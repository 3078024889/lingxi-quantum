import{NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{getPaypalAccessToken,listPaypalWebhooks,paypalConfigured,paypalEnabled}from"@/lib/paypal";
import{wechatPayConfigured,wechatPayEnabled,wechatPayMissingVars}from"@/lib/wechatpay";
import{alipayEnabled,alipayMissingVars}from"@/lib/alipay";
import{toolPassCommerceReady}from"@/lib/tools/commerce/tool-server-receipt";
import{SASI_SOFTWARE_CATALOG}from"@/lib/sasi-software/catalog";
import{softwareCheckoutReady}from"@/lib/sasi-software/readiness";
import{marketplaceR2Ready}from"@/lib/sasi-marketplace/r2";
import{trustedSiteOrigin}from"@/lib/sasi/site-origin";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;

function isAdmin(email:string|null|undefined){
 const allow=(process.env.TOOL_ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
 return Boolean(email&&allow.includes(email.toLowerCase()));
}

export async function GET(req:Request){
 const supabase=createClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 if(!isAdmin(user.email))return NextResponse.json({error:"ADMIN_REQUIRED"},{status:403});

 const paypalLive=process.env.PAYPAL_ENV?.trim().toLowerCase()==="live";
 let paypalTokenTest:"PASS"|"FAIL"|"SKIPPED"="SKIPPED";
 let paypalWebhook:{registered:boolean;urlMatches:boolean;missingEvents:string[]}|null=null;
 const requiredEvents=[
  "CHECKOUT.ORDER.APPROVED","CHECKOUT.PAYMENT-APPROVAL.REVERSED",
  "PAYMENT.CAPTURE.PENDING","PAYMENT.CAPTURE.COMPLETED",
  "PAYMENT.CAPTURE.DENIED","PAYMENT.CAPTURE.REFUNDED"
 ];
 if(paypalLive&&paypalConfigured()){
  try{await getPaypalAccessToken();paypalTokenTest="PASS";}
  catch{paypalTokenTest="FAIL";}
  if(paypalTokenTest==="PASS"){
   try{
    const rows=await listPaypalWebhooks();
    const selected=rows.find(item=>item.id===process.env.PAYPAL_WEBHOOK_ID?.trim());
    const missingEvents=selected?requiredEvents.filter(name=>!selected.events.includes(name)):requiredEvents;
    const expectedUrl=trustedSiteOrigin(req)+"/api/pay/paypal/webhook";
    const normalize=(value:string)=>value.replace(/\/$/,"");
    paypalWebhook={
     registered:Boolean(selected),
     urlMatches:Boolean(selected&&normalize(selected.url)===normalize(expectedUrl)),
     missingEvents
    };
   }catch{
    paypalWebhook={registered:false,urlMatches:false,missingEvents:requiredEvents};
   }
  }
 }
 const software=await Promise.all(SASI_SOFTWARE_CATALOG.map(async item=>({
  productId:item.id,ready:await softwareCheckoutReady(item.id)
 })));
 const alipayMissing=alipayMissingVars();
 const wechatMissing=wechatPayMissingVars();
 return NextResponse.json({
  payments:{
   wechat:{configured:wechatPayConfigured(),enabled:wechatPayEnabled(),missing:wechatMissing},
   alipay:{configured:alipayMissing.length===0,enabled:alipayEnabled(),missing:alipayMissing},
   paypal:{environment:paypalLive?"live":"not-live",configured:paypalConfigured(),enabled:paypalEnabled(),tokenTest:paypalTokenTest,webhook:paypalWebhook}
  },
  commerce:{
   toolPass:toolPassCommerceReady(),
   softwareCommerceFlag:process.env.SOFTWARE_COMMERCE_READY==="true",
   softwarePackages:software,
   marketplaceR2:marketplaceR2Ready()
  }
 },{headers:{"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"}});
}
