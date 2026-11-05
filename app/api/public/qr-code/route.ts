import {NextRequest,NextResponse} from "next/server";
import QRCode from "qrcode";

export const runtime="nodejs";

/** Bounded, stateless QR rendering for third-party partner widgets; no personal input is logged. */
export async function GET(req:NextRequest){
 const raw=req.nextUrl.searchParams.get("text")||"";
 if(!raw||raw.length>256||/[\u0000-\u001f\u007f]/.test(raw))
  return NextResponse.json({error:"INVALID_QR_TEXT"},{status:400,headers:{"Cache-Control":"no-store"}});
 try{
  const svg=await QRCode.toString(raw,{type:"svg",errorCorrectionLevel:"M",width:200,margin:1});
  return new NextResponse(svg,{status:200,headers:{
   "Content-Type":"image/svg+xml; charset=utf-8",
   "X-Content-Type-Options":"nosniff",
   "Access-Control-Allow-Origin":"*",
   "Cache-Control":"public, max-age=3600, s-maxage=21600",
   "Content-Security-Policy":"default-src 'none'; sandbox"
  }});
 }catch{
  return NextResponse.json({error:"QR_GENERATION_FAILED"},{status:422,headers:{"Cache-Control":"no-store"}});
 }
}
