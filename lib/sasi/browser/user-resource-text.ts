"use client";

type PuterResponse={message?:{content?:unknown};toString?:()=>string};
type PuterGlobal={
 auth:{isSignedIn:()=>boolean;signIn:()=>Promise<unknown>;signOut?:()=>void};
 ai:{chat:(prompt:string,options?:{model?:string})=>Promise<PuterResponse|unknown>};
};

declare global{interface Window{puter?:PuterGlobal}}

const SCRIPT_ID="lingxifield-puter";
const SCRIPT_SRC="https://js.puter.com/v2/";
const STORAGE_KEY="lx-sasi-user-resource";

function current(){return typeof window==="undefined"?undefined:window.puter}
function enabled(){try{return localStorage.getItem(STORAGE_KEY)==="puter"}catch{return false}}
function setEnabled(value:boolean){try{value?localStorage.setItem(STORAGE_KEY,"puter"):localStorage.removeItem(STORAGE_KEY)}catch{}}

function loadScript():Promise<PuterGlobal>{
 if(typeof window==="undefined")return Promise.reject(new Error("BROWSER_REQUIRED"));
 if(current())return Promise.resolve(current()!);
 return new Promise((resolve,reject)=>{
  const existing=document.getElementById(SCRIPT_ID) as HTMLScriptElement|null;
  const done=()=>current()?resolve(current()!):reject(new Error("RESOURCE_LOAD_FAILED"));
  if(existing){existing.addEventListener("load",done,{once:true});existing.addEventListener("error",()=>reject(new Error("RESOURCE_LOAD_FAILED")),{once:true});return}
  const script=document.createElement("script");script.id=SCRIPT_ID;script.src=SCRIPT_SRC;script.async=true;script.crossOrigin="anonymous";
  script.addEventListener("load",done,{once:true});script.addEventListener("error",()=>reject(new Error("RESOURCE_LOAD_FAILED")),{once:true});
  document.head.appendChild(script);
 });
}

function textFromResponse(value:unknown){
 const response=value as PuterResponse|undefined;
 const content=response?.message?.content;
 if(typeof content==="string")return content.trim();
 if(Array.isArray(content))return content.map((x:any)=>typeof x==="string"?x:String(x?.text||"")).join("").trim();
 if(content!=null)return String(content).trim();
 return typeof response?.toString==="function"?String(response.toString()).trim():"";
}

export type UserResourceState="off"|"connected"|"available"|"unavailable";

export async function userResourceState():Promise<UserResourceState>{
 if(!enabled())return"off";
 try{
  const p=await loadScript();
  return p.auth.isSignedIn()?"connected":"available";
 }catch{return"unavailable"}
}

export async function connectUserResource():Promise<UserResourceState>{
 try{
  const p=await loadScript();
  if(!p.auth.isSignedIn())await p.auth.signIn();
  if(!p.auth.isSignedIn())return"available";
  setEnabled(true);return"connected";
 }catch{return"unavailable"}
}

export function disconnectUserResource(){
 setEnabled(false);
 try{current()?.auth.signOut?.()}catch{}
}

export async function tryUserResourceText(input:{prompt:string;context?:string}):Promise<{kind:"answer";answer:string}|{kind:"skip"}>{
 if(!enabled())return{kind:"skip"};
 try{
  const p=await loadScript();if(!p.auth.isSignedIn())return{kind:"skip"};
  const prompt=[input.context?.trim(),input.prompt.trim()].filter(Boolean).join("\n\n");
  if(!prompt)return{kind:"skip"};
  const answer=textFromResponse(await p.ai.chat(prompt,{model:"openai/gpt-5.4-nano"}));
  return answer?{kind:"answer",answer}:{kind:"skip"};
 }catch{return{kind:"skip"}}
}
