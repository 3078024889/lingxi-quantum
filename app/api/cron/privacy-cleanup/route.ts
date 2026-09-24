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
 let deferredNotes=0;
 let fileQueryErrors=0;
 let objectDeleteErrors=0;

 for(const n of notes||[]){
   const fileQuery=await admin
     .from("burn_files")
     .select("object_key")
     .eq("note_id",n.id);

   if(fileQuery.error){
     fileQueryErrors++;
     deferredNotes++;
     console.error("[privacy cleanup files]",n.id,fileQuery.error.message);
     continue;
   }

   let ok=true;
   for(const f of fileQuery.data||[]){
     try{
       if(await r2Delete(f.object_key))deletedObjects++;
       else{
         objectDeleteErrors++;
         ok=false;
       }
     }catch(e){
       objectDeleteErrors++;
       ok=false;
       console.error("[privacy cleanup r2]",n.id,e instanceof Error?e.message:String(e));
     }
   }

   if(!ok){
     deferredNotes++;
     continue;
   }

   const d=await admin.from("burn_notes").delete().eq("id",n.id);
   if(d.error){
     deferredNotes++;
     console.error("[privacy cleanup note]",n.id,d.error.message);
   }else{
     deletedNotes++;
   }
 }

 // DB cleanup intentionally excludes file-backed burn notes.
 // Those notes must only be deleted after their R2 objects are removed above.
 const cleanup=await admin.rpc("cleanup_ephemeral_privacy_data");
 if(cleanup.error)console.error("[privacy cleanup rpc]",cleanup.error.message);

 return NextResponse.json({
   ok:true,
   deletedObjects,
   deletedNotes,
   deferredNotes,
   fileQueryErrors,
   objectDeleteErrors,
   dbCleanup:cleanup.error?null:cleanup.data
 });
}
