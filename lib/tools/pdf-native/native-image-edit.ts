/**
 * Restricted editing of images that already exist in the PDF page content.
 * Uses Folio's MIT-licensed image operator rewrite, without rasterizing the page.
 * Safe edits target a single page's own axis-aligned image Do operator.
 * This is not a secure destruction of historical object bytes.
 */
import {PDFDocument} from "pdf-lib";
import {locatePageImages,commitImageEdit} from "./image-mutate";
import {hasPdfSignature} from "./native-text-edit";
import {canNativeEditPage} from "./native-page-geometry";
import type {ImageEditTarget,ImageEditRect} from "./image-types";
export type NativeImageRegion={key:string;target:ImageEditTarget;x:number;y:number;w:number;h:number;aspect:number};
export type NativeImageAction={kind:"move";rect:ImageEditRect}|{kind:"delete"}|{kind:"replace";dataUrl:string;mime:"image/png"|"image/jpeg"};
export type NativeImageChange={pageIndex:number;target:ImageEditTarget;action:NativeImageAction};

export async function locateEditableNativeImages(bytes:Uint8Array,pageIndex:number):Promise<NativeImageRegion[]>{
 if(!Number.isSafeInteger(pageIndex)||pageIndex<0||hasPdfSignature(bytes))return[];
 const doc=await PDFDocument.load(bytes);
 if(pageIndex>=doc.getPageCount())return[];
 const page=doc.getPage(pageIndex);
 if(!canNativeEditPage(page))return[];
 const W=page.getWidth(),H=page.getHeight();
 if(W<=0||H<=0)return[];
 const images=await locatePageImages(bytes,pageIndex);
 const out:NativeImageRegion[]=[];
 for(const image of images){
  if(!image.editable||!image.transformable)continue;
  const {x,y,width,height}=image.rect;
  if(!(width>0&&height>0&&x>=0&&y>=0&&x+width<=W+1e-4&&y+height<=H+1e-4))continue;
  out.push({key:`image-${image.streamIndex}-${image.name}-${out.length}`,
   target:{streamIndex:image.streamIndex,name:image.name,rect:{...image.rect}},
   x:x/W*100,y:(H-y-height)/H*100,w:width/W*100,h:height/H*100,
   aspect:width/height});
  if(out.length>=150)break;
 }
 return out;
}
export async function applyNativeImageChanges(bytes:Uint8Array,changes:NativeImageChange[]):Promise<Uint8Array>{
 if(changes.length===0)return bytes;
 if(hasPdfSignature(bytes))throw Error("PDF_SIGNED_OR_SIGNATURE_PRESENT");
 const sourceDoc=await PDFDocument.load(bytes);
 for(const change of changes){
  if(!Number.isSafeInteger(change.pageIndex)||change.pageIndex<0||change.pageIndex>=sourceDoc.getPageCount()||!canNativeEditPage(sourceDoc.getPage(change.pageIndex)))throw Error("PDF_IMAGE_PAGE_UNSUPPORTED");
 }
 let result=bytes;
 const seen=new Set<string>();
 for(const change of changes){
  if(!Number.isSafeInteger(change.pageIndex)||change.pageIndex<0)throw Error("PDF_IMAGE_PAGE_INVALID");
  const key=[change.pageIndex,change.target.name,change.target.rect.x,change.target.rect.y,change.target.rect.width,change.target.rect.height].join(":");
  if(seen.has(key))throw Error("PDF_IMAGE_DUPLICATE_TARGET");seen.add(key);
  const images=await locatePageImages(result,change.pageIndex);
  const candidate=images.filter(img=>img.editable&&img.name===change.target.name&&
    Math.hypot(img.rect.x-change.target.rect.x,img.rect.y-change.target.rect.y)<2&&Math.abs(img.rect.width-change.target.rect.width)<2&&Math.abs(img.rect.height-change.target.rect.height)<2);
  if(candidate.length!==1)throw Error("PDF_IMAGE_TARGET_MISSING_OR_AMBIGUOUS");
  const image=candidate[0];
  if(change.action.kind==="move"&&!image.transformable)throw Error("PDF_IMAGE_TRANSFORM_UNSUPPORTED");
  result=new Uint8Array(await commitImageEdit({pdfBytes:result,pageIndex:change.pageIndex,
   target:{streamIndex:image.streamIndex,name:image.name,rect:{...image.rect}},action:change.action}));
 }
 return result;
}
