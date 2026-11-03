import{NextRequest,NextResponse}from"next/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{requirePaidMediaQuote,guardPaidMediaOperation}from"@/lib/tools/media/paid-guard";
import{synthesizeRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const b=await req.json(),quoteId=String(b.quoteId||""),text=String(b.text||"");
  if(!text||text.length>4000)return NextResponse.json({error:"INVALID_TEXT"},{status:400});
  const verified=await requirePaidMediaQuote(quoteId,["video-dubbing","video-translate"]);
  // A one-minute paid quote cannot authorize a full 12,000-character voice job.
  const maximumChars=Math.min(4000,Math.max(1200,Math.ceil(verified.quantity)*1500));
  if(text.length>maximumChars)return NextResponse.json({error:"QUOTE_TTS_TEXT_EXCEEDS_PAID_UNITS"},{status:409});
  await guardPaidMediaOperation(quoteId,verified.quantity,"tts");
  const audio=await synthesizeRemote(text,String(b.language||"en"));
  return new NextResponse(new Uint8Array(audio),{headers:{"content-type":"audio/mpeg","cache-control":"private, no-store"}});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/LOGIN_REQUIRED/.test(m)?401:/MEDIA_USAGE_LIMIT_REACHED/.test(m)?429:/MEDIA_USAGE_GUARD_UNAVAILABLE|QUOTE_LOOKUP_UNAVAILABLE/.test(m)?503:/QUOTE/.test(m)?402:/NOT_CONFIGURED/.test(m)?503:500});
 }
}
