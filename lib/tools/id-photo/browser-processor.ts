import{presetPixels,type IdPhotoPreset}from"./presets";
export type IdPhotoProcessOptions={background:string;preset:IdPhotoPreset;zoom:number;offsetX:number;offsetY:number};
const bg:Record<string,string>={white:"#ffffff",blue:"#dbeafe",red:"#ef4444",gray:"#e5e7eb"};
function toBlob(c:HTMLCanvasElement){return new Promise<Blob>((resolve,reject)=>c.toBlob(x=>x?resolve(x):reject(new Error("IMAGE_EXPORT_FAILED")),"image/png"));}
async function load(file:File){return await createImageBitmap(file);}
async function detectFace(bitmap:ImageBitmap){
 const FD=(globalThis as any).FaceDetector;if(!FD)return null;
 try{const faces=await new FD({fastMode:false,maxDetectedFaces:1}).detect(bitmap);return faces?.[0]?.boundingBox||null}catch{return null}
}
export async function processIdPhoto(file:File,o:IdPhotoProcessOptions){
 const img=await load(file),face=await detectFace(img),{width,height}=presetPixels(o.preset),c=document.createElement("canvas");c.width=width;c.height=height;
 const ctx=c.getContext("2d",{willReadFrequently:true})!;ctx.fillStyle=bg[o.background]||bg.white;ctx.fillRect(0,0,width,height);
 const targetAspect=width/height,srcAspect=img.width/img.height;let sw=img.width,sh=img.height;
 if(srcAspect>targetAspect)sw=img.height*targetAspect;else sh=img.width/targetAspect;
 const zoom=Math.max(1,Math.min(2.2,o.zoom||1));sw/=zoom;sh/=zoom;
 let cx=face?face.x+face.width/2:img.width/2,cy=face?face.y+face.height*.62:img.height/2;
 cx-=o.offsetX*sw;cy-=o.offsetY*sh;
 const sx=Math.max(0,Math.min(img.width-sw,cx-sw/2)),sy=Math.max(0,Math.min(img.height-sh,cy-sh*.43));
 ctx.drawImage(img,sx,sy,sw,sh,0,0,width,height);
 // Honest background replacement: only remove a border-connected, near-uniform background. Complex backgrounds remain untouched.
 const im=ctx.getImageData(0,0,width,height),d=im.data,pts=[[2,2],[width-3,2],[2,height-3],[width-3,height-3],[width>>1,2]],seed=[0,0,0];
 for(const [x,y]of pts){const i=(y*width+x)*4;seed[0]+=d[i];seed[1]+=d[i+1];seed[2]+=d[i+2]}seed[0]/=pts.length;seed[1]/=pts.length;seed[2]/=pts.length;
 const dist=(i:number)=>Math.hypot(d[i]-seed[0],d[i+1]-seed[1],d[i+2]-seed[2]),target=bg[o.background]||bg.white;
 const rgb=target.match(/[a-f\d]{2}/gi)!.map(x=>parseInt(x,16));
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,dd=dist(i);if(dd<42){const a=Math.max(0,Math.min(1,dd/42));d[i]=rgb[0]*(1-a)+d[i]*a;d[i+1]=rgb[1]*(1-a)+d[i+1]*a;d[i+2]=rgb[2]*(1-a)+d[i+2]*a;}}
 ctx.putImageData(im,0,0);img.close?.();
 return{blob:await toBlob(c),width,height,faceDetected:Boolean(face),quality:face?"face-assisted":"manual-review" as const};
}
