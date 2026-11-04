import QRCode from "qrcode";

/** First-party, allowlisted QR destinations decoded from owner's original images.
 * No arbitrary URL-to-QR generation; do not forward untrusted destinations.
 * This route draws a QR client can actually scan; no third-party QR CDN.
 */
const DESTINATIONS={
 search:"http://weixin.qq.com/r/mp/_yAoMCzEYnEdrWhT93Xp",
 ranking:"http://weixin.qq.com/r/mp/oycQCBfEPUpCrVNr93Kx"
} as const;
type Target=keyof typeof DESTINATIONS;
export const revalidate=86400;

export async function GET(request:Request):Promise<Response>{
 const key=new URL(request.url).searchParams.get("kind");
 if(key!=="search"&&key!=="ranking")
  return new Response("Unknown QR type",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 const svg=await QRCode.toString(DESTINATIONS[key as Target],{
  type:"svg",errorCorrectionLevel:"H",margin:3,width:252,
  color:{dark:"#151521",light:"#ffffff"}
 });
 return new Response(svg,{headers:{
  "Content-Type":"image/svg+xml; charset=utf-8",
  "Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800",
  "X-Content-Type-Options":"nosniff",
  "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; sandbox"
 }});
}
