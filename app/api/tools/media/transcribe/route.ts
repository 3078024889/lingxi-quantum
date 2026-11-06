import {authorizeToolPassStage} from "@/lib/tools/commerce/tool-stage-gate";
import{NextRequest,NextResponse}from"next/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{requirePaidMediaQuote}from"@/lib/tools/media/paid-guard";
import{transcribeAudioRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const fd=await req.formData(),quoteId=String(fd.get("quoteId")||""),x=fd.get("file");
  if(!(x instanceof File)||x.size<=0||x.size>20*1024*1024)return NextResponse.json({error:"INVALID_AUDIO"},{status:400});
  const allowed=["video-dubbing","video-translate","video-transcription","audio-transcription"];
  const toolSlug=String(fd.get("toolSlug")||"video-transcription");
  if(!allowed.includes(toolSlug))return NextResponse.json({error:"INVALID_TOOL"},{status:400});
  const stage=await authorizeToolPassStage({toolSlug,stage:"media-transcribe",
    accessRequestId:fd.get("accessRequestId"),operationId:fd.get("operationId")});
  if(!stage.ok)return NextResponse.json({error:stage.error},{status:stage.status});
  if(stage.mode==="legacy")await requirePaidMediaQuote(quoteId,allowed);
  const text=await transcribeAudioRemote(x);
  return NextResponse.json({text});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/LOGIN_REQUIRED/.test(m)?401:/QUOTE/.test(m)?402:/NOT_CONFIGURED/.test(m)?503:500});
 }
}
