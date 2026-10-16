import{NextRequest,NextResponse}from"next/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{requirePaidMediaQuote}from"@/lib/tools/media/paid-guard";
import{translateTextRemote}from"@/lib/tools/media/provider";
import{createClient}from"@/lib/supabase/server";import{createAdminClient}from"@/lib/supabase/admin";import{foodRequestIpHash}from"@/lib/tools/food/request-identity";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const b=await req.json(),quoteId=String(b.quoteId||""),accessId=String(b.accessId||""),toolId=String(b.toolId||""),text=String(b.text||"");
  if(!text||text.length>30000)return NextResponse.json({error:"INVALID_TEXT"},{status:400});
  if(toolId==="image-translator"&&/^[0-9a-f-]{36}$/i.test(accessId)){
   const supabase=createClient(),{data:{user}}=await supabase.auth.getUser();const admin=createAdminClient(),ipHash=foodRequestIpHash(req);
   const {data:row,error}=await admin.from("tool_export_requests").select("id,tool_id,user_id,ip_hash,state,units").eq("id",accessId).maybeSingle();
   if(error||!row||row.tool_id!=="image-translator"||row.units<1||row.units>20||row.state==="payment_required"||(row.user_id?row.user_id!==user?.id:row.ip_hash!==ipHash))throw Error("QUOTE_ACCESS_REQUIRED");
  }else await requirePaidMediaQuote(quoteId,["video-dubbing","video-translate","image-translator","subtitle-translate"]);
  const translated=await translateTextRemote({text,source:String(b.source||"auto"),target:String(b.target||"en")});
  return NextResponse.json({translated});
 }catch(e){
  const m=e instanceof Error?e.message:String(e);
  return NextResponse.json({error:m},{status:/LOGIN_REQUIRED/.test(m)?401:/QUOTE/.test(m)?402:/NOT_CONFIGURED/.test(m)?503:500});
 }
}
