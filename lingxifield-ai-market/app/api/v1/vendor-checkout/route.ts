import {NextRequest,NextResponse} from 'next/server';
import {validateVendorCheckoutRequest} from '../../../../lib/vendor-price-catalog.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
/** Fail-closed until authenticated vendor claims, a durable order ledger,
 * verified merchant credentials, signed webhooks and refund reconciliation
 * are attached to this isolated market service. Never share SASI top-up orders.
 */
export async function POST(request:NextRequest){
 const source=request.headers.get('origin');
 if(!source||source!==new URL(request.url).origin)return NextResponse.json({error:'INVALID_ORIGIN'},{status:403,headers});
 const contentLength=Number(request.headers.get('content-length')||0);
 if(contentLength>4096)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413,headers});
 const raw=await request.text();
 if(Buffer.byteLength(raw,'utf8')>4096)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413,headers});
 let input:unknown;
 try{input=JSON.parse(raw);}catch{return NextResponse.json({error:'INVALID_JSON'},{status:400,headers});}
 const quote=validateVendorCheckoutRequest(input);
 if(!quote)return NextResponse.json({error:'INVALID_VENDOR_CHECKOUT_REQUEST'},{status:400,headers});
 return NextResponse.json({
  error:'CHECKOUT_NOT_YET_ENABLED',paymentEnabled:false,
  message:'Payment will be available after vendor identity and merchant provider verification.',
  quote:quote.plan
 },{status:503,headers});
}
