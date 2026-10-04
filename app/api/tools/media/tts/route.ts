import{NextRequest,NextResponse}from"next/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{requirePaidMediaQuote}from"@/lib/tools/media/paid-guard";
import{synthesizeRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const b=await req.json(),quoteId=String(b.quoteId||""),text=String(b.text||"");
  if(!text||text.length>12000)return NextResponse.json({error:"INVALID_TEXT"},{status:400});
  await requirePaidMediaQuote(quoteId,["video-dubbing","video-translate"]);
  const audio=await synthesizeRemote(text,String(b.language||"en"));
  return new NextResponse(new Uint8Array(audio),{headers:{"content-type":"audio/mpeg","cache-control":"private, no-store"}});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/LOGIN_REQUIRED/.test(m)?401:/QUOTE/.test(m)?402:/NOT_CONFIGURED/.test(m)?503:500});
 }
}
