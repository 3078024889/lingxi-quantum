import fs from "node:fs";
const p=fs.readFileSync("scripts/patch-tools-v14701.mjs","utf8");
const x=fs.readFileSync("lib/tools/hub-copy-v1470.ts","utf8");

const tests=[
 ["source/display types separated",
   p.includes('type SourceCategory = "image" | "pdf" | "media" | "privacy" | "utility" | "ai" | "qr";')
   && p.includes('type Category = ToolDisplayCategory;')
   && p.includes("category: SourceCategory;")],
 ["ai qr utility remain legal source values",
   p.includes('"utility" | "ai" | "qr"')
   && p.includes("registryCategory(category: string): SourceCategory")],
 ["empty-state t preserved",
   p.includes('const { lang, t } = useLingxiLang();')
   || !p.includes('const { lang } = useLingxiLang();')],
 ["temp-mail real features",
   x.includes("自动收信和识别验证码")
   && p.includes("最长可延长至60分钟")
   && p.includes("11–100个")],
 ["no repeated privacy badge in new markup",
   p.includes('<div className="lx11-tool-meta"><b>{toolHubCopy(lang,"open")}</b></div>')],
 ["no destructive git",
   !p.includes("reset --hard")&&!p.includes("clean -fd")&&!p.includes("checkout .")]
];
let bad=false;
for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);
console.log("V14.70.1_SELFTEST=PASS");
