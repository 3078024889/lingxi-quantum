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
async function animatedPng(file:File,bytes:Uint8Array){
 // A valid APNG may place large ancillary chunks before acTL/IDAT.
 // Read only the next 8-byte chunk header beyond the initial preview; never decode
 // while the animation state is unknown, and cap scanning to bound CPU work.
 let i=8,chunks=0;
 while(i+12<=file.size&&chunks++<4096){
  const header=i+8<=bytes.length?bytes.subarray(i,i+8):
   new Uint8Array(await file.slice(i,i+8).arrayBuffer());
  if(header.length!==8)break;
  const length=((header[0]*2**24)+(header[1]<<16)+(header[2]<<8)+header[3])>>>0;
  const tag=String.fromCharCode(...header.subarray(4,8));
  if(length>file.size-i-12)throw Error("IMAGE_STRUCTURE_UNVERIFIED");
  if(tag==="acTL")return true;
  if(tag==="IDAT")return false;
  if(tag==="IEND")break;
  i+=12+length;
 }
 throw Error("IMAGE_STRUCTURE_UNVERIFIED");
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

/** Reject oversized headers before createImageBitmap allocates decoded pixels. */
function imageSizeHeader(bytes:Uint8Array,type:BatchImageMime):{width:number;height:number}|null{
 const be=(i:number)=>(bytes[i]*16777216+bytes[i+1]*65536+bytes[i+2]*256+bytes[i+3])>>>0;
 if(type==="image/png"){
  if(bytes.length>=24&&String.fromCharCode(...bytes.subarray(12,16))==="IHDR")return{width:be(16),height:be(20)};
  return null;
 }
 if(type==="image/jpeg"){
  let i=2;
  while(i+9<bytes.length){
   if(bytes[i]!==255){i++;continue}
   let marker=i+1;
   while(marker<bytes.length&&bytes[marker]===255)marker++;
   if(marker>=bytes.length)break;
   const code=bytes[marker];
   if(code===0xda||code===0xd9)break;
   if(code===0xd8||code===0x01||(code>=0xd0&&code<=0xd7)){i=marker+1;continue}
   if(marker+2>=bytes.length)break;
   const segment=(bytes[marker+1]<<8)|bytes[marker+2];
   if(segment<2||marker+1+segment>bytes.length)break;
   if(((code>=0xc0&&code<=0xc3)||(code>=0xc5&&code<=0xc7)||(code>=0xc9&&code<=0xcb)||(code>=0xcd&&code<=0xcf))&&segment>=7){
    return{height:(bytes[marker+4]<<8)|bytes[marker+5],width:(bytes[marker+6]<<8)|bytes[marker+7]};
   }
   i=marker+1+segment;
  }
  return null;
 }
 if(bytes.length<30)return null;
 const tag=String.fromCharCode(...bytes.subarray(12,16));
 if(tag==="VP8X")return{
  width:1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16),
  height:1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16)
 };
 if(tag==="VP8 ")return{width:((bytes[27]&63)<<8)|bytes[26],height:((bytes[29]&63)<<8)|bytes[28]};
 if(tag==="VP8L"&&bytes[20]===47)return{
  width:1+bytes[21]+((bytes[22]&63)<<8),
  height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10)
 };
 return null;
}

/** Protect users against animation flattening, including mislabeled file extensions. */
export async function validateStaticBatchImage(file:File){
 const head=new Uint8Array(await file.slice(0,Math.min(file.size,1024*1024)).arrayBuffer());
 const found=signature(head);
 if(!found)throw Error("UNSUPPORTED_IMAGE_BYTES");
 if(file.type&&file.type!==found)throw Error("IMAGE_MIME_MISMATCH");
 if(found==="image/png"&&await animatedPng(file,head))throw Error("ANIMATED_IMAGE_UNSUPPORTED");
 if(found==="image/webp"&&animatedWebp(head))throw Error("ANIMATED_IMAGE_UNSUPPORTED");
 const dimensions=imageSizeHeader(head,found);
 if(!dimensions)throw Error("IMAGE_STRUCTURE_UNVERIFIED");
 if(dimensions&&(!dimensions.width||!dimensions.height||dimensions.width>MAX_SIDE||dimensions.height>MAX_SIDE||dimensions.width*dimensions.height>MAX_PIXELS))throw Error("IMAGE_DIMENSIONS_TOO_LARGE");
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
