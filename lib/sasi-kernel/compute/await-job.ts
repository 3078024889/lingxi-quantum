import "server-only";
import { getNativeJob, submitNativeJob } from "./native-client";
import type { NativeJobPublic } from "./protocol";

function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms))}

export async function runNativeReasoningAndWait(input:{
  taskId:string;
  ownerId:string;
  prompt:string;
  deep:boolean;
  timeoutMs:number;
}):Promise<NativeJobPublic|null>{
  const job=await submitNativeJob({
    taskId:input.taskId,
    ownerId:input.ownerId,
    kind:"reason",
    input:{prompt:input.prompt,mode:input.deep?"deep":"standard",responseFormat:"text"},
  });
  if(job.state==="succeeded")return job;
  const deadline=Date.now()+Math.max(1500,Math.min(28_000,input.timeoutMs));
  let wait=450;
  while(Date.now()<deadline){
    await sleep(wait);
    const current=await getNativeJob(job.id,input.ownerId);
    if(["succeeded","failed","cancelled"].includes(current.state))return current;
    wait=Math.min(1400,Math.round(wait*1.35));
  }
  return null;
}
