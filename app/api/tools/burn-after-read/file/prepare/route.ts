import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {newBurnObjectKey,presignR2,r2Ready} from "@/lib/r2-private";
import {createBurnRevealToken} from "@/lib/tools/burn-link-token";

export const runtime="nodejs";
const TTL=new Set([10,60,1440,4320,10080]);
const VIEWS=new Set([1,3,5]);
const DUR=new Set([5,10,30,60]);
const MODES=new Set(["once","timed","limited","fast"]);
const MAX_TOTAL=2*1024*1024*1024;
const MAX_FILES=20;

function safeName(v:string){
  return v.replace(/[\u0000-\u001f\u007f]/g,"").replace(/[\\/]/g,"_").slice(0,180)||"file";
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
 if(!r2Ready())return NextResponse.json({error:"PRIVATE_STORAGE_NOT_READY"},{status:503});

 const supabase=createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});

 const abuse=await enforceAbuseGuard(req,{scope:"burn-file-prepare",userId:user.id,accountLimit:30,ipLimit:90});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const contentLength=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(contentLength)&&contentLength>128*1024)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});

 const body=await req.json().catch(()=>null) as any;
 if(!body)return NextResponse.json({error:"INVALID_BODY"},{status:400});
 const quoteId=String(body.quoteId||"");
 const files=Array.isArray(body.files)?body.files:[];
 const ciphertext=String(body.ciphertext||"");
 const iv=String(body.iv||"");
 const ttl=Number(body.ttlMinutes);
 const mode=String(body.mode||"once");
 const maxViews=Number(body.maxViews||1);
 const duration=body.viewDurationSeconds==null?null:Number(body.viewDurationSeconds);

 if(!quoteId||files.length<1||files.length>MAX_FILES||ciphertext.length>400000||iv.length<8||!TTL.has(ttl)||!MODES.has(mode)||!VIEWS.has(maxViews)||(mode==="fast"&&!DUR.has(Number(duration)))){
  return NextResponse.json({error:"INVALID_SHARE"},{status:400});
 }

 let total=0;
 const normalized=files.map((f:any)=>{
  const size=Math.floor(Number(f?.size||0));
  if(!Number.isFinite(size)||size<1)throw new Error("INVALID_FILE");
  total+=size;
  return {name:safeName(String(f?.name||"file")),size,type:String(f?.type||"application/octet-stream").slice(0,120)};
 });
 if(total>MAX_TOTAL)return NextResponse.json({error:"FILES_TOO_LARGE"},{status:413});

 const admin=createAdminClient();
 const {data:q,error:qerr}=await admin.from("tool_payment_quotes").select("id,user_id,tool_id,quantity,status").eq("id",quoteId).eq("user_id",user.id).eq("tool_id","burn-after-read-file").eq("status","paid").maybeSingle();
 if(qerr)return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
 if(!q)return NextResponse.json({error:"PAID_SHARE_REQUIRED"},{status:402});
 const mb=Math.max(1,Math.ceil(total/1024/1024));
 if(Math.ceil(Number(q.quantity))!==mb)return NextResponse.json({error:"QUOTE_SIZE_MISMATCH"},{status:409});

 const existing=await admin.from("burn_notes").select("id,expires_at,ready_at").eq("quote_id",quoteId).eq("owner_user_id",user.id).maybeSingle();
 if(existing.data){
   const {data:rows}=await admin.from("burn_files").select("id,object_key,original_name,size_bytes,mime_type").eq("note_id",existing.data.id).order("created_at");
   return NextResponse.json({
     id:existing.data.id,expiresAt:existing.data.expires_at,alreadyPrepared:true,
     token:createBurnRevealToken(String(existing.data.id),String(existing.data.expires_at)),
     files:(rows||[]).map((x:any)=>({id:x.id,name:x.original_name,size:x.size_bytes,type:x.mime_type,uploadUrl:presignR2("PUT",x.object_key,600)}))
   });
 }

 const expiresAt=new Date(Date.now()+ttl*60000).toISOString();
 const {data:note,error}=await admin.from("burn_notes").insert({
   ciphertext,iv,expires_at:expiresAt,mode,max_views:maxViews,view_duration_seconds:mode==="fast"?duration:null,
   owner_user_id:user.id,quote_id:quoteId,has_files:true
 }).select("id,expires_at").single();
 if(error||!note)return NextResponse.json({error:"CREATE_FAILED"},{status:500});

 const rows=normalized.map((f: { name: string; size: number; type: string })=>({note_id:note.id,object_key:newBurnObjectKey(note.id,f.name),original_name:f.name,size_bytes:f.size,mime_type:f.type}));
 const inserted=await admin.from("burn_files").insert(rows).select("id,object_key,original_name,size_bytes,mime_type");
 if(inserted.error){
   await admin.from("burn_notes").delete().eq("id",note.id);
   return NextResponse.json({error:"CREATE_FAILED"},{status:500});
 }
 return NextResponse.json({
   id:note.id,expiresAt:note.expires_at,
   token:createBurnRevealToken(String(note.id),String(note.expires_at)),
   files:(inserted.data||[]).map((x:any)=>({id:x.id,name:x.original_name,size:x.size_bytes,type:x.mime_type,uploadUrl:presignR2("PUT",x.object_key,600)}))
 });
}
