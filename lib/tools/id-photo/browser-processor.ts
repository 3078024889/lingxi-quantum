import{presetPixels,type IdPhotoPreset}from"./presets";import{portraitMatte}from"./modnet-runtime";
export type IdPhotoProcessOptions={background:string;preset:IdPhotoPreset;zoom:number;offsetX:number;offsetY:number;matting?:boolean};
const bg:Record<string,string>={white:"#ffffff",blue:"#438edb",red:"#d9363e",gray:"#e5e7eb"};
function toBlob(c:HTMLCanvasElement){return new Promise<Blob>((resolve,reject)=>c.toBlob(x=>x?resolve(x):reject(new Error("IMAGE_EXPORT_FAILED")),"image/png"))}
async function detectFace(bitmap:ImageBitmap){const FD=(globalThis as any).FaceDetector;if(!FD)return null;try{const f=await new FD({fastMode:false,maxDetectedFaces:1}).detect(bitmap);return f?.[0]?.boundingBox||null}catch{return null}}
export async function processIdPhoto(file:File,o:IdPhotoProcessOptions){
 const img=await createImageBitmap(file),face=await detectFace(img),matte=o.matting===false?null:await portraitMatte(img),{width,height}=presetPixels(o.preset),c=document.createElement("canvas");c.width=width;c.height=height;const ctx=c.getContext("2d",{willReadFrequently:true})!;
 ctx.fillStyle=bg[o.background]||bg.white;ctx.fillRect(0,0,width,height);
 const targetAspect=width/height,srcAspect=img.width/img.height;let sw=img.width,sh=img.height;if(srcAspect>targetAspect)sw=img.height*targetAspect;else sh=img.width/targetAspect;
 const zoom=Math.max(.8,Math.min(2.4,o.zoom||1));sw/=zoom;sh/=zoom;let cx=face?face.x+face.width/2:img.width/2,cy=face?face.y+face.height*.62:img.height*.44;cx+=o.offsetX*sw*.35;cy+=o.offsetY*sh*.35;
 const sx=Math.max(0,Math.min(img.width-sw,cx-sw/2)),sy=Math.max(0,Math.min(img.height-sh,cy-sh*.43));
 const src=document.createElement("canvas");src.width=width;src.height=height;const sc=src.getContext("2d",{willReadFrequently:true})!;sc.drawImage(img,sx,sy,sw,sh,0,0,width,height);
 if(matte){const im=sc.getImageData(0,0,width,height),d=im.data;for(let y=0;y<height;y++)for(let x=0;x<width;x++){const si=(y*width+x)*4,ix=sx+x/width*sw,iy=sy+y/height*sh;let a=matte.alphaAt(ix,iy);a=a<.03?0:a>.97?1:a*a*(3-2*a);d[si+3]=Math.round(a*255)}sc.putImageData(im,0,0);ctx.drawImage(src,0,0)}
 else ctx.drawImage(src,0,0);
 img.close?.();return{blob:await toBlob(c),width,height,faceDetected:Boolean(face),mattingApplied:Boolean(matte),quality:matte?"portrait-matted":"crop-only"};
}
