// Only dispatch actual HEIC/HEIF containers into the browser's libheif decoder.
// A filename or browser MIME declaration alone cannot establish the file type.
const HEVC_BRANDS=new Set(["heic","heix","hevc","hevx","heim","heis","hevm","hevs"]);
export async function hasHeicContainer(blob:Blob):Promise<boolean>{
 if(blob.size<20)return false;
 const bytes=new Uint8Array(await blob.slice(0,128).arrayBuffer());
 if(String.fromCharCode(...bytes.slice(4,8))!=="ftyp")return false;
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const length=view.getUint32(0,false);
 if(length!==0&&(length<20||length>blob.size))return false;
 const brands:string[]=[];
 // Size 1 is an extended-size BMFF box; decoder validation handles that case.
 const start=length===1?16:8;
 for(let i=start;i+4<=bytes.length;i+=4){
  if(i===12&&length!==1)continue; // minor_version, not a brand
  brands.push(String.fromCharCode(...bytes.slice(i,i+4)));
 }
 return brands.some(b=>HEVC_BRANDS.has(b));
}
export async function verifiedJpeg(blob:Blob){
 if(!blob||blob.size<4)throw new Error("JPEG_OUTPUT_EMPTY");
 const magic=new Uint8Array(await blob.slice(0,4).arrayBuffer());
 if(magic[0]!==255||magic[1]!==216||magic[2]!==255)throw new Error("JPEG_OUTPUT_INVALID");
 return blob;
}
