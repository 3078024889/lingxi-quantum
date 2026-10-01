import{NextResponse}from"next/server";
import{DOCUMENT_INPUT_FORMATS,documentConverterReadiness}from"@/lib/tools/document/converter";
export const runtime="nodejs";
export async function GET(){
 const readiness=await documentConverterReadiness();
 return NextResponse.json({
  formats:DOCUMENT_INPUT_FORMATS,
  officeSupported:true,
  officeReady:readiness.ready,
  families:readiness.families,
  localPdf:true
 },{headers:{"cache-control":"no-store"}});
}
