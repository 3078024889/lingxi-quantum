import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {r2Delete} from "@/lib/r2-private";
export const runtime="nodejs";export const maxDuration=60;
/** Fail visibly on partial cleanup; never publish "ok" while private objects remain. */
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET?.trim();
 if(!secret||req.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const admin=createAdminClient();
 const {data:notes,error}=await admin.from("burn_notes").select("id").or(`expires_at.lt.${new Date().toISOString()},consumed_at.lt.${new Date(Date.now()-300000).toISOString()}`).limit(101);
 if(error)return NextResponse.json({ok:false,error:"NOTE_QUERY_FAILED"},{status:503,headers:{"Cache-Control":"no-store"}});
 let deletedObjects=0,deletedNotes=0,deferredNotes=0,fileQueryErrors=0,objectDeleteErrors=0;
 const notesBacklog=(notes?.length||0)>100;
 for(const note of (notes||[]).slice(0,100)){
  const records=await admin.from("burn_files").select("object_key").eq("note_id",note.id);
  if(records.error){fileQueryErrors++;deferredNotes++;continue}
  let objectsGone=true;
  for(const file of records.data||[]){
   try{
    if(await r2Delete(file.object_key))deletedObjects++;
    else{objectDeleteErrors++;objectsGone=false}
   }catch{objectDeleteErrors++;objectsGone=false}
  }
  if(!objectsGone){deferredNotes++;continue}
  const removed=await admin.from("burn_notes").delete().eq("id",note.id);
  if(removed.error)deferredNotes++;else deletedNotes++;
 }
 let deletedToolTemp=0,tempQueryErrors=0,tempObjectErrors=0,tempUpdateErrors=0;
 const expired=await admin.from("tool_temp_files").select("id,object_key").lt("expires_at",new Date().toISOString()).is("deleted_at",null).limit(101);
 const tempBacklog=(expired.data?.length||0)>100;
 if(expired.error)tempQueryErrors++;
 else for(const item of (expired.data||[]).slice(0,100)){
  try{
   if(!(await r2Delete(item.object_key))){tempObjectErrors++;continue}
   const marked=await admin.from("tool_temp_files").update({deleted_at:new Date().toISOString()}).eq("id",item.id);
   if(marked.error)tempUpdateErrors++;
   else deletedToolTemp++;
  }catch{tempObjectErrors++}
 }
 let cleanupError=false,cleanupData:unknown=null;
 try{const result=await admin.rpc("cleanup_ephemeral_privacy_data");cleanupError=Boolean(result.error);cleanupData=result.data;}
 catch{cleanupError=true}
 const dbCleanupErrors=cleanupError?1:0;
 const incomplete=notesBacklog||tempBacklog||deferredNotes+fileQueryErrors+objectDeleteErrors+tempQueryErrors+tempObjectErrors+tempUpdateErrors+dbCleanupErrors>0;
 const report={ok:!incomplete,notesBacklog,tempBacklog,deletedObjects,deletedNotes,deferredNotes,fileQueryErrors,objectDeleteErrors,deletedToolTemp,tempQueryErrors,tempObjectErrors,tempUpdateErrors,dbCleanupErrors,dbCleanup:cleanupError?null:cleanupData};
 return NextResponse.json(report,{status:incomplete?503:200,headers:{"Cache-Control":"no-store"}});
}
