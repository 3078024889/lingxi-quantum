"use client";

import type {LingxiLang} from "@/lib/lingxi-i18n";

type LocalMessage={role:"system"|"user"|"assistant";content:string};
type LocalOutcome=
 |{kind:"answer";answer:string}
 |{kind:"skip";reason:"unsupported"|"not-ready"|"not-suitable"|"failed"};

type LanguageModelSession={
 prompt:(input:string,options?:{signal?:AbortSignal})=>Promise<string>;
 destroy?:()=>void;
};

type LanguageModelApi={
 availability:(options?:unknown)=>Promise<string>;
 create:(options?:unknown)=>Promise<LanguageModelSession>;
};

const LOCAL_ENABLED_KEY="lx-sasi-local-text-enabled";

const LANGUAGE:Record<LingxiLang,string>={
 zh:"zh",en:"en",ja:"ja",ko:"ko",fr:"fr",de:"de",es:"es",pt:"pt",ar:"ar"
};

function localEnabled(){
 if(typeof window==="undefined")return false;
 try{return localStorage.getItem(LOCAL_ENABLED_KEY)==="1"}catch{return false}
}

function api():LanguageModelApi|null{
 if(typeof window==="undefined")return null;
 const g=globalThis as unknown as {LanguageModel?:LanguageModelApi;ai?:{languageModel?:LanguageModelApi}};
 return g.LanguageModel??g.ai?.languageModel??null;
}

export function browserLocalTextSuitable(text:string){
 const value=String(text||"").trim();
 if(!value||value.length>1400)return false;
 return !/(最新|今天|现在发生|联网|搜索|查一下|来源|引用|论文|深度研究|实时|新闻|价格|汇率|天气|research|latest|current|search the web|citation|source|news|price|weather)/i.test(value);
}

/**
 * Zero-subsidy fast path for ordinary conversation.
 * It never initiates a model download: only a browser model that is already
 * available is used. Any incompatibility or failure falls through quietly to
 * the existing SASI resource path.
 */
export async function tryBrowserLocalText(input:{
 lang:LingxiLang;
 messages:LocalMessage[];
 signal?:AbortSignal;
}):Promise<LocalOutcome>{
 const lm=api();
 if(!localEnabled())return{kind:"skip",reason:"not-ready"};
 const last=[...input.messages].reverse().find(x=>x.role==="user");
 if(!lm?.availability||!lm?.create||!last||!browserLocalTextSuitable(last.content))return{kind:"skip",reason:"not-suitable"};
 const language=LANGUAGE[input.lang]||"en";
 const io={expectedInputs:[{type:"text",languages:[language]}],expectedOutputs:[{type:"text",languages:[language]}]};
 try{
  const status=await lm.availability(io);
  // Do not trigger downloads implicitly. Downloadable/downloading sessions are
  // offered only by an explicit user action in a later opt-in flow.
  if(status!=="available")return{kind:"skip",reason:status==="unavailable"?"unsupported":"not-ready"};
  const prior=input.messages.slice(0,-1).slice(-8).map(x=>({role:x.role,content:x.content}));
  const session=await lm.create({
   ...io,
   initialPrompts:[
    {role:"system",content:"Answer the user directly in the same language as the user. Do not invent current facts or claim web access."},
    ...prior
   ],
   signal:input.signal
  });
  try{
   const answer=String(await session.prompt(last.content,{signal:input.signal})).trim();
   if(!answer)return{kind:"skip",reason:"failed"};
   return{kind:"answer",answer};
  }finally{session.destroy?.()}
 }catch{
  return{kind:"skip",reason:"failed"};
 }
}
