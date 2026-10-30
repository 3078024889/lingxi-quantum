import {NextResponse} from 'next/server';
import {pricing} from '../../../../lib/v2';
import {currencyFromCountry} from '../../../../lib/region-billing.mjs';

export const dynamic='force-dynamic';
/**
 * Informational, server-priced vendor quote. Never a payment authorization.
 * Geo-IP chooses the default only; customers may choose CNY or USD explicitly.
 * The nominal amount remains the same, NOT converted by exchange rates.
 */
export function GET(request:Request){
 const url=new URL(request.url);
 const chosen=url.searchParams.get('currency');
 if(chosen!==null && chosen!=='CNY' && chosen!=='USD'){
  return NextResponse.json({error:'INVALID_CURRENCY'},{status:400,headers:{'Cache-Control':'no-store'}});
 }
 const country=request.headers.get('x-vercel-ip-country')||request.headers.get('cf-ipcountry');
 const currency=chosen||currencyFromCountry(country);
 const recommendedProviders=currency==='CNY'?['alipay','wechat']:['paypal'];
 return NextResponse.json({
  currency,
  defaultCurrency:currencyFromCountry(country),
  userSelectableCurrencies:['CNY','USD'],
  nominalParity:true,
  exchangeRateApplied:false,
  paymentEnabled:false,
  recommendedProviders,
  providersEnabled:[],
  checkoutUrl:null,
  data:pricing.map(p=>({
   id:p.id,amount:p.amount,amountMinor:p.amount*100,currency,
   interval:p.interval,label:p.label,
   availability:p.id==='listing'?'free':p.id==='geo'?'waitlist':'not_yet_checkout_enabled',
   checkoutEnabled:false,
  })),
  disclaimer:'Vendor payments are not active. A quote or redirect cannot grant sponsored placement. Activation requires verified provider settlement, immutable order amount/currency, audit ledger and entitlement delivery.'
 },{headers:{'Cache-Control':'private, no-store'}});
}