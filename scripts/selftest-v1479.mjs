import fs from "node:fs";
const p=fs.readFileSync("scripts/patch-v1479.mjs","utf8");
const tests=[
 ["home implementation copy removed",p.includes("不需要在多个软件之间来回切换")],
 ["SASI visual classes",p.includes("lx-sasi-entry-card")&&p.includes("lx-sasi-prompt-panel")],
 ["connection engineering copy removed",p.includes("连接服务暂时不可用")&&!p.includes("reset --hard")],
 ["no broad copy rewrite",!p.includes("Footer.tsx")&&!p.includes("brand-system-i18n")],
 ["no destructive git",!p.includes("reset --hard")&&!p.includes("clean -fd")&&!p.includes("checkout .")],
];
let bad=false;for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);console.log("V14.79_SELFTEST=PASS");
