import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {r2Delete} from "@/lib/r2-private";
export const runtime="nodejs";export const maxDuration=60;
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET?.trim();if(!secret||req.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const admin=createAdminClient();
 const {data:notes,error}=await admin.from("burn_notes").select("id").or(`expires_at.lt.${new Date().toISOString()},consumed_at.not.is.null`).limit(100);
 if(error)return NextResponse.json({error:"QUERY_FAILED"},{status:500});
 let deletedObjects=0,deletedNotes=0,deferredNotes=0,fileQueryErrors=0,objectDeleteErrors=0;
 for(const n of notes||[]){
  const fileQuery=await admin.from("burn_files").select("object_key").eq("note_id",n.id);
  if(fileQuery.error){fileQueryErrors++;deferredNotes++;continue}
  let ok=true;for(const f of fileQuery.data||[]){try{if(await r2Delete(f.object_key))deletedObjects++;else{objectDeleteErrors++;ok=false}}catch{objectDeleteErrors++;ok=false}}
  if(!ok){deferredNotes++;continue}
  const d=await admin.from("burn_notes").delete().eq("id",n.id);if(d.error)deferredNotes++;else deletedNotes++;
 }
 let deletedToolTemp=0;
 const {data:temp}=await admin.from("tool_temp_files").select("id,object_key").lt("expires_at",new Date().toISOString()).is("deleted_at",null).limit(100);
 for(const f of temp||[]){try{if(await r2Delete(f.object_key)){await admin.from("tool_temp_files").update({deleted_at:new Date().toISOString()}).eq("id",f.id);deletedToolTemp++}}catch{}}
 const cleanup=await admin.rpc("cleanup_ephemeral_privacy_data");
 return NextResponse.json({ok:true,deletedObjects,deletedNotes,deferredNotes,fileQueryErrors,objectDeleteErrors,deletedToolTemp,dbCleanup:cleanup.error?null:cleanup.data});
}
