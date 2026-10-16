import{NextRequest,NextResponse}from"next/server";import{createClient}from"@/lib/supabase/server";import{enforceAbuseGuard}from"@/lib/security/abuse-guard";import{synthesizeRemote}from"@/lib/tools/media/provider";import{isSameOriginMutation}from"@/lib/sasi/request-security";
export const runtime="nodejs";export const maxDuration=30;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const b=await req.json(),text=String(b.text||""),language=String(b.language||"en");
  if(!text||text.length>3000||!LANGS.has(language))return NextResponse.json({error:"PREVIEW_INPUT_INVALID"},{status:400});
  const{data:{user}}=await createClient().auth.getUser();const abuse=await enforceAbuseGuard(req,{scope:"media-preview-tts",userId:user?.id||null,accountLimit:30,ipLimit:60,windowSeconds:3600});if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  const audio=await synthesizeRemote(text,language);return new NextResponse(new Uint8Array(audio),{headers:{"content-type":"audio/mpeg","cache-control":"private, no-store"}});
 }catch(e){const m=e instanceof Error?e.message:String(e);return NextResponse.json({error:m},{status:/NOT_CONFIGURED/.test(m)?503:500})}
}
const LANGS=new Set(["zh","en","ja","ko","fr","de","es","pt","ar"]);