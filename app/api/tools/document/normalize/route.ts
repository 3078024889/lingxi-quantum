import {NextResponse} from "next/server";

export const runtime="nodejs";
export const maxDuration=60;

const MAX_BYTES=20*1024*1024;
const ALLOWED=new Set(["doc","docx"]);

function converterUrl(){
  const raw=(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_URL||"").trim();
  if(!raw)return null;
  try{
    const u=new URL(raw);
    const local=u.hostname==="127.0.0.1"||u.hostname==="localhost"||u.hostname==="::1";
    if(u.protocol!=="https:"&&!local)return null;
    return u;
  }catch{return null;}
}

export async function POST(request:Request){
  const url=converterUrl();
  const secret=(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_SECRET||"").trim();
  if(!url||!secret)return NextResponse.json({error:"DOCUMENT_CONVERSION_UNAVAILABLE"},{status:503});
  const form=await request.formData().catch(()=>null);
  const file=form?.get("file");
  if(!(file instanceof File))return NextResponse.json({error:"FILE_REQUIRED"},{status:400});
  if(file.size<1||file.size>MAX_BYTES)return NextResponse.json({error:"FILE_SIZE_UNSUPPORTED"},{status:413});
  const ext=(file.name.split(".").pop()||"").toLowerCase();
  if(!ALLOWED.has(ext))return NextResponse.json({error:"DOCUMENT_TYPE_UNSUPPORTED"},{status:415});
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),55_000);
  try{
    const upstream=await fetch(new URL("/convert",url),{
      method:"POST",
      headers:{authorization:`Bearer ${secret}`,"content-type":"application/octet-stream","x-lingxifield-ext":ext},
      body:Buffer.from(await file.arrayBuffer()),
      cache:"no-store",
      signal:controller.signal,
    });
    if(!upstream.ok)return NextResponse.json({error:"DOCUMENT_CONVERSION_FAILED"},{status:502});
    const bytes=await upstream.arrayBuffer();
    if(bytes.byteLength<5||new Uint8Array(bytes,0,5).every((v,i)=>v===[0x25,0x50,0x44,0x46,0x2d][i])===false){
      return NextResponse.json({error:"DOCUMENT_CONVERSION_INVALID"},{status:502});
    }
    return new NextResponse(bytes,{status:200,headers:{"content-type":"application/pdf","cache-control":"private, no-store","x-content-type-options":"nosniff"}});
  }catch{return NextResponse.json({error:"DOCUMENT_CONVERSION_FAILED"},{status:502});}
  finally{clearTimeout(timer);}
}
