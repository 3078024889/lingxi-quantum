import{NextRequest,NextResponse}from"next/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{createClient}from"@/lib/supabase/server";
import{toolPassBackendReady,redeemToolStart}from"@/lib/tools/commerce/tool-server-receipt";
import{convertDocumentToPdf,documentInputSupported}from"@/lib/tools/document/converter";
export const runtime="nodejs";
export const maxDuration=60;
const MAX_BYTES=process.env.VERCEL?3_500_000:50*1024*1024;

export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'},{status:403});
 const form=await request.formData().catch(()=>null),file=form?.get("file");
 if(!(file instanceof File))return NextResponse.json({error:"FILE_REQUIRED"},{status:400});
 if(file.size<1||file.size>MAX_BYTES)return NextResponse.json({error:"FILE_SIZE_UNSUPPORTED"},{status:413});
 if(!documentInputSupported(file.name)&&file.type!=="application/pdf")return NextResponse.json({error:"DOCUMENT_TYPE_UNSUPPORTED"},{status:415});
 if(toolPassBackendReady()){
  const {data:{user}}=await createClient().auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
  const receipt=await redeemToolStart({userId:user.id,toolSlug:"office-conversion",accessRequestId:form?.get("accessRequestId"),operationId:String(form?.get("operationId")||"")});
  if(!receipt.ok)return NextResponse.json({error:receipt.error},{status:403});
  if(receipt.alreadyRedeemed)return NextResponse.json({error:"TOOL_OPERATION_ALREADY_STARTED"},{status:409});
 }
 try{
  const bytes=await convertDocumentToPdf(file);
  return new NextResponse(bytes,{headers:{
   "content-type":"application/pdf",
   "cache-control":"private, no-store",
   "x-content-type-options":"nosniff",
   "content-disposition":`inline; filename="${encodeURIComponent(file.name.replace(/\.[^.]+$/,"")||"document")}.pdf"`
  }});
 }catch(e){
  const code=e instanceof Error?e.message:"DOCUMENT_CONVERSION_FAILED";
  const status=code.includes("SIZE_UNSUPPORTED")?413:code.includes("TIMEOUT")?504:code.includes("UNAVAILABLE")?503:code.includes("UNSUPPORTED")||code.includes("INPUT_INVALID")?415:502;
  console.error("[document normalize]",code);
  return NextResponse.json({error:code.split(":")[0]},{status});
 }
}
