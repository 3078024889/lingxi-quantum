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
type UiLanguage = "zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
const languages:UiLanguage[]=["zh","en","ja","ko","fr","de","es","pt","ar"];
const ui:Record<string,Record<UiLanguage,string>>={
 title:{zh:"文件来源与签名",en:"File origin and signature",ja:"ファイルの出所と署名",ko:"파일 출처와 서명",fr:"Origine et signature du fichier",de:"Dateiherkunft und Signatur",es:"Origen y firma del archivo",pt:"Origem e assinatura do arquivo",ar:"مصدر الملف والتوقيع"},
 checking:{zh:"正在核验文件来源…",en:"Checking the file origin…",ja:"出所を確認しています…",ko:"파일 출처를 확인하는 중…",fr:"Vérification de l’origine…",de:"Dateiherkunft wird geprüft…",es:"Comprobando el origen…",pt:"Verificando a origem…",ar:"جارٍ التحقق من مصدر الملف…"},
 trusted:{zh:"签名核验通过，签发方可信",en:"Signature verified; signer trusted",ja:"署名を確認済み・発行元は信頼済み",ko:"서명 확인됨 · 신뢰할 수 있는 발급자",fr:"Signature vérifiée, signataire fiable",de:"Signatur geprüft, Aussteller vertrauenswürdig",es:"Firma verificada y emisor de confianza",pt:"Assinatura verificada e emissor confiável",ar:"تم التحقق من التوقيع والجهة الموقعة موثوقة"},
 valid:{zh:"签名核验通过，来源声明仍需自行核对",en:"Signature verified; review the origin details",ja:"署名は確認済み。出所の記載も確認してください",ko:"서명 확인됨 · 출처 설명을 확인하세요",fr:"Signature vérifiée, vérifiez les informations d’origine",de:"Signatur geprüft, Herkunftsangaben bitte prüfen",es:"Firma verificada; revise los datos de origen",pt:"Assinatura verificada; confira os dados de origem",ar:"تم التحقق من التوقيع، راجع تفاصيل المصدر"},
 untrusted:{zh:"已找到签名，但签发方尚未获得信任确认",en:"Signature found; signer is not trusted",ja:"署名あり・発行元の信頼は未確認",ko:"서명 있음 · 발급자 신뢰 확인 안 됨",fr:"Signature présente, signataire non reconnu",de:"Signatur vorhanden, Aussteller nicht vertrauenswürdig",es:"Firma encontrada; emisor no reconocido",pt:"Assinatura encontrada; emissor não confiável",ar:"عُثر على توقيع لكن الجهة الموقعة غير موثوقة"},
 invalid:{zh:"签名或文件完整性核验未通过",en:"Signature or file integrity check failed",ja:"署名またはファイルの完全性を確認できませんでした",ko:"서명 또는 파일 무결성 확인 실패",fr:"Échec de la vérification de la signature ou du fichier",de:"Signatur- oder Integritätsprüfung fehlgeschlagen",es:"Falló la verificación de firma o integridad",pt:"Falha na verificação da assinatura ou integridade",ar:"فشل التحقق من التوقيع أو سلامة الملف"},
 absent:{zh:"这份文件没有可读取的来源签名",en:"No readable origin signature in this file",ja:"このファイルに読み取れる出所の署名はありません",ko:"이 파일에 읽을 수 있는 출처 서명이 없습니다",fr:"Aucune signature d’origine lisible dans ce fichier",de:"Keine lesbare Herkunftssignatur in dieser Datei",es:"Este archivo no tiene firma de origen legible",pt:"Este arquivo não contém assinatura de origem legível",ar:"لا يوجد توقيع مصدر قابل للقراءة في هذا الملف"},
 unavailable:{zh:"暂时无法核验这份文件的来源",en:"Could not check this file’s origin",ja:"このファイルの出所を確認できませんでした",ko:"이 파일의 출처를 확인할 수 없습니다",fr:"Impossible de vérifier l’origine de ce fichier",de:"Dateiherkunft konnte nicht geprüft werden",es:"No se pudo comprobar el origen del archivo",pt:"Não foi possível verificar a origem do arquivo",ar:"تعذر التحقق من مصدر هذا الملف"},
 issuer:{zh:"签发方",en:"Signer",ja:"発行元",ko:"발급자",fr:"Signataire",de:"Aussteller",es:"Firmante",pt:"Signatário",ar:"الجهة الموقعة"},
 claim:{zh:"文件名称",en:"Content title",ja:"コンテンツ名",ko:"콘텐츠 이름",fr:"Nom du contenu",de:"Inhaltstitel",es:"Título del contenido",pt:"Título do conteúdo",ar:"عنوان المحتوى"},
 absentHint:{zh:"这不代表图片或视频由 AI 生成。原文件可能没有签名，也可能在编辑或分享过程中丢失签名。",en:"This does not mean AI created the file. The original may never have had a signature, or it may have been lost while editing or sharing.",ja:"AIが作成した証拠ではありません。元の署名が存在しなかったか、編集や共有で失われた可能性があります。",ko:"AI 제작의 증거가 아닙니다. 원본에 서명이 없었거나 편집·공유 중 사라졌을 수 있습니다.",fr:"Cela ne prouve pas une création par IA. La signature peut n’avoir jamais existé ou avoir été perdue lors d’une modification.",de:"Das belegt keine KI-Erstellung. Eine Signatur kann fehlen oder beim Bearbeiten verloren gegangen sein.",es:"Esto no demuestra creación por IA. La firma pudo no existir o perderse al editar o compartir.",pt:"Isso não prova criação por IA. A assinatura pode nunca ter existido ou ter sido perdida ao editar.",ar:"هذا لا يثبت أن الملف أنشأه الذكاء الاصطناعي. قد لا يكون موقّعًا أصلًا أو فقد توقيعه أثناء التحرير."},
 unavailableHint:{zh:"本次未获得可确认的结果。请换用原始文件重试。",en:"No confirmed result is available. Try again with the original file.",ja:"確認できる結果がありません。元のファイルでもう一度お試しください。",ko:"확인된 결과가 없습니다. 원본 파일로 다시 시도하세요.",fr:"Aucun résultat confirmé. Réessayez avec le fichier original.",de:"Kein bestätigtes Ergebnis. Bitte die Originaldatei erneut prüfen.",es:"No hay un resultado confirmado. Pruebe con el archivo original.",pt:"Não há resultado confirmado. Tente novamente com o arquivo original.",ar:"لا تتوفر نتيجة مؤكدة. أعد المحاولة بالملف الأصلي."},
 explanation:{zh:"签名可帮助确认文件携带的来源声明，不保证画面中的事情真实发生，也不能单独判断是否由 AI 生成。",en:"A signature helps verify declared origin. It does not prove a scene is real or determine whether AI made it.",ja:"署名は記録された出所情報の確認に役立ちますが、映像の真実性やAI生成の有無は証明しません。",ko:"서명은 기록된 출처 확인에 도움이 되지만 실제 장면인지 또는 AI 제작인지는 증명하지 않습니다.",fr:"Une signature aide à vérifier l’origine déclarée, sans prouver la réalité de la scène ni sa création par IA.",de:"Eine Signatur hilft bei Herkunftsangaben, beweist aber weder die Echtheit einer Szene noch ihre KI-Erstellung.",es:"La firma ayuda a comprobar el origen declarado, no prueba que la escena sea real ni que se haya creado con IA.",pt:"A assinatura ajuda a conferir a origem declarada, sem provar a realidade da cena nem a criação por IA.",ar:"يساعد التوقيع في التحقق من المصدر المعلن، لكنه لا يثبت حقيقة المشهد أو ما إذا كان من إنشاء الذكاء الاصطناعي."}
};
function message(key:string,lang:LingxiLang){const locale:UiLanguage=languages.includes(lang as UiLanguage)?lang as UiLanguage:"en";return ui[key]?.[locale]||ui[key]?.en||key;}
export default function C2paProvenanceCheck({file,lang}:{file:File;lang:LingxiLang}){
 const [result,setResult]=useState<ProvenanceResult>({status:"checking"});
 useEffect(()=>{
  let alive=true;setResult({status:"checking"});
  void verifyC2paFile(file).then(value=>{if(alive)setResult(value)});
  return()=>{alive=false};
 },[file]);
 return <section className="mt-3 space-y-2 border-t pt-3 text-sm" data-c2pa-verification={result.status}>
  <p className="font-semibold">{message("title",lang)}</p>
  <p role="status" aria-live="polite">{message(result.status,lang)}</p>
  {result.issuer&&<p>{message("issuer",lang)}：{result.issuer}</p>}
  {result.claim&&<p>{message("claim",lang)}：{result.claim}</p>}
  {result.status==="absent"&&<p className="opacity-80">{message("absentHint",lang)}</p>}
  {result.status==="unavailable"&&<p className="opacity-70">{message("unavailableHint",lang)}</p>}
  <p className="opacity-70">{message("explanation",lang)}</p>
 </section>;
}
