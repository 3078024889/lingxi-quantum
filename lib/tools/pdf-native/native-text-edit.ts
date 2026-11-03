/**
 * Browser-safe, fail-closed native PDF text-run modification.
 * Uses the MIT-licensed Folio tokenizer/rewriter pinned in this folder.
 * This removes painted text operators from reachable page content streams;
 * it is NOT a secure redaction or guaranteed erasure of previous PDF revisions.
 */
import {PDFDocument} from "pdf-lib";
import {locatePageRuns,commitTextEdit} from "./mutate";
import type {LocatedRun,ShowOp} from "./types";
export type NativePdfTextTarget={x:number;y:number;op:ShowOp};
const signedToken=new TextEncoder().encode("/ByteRange");
export function hasPdfSignature(bytes:Uint8Array):boolean{
 for(let i=0;i+signedToken.length<=bytes.length;i++){
  let equal=true;
  for(let j=0;j<signedToken.length;j++){if(bytes[i+j]!==signedToken[j]){equal=false;break}}
  if(equal)return true;
 }
 return false;
}
export async function findNativePdfTextTarget(bytes:Uint8Array,pageIndex:number,point:{x:number;y:number}):Promise<NativePdfTextTarget|null>{
 if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||hasPdfSignature(bytes))return null;
 const pdf=await PDFDocument.load(bytes);
 if(pageIndex<0||pageIndex>=pdf.getPageCount()||pdf.getPage(pageIndex).getRotation().angle%360!==0)return null;
 const runs=await locatePageRuns(bytes,pageIndex);
 const matches=runs.filter((r:LocatedRun)=>{
  const tolerance=Math.max(2,.25*Math.abs(r.fontSize));
  return Math.hypot(r.x-point.x,r.y-point.y)<=tolerance;
 });
 if(matches.length!==1||!matches[0].editable)return null;
 const r=matches[0];return{x:r.x,y:r.y,op:r.op};
}
export async function removeNativePdfTextRuns(bytes:Uint8Array,changes:Array<{pageIndex:number;target:NativePdfTextTarget}>):Promise<Uint8Array>{
 if(changes.length===0)return bytes;
 if(hasPdfSignature(bytes))throw Error("PDF_SIGNED_OR_SIGNATURE_PRESENT");
 let result=bytes;
 const seen=new Set<string>();
 for(const change of changes){
  const {pageIndex,target}=change;
  if(!Number.isSafeInteger(pageIndex)||pageIndex<0||!Number.isFinite(target.x)||!Number.isFinite(target.y))throw Error("PDF_NATIVE_TEXT_TARGET_INVALID");
  const key=[pageIndex,target.x,target.y,target.op].join(":");
  if(seen.has(key))throw Error("PDF_NATIVE_TEXT_TARGET_DUPLICATE");
  seen.add(key);
  const runs=await locatePageRuns(result,pageIndex);
  const best=runs.filter((r:LocatedRun)=>{
   const tol=Math.max(2,.25*Math.abs(r.fontSize));
   return r.op===target.op&&Math.hypot(r.x-target.x,r.y-target.y)<=tol;
  });
  if(best.length!==1||!best[0].editable)throw Error("PDF_NATIVE_TEXT_UNSUPPORTED");
  result=new Uint8Array(await commitTextEdit({
   pdfBytes:result,pageIndex,target,newText:"",
   style:{fontFamilyHint:"Helvetica",fontSize:Math.max(6,best[0].fontSize),color:{r:0,g:0,b:0}}
  }));
  const remaining=await locatePageRuns(result,pageIndex);
  if(remaining.some((r:LocatedRun)=>r.op===target.op&&Math.hypot(r.x-target.x,r.y-target.y)<.5))throw Error("PDF_NATIVE_TEXT_REMOVAL_UNVERIFIED");
 }
 return result;
}
