"use client";
import {useEffect,useState} from "react";
import type {LingxiLang} from "@/lib/lingxi-i18n";

export type ProvenanceStatus="checking"|"trusted"|"valid"|"invalid"|"absent"|"unavailable";
export type ProvenanceResult={status:ProvenanceStatus;issuer?:string;claim?:string;reason?:string};

let sdkPromise:Promise<Awaited<ReturnType<typeof import("@contentauth/c2pa-web/inline")["createC2pa"]>>>|null=null;
/** Single SDK instance per browser session: avoid instantiating Wasm for each uploaded file. */
async function getSdk(){
 if(!sdkPromise)sdkPromise=import("@contentauth/c2pa-web/inline").then(({createC2pa})=>createC2pa()).catch(error=>{sdkPromise=null;throw error});
 return sdkPromise;
}
const isObj=(input:unknown):input is Record<string,unknown>=>Boolean(input)&&typeof input==="object"&&!Array.isArray(input);
function describe(store:unknown):ProvenanceResult{
 if(!isObj(store))return {status:"unavailable",reason:"INVALID_VERIFICATION_REPORT"};
 const manifests=isObj(store.manifests)?store.manifests:{};
 const active=typeof store.active_manifest==="string"?store.active_manifest:"";
 // A manifest-free result is not evidence that the source is human or AI.
 if(!active||!isObj(manifests[active]))return {status:"absent"};
 const value=store.validation_state;
 const rawState=typeof value==="string"?value.toLowerCase():"";
 const details=manifests[active] as Record<string,unknown>;
 const sig=isObj(details.signature_info)?details.signature_info:{};
 const issuer=typeof sig.issuer==="string"?sig.issuer.slice(0,160):undefined;
 const claim=typeof details.title==="string"?details.title.slice(0,160):undefined;
 if(rawState==="trusted")return {status:"trusted",issuer,claim};
 if(rawState==="valid")return {status:"valid",issuer,claim};
 if(rawState==="invalid")return {status:"invalid",issuer,claim};
 // An unrecognized or missing validation_state must never be marked valid.
 return {status:"unavailable",issuer,claim,reason:"VERIFICATION_STATE_UNAVAILABLE"};
}
export async function verifyC2paFile(file:File):Promise<ProvenanceResult>{
 // The workbench accepts up to 250 MB, but WebAssembly memory must be bounded.
 if(file.size>250*1024*1024)return {status:"unavailable",reason:"FILE_TOO_LARGE"};
 if(!file.size)return {status:"unavailable",reason:"EMPTY_FILE"};
 let reader:null|{manifestStore:()=>Promise<unknown>;free:()=>Promise<unknown>}=null;
 try{
  const {Reader}=await import("@contentauth/c2pa-web");
  const sdk=await getSdk();
  const found=await Reader.fromBlob(sdk,file.type||undefined,file);
  if(!found)return {status:"absent"};
  reader=found;
  return describe(await found.manifestStore());
 }catch(e){
  return {status:"unavailable",reason:e instanceof Error?e.message.slice(0,160):"VERIFICATION_FAILED"};
 }finally{
  if(reader)try{await reader.free()}catch{}
 }
}
const copy:Record<ProvenanceStatus,Record<"zh"|"en",string>>={
 checking:{zh:"正在验证 C2PA 来源凭证…",en:"Verifying C2PA Content Credentials…"},
 trusted:{zh:"C2PA 签名有效，签发者受到信任",en:"C2PA signature valid; signer trusted"},
 valid:{zh:"C2PA 签名有效，签发者信任尚未确认",en:"C2PA signature valid; signer trust not established"},
 invalid:{zh:"C2PA 验证失败：凭证可能已损坏或内容被改动",en:"C2PA validation failed; credentials or media may have changed"},
 absent:{zh:"未找到 C2PA 来源凭证",en:"No C2PA Content Credentials found"},
 unavailable:{zh:"暂时无法完成 C2PA 验证",en:"C2PA verification could not be completed"}
};
export default function C2paProvenanceCheck({file,lang}:{file:File;lang:LingxiLang}){
 const [result,setResult]=useState<ProvenanceResult>({status:"checking"});
 const zh=lang==="zh";
 useEffect(()=>{
  let alive=true;setResult({status:"checking"});
  void verifyC2paFile(file).then(value=>{if(alive)setResult(value)});
  return()=>{alive=false};
 },[file]);
 return <section className="mt-3 space-y-2 border-t pt-3 text-sm" data-c2pa-verification={result.status}>
  <p className="font-semibold">{zh?"C2PA 数字来源凭证验证":"C2PA Content Credentials verification"}</p>
  <p role="status" aria-live="polite">{copy[result.status][zh?"zh":"en"]}</p>
  {result.issuer&&<p>{zh?"签发信息":"Signer"}：{result.issuer}</p>}
  {result.claim&&<p>{zh?"内容标识":"Content title"}：{result.claim}</p>}
  {result.status==="unavailable"&&<p className="opacity-70">{zh?"此文件没有得到有效的验证结论，可稍后重试或使用 Content Credentials 官方验证服务。":"No valid verification outcome was established; retry or consult the official Content Credentials verifier."}</p>}
  <p className="opacity-70">{zh?"C2PA 仅验证来源声明及相关签名，不保证内容真实；没有凭证也不意味着是 AI 生成。":"C2PA verifies signed provenance claims, not factual truth. Missing credentials do not imply AI generation."}</p>
 </section>;
}
