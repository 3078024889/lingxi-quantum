import {NextResponse} from 'next/server';
/**
 * Checkout is deliberately closed until merchant permissions, vendor identity, isolated
 * order ledger, verified callbacks AND fulfilment are completed and tested.
 * Never accept client-side paid/amount/currency flags to grant entitlements.
 */
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function POST(request:Request){
 const here=new URL(request.url);
 if(request.headers.get('origin')!==here.origin)return NextResponse.json({error:'INVALID_ORIGIN'},{status:403,headers});
 return NextResponse.json({error:'MARKET_CHECKOUT_NOT_LIVE',message:'Billing is not accepting payments. Merchant configuration, audited order ledger and verified receipt processing are required.'},{status:503,headers});
}
