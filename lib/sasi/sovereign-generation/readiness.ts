import "server-only";
function env(name:string){return process.env[name]?.trim()||""}
function workerConfigured(kind:"image"|"video"){
 const url=env("SASI_LOCAL_GENERATION_WORKER_URL"),secret=env("SASI_LOCAL_GENERATION_WORKER_SECRET");
 const model=env(kind==="image"?"SASI_LOCAL_IMAGE_MODEL":"SASI_LOCAL_VIDEO_MODEL");
 if(!url||!secret||!model)return false;
 try{const u=new URL(url);return u.protocol==="https:"||u.hostname==="127.0.0.1"||u.hostname==="localhost"}catch{return false}
}
export function sovereignGenerationReadiness(){
 return{
  autonomous:{image:true,video:true,providerRequired:false},
  enhanced:{
   image:{ready:workerConfigured("image"),modelConfigured:Boolean(env("SASI_LOCAL_IMAGE_MODEL"))},
   video:{ready:workerConfigured("video"),modelConfigured:Boolean(env("SASI_LOCAL_VIDEO_MODEL"))},
  },
  architecture:{signedWorker:true,artifactStorage:"r2-or-private-storage",queueRequiredForGpu:true},
 };
}
