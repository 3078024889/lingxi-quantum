import{NextResponse}from"next/server";
export const runtime="nodejs";
export async function GET(){
 const custom=Boolean(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_URL?.trim()&&process.env.LINGXIFIELD_DOCUMENT_CONVERTER_SECRET?.trim());
 const convertApi=Boolean(process.env.LINGXIFIELD_CONVERTAPI_TOKEN?.trim()||process.env.CONVERTAPI_SECRET?.trim());
 const formats=(custom||convertApi)?["pdf","doc","docx","ppt","pptx","xls","xlsx","odt","ods","odp"]:["pdf"];
 return NextResponse.json({formats,officeReady:formats.length>1},{headers:{"cache-control":"no-store"}});
}
