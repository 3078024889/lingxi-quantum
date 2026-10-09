import "server-only";
import{createAdminClient}from"@/lib/supabase/admin";
import{toPublicRunEvent,type PublicRunEvent}from"./public-event-codec";
import{publicDurableRunTask}from"./unified-task-view";

export async function assertRunOwner(userId:string,runId:string){
 const admin=createAdminClient();
 const{data,error}=await admin.from("sasi_durable_runs")
  .select("id,user_id,task,state,current_step,attempt,created_at,updated_at,output_json,error_code")
  .eq("id",runId).eq("user_id",userId).maybeSingle();
 if(error||!data)return null;
 return data as Record<string,unknown>;
}

export async function listPublicRunEvents(input:{
 userId:string;runId:string;afterId:number;limit?:number;
}):Promise<PublicRunEvent[]>{
 const owned=await assertRunOwner(input.userId,input.runId);
 if(!owned)return [];
 const admin=createAdminClient();
 const limit=Math.max(1,Math.min(100,Number(input.limit||50)));
 const{data,error}=await admin.from("sasi_durable_run_events")
  .select("id,run_id,kind,step,metadata,created_at")
  .eq("run_id",input.runId).gt("id",Math.max(0,input.afterId))
  .order("id",{ascending:true}).limit(limit);
 if(error||!Array.isArray(data))return [];
 return data.map(row=>toPublicRunEvent(row as Record<string,unknown>)).filter((x):x is PublicRunEvent=>Boolean(x));
}

async function latestPublicRunEvents(runId:string,limit=40):Promise<PublicRunEvent[]>{
 const admin=createAdminClient();
 const bounded=Math.max(1,Math.min(100,Number(limit||40)));
 const{data,error}=await admin.from("sasi_durable_run_events")
  .select("id,run_id,kind,step,metadata,created_at")
  .eq("run_id",runId).order("id",{ascending:false}).limit(bounded);
 if(error||!Array.isArray(data))return [];
 return data
  .map(row=>toPublicRunEvent(row as Record<string,unknown>))
  .filter((x):x is PublicRunEvent=>Boolean(x))
  .reverse();
}

export async function runSnapshot(userId:string,runId:string){
 const run=await assertRunOwner(userId,runId);
 if(!run)return null;
 const events=await latestPublicRunEvents(runId,40);
 const lastEventId=events.length?Math.max(...events.map(e=>e.id)):0;
 return {
  runId:String(run.id),
  state:String(run.state||"created"),
  currentStep:run.current_step?String(run.current_step):null,
  attempt:Number(run.attempt||0),
  updatedAt:String(run.updated_at||""),
  hasOutput:run.output_json!=null,
  lastEventId,
  events,
  task:publicDurableRunTask(run)
 };
}
