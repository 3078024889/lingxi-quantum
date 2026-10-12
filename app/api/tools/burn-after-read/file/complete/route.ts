import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {r2Head} from "@/lib/r2-private";
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
export const runtime="nodejs"; export const maxDuration=30;

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const abuse=await enforceAbuseGuard(req,{scope:"burn-file-complete",userId:user.id,accountLimit:60,ipLimit:180});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const contentLength=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(contentLength)&&contentLength>16*1024)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
 const body=await boundedRequestJson(req,16*1024).catch(()=>null) as Record<string,unknown>|null;
 const id=typeof body?.id==='string'?body.id:'';
 if(!id)return NextResponse.json({error:"SHARE_ID_REQUIRED"},{status:400});
 const admin=createAdminClient();
 const {data:note,error:noteError}=await admin.from("burn_notes").select("id,owner_user_id,ready_at,expires_at,consumed_at").eq("id",String(id)).eq("owner_user_id",user.id).maybeSingle();
 if(noteError)return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
 if(!note)return NextResponse.json({error:"SHARE_NOT_FOUND"},{status:404});
 if(note.consumed_at||Date.parse(note.expires_at)<=Date.now())return NextResponse.json({error:"SHARE_GONE"},{status:410});
 if(note.ready_at)return NextResponse.json({ok:true});
 const {data:files,error:filesError}=await admin.from("burn_files").select("object_key,size_bytes").eq("note_id",note.id);
 if(filesError)return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
 if(!files?.length)return NextResponse.json({error:"FILES_NOT_FOUND"},{status:409});
 for(const f of files){
   let h;try{h=await r2Head(f.object_key)}catch{return NextResponse.json({error:'STORAGE_UNAVAILABLE'},{status:503})}
   if(!h||h.size!==Number(f.size_bytes))return NextResponse.json({error:"UPLOAD_INCOMPLETE"},{status:409});
 }
 const now=new Date().toISOString();
 const {data:completed,error}=await admin.from("burn_notes").update({ready_at:now}).eq("id",note.id).eq('owner_user_id',user.id).is('ready_at',null).is('consumed_at',null).gt('expires_at',now).select('id').maybeSingle();
 if(error)return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
 if(!completed){
  const current=await admin.from('burn_notes').select('ready_at,expires_at,consumed_at').eq('id',note.id).eq('owner_user_id',user.id).maybeSingle();
  if(current.error)return NextResponse.json({error:'SERVICE_BUSY'},{status:503});
  if(!current.data||current.data.consumed_at||Date.parse(current.data.expires_at)<=Date.now())return NextResponse.json({error:'SHARE_GONE'},{status:410});
  if(!current.data.ready_at)return NextResponse.json({error:'UPLOAD_INCOMPLETE'},{status:409});
 }
 return NextResponse.json({ok:true});
}
