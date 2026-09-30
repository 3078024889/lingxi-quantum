"use client";
let sessionPromise:Promise<any>|null=null;
const ORT_VERSION="1.21.0";
async function ortRuntime(){
  const ort=await import("onnxruntime-web");
  ort.env.wasm.wasmPaths=`https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
  ort.env.wasm.numThreads=1;
  ort.env.wasm.proxy=false;
  return ort;
}
async function session(){
  if(sessionPromise)return sessionPromise;
  sessionPromise=(async()=>{
    const ort=await ortRuntime();
    return ort.InferenceSession.create("/models/id-photo/modnet.onnx",{
      executionProviders:["wasm"],graphOptimizationLevel:"all"
    });
  })();
  return sessionPromise;
}
function bilinear(mask:Float32Array,mw:number,mh:number,x:number,y:number){
  const fx=Math.max(0,Math.min(mw-1,x)),fy=Math.max(0,Math.min(mh-1,y));
  const x0=Math.floor(fx),y0=Math.floor(fy),x1=Math.min(mw-1,x0+1),y1=Math.min(mh-1,y0+1),dx=fx-x0,dy=fy-y0;
  return mask[y0*mw+x0]*(1-dx)*(1-dy)+mask[y0*mw+x1]*dx*(1-dy)+mask[y1*mw+x0]*(1-dx)*dy+mask[y1*mw+x1]*dx*dy;
}
export async function portraitMatte(bitmap:ImageBitmap){
  const ort=await ortRuntime(),size=512,c=document.createElement("canvas");c.width=size;c.height=size;
  const ctx=c.getContext("2d",{willReadFrequently:true})!;ctx.drawImage(bitmap,0,0,size,size);
  const d=ctx.getImageData(0,0,size,size).data,input=new Float32Array(3*size*size);
  for(let i=0;i<size*size;i++){input[i]=(d[i*4]/255-.5)/.5;input[size*size+i]=(d[i*4+1]/255-.5)/.5;input[2*size*size+i]=(d[i*4+2]/255-.5)/.5}
  const s=await session(),res=await s.run({[s.inputNames[0]]:new ort.Tensor("float32",input,[1,3,size,size])}),out=res[s.outputNames[0]];
  const dims=out.dims as number[],raw=out.data as Float32Array,mh=Number(dims[dims.length-2]||size),mw=Number(dims[dims.length-1]||size);
  return{width:bitmap.width,height:bitmap.height,alphaAt:(x:number,y:number)=>Math.max(0,Math.min(1,bilinear(raw,mw,mh,x/bitmap.width*(mw-1),y/bitmap.height*(mh-1))))};
}
