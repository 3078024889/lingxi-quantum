import {authorizeToolPassStage} from "@/lib/tools/commerce/tool-stage-gate";
import{NextRequest,NextResponse}from"next/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{requirePaidMediaQuote}from"@/lib/tools/media/paid-guard";
import{translateTextRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const b=await req.json(),quoteId=String(b.quoteId||""),text=String(b.text||"");
  if(!text||text.length>30000)return NextResponse.json({error:"INVALID_TEXT"},{status:400});
  const allowed=["video-dubbing","video-translate","image-translator","subtitle-translate"];
  const toolSlug=String(b.toolSlug||"video-translate");
  if(!allowed.includes(toolSlug))return NextResponse.json({error:"INVALID_TOOL"},{status:400});
  const stage=await authorizeToolPassStage({toolSlug,stage:"media-translate",
    accessRequestId:b.accessRequestId,operationId:b.operationId});
  if(!stage.ok)return NextResponse.json({error:stage.error},{status:stage.status});
  if(stage.mode==="legacy")await requirePaidMediaQuote(quoteId,allowed,{stage:"media-translate",characters:text.length,operationId:b.stageCallId});
  const translated=await translateTextRemote({text,source:String(b.source||"auto"),target:String(b.target||"en")});
  return NextResponse.json({translated});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/QUOTE_STAGE_ALREADY_STARTED/.test(m)?409:/QUOTE_STAGE_UNAVAILABLE/.test(m)?503:/LOGIN_REQUIRED/.test(m)?401:/LEGACY_MEDIA_PAID_ALLOWANCE_EXHAUSTED|QUOTE|LEGACY_MEDIA_/.test(m)?402:/NOT_CONFIGURED/.test(m)?503:500});
 }
}
