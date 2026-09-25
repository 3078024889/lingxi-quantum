import fs from "node:fs";
const help=fs.readFileSync("components/PaypalHelp.tsx","utf8");
const checkout=fs.readFileSync("app/checkout-usd/page.tsx","utf8");
const landing=fs.readFileSync("app/paypal/page.tsx","utf8");
const tests=[
 ["nine language help",(help.match(/^\s{2}(zh|en|ja|ko|fr|de|es|pt|ar):\{/gm)||[]).length===9],
 ["nine language checkout",(checkout.match(/^\s{2}(zh|en|ja|ko|fr|de|es|pt|ar):\{/gm)||[]).length===9],
 ["China link present",help.includes("paypal.com/c2/webapps/mpp/account-selection?locale.x=zh_CN")],
 ["global link present",help.includes("https://www.paypal.com/")],
 ["structured data present",landing.includes('"@context":"https://schema.org"')],
 ["no fake route",!landing.includes("javascript:")&&!checkout.includes("javascript:")],
];
let failed=false;
for(const [name,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${name}`);if(!ok)failed=true}
if(failed)process.exit(1);
console.log("V14.68_SELFTEST=PASS");
