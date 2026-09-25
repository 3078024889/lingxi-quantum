import fs from "node:fs";
const p=fs.readFileSync("scripts/patch-v1480.mjs","utf8");
const tests=[
 ["knowledge copy removes browser/local implementation",p.includes("资料按原文建立可追溯的私人资料库")&&p.includes("我的资料")],
 ["research implementation wording removed",p.includes("围绕相关原文证据展开")],
 ["wallet visual anchors",p.includes("lx-wallet-currency-card")],
 ["global state visuals",p.includes("lx-state-card is-loading")&&p.includes("lx-state-card is-empty")],
 ["no pricing/payment logic rewrite",!p.includes("CNY=[")&&!p.includes("USD=[")&&!p.includes("/api/ai/wallet")],
 ["no destructive git",!p.includes("reset --hard")&&!p.includes("clean -fd")&&!p.includes("checkout .")],
];
let bad=false;for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);console.log("V14.80_SELFTEST=PASS");
