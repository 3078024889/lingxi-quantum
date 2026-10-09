"use client";
import {useEffect,useState} from "react";
import type {LingxiLang} from "@/lib/lingxi-i18n";

export type ProvenanceStatus="checking"|"trusted"|"valid"|"untrusted"|"invalid"|"absent"|"unavailable";
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
 if(!active||!isObj(manifests[active]))return {status:"unavailable",reason:"MISSING_ACTIVE_MANIFEST"};
 const value=store.validation_state;
 const rawState=typeof value==="string"?value.toLowerCase():"";
 const details=manifests[active] as Record<string,unknown>;
 const sig=isObj(details.signature_info)?details.signature_info:{};
 const issuer=typeof sig.issuer==="string"?sig.issuer.slice(0,160):undefined;
 const claim=typeof details.title==="string"?details.title.slice(0,160):undefined;
 if(rawState==="trusted")return {status:"trusted",issuer,claim};
 if(rawState==="valid")return {status:"valid",issuer,claim};
 if(rawState==="invalid"){
  const validation=isObj(store.validation_results)?store.validation_results:{};
  const activeResults=isObj(validation.activeManifest)?validation.activeManifest:{};
  const failures=Array.isArray(activeResults.failure)?activeResults.failure.filter(isObj):[];
  const successes=Array.isArray(activeResults.success)?activeResults.success.filter(isObj):[];
  const signatureValidated=successes.some(item=>item.code==="claimSignature.validated");
  const trustOnly=failures.length>0&&failures.every(item=>typeof item.code==="string"&&
    (item.code==="signingCredential.untrusted"||item.code==="timeStamp.untrusted"));
  if(signatureValidated&&trustOnly)return {status:"untrusted",issuer,claim};
  return {status:"invalid",issuer,claim};
 }
 // An unrecognized or missing validation_state must never be marked valid.
 return {status:"unavailable",issuer,claim,reason:"VERIFICATION_STATE_UNAVAILABLE"};
}
export async function verifyC2paFile(file:File):Promise<ProvenanceResult>{
 // The workbench accepts up to 250 MB, but WebAssembly memory must be bounded.
 if(file.size>250*1024*1024)return {status:"unavailable",reason:"FILE_TOO_LARGE"};
 if(!file.size)return {status:"unavailable",reason:"EMPTY_FILE"};
 let reader:null|{manifestStore:()=>Promise<unknown>;free:()=>Promise<unknown>}=null;
 try{
  const {Reader,Context}=await import("@contentauth/c2pa-web");
  const sdk=await getSdk();
  const found=await Reader.fromBlob(sdk,file.type||undefined,file,new Context({verify:{verifyTrust:true,verifyAfterReading:true},trust:{trustAnchors:"https://raw.githubusercontent.com/c2pa-org/conformance-public/refs/heads/main/trust-list/C2PA-TRUST-LIST.pem"}}));
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
 valid:{zh:"C2PA 签名验证通过，仍需核对来源声明",en:"C2PA signature validated; provenance claims still require scrutiny"},
 untrusted:{zh:"检测到 C2PA 签名，但签发证书不在可信名单中",en:"C2PA signature found; signer certificate is not trusted"},
 invalid:{zh:"C2PA 完整性或签名验证失败",en:"C2PA signature or integrity verification failed"},
 absent:{zh:"当前文件未检测到内嵌 C2PA 凭证",en:"No embedded C2PA credentials detected in this file"},
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
  {result.status==="absent"&&<p className="opacity-80">{zh?"这只说明当前上传的文件副本没有可读取的内嵌凭证。原文件可能从未签名，也可能在编辑、转存或平台处理后丢失凭证；无法仅凭这个结果判断。":"This means this uploaded copy has no readable embedded credentials. The original may never have been signed, or credentials may have been lost during editing or sharing; this result cannot distinguish those cases."}</p>}
  {result.status==="unavailable"&&<p className="opacity-70">{zh?"此文件没有得到有效的验证结论，可稍后重试或使用 Content Credentials 官方验证服务。":"No valid verification outcome was established; retry or consult the official Content Credentials verifier."}</p>}
  <p className="opacity-70">{zh?"C2PA 只用于核验可读取的来源凭证与签名，不判断这张图片或视频是不是 AI 制作；下方 AI 模型分数是另一项独立分析。":"C2PA checks available signed provenance, not whether media was AI-generated. The model scores below are a separate assessment."}</p>
 </section>;
}
