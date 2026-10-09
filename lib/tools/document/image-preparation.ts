import {extractHandwritingPixels} from "./signature-ink";
export type CopyTone="bw"|"gray"|"color";
export type PreparedImage={dataUrl:string;width:number;height:number};

function loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("IMAGE_LOAD_FAILED"));im.src=src;});}
function fileData(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));r.readAsDataURL(file);});}

export async function prepareSignatureOrStamp(file:File,mode:"signature"|"stamp"="stamp",sensitivity=60):Promise<PreparedImage>{
 const src=await fileData(file),im=await loadImage(src);const c=document.createElement("canvas");const scale=mode==="signature"?Math.min(1,2048/Math.max(im.naturalWidth,im.naturalHeight),Math.sqrt(4_000_000/(im.naturalWidth*im.naturalHeight))):1;c.width=Math.max(1,Math.round(im.naturalWidth*scale));c.height=Math.max(1,Math.round(im.naturalHeight*scale));const ctx=c.getContext("2d");if(!ctx)throw new Error("CANVAS_UNAVAILABLE");ctx.drawImage(im,0,0);
 if(mode==="signature"){
  const image=ctx.getImageData(0,0,c.width,c.height);
  const out=extractHandwritingPixels(image.data,c.width,c.height,sensitivity);
  const cut=document.createElement("canvas");cut.width=out.width;cut.height=out.height;
  const cutCtx=cut.getContext("2d");if(!cutCtx)throw new Error("CANVAS_UNAVAILABLE");
  const pixels=cutCtx.createImageData(out.width,out.height);pixels.data.set(out.pixels);
  cutCtx.putImageData(pixels,0,0);
  return {dataUrl:cut.toDataURL("image/png"),width:cut.width,height:cut.height};
 }
 const img=ctx.getImageData(0,0,c.width,c.height),d=img.data;
 let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4,r=d[i],g=d[i+1],b=d[i+2];const mx=Math.max(r,g,b),mn=Math.min(r,g,b),nearWhite=mx>238&&mn>225;if(nearWhite)d[i+3]=0;else if(d[i+3]>12){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}
 ctx.putImageData(img,0,0);if(maxX<minX||maxY<minY)return{dataUrl:c.toDataURL("image/png"),width:c.width,height:c.height};
 const pad=Math.max(3,Math.round(Math.max(maxX-minX+1,maxY-minY+1)*.035));const sx=Math.max(0,minX-pad),sy=Math.max(0,minY-pad),ex=Math.min(c.width,maxX+pad+1),ey=Math.min(c.height,maxY+pad+1);const out=document.createElement("canvas");out.width=ex-sx;out.height=ey-sy;out.getContext("2d")!.drawImage(c,sx,sy,out.width,out.height,0,0,out.width,out.height);return{dataUrl:out.toDataURL("image/png"),width:out.width,height:out.height};
}

export async function renderDocumentCopyImage(file:File,tone:CopyTone):Promise<HTMLCanvasElement>{
 const src=await fileData(file),im=await loadImage(src);const c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;const ctx=c.getContext("2d")!;ctx.drawImage(im,0,0);if(tone==="color")return c;const img=ctx.getImageData(0,0,c.width,c.height),d=img.data;
 for(let i=0;i<d.length;i+=4){const gray=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];let v=tone==="gray"?gray:(gray>210?255:gray<70?0:(gray-70)/140*255);if(tone==="gray")v=v>242?255:Math.max(0,Math.min(255,(v-18)*1.12));d[i]=d[i+1]=d[i+2]=Math.round(v);}ctx.putImageData(img,0,0);return c;
}
