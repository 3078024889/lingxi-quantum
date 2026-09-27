import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {newBurnObjectKey,presignR2,r2Ready} from "@/lib/r2-private";

export const runtime="nodejs";
const SAFE_TYPE=/^(application\/pdf|text\/|image\/|video\/|audio\/|application\/(zip|json|octet-stream|vnd\.openxmlformats-officedocument\.|vnd\.ms-))/i;

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 if(!r2Ready())return NextResponse.json({error:"TEMP_FILE_SERVICE_UNAVAILABLE"},{status:503});
 const abuse=await enforceAbuseGuard(req,{scope:"tool-mobile-file",userId:user.id,accountLimit:60,ipLimit:180});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const body=await req.json().catch(()=>null) as {name?:unknown;type?:unknown;size?:unknown}|null;
 const name=String(body?.name||"result").slice(0,180),type=String(body?.type||"application/octet-stream").slice(0,160),size=Number(body?.size||0);
 if(!Number.isFinite(size)||size<=0||size>100*1024*1024)return NextResponse.json({error:"FILE_SIZE_INVALID"},{status:400});
 if(!SAFE_TYPE.test(type))return NextResponse.json({error:"FILE_TYPE_UNSUPPORTED"},{status:415});
 const key=newBurnObjectKey(`tool-${user.id}`,name);
 const expiresAt=new Date(Date.now()+20*60*1000).toISOString();
 const admin=createAdminClient();
 const {error}=await admin.from("tool_temp_files").insert({user_id:user.id,object_key:key,file_name:name,mime_type:type,byte_size:size,expires_at:expiresAt});
 if(error)return NextResponse.json({error:"TEMP_FILE_CREATE_FAILED"},{status:500});
 return NextResponse.json({putUrl:presignR2("PUT",key,300),getUrl:presignR2("GET",key,900),expiresAt},{headers:{"Cache-Control":"no-store"}});
}
