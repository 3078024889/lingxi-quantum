import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f-]{36}$/i;
const MAX_TRANSCRIPT_CHARS=120_000;

export async function POST(request:NextRequest, props:{params: Promise<{id:string}>}) {
  const params = await props.params;
  if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const db=createClient();const{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  if(!UUID.test(params.id))return NextResponse.json({error:"INVALID_ASSET_ID"},{status:400});
  const guard=await enforceAbuseGuard(request,{scope:"sasi-local-transcript-save",userId:user.id,accountLimit:80,ipLimit:180});
  if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status});
  const body=await request.json().catch(()=>null) as {text?:unknown;model?:unknown}|null;
  const text=typeof body?.text==="string"?body.text.trim():"";
  if(!text||text.length>MAX_TRANSCRIPT_CHARS)return NextResponse.json({error:"INVALID_TRANSCRIPT"},{status:400});
  const admin=createAdminClient();
  const{data:asset,error}=await admin.from("sasi_assets")
    .select("id,project_id,media_kind,status")
    .eq("id",params.id).eq("user_id",user.id).maybeSingle();
  if(error||!asset)return NextResponse.json({error:"ASSET_NOT_FOUND"},{status:404});
  if(!["audio","video"].includes(String(asset.media_kind)))return NextResponse.json({error:"ASSET_NOT_MEDIA"},{status:422});
  if(!["ready","external_scan_required"].includes(String(asset.status)))return NextResponse.json({error:"ASSET_NOT_READY_FOR_TRANSCRIPT"},{status:409});
  const{error:updateError}=await admin.from("sasi_assets").update({
    extracted_text:text,updated_at:new Date().toISOString()
  }).eq("id",params.id).eq("user_id",user.id);
  if(updateError)return NextResponse.json({error:"TRANSCRIPT_SAVE_FAILED"},{status:503});
  return NextResponse.json({ok:true,assetId:params.id,characters:text.length},{headers:{"Cache-Control":"no-store"}});
}
