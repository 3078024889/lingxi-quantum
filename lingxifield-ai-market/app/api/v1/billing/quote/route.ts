import {NextResponse} from 'next/server';
import {MARKET_API_PRODUCTS} from '../../../../../lib/market-api-service-catalog';
import {vendorPlacementQuote} from '../../../../../lib/market-vendor-quote.mjs';
import {mainSiteBillingCompatibility} from '../../../../../lib/market-billing-readiness.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
/** Server-owned preview quote, no money movement and no user state changes. */
export function GET(request:Request){
 const url=new URL(request.url);
 const input={
  productId:url.searchParams.get('productId')||'',planId:url.searchParams.get('planId')||'',
  currency:url.searchParams.get('currency')||'',provider:url.searchParams.get('provider')
 };
 try{
  const quote=vendorPlacementQuote(input,MARKET_API_PRODUCTS);
  return NextResponse.json({quote,merchantIntegration:mainSiteBillingCompatibility(),
   checkoutEnabled:false,checkoutUrl:null,
   disclaimer:'This quote is informational only. Merchant payment, vendor authentication and placement entitlement are not activated.'},
   {headers});
 }catch(error){
  const code=error instanceof Error?error.message:'INVALID_QUOTE';
  const statuses=new Set(['UNKNOWN_PRODUCT','UNKNOWN_OR_NOT_FOR_SALE_PLAN','INVALID_CURRENCY',
   'FREE_PLAN_HAS_NO_PAYMENT_PROVIDER','PROVIDER_CURRENCY_MISMATCH']);
  return NextResponse.json({error:statuses.has(code)?code:'INVALID_QUOTE'},
   {status:400,headers});
 }
}
