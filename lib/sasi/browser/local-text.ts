"use client";

import type {LingxiLang} from "@/lib/lingxi-i18n";

type LocalMessage={role:"system"|"user"|"assistant";content:string};
export type BrowserLocalState="unsupported"|"ready"|"needs-download"|"downloading";
type LocalOutcome=
 |{kind:"answer";answer:string}
 |{kind:"skip";reason:"unsupported"|"not-ready"|"not-suitable"|"failed"};

type DownloadMonitor={addEventListener:(name:"downloadprogress",listener:(event:{loaded:number})=>void)=>void};
type LanguageModelSession={
 prompt:(input:string,options?:{signal?:AbortSignal})=>Promise<string>;
 destroy?:()=>void;
};
type LanguageModelCreateOptions={
 expectedInputs?:unknown[];
 expectedOutputs?:unknown[];
 initialPrompts?:Array<{role:"system"|"user"|"assistant";content:string}>;
 signal?:AbortSignal;
 monitor?:(monitor:DownloadMonitor)=>void;
};
type LanguageModelApi={
 availability:(options?:unknown)=>Promise<"unavailable"|"downloadable"|"downloading"|"available"|string>;
 create:(options?:LanguageModelCreateOptions)=>Promise<LanguageModelSession>;
};

const LANGUAGE:Record<LingxiLang,string>={
 zh:"zh",en:"en",ja:"ja",ko:"ko",fr:"fr",de:"de",es:"es",pt:"pt",ar:"ar"
};

function api():LanguageModelApi|null{
 if(typeof window==="undefined")return null;
 const g=globalThis as unknown as {LanguageModel?:LanguageModelApi;ai?:{languageModel?:LanguageModelApi}};
 return g.LanguageModel??g.ai?.languageModel??null;
}
function io(lang:LingxiLang){
 const language=LANGUAGE[lang]||"en";
 return {expectedInputs:[{type:"text",languages:[language]}],expectedOutputs:[{type:"text",languages:[language]}]};
}

export function browserLocalTextSuitable(text:string){
 const value=String(text||"").trim();
 if(!value||value.length>1400)return false;
 return !/(最新|今天|现在发生|联网|搜索|查一下|来源|引用|论文|深度研究|实时|新闻|价格|汇率|天气|research|latest|current|search the web|citation|source|news|price|weather)/i.test(value);
}

export async function browserLocalTextState(lang:LingxiLang):Promise<BrowserLocalState>{
 const lm=api();if(!lm?.availability||!lm?.create)return"unsupported";
 try{
  const status=await lm.availability(io(lang));
  if(status==="available")return"ready";
  if(status==="downloadable")return"needs-download";
  if(status==="downloading")return"downloading";
  return"unsupported";
 }catch{return"unsupported"}
}

export async function prepareBrowserLocalText(lang:LingxiLang,onProgress?:(value:number)=>void):Promise<BrowserLocalState>{
 const lm=api();if(!lm?.availability||!lm?.create)return"unsupported";
 const options=io(lang);
 try{
  const status=await lm.availability(options);
  if(status==="unavailable")return"unsupported";
  const session=await lm.create({
   ...options,
   monitor(m){m.addEventListener("downloadprogress",event=>onProgress?.(Math.max(0,Math.min(1,Number(event.loaded)||0))))}
  });
  session.destroy?.();
  return"ready";
 }catch{return"unsupported"}
}

export async function tryBrowserLocalText(input:{
 lang:LingxiLang;
 messages:LocalMessage[];
 signal?:AbortSignal;
}):Promise<LocalOutcome>{
 const lm=api();
 const last=[...input.messages].reverse().find(x=>x.role==="user");
 if(!lm?.availability||!lm?.create||!last||!browserLocalTextSuitable(last.content))return{kind:"skip",reason:"not-suitable"};
 const options=io(input.lang);
 try{
  const status=await lm.availability(options);
  if(status!=="available")return{kind:"skip",reason:status==="unavailable"?"unsupported":"not-ready"};
  const prior=input.messages.slice(0,-1).slice(-8).map(x=>({role:x.role,content:x.content}));
  const session=await lm.create({
   ...options,
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
