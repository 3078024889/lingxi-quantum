// Check actual ISO BMFF/HEVC brands before allocating the browser decoder.
// HEIC names and browser-supplied MIME values are never proof of file format.
const HEVC_BRANDS=new Set(["heic","heix","hevc","hevx","heim","heis","hevm","hevs"]);
const brand=(bytes:Uint8Array,pos:number)=>String.fromCharCode(...bytes.subarray(pos,pos+4));

export async function hasHeicContainer(blob:Blob):Promise<boolean>{
 if(blob.size<20)return false;
 const bytes=new Uint8Array(await blob.slice(0,192).arrayBuffer());
 if(brand(bytes,4)!=="ftyp")return false;
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const size=view.getUint32(0,false);
 const extended=size===1;
 if(size===0)return false; // an unbounded brand box isn't a defensible image declaration
 const header=extended?16:8,minimum=header+12;
 if(blob.size<minimum||bytes.length<minimum)return false;
 const boxSize=extended?Number(view.getBigUint64(8,false)):size;
 if(!Number.isSafeInteger(boxSize)||boxSize<minimum||boxSize>blob.size)return false;
 if(HEVC_BRANDS.has(brand(bytes,header)))return true;
 const end=Math.min(bytes.byteLength,boxSize);
 for(let i=header+8;i+4<=end;i+=4)if(HEVC_BRANDS.has(brand(bytes,i)))return true;
 return false;
}

// A generated .jpg must be a real, decodable JPEG; do not trust the decoder's
// claimed MIME or a renamed PNG. The browser stage also checks image decoding.
export async function verifiedJpeg(blob:Blob){
 if(!blob||blob.size<8)throw new Error("JPEG_OUTPUT_EMPTY");
 const head=new Uint8Array(await blob.slice(0,4).arrayBuffer());
 const tail=new Uint8Array(await blob.slice(blob.size-4).arrayBuffer());
 if(head[0]!==255||head[1]!==216||head[2]!==255||!(tail[2]===255&&tail[3]===217))
  throw new Error("JPEG_OUTPUT_INVALID");
 if(typeof createImageBitmap==="function"){
  const bitmap=await createImageBitmap(blob);
  try{if(bitmap.width<1||bitmap.height<1)throw new Error("JPEG_OUTPUT_EMPTY")}finally{bitmap.close()}
 }
 return blob;
}
