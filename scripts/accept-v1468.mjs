import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8");
const failures=[];
const check=(ok,name)=>{console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failures.push(name)};
const help=r("components/PaypalHelp.tsx"),checkout=r("app/checkout-usd/page.tsx"),landing=r("app/paypal/page.tsx"),layout=r("app/checkout-usd/layout.tsx");
for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
  check(new RegExp(`\\b${lang}:\\s*\\{`).test(help),`PayPal help includes ${lang}`);
  check(new RegExp(`\\b${lang}:\\s*\\{`).test(checkout),`checkout includes ${lang}`);
}
check(help.includes("paypal.com/c2/webapps/mpp/account-selection?locale.x=zh_CN"),"Mainland China PayPal registration link");
check(help.includes('href="https://www.paypal.com/"'),"global PayPal official link");
check(help.includes("navigator.language"),"browser locale hint");
check(checkout.includes("<PaypalHelp compact/>"),"checkout embeds localized help");
check(layout.includes("index:false"),"transaction page noindex");
check(layout.includes('canonical:"/paypal"'),"transaction canonical points to PayPal page");
check(landing.includes('"@type":"FAQPage"'),"FAQ structured data");
check(landing.includes("openGraph"),"OpenGraph metadata");
check(landing.includes("<PaypalHelp/>"),"landing embeds localized help");
if(failures.length){console.error(`V14.68_ACCEPT_FAILURES=${failures.length}`);failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.68_PAYPAL_I18N_GEO_SEO=PASS");
