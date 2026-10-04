import {smartCrop} from "./image-smart-crop";
export type ResizeFitMode="smart"|"cover"|"contain"|"stretch";
export type ResizeOutputMime="image/jpeg"|"image/png"|"image/webp";
export type ResizeRequest={
 width:number;height:number;fit:ResizeFitMode;focusX?:number;focusY?:number;background?:string;
 output?:ResizeOutputMime;quality?:number;allowUpscale?:boolean;
};
export type ResizeResult={
 blob:Blob;width:number;height:number;sourceWidth:number;sourceHeight:number;cropped:boolean;cropMethod?:string;
};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const safe=(n:number)=>Math.max(1,Math.min(16384,Math.round(Number.isFinite(n)?n:1)));
function canvas(w:number,h:number){const c=document.createElement("canvas");c.width=safe(w);c.height=safe(h);return c}
function ctx2d(c:HTMLCanvasElement){const x=c.getContext("2d");if(!x)throw new Error("2D_CONTEXT_UNAVAILABLE");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";return x}
function blob(c:HTMLCanvasElement,type:ResizeOutputMime,q:number){return new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("IMAGE_EXPORT_FAILED")),type,type==="image/png"?undefined:clamp(q,.4,1)))}
function coverCrop(sw:number,sh:number,tw:number,th:number,fx=50,fy=50){
 const sr=sw/sh,tr=tw/th;let w=sw,h=sh;if(sr>tr)w=sh*tr;else if(sr<tr)h=sw/tr;
 const mx=Math.max(0,sw-w),my=Math.max(0,sh-h);return{x:mx*clamp(fx/100,0,1),y:my*clamp(fy/100,0,1),width:w,height:h};
}
function progressive(source:CanvasImageSource,sw:number,sh:number,tw:number,th:number){
 let current=source,cw=sw,ch=sh;
 while(cw/tw>2||ch/th>2){
   const nw=Math.max(tw,Math.round(cw/2)),nh=Math.max(th,Math.round(ch/2)),step=canvas(nw,nh);
   ctx2d(step).drawImage(current,0,0,cw,ch,0,0,nw,nh);current=step;cw=nw;ch=nh;
 }
 return{source:current,width:cw,height:ch};
}
export async function resizeImagePro(file:File,r:ResizeRequest):Promise<ResizeResult>{
 const bmp=await createImageBitmap(file);
 try{
   const tw=safe(r.width),th=safe(r.height),type=r.output??"image/jpeg",q=r.quality??.92,bg=r.background??"#ffffff",up=r.allowUpscale??true;
   const out=canvas(tw,th),x=ctx2d(out);
   if(type!=="image/png"||r.fit==="contain"){x.fillStyle=bg;x.fillRect(0,0,tw,th)}else x.clearRect(0,0,tw,th);
   let cropped=false,cropMethod="";
   if(r.fit==="stretch"){
     const s=progressive(bmp,bmp.width,bmp.height,tw,th);x.drawImage(s.source,0,0,s.width,s.height,0,0,tw,th);
   }else if(r.fit==="contain"){
     const scale=Math.min(tw/bmp.width,th/bmp.height,up?Infinity:1),dw=Math.max(1,Math.round(bmp.width*scale)),dh=Math.max(1,Math.round(bmp.height*scale));
     const s=progressive(bmp,bmp.width,bmp.height,dw,dh);x.drawImage(s.source,0,0,s.width,s.height,Math.round((tw-dw)/2),Math.round((th-dh)/2),dw,dh);
   }else{
     const c=r.fit==="smart"?await smartCrop(bmp,tw/th):coverCrop(bmp.width,bmp.height,tw,th,r.focusX??50,r.focusY??50);
     cropMethod=r.fit==="smart"?(c as any).method:"manual-focus";
     cropped=Math.abs(c.width-bmp.width)>.5||Math.abs(c.height-bmp.height)>.5;
     const scale=Math.max(tw/c.width,th/c.height);
     if(!up&&scale>1){
       // Preserve requested ratio without inventing detail: contain the crop instead of upscaling.
       const dw=Math.max(1,Math.round(c.width)),dh=Math.max(1,Math.round(c.height));
       x.clearRect(0,0,tw,th);x.fillStyle=bg;x.fillRect(0,0,tw,th);
       x.drawImage(bmp,c.x,c.y,c.width,c.height,Math.round((tw-dw)/2),Math.round((th-dh)/2),dw,dh);
     }else x.drawImage(bmp,c.x,c.y,c.width,c.height,0,0,tw,th);
   }
   return{blob:await blob(out,type,q),width:tw,height:th,sourceWidth:bmp.width,sourceHeight:bmp.height,cropped,cropMethod};
 }finally{bmp.close?.()}
}
export function extensionForResizeMime(type:ResizeOutputMime){return type==="image/png"?"png":type==="image/webp"?"webp":"jpg"}
