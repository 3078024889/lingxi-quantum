export type SmartCropRect={x:number;y:number;width:number;height:number;score:number;method:string};

type FaceRect={x:number;y:number;width:number;height:number};

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function targetCrop(sw:number,sh:number,ratio:number){
 if(sw/sh>ratio)return {width:sh*ratio,height:sh};
 return {width:sw,height:sw/ratio};
}
function intersects(a:{x:number;y:number;width:number;height:number},b:FaceRect){
 const x=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));
 const y=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
 return x*y;
}
async function detectNativeFaces(bitmap:ImageBitmap):Promise<FaceRect[]>{
 try{
   const C=(globalThis as any).FaceDetector;
   if(!C)return[];
   const detector=new C({fastMode:true,maxDetectedFaces:12});
   const faces=await detector.detect(bitmap);
   return faces.map((f:any)=>({
     x:Number(f.boundingBox?.x||0),y:Number(f.boundingBox?.y||0),
     width:Number(f.boundingBox?.width||0),height:Number(f.boundingBox?.height||0)
   })).filter((f:FaceRect)=>f.width>0&&f.height>0);
 }catch{return[]}
}
function pixelScore(data:Uint8ClampedArray,w:number,h:number){
 const scores=new Float32Array(w*h);
 for(let y=1;y<h-1;y++){
   for(let x=1;x<w-1;x++){
     const i=(y*w+x)*4;
     const r=data[i],g=data[i+1],b=data[i+2];
     const max=Math.max(r,g,b),min=Math.min(r,g,b);
     const sat=max?((max-min)/max):0;
     const lum=.2126*r+.7152*g+.0722*b;
     const il=(y*w+x-1)*4,ir=(y*w+x+1)*4,iu=((y-1)*w+x)*4,id=((y+1)*w+x)*4;
     const lL=.2126*data[il]+.7152*data[il+1]+.0722*data[il+2];
     const lR=.2126*data[ir]+.7152*data[ir+1]+.0722*data[ir+2];
     const lU=.2126*data[iu]+.7152*data[iu+1]+.0722*data[iu+2];
     const lD=.2126*data[id]+.7152*data[id+1]+.0722*data[id+2];
     const edge=(Math.abs(lR-lL)+Math.abs(lD-lU))/510;
     // Skin-tone preference inspired by "attention" strategies; it is only a soft cue.
     const skin=(r>95&&g>40&&b>20&&r>g&&r>b&&Math.abs(r-g)>15&&(max-min)>15)?1:0;
     const centerX=1-Math.abs((x/(w-1))-.5)*2;
     const centerY=1-Math.abs((y/(h-1))-.5)*2;
     const centerBias=.15*(centerX*.6+centerY*.4);
     scores[y*w+x]=edge*1.75+sat*.45+skin*.7+centerBias+(lum>30&&lum<225?.05:0);
   }
 }
 return scores;
}
function rectScore(map:Float32Array,w:number,h:number,r:{x:number;y:number;width:number;height:number}){
 const x0=clamp(Math.floor(r.x),0,w-1),y0=clamp(Math.floor(r.y),0,h-1);
 const x1=clamp(Math.ceil(r.x+r.width),1,w),y1=clamp(Math.ceil(r.y+r.height),1,h);
 let s=0,n=0;
 for(let y=y0;y<y1;y+=2)for(let x=x0;x<x1;x+=2){s+=map[y*w+x];n++}
 return n?s/n:0;
}
export async function smartCrop(bitmap:ImageBitmap,targetRatio:number):Promise<SmartCropRect>{
 const sw=bitmap.width,sh=bitmap.height;
 const base=targetCrop(sw,sh,targetRatio);
 if(Math.abs(sw/sh-targetRatio)<.001)return{x:0,y:0,width:sw,height:sh,score:1,method:"already-matching"};

 const analysisMax=320,scale=Math.min(1,analysisMax/Math.max(sw,sh));
 const aw=Math.max(16,Math.round(sw*scale)),ah=Math.max(16,Math.round(sh*scale));
 const c=document.createElement("canvas");c.width=aw;c.height=ah;
 const ctx=c.getContext("2d",{willReadFrequently:true});
 if(!ctx)throw new Error("SMART_CROP_CONTEXT_UNAVAILABLE");
 ctx.drawImage(bitmap,0,0,aw,ah);
 const img=ctx.getImageData(0,0,aw,ah),map=pixelScore(img.data,aw,ah);
 const faces=await detectNativeFaces(bitmap);

 const cropW=base.width*scale,cropH=base.height*scale;
 const maxX=Math.max(0,aw-cropW),maxY=Math.max(0,ah-cropH);
 let best:{x:number;y:number;width:number;height:number;score:number}|null=null;
 const steps=16;
 for(let yi=0;yi<=steps;yi++){
   for(let xi=0;xi<=steps;xi++){
     const x=maxX*(xi/steps),y=maxY*(yi/steps);
     const r={x,y,width:cropW,height:cropH};
     let score=rectScore(map,aw,ah,r);
     if(faces.length){
       const original={x:x/scale,y:y/scale,width:base.width,height:base.height};
       for(const face of faces){
         const overlap=intersects(original,face);
         const ratio=overlap/Math.max(1,face.width*face.height);
         score+=ratio*2.8-(1-ratio)*1.4;
       }
     }
     // Mild rule-of-thirds preference, never strong enough to override content.
     const cx=x+cropW/2,cy=y+cropH/2;
     const rx=Math.min(Math.abs(cx-aw/3),Math.abs(cx-aw*2/3))/aw;
     const ry=Math.min(Math.abs(cy-ah/3),Math.abs(cy-ah*2/3))/ah;
     score+=Math.max(0,.08-(rx+ry)*.1);
     if(!best||score>best.score)best={...r,score};
   }
 }
 const b=best!;
 return {
   x:b.x/scale,y:b.y/scale,width:b.width/scale,height:b.height/scale,score:b.score,
   method:faces.length?"attention+native-face":"attention"
 };
}
