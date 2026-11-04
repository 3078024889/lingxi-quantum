export type BatchImageMime="image/jpeg"|"image/png"|"image/webp";
const MAX_PIXELS=40_000_000;
const MAX_SIDE=16_384;

function signature(bytes:Uint8Array):BatchImageMime|null{
 if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return "image/jpeg";
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return "image/png";
 const str=(i:number,n:number)=>String.fromCharCode(...bytes.subarray(i,i+n));
 if(bytes.length>=12&&str(0,4)==="RIFF"&&str(8,4)==="WEBP")return "image/webp";
 return null;
}
function animatedPng(bytes:Uint8Array){
 // acTL must precede IDAT in a valid APNG. Reject before calling createImageBitmap.
 let i=8;
 while(i+8<=bytes.length){
  const length=((bytes[i]*2**24)+(bytes[i+1]<<16)+(bytes[i+2]<<8)+bytes[i+3])>>>0;
  const tag=String.fromCharCode(...bytes.subarray(i+4,i+8));
  if(tag==="acTL")return true;
  if(tag==="IDAT"||tag==="IEND")break;
  if(length>bytes.length-i-12)break;
  i+=12+length;
 }
 return false;
}
function animatedWebp(bytes:Uint8Array){
 let i=12;
 while(i+8<=bytes.length){
  const tag=String.fromCharCode(...bytes.subarray(i,i+4));
  const len=(bytes[i+4]+bytes[i+5]*256+bytes[i+6]*65536+bytes[i+7]*16777216)>>>0;
  if(tag==="ANIM"||tag==="ANMF")return true;
  if(tag==="VP8X"&&len>0&&i+9<=bytes.length&&(bytes[i+8]&0x02)!==0)return true;
  if(len>bytes.length-i-8)break;
  i+=8+len+(len&1);
 }
 return false;
}

/** Protect users against animation flattening, including mislabeled file extensions. */
export async function validateStaticBatchImage(file:File){
 const head=new Uint8Array(await file.slice(0,Math.min(file.size,1024*1024)).arrayBuffer());
 const found=signature(head);
 if(!found)throw Error("UNSUPPORTED_IMAGE_BYTES");
 if(file.type&&file.type!==found)throw Error("IMAGE_MIME_MISMATCH");
 if(found==="image/png"&&animatedPng(head))throw Error("ANIMATED_IMAGE_UNSUPPORTED");
 if(found==="image/webp"&&animatedWebp(head))throw Error("ANIMATED_IMAGE_UNSUPPORTED");
 return found;
}

export async function convertBatchImage(file:File,maxWidth:number,quality:number,mime:BatchImageMime):Promise<Blob>{
 await validateStaticBatchImage(file);
 if(!Number.isSafeInteger(maxWidth)||maxWidth<0||maxWidth>MAX_SIDE)throw Error("IMAGE_WIDTH_INVALID");
 const image=await createImageBitmap(file);
 let canvas:HTMLCanvasElement|null=null;
 try{
  const sourceW=image.width,sourceH=image.height;
  if(!sourceW||!sourceH||sourceW>MAX_SIDE||sourceH>MAX_SIDE||sourceW*sourceH>MAX_PIXELS)throw Error("IMAGE_DIMENSIONS_TOO_LARGE");
  const width=maxWidth>0?Math.min(sourceW,maxWidth):sourceW;
  const height=Math.max(1,Math.round(sourceH*width/sourceW));
  if(width*height>MAX_PIXELS)throw Error("IMAGE_DIMENSIONS_TOO_LARGE");
  canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const context=canvas.getContext("2d",{alpha:mime!=="image/jpeg"});
  if(!context)throw Error("IMAGE_CANVAS_UNAVAILABLE");
  if(mime==="image/jpeg"){context.fillStyle="#fff";context.fillRect(0,0,width,height)}
  context.imageSmoothingEnabled=true;context.imageSmoothingQuality="high";
  context.drawImage(image,0,0,width,height);
  return await new Promise<Blob>((resolve,reject)=>canvas!.toBlob(blob=>blob?resolve(blob):reject(Error("IMAGE_EXPORT_FAILED")),mime,mime==="image/png"?undefined:Math.max(.4,Math.min(.95,quality))));
 }finally{
  image.close?.();
  if(canvas){canvas.width=1;canvas.height=1}
 }
}
export function makeUniqueBatchName(name:string,ext:"jpg"|"png"|"webp",used:Set<string>){
 const clean=name.replace(/[\u0000-\u001f\u007f\\/:*?"<>|]/g,"_").trim()||"image";
 const base=(clean.replace(/\.[^.]+$/,"")||"image").slice(0,100);
 let output=base+"."+ext,index=2;
 while(used.has(output.toLowerCase()))output=base+"-"+index++ +"."+ext;
 used.add(output.toLowerCase());
 return output;
}
