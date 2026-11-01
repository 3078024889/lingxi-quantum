import {NextResponse} from 'next/server';
import {paymentDeploymentReadiness} from '../../../../../lib/market-billing-readiness.mjs';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(){
 const providers=paymentDeploymentReadiness();
 return NextResponse.json({providers,merchantAcceptanceEnabled:providers.some(p=>p.checkoutAvailable),
  providerCurrencies:{alipay:'CNY',wechat:'CNY',paypal:'USD'},
  currencyPolicy:'The displayed CNY and USD plan numerals match, but represent separate prices; never silently convert.',
  verification:'Only an independently verified server-side provider transaction plus atomic order ledger can authorize delivery.',
  note:'This concerns LINGXIFIELD merchant billing, not the payment methods accepted by the 32 listed AI vendors.'},
  {headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
