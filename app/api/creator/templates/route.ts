import{NextRequest,NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";import{isSameOriginMutation}from"@/lib/sasi/request-security";
export const runtime="nodejs";
async function uid(req:NextRequest){const a=createAdminClient(),t=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");if(!t)return null;const{data}=await a.auth.getUser(t);return data.user?.id||null}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});const owner=await uid(req);if(!owner)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const b=await req.json().catch(()=>null)as any;if(!b?.consentToTemplate)return NextResponse.json({error:"CONSENT_REQUIRED"},{status:400});
 const title=String(b?.title||"").trim();if(!title)return NextResponse.json({error:"TITLE_REQUIRED"},{status:400});
 const admin=createAdminClient();const{data,error}=await admin.from("lingxifield_creator_templates").insert({owner_id:owner,source_artifact_id:b.sourceArtifactId||null,kind:String(b.kind||"video"),title:title.slice(0,120),description:String(b.description||"").slice(0,1200),cover_url:b.coverUrl||null,preview_url:b.previewUrl||null,template_payload:b.templatePayload||{},visibility:"private",review_status:"submitted"}).select("id,review_status").single();
 if(error)return NextResponse.json({error:"SUBMIT_FAILED"},{status:500});return NextResponse.json({ok:true,template:data});
}