import {NextResponse} from 'next/server';
import {VENDOR_PLANS,selectBillingCurrency,vendorQuote} from '../../../../lib/vendor-price-catalog.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){
 const url=new URL(request.url);
 const country=request.headers.get('x-vercel-ip-country')||request.headers.get('cf-ipcountry')||'';
 const currency=selectBillingCurrency(url.searchParams.get('currency'),country);
 const data=VENDOR_PLANS.map(plan=>({...vendorQuote(plan.id,currency),benefits:plan.benefits,orderable:plan.orderable}));
 return NextResponse.json({
  currency, country:country||null, paymentEnabled:false,
  providers:{CNY:['alipay','wechat'],USD:['paypal']},
  checkoutStatus:'PENDING_MERCHANT_VERIFICATION',
  data,
  disclaimer:'Prices are proposed. No money is collected until licensed merchant accounts, immutable order storage and verified callbacks pass review.'
 },{headers:{'Cache-Control':'no-store'}});
}
