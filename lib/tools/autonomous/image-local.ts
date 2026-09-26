
export type NormalizedBox={x:number;y:number;w:number;h:number};

async function bitmap(file:File){return await createImageBitmap(file)}
function blobOf(c:HTMLCanvasElement,type="image/png",quality=.94){
 return new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("IMAGE_EXPORT_FAILED")),type,quality));
}
function rgb(hex:string){
 const v=hex.replace("#","");const n=parseInt(v.length===3?v.split("").map(x=>x+x).join(""):v,16);
 return[(n>>16)&255,(n>>8)&255,n&255] as const;
}
function colorDistance(a:number[],b:number[]){
 return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);
}
export async function localIdPhoto(file:File,background:string){
 const img=await bitmap(file),c=document.createElement("canvas");
 c.width=img.width;c.height=img.height;const ctx=c.getContext("2d",{willReadFrequently:true})!;
 ctx.drawImage(img,0,0);img.close?.();
 const src=ctx.getImageData(0,0,c.width,c.height),d=src.data,w=c.width,h=c.height;
 const pts=[[2,2],[w-3,2],[2,h-3],[w-3,h-3],[Math.floor(w/2),2],[Math.floor(w/2),h-3]];
 const seed=[0,0,0];for(const [x,y] of pts){const i=(y*w+x)*4;seed[0]+=d[i];seed[1]+=d[i+1];seed[2]+=d[i+2]}
 seed[0]/=pts.length;seed[1]/=pts.length;seed[2]/=pts.length;
 const bgMap:Record<string,string>={white:"#ffffff","light blue":"#dbeafe",red:"#ef4444","light gray":"#e5e7eb"};
 const target=rgb(bgMap[background]||"#ffffff");
 const threshold=62,feather=38;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,dist=colorDistance([d[i],d[i+1],d[i+2]],seed);
   const edge=Math.min(x,y,w-1-x,h-1-y),edgeBias=edge<Math.min(w,h)*.08?14:0;
   const alpha=Math.max(0,Math.min(1,(dist-(threshold-edgeBias))/feather));
   d[i]=Math.round(target[0]*(1-alpha)+d[i]*alpha);
   d[i+1]=Math.round(target[1]*(1-alpha)+d[i+1]*alpha);
   d[i+2]=Math.round(target[2]*(1-alpha)+d[i+2]*alpha);
 }
 ctx.putImageData(src,0,0);
 return await blobOf(c,"image/png");
}
export async function localInpaint(file:File,box:NormalizedBox){
 const img=await bitmap(file),c=document.createElement("canvas");
 c.width=img.width;c.height=img.height;const ctx=c.getContext("2d",{willReadFrequently:true})!;
 ctx.drawImage(img,0,0);img.close?.();
 const im=ctx.getImageData(0,0,c.width,c.height),d=im.data,w=c.width,h=c.height;
 let x0=Math.max(1,Math.floor(box.x*w)),y0=Math.max(1,Math.floor(box.y*h));
 let x1=Math.min(w-2,Math.ceil((box.x+box.w)*w)),y1=Math.min(h-2,Math.ceil((box.y+box.h)*h));
 if(x1<=x0||y1<=y0)throw new Error("SELECT_AREA_FIRST");
 const at=(x:number,y:number)=>((Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x)))*4);
 const band=Math.max(2,Math.round(Math.min(w,h)*.004));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const fx=(x-x0)/Math.max(1,x1-x0),fy=(y-y0)/Math.max(1,y1-y0);
   const samples:number[][]=[];
   for(let b=1;b<=band;b++){
     for(const [sx,sy] of [[x,y0-b],[x,y1+b],[x0-b,y],[x1+b,y]]){
       const j=at(sx,sy);samples.push([d[j],d[j+1],d[j+2]]);
     }
   }
   const top=samples.slice(0,band),bottom=samples.slice(band,band*2),left=samples.slice(band*2,band*3),right=samples.slice(band*3);
   const avg=(arr:number[][],ch:number)=>arr.reduce((s,v)=>s+v[ch],0)/Math.max(1,arr.length);
   const i=at(x,y);
   for(let ch=0;ch<3;ch++){
     const vertical=avg(top,ch)*(1-fy)+avg(bottom,ch)*fy;
     const horizontal=avg(left,ch)*(1-fx)+avg(right,ch)*fx;
     d[i+ch]=Math.round((vertical+horizontal)/2);
   }
   d[i+3]=255;
 }
 ctx.putImageData(im,0,0);
 return await blobOf(c,"image/png");
}
