import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {r2Delete} from "@/lib/r2-private";

export const runtime="nodejs";
export const maxDuration=60;

export async function GET(req:Request){
 const secret=process.env.CRON_SECRET?.trim();
 if(!secret||req.headers.get("authorization")!==`Bearer ${secret}`){
   return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 }

 const admin=createAdminClient();
 const {data:notes,error}=await admin
   .from("burn_notes")
   .select("id")
   .or(`expires_at.lt.${new Date().toISOString()},consumed_at.not.is.null`)
   .limit(100);

 if(error)return NextResponse.json({error:"QUERY_FAILED"},{status:500});

 let deletedObjects=0;
 let deletedNotes=0;

 for(const n of notes||[]){
   const {data:files}=await admin.from("burn_files").select("object_key").eq("note_id",n.id);
   let ok=true;
   for(const f of files||[]){
     if(await r2Delete(f.object_key))deletedObjects++;
     else ok=false;
   }
   if(ok){
     const d=await admin.from("burn_notes").delete().eq("id",n.id);
     if(!d.error)deletedNotes++;
   }
 }

 const cleanup=await admin.rpc("cleanup_ephemeral_privacy_data");
 if(cleanup.error)console.error("[privacy cleanup rpc]",cleanup.error.message);

 return NextResponse.json({ok:true,deletedObjects,deletedNotes});
}
