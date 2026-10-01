import{NextRequest,NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{claimFreeEntitlement}from"@/lib/tools/commerce/free-entitlement";
import{transcribeAudioRemote,translateTextRemote,synthesizeRemote}from"@/lib/tools/media/provider";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:NextRequest){
 try{
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const s=createClient(),{data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
  const fd=await req.formData(),file=fd.get("file"),source=String(fd.get("source")||"auto"),target=String(fd.get("target")||"en");
  if(!(file instanceof File)||file.size<=0||file.size>8*1024*1024)return NextResponse.json({error:"INVALID_PREVIEW_AUDIO"},{status:400});
  const claim=await claimFreeEntitlement(req,user.id,"video-dubbing-preview");
  if(!claim.ok)return NextResponse.json({error:claim.error},{status:claim.error==="FREE_ENTITLEMENT_USED"?409:503});
  const original=await transcribeAudioRemote(file);
  const translated=source===target?original:await translateTextRemote({text:original,source,target});
  const audio=await synthesizeRemote(translated,target);
  return new NextResponse(new Uint8Array(audio),{headers:{"content-type":"audio/mpeg","cache-control":"private, no-store","x-lingxifield-preview":"30s-max"}});
 }catch(e){const m=e instanceof Error?e.message:String(e);return NextResponse.json({error:m},{status:/NOT_CONFIGURED/.test(m)?503:500})}
}
