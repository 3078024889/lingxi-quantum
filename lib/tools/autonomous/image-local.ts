
export type NormalizedBox={x:number;y:number;w:number;h:number};
export type NormalizedPoint={x:number;y:number};
export type NormalizedStroke={points:NormalizedPoint[];radius:number};

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


function paintMaskCircle(mask:Uint8Array,w:number,h:number,cx:number,cy:number,radius:number){
 const x0=Math.max(0,Math.floor(cx-radius)),x1=Math.min(w-1,Math.ceil(cx+radius));
 const y0=Math.max(0,Math.floor(cy-radius)),y1=Math.min(h-1,Math.ceil(cy+radius)),r2=radius*radius;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if((x-cx)*(x-cx)+(y-cy)*(y-cy)<=r2)mask[y*w+x]=1;
}
function normalizedStrokeMask(strokes:NormalizedStroke[],w:number,h:number){
 const mask=new Uint8Array(w*h),scale=Math.min(w,h);
 for(const stroke of strokes){
  if(!stroke.points.length)continue;
  const radius=Math.max(1,stroke.radius*scale);
  for(let i=0;i<stroke.points.length;i++){
   const p=stroke.points[i],x=p.x*w,y=p.y*h;
   paintMaskCircle(mask,w,h,x,y,radius);
   if(i){
    const q=stroke.points[i-1],qx=q.x*w,qy=q.y*h,dx=x-qx,dy=y-qy;
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/(Math.max(1,radius*.6))));
    for(let n=1;n<steps;n++){const t=n/steps;paintMaskCircle(mask,w,h,qx+dx*t,qy+dy*t,radius)}
   }
  }
 }
 // Expand one pixel so anti-aliased watermark edges are not left as a halo.
 const expanded=mask.slice();
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(mask[y*w+x]){
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)expanded[(y+dy)*w+x+dx]=1;
 }
 return expanded;
}

export function diffuseMaskedPixels(input:Uint8ClampedArray,w:number,h:number,mask:Uint8Array){
 if(w<1||h<1||input.length!==w*h*4||mask.length!==w*h)throw new Error("INPAINT_INPUT_INVALID");
 const d=new Uint8ClampedArray(input),known=new Uint8Array(mask.length),queued=new Uint8Array(mask.length);
 let remaining=0;
 for(let i=0;i<mask.length;i++){known[i]=mask[i]?0:1;if(mask[i])remaining++}
 if(!remaining)throw new Error("SELECT_AREA_FIRST");
 if(remaining>w*h*.55)throw new Error("SELECTION_TOO_LARGE");
 const neighbors=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]] as const;
 const hasKnownNeighbor=(i:number)=>{
  const x=i%w,y=(i-x)/w;
  for(const [dx,dy]of neighbors){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<w&&ny<h&&known[ny*w+nx])return true}
  return false;
 };
 let frontier:number[]=[];
 for(let i=0;i<mask.length;i++)if(mask[i]&&hasKnownNeighbor(i)){frontier.push(i);queued[i]=1}
 while(frontier.length&&remaining>0){
  const ready:Array<{i:number;r:number;g:number;b:number;a:number}>=[];
  for(const i of frontier){
   if(known[i])continue;
   const x=i%w,y=(i-x)/w;let weight=0,r=0,g=0,b=0,a=0;
   for(const [dx,dy]of neighbors){
    const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;
    const ni=ny*w+nx;if(!known[ni])continue;
    const k=ni*4,wt=(dx!==0&&dy!==0)?0.72:1;weight+=wt;r+=d[k]*wt;g+=d[k+1]*wt;b+=d[k+2]*wt;a+=d[k+3]*wt;
   }
   if(weight)ready.push({i,r:r/weight,g:g/weight,b:b/weight,a:a/weight});
  }
  if(!ready.length)break;
  const next:number[]=[];
  for(const v of ready){const k=v.i*4;d[k]=Math.round(v.r);d[k+1]=Math.round(v.g);d[k+2]=Math.round(v.b);d[k+3]=Math.round(v.a);known[v.i]=1;remaining--}
  for(const v of ready){
   const x=v.i%w,y=(v.i-x)/w;
   for(const [dx,dy]of neighbors){
    const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;
    const ni=ny*w+nx;if(mask[ni]&&!known[ni]&&!queued[ni]){queued[ni]=1;next.push(ni)}
   }
  }
  frontier=next;
 }
 if(remaining)throw new Error("INPAINT_INCOMPLETE");
 return d;
}

export async function localInpaintMask(file:File,strokes:NormalizedStroke[]){
 if(!strokes.some(s=>s.points.length))throw new Error("SELECT_AREA_FIRST");
 const img=await bitmap(file),c=document.createElement("canvas");c.width=img.width;c.height=img.height;
 const ctx=c.getContext("2d",{willReadFrequently:true})!;ctx.drawImage(img,0,0);img.close?.();
 const image=ctx.getImageData(0,0,c.width,c.height),mask=normalizedStrokeMask(strokes,c.width,c.height);
 image.data.set(diffuseMaskedPixels(image.data,c.width,c.height,mask));
 ctx.putImageData(image,0,0);
 return await blobOf(c,"image/png");
}
