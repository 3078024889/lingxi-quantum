import{NextRequest,NextResponse}from"next/server";
import{createHash}from"node:crypto";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{claimLegacyMediaExecution}from"@/lib/tools/media/paid-guard";
import{translateTextRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const b=await req.json(),quoteId=String(b.quoteId||""),text=String(b.text||"");
  if(!text||text.length>30000)return NextResponse.json({error:"INVALID_TEXT"},{status:400});
  const source=String(b.source||"auto"),target=String(b.target||"en");
  const digest=createHash("sha256").update(JSON.stringify({text,source,target})).digest("hex");
  await claimLegacyMediaExecution({quoteId,toolIds:["video-dubbing","video-translate","image-translator","subtitle-translate"],stage:"translate",digest});
  const translated=await translateTextRemote({text,source,target});
  return NextResponse.json({translated});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/LOGIN_REQUIRED/.test(m)?401:/QUOTE_OPERATION_ALREADY_USED/.test(m)?409:/QUOTE/.test(m)?402:/NOT_CONFIGURED|MEDIA_EXECUTION_UNAVAILABLE/.test(m)?503:500});
 }
}
