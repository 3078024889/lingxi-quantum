import{presetPixels,type IdPhotoPreset}from"./presets";
import{portraitMatte}from"./modnet-runtime";

export type IdPhotoProcessOptions={background:string;preset:IdPhotoPreset;zoom:number;offsetX:number;offsetY:number;matting?:boolean};
export type IdPhotoProcessResult={blob:Blob;hdBlob:Blob;width:number;height:number;hdWidth:number;hdHeight:number;faceDetected:boolean;mattingApplied:boolean;quality:string;warnings:string[];rotation:number};

const backgrounds:Record<string,[number,number,number]>={white:[255,255,255],blue:[67,142,219],red:[217,54,62],gray:[229,231,235]};
function toBlob(c:HTMLCanvasElement){return new Promise<Blob>((resolve,reject)=>c.toBlob(x=>x?resolve(x):reject(new Error("IMAGE_EXPORT_FAILED")),"image/png"))}
function clamp(v:number,a=0,b=1){return Math.max(a,Math.min(b,v))}
type FaceInfo={box:{x:number;y:number;width:number;height:number};angle:number};

async function detectFace(bitmap:ImageBitmap):Promise<FaceInfo|null>{
 const FD=(globalThis as any).FaceDetector;if(!FD)return null;
 try{
  const faces=await new FD({fastMode:false,maxDetectedFaces:1}).detect(bitmap),f=faces?.[0];if(!f?.boundingBox)return null;
  let angle=0;
  const marks=Array.isArray(f.landmarks)?f.landmarks:[];
  const eyes=marks.filter((m:any)=>String(m.type||"").toLowerCase().includes("eye"));
  if(eyes.length>=2){
   const point=(m:any)=>m.locations?.[0]||m.location||m;
   const a=point(eyes[0]),b=point(eyes[1]);
   if(Number.isFinite(a?.x)&&Number.isFinite(a?.y)&&Number.isFinite(b?.x)&&Number.isFinite(b?.y))
    angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  }
  return{box:f.boundingBox,angle};
 }catch{return null}
}

async function rotateBitmap(bitmap:ImageBitmap,degrees:number){
 if(Math.abs(degrees)<.6)return bitmap;
 const r=degrees*Math.PI/180,cs=Math.abs(Math.cos(r)),sn=Math.abs(Math.sin(r));
 const w=Math.ceil(bitmap.width*cs+bitmap.height*sn),h=Math.ceil(bitmap.width*sn+bitmap.height*cs);
 const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d")!;
 x.translate(w/2,h/2);x.rotate(r);x.drawImage(bitmap,-bitmap.width/2,-bitmap.height/2);
 const next=await createImageBitmap(c);bitmap.close?.();return next;
}

function smoothAlpha(a:number){a=clamp(a);const lo=.025,hi=.975;if(a<=lo)return 0;if(a>=hi)return 1;const t=(a-lo)/(hi-lo);return t*t*(3-2*t)}
function compositePixel(fr:number,fg:number,fb:number,a:number,bg:[number,number,number]){
 // Edge decontamination: remove a conservative estimate of the original background spill
 // only in semi-transparent pixels. Fully opaque facial pixels remain untouched.
 if(a>.995)return[fr,fg,fb] as const;
 const safe=Math.max(.08,a),spill=1-a;
 const rr=clamp((fr/255-spill*.92)/safe)*255;
 const gg=clamp((fg/255-spill*.92)/safe)*255;
 const bb=clamp((fb/255-spill*.92)/safe)*255;
 const edge=clamp((a-.08)/.84);
 const er=rr*edge+fr*(1-edge),eg=gg*edge+fg*(1-edge),eb=bb*edge+fb*(1-edge);
 return[
  Math.round(er*a+bg[0]*(1-a)),
  Math.round(eg*a+bg[1]*(1-a)),
  Math.round(eb*a+bg[2]*(1-a))
 ] as const;
}

async function render(img:ImageBitmap,matte:any,face:FaceInfo|null,o:IdPhotoProcessOptions,width:number,height:number,scale:number){
 const W=width*scale,H=height*scale,c=document.createElement("canvas");c.width=W;c.height=H;
 const ctx=c.getContext("2d",{willReadFrequently:true})!,bg=backgrounds[o.background]||backgrounds.white;
 ctx.fillStyle=`rgb(${bg[0]} ${bg[1]} ${bg[2]})`;ctx.fillRect(0,0,W,H);
 const targetAspect=width/height,srcAspect=img.width/img.height;let sw=img.width,sh=img.height;
 if(srcAspect>targetAspect)sw=img.height*targetAspect;else sh=img.width/targetAspect;
 const zoom=Math.max(.82,Math.min(2.2,o.zoom||1));sw/=zoom;sh/=zoom;
 let cx=face?face.box.x+face.box.width/2:img.width/2,cy=face?face.box.y+face.box.height*.58:img.height*.44;
 cx+=o.offsetX*sw*.32;cy+=o.offsetY*sh*.32;
 const sx=Math.max(0,Math.min(img.width-sw,cx-sw/2)),sy=Math.max(0,Math.min(img.height-sh,cy-sh*.43));
 const fg=document.createElement("canvas");fg.width=W;fg.height=H;const fc=fg.getContext("2d",{willReadFrequently:true})!;
 fc.imageSmoothingEnabled=true;fc.imageSmoothingQuality="high";fc.drawImage(img,sx,sy,sw,sh,0,0,W,H);
 if(!matte){ctx.drawImage(fg,0,0);return c}
 const im=fc.getImageData(0,0,W,H),d=im.data,out=ctx.createImageData(W,H),od=out.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=(y*W+x)*4,ix=sx+(x/W)*sw,iy=sy+(y/H)*sh,a=smoothAlpha(matte.alphaAt(ix,iy));
  const [r,g,b]=compositePixel(d[i],d[i+1],d[i+2],a,bg);od[i]=r;od[i+1]=g;od[i+2]=b;od[i+3]=255;
 }
 ctx.putImageData(out,0,0);return c;
}

export async function processIdPhoto(file:File,o:IdPhotoProcessOptions):Promise<IdPhotoProcessResult>{
 let img=await createImageBitmap(file,{imageOrientation:"from-image"} as ImageBitmapOptions);
 if(Math.min(img.width,img.height)<600)throw new Error("PHOTO_TOO_SMALL");
 let face=await detectFace(img),rotation=face?.angle||0;
 if(Math.abs(rotation)>18){img.close?.();throw new Error("FACE_ANGLE_TOO_LARGE")}
 if(Math.abs(rotation)>.8){img=await rotateBitmap(img,-rotation);face=await detectFace(img)}
 const matte=o.matting===false?null:await portraitMatte(img),{width,height}=presetPixels(o.preset);
 const standard=await render(img,matte,face,o,width,height,1),hd=await render(img,matte,face,o,width,height,3);
 const warnings:string[]=[];if(!face)warnings.push("FACE_NOT_DETECTED");
 const result={blob:await toBlob(standard),hdBlob:await toBlob(hd),width,height,hdWidth:width*3,hdHeight:height*3,faceDetected:Boolean(face),mattingApplied:Boolean(matte),quality:matte?"portrait-matted":"crop-only",warnings,rotation};
 img.close?.();return result;
}
