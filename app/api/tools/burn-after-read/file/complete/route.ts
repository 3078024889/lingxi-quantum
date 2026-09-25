import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {r2Head} from "@/lib/r2-private";
export const runtime="nodejs"; export const maxDuration=30;

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const abuse=await enforceAbuseGuard(req,{scope:"burn-file-complete",userId:user.id,accountLimit:60,ipLimit:180});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const contentLength=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(contentLength)&&contentLength>16*1024)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
 const {id}=await req.json().catch(()=>({}));
 if(!id)return NextResponse.json({error:"SHARE_ID_REQUIRED"},{status:400});
 const admin=createAdminClient();
 const {data:note}=await admin.from("burn_notes").select("id,owner_user_id,ready_at").eq("id",String(id)).eq("owner_user_id",user.id).maybeSingle();
 if(!note)return NextResponse.json({error:"SHARE_NOT_FOUND"},{status:404});
 if(note.ready_at)return NextResponse.json({ok:true});
 const {data:files}=await admin.from("burn_files").select("object_key,size_bytes").eq("note_id",note.id);
 if(!files?.length)return NextResponse.json({error:"FILES_NOT_FOUND"},{status:409});
 for(const f of files){
   const h=await r2Head(f.object_key);
   if(!h||h.size!==Number(f.size_bytes))return NextResponse.json({error:"UPLOAD_INCOMPLETE"},{status:409});
 }
 const {error}=await admin.from("burn_notes").update({ready_at:new Date().toISOString()}).eq("id",note.id);
 if(error)return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
 return NextResponse.json({ok:true});
}
