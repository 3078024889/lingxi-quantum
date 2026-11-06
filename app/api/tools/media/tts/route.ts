import{NextRequest,NextResponse}from"next/server";
import{createHash}from"node:crypto";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{claimLegacyMediaExecution}from"@/lib/tools/media/paid-guard";
import{synthesizeRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const b=await req.json(),quoteId=String(b.quoteId||""),text=String(b.text||"");
  if(!text||text.length>12000)return NextResponse.json({error:"INVALID_TEXT"},{status:400});
  const language=String(b.language||"en");
  const digest=createHash("sha256").update(JSON.stringify({text,language})).digest("hex");
  await claimLegacyMediaExecution({quoteId,toolIds:["video-dubbing","video-translate"],stage:"tts",digest});
  const audio=await synthesizeRemote(text,language);
  return new NextResponse(new Uint8Array(audio),{headers:{"content-type":"audio/mpeg","cache-control":"private, no-store"}});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/LOGIN_REQUIRED/.test(m)?401:/QUOTE_OPERATION_ALREADY_USED/.test(m)?409:/QUOTE/.test(m)?402:/NOT_CONFIGURED|MEDIA_EXECUTION_UNAVAILABLE/.test(m)?503:500});
 }
}
