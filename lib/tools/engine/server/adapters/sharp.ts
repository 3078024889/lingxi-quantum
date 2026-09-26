import fs from "node:fs";

async function sharpModule(){
  const m=await import("sharp");
  return (m as any).default||m;
}
export async function sharpMetadata(input:string){
  const sharp=await sharpModule();
  return sharp(input,{failOn:"none"}).metadata();
}
export async function sharpConvert(input:string,output:string,format?:string,quality=88){
  const sharp=await sharpModule();
  let p=sharp(input,{failOn:"none"}).rotate();
  const f=(format||"").toLowerCase();
  if(f==="png")p=p.png();
  else if(f==="webp")p=p.webp({quality});
  else if(f==="avif")p=p.avif({quality});
  else p=p.jpeg({quality,mozjpeg:true});
  await p.toFile(output);
  return {output,bytes:fs.statSync(output).size,format:f||"jpeg"};
}
export async function sharpResize(input:string,output:string,width?:number,height?:number,fit:"inside"|"cover"|"contain"="inside"){
  const sharp=await sharpModule();
  await sharp(input,{failOn:"none"}).rotate().resize({
    width:width&&width>0?Math.round(width):undefined,
    height:height&&height>0?Math.round(height):undefined,
    fit,
    withoutEnlargement:false
  }).toFile(output);
  return {output,bytes:fs.statSync(output).size};
}
export async function sharpCompress(input:string,output:string,quality=82){
  const sharp=await sharpModule();
  const meta=await sharp(input,{failOn:"none"}).metadata();
  let p=sharp(input,{failOn:"none"}).rotate();
  if(meta.format==="png")p=p.png({compressionLevel:9,palette:true});
  else if(meta.format==="webp")p=p.webp({quality});
  else if(meta.format==="avif")p=p.avif({quality});
  else p=p.jpeg({quality,mozjpeg:true});
  await p.toFile(output);
  return {output,bytes:fs.statSync(output).size,inputBytes:fs.statSync(input).size};
}
export async function sharpStripMetadata(input:string,output:string){
  const sharp=await sharpModule();
  await sharp(input,{failOn:"none"}).rotate().withMetadata({exif:{}}).toFile(output);
  return {output,bytes:fs.statSync(output).size};
}
