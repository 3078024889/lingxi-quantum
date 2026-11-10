import process from "node:process";

const fail=(code)=>{console.log("CN_MERCHANT_PAYPAL_"+code+"=FAIL");process.exitCode=1;};
const required=[
 "CHECKOUT.ORDER.APPROVED",
 "CHECKOUT.ORDER.COMPLETED",
 "CHECKOUT.PAYMENT-APPROVAL.REVERSED",
 "PAYMENT.CAPTURE.PENDING",
 "PAYMENT.CAPTURE.COMPLETED",
 "PAYMENT.CAPTURE.DENIED",
 "PAYMENT.CAPTURE.REFUNDED"
];

async function main(){
 const env=process.env;
 if(String(env.PAYPAL_ENV||"").trim().toLowerCase()!=="live")return fail("ENVIRONMENT_LIVE");
 const clientId=String(env.PAYPAL_CLIENT_ID||"").trim();
 const clientSecret=String(env.PAYPAL_CLIENT_SECRET||"").trim();
 const webhookId=String(env.PAYPAL_WEBHOOK_ID||"").trim();
 if(!clientId||!clientSecret||!webhookId)return fail("CREDENTIALS_PRESENT");
 const auth=Buffer.from(clientId+":"+clientSecret,"utf8").toString("base64");
 let tokenResponse,tokenBody;
 try{
  tokenResponse=await fetch("https://api-m.paypal.com/v1/oauth2/token",{
   method:"POST",
   headers:{Authorization:"Basic "+auth,"Content-Type":"application/x-www-form-urlencoded"},
   body:"grant_type=client_credentials",
   cache:"no-store",
   signal:AbortSignal.timeout(15000)
  });
  tokenBody=await tokenResponse.json();
 }catch{return fail("LIVE_OAUTH_REQUEST");}
 if(!tokenResponse.ok||typeof tokenBody?.access_token!=="string"||!tokenBody.access_token)
  return fail("LIVE_OAUTH_AUTHENTICATION");
 console.log("CN_MERCHANT_PAYPAL_LIVE_TOKEN=PASS");
 let webhookResponse,webhook;
 try{
  webhookResponse=await fetch("https://api-m.paypal.com/v1/notifications/webhooks/"+encodeURIComponent(webhookId),{
   method:"GET",
   headers:{Authorization:"Bearer "+tokenBody.access_token,Accept:"application/json"},
   cache:"no-store",
   signal:AbortSignal.timeout(15000)
  });
  webhook=await webhookResponse.json();
 }catch{return fail("WEBHOOK_LOOKUP");}
 if(!webhookResponse.ok||String(webhook?.id||"")!==webhookId)
  return fail("WEBHOOK_ID_MATCH");
 if(String(webhook?.url||"").replace(/\/$/,"")!=="https://lingxifield.cn/api/pay/paypal/webhook")
  return fail("WEBHOOK_URL_MATCH");
 const actual=new Set(Array.isArray(webhook?.event_types)?webhook.event_types.map(x=>String(x?.name||"")):[]);
 const missing=required.filter(x=>!actual.has(x));
 if(missing.length){
  console.log("CN_MERCHANT_PAYPAL_MISSING_EVENTS="+missing.join(","));
  return fail("WEBHOOK_EVENT_SUBSCRIPTIONS");
 }
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_ID=PASS");
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_URL=PASS");
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_EVENTS=PASS");
 console.log("CN_MERCHANT_PAYPAL_LIVE_PROBE=PASS");
 if(env.NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true"&&env.TOOL_PASS_BACKEND_READY==="true"&&
    String(env.LINGXIFIELD_PRIVACY_HASH_SECRET||"").length>=32)
  console.log("CN_TOOLPASS_BACKEND_READINESS=PASS");
 else
  console.log("CN_TOOLPASS_BACKEND_READINESS=FAIL");
}
await main().catch(()=>fail("UNEXPECTED"));
