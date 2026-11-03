import{NextRequest,NextResponse}from"next/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{requirePaidMediaQuote,guardPaidMediaOperation}from"@/lib/tools/media/paid-guard";
import{transcribeAudioRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const fd=await req.formData(),quoteId=String(fd.get("quoteId")||""),x=fd.get("file");
  if(!(x instanceof File)||x.size<=0||x.size>20*1024*1024)return NextResponse.json({error:"INVALID_AUDIO"},{status:400});
  const verified=await requirePaidMediaQuote(quoteId,["video-dubbing","video-translate","video-transcription","audio-transcription"]);
  await guardPaidMediaOperation(quoteId,verified.quantity,"transcribe");
  const text=await transcribeAudioRemote(x);
  return NextResponse.json({text});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/LOGIN_REQUIRED/.test(m)?401:/MEDIA_USAGE_LIMIT_REACHED/.test(m)?429:/MEDIA_USAGE_GUARD_UNAVAILABLE|QUOTE_LOOKUP_UNAVAILABLE/.test(m)?503:/QUOTE/.test(m)?402:/NOT_CONFIGURED/.test(m)?503:500});
 }
}
