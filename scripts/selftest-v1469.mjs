import fs from "node:fs";
const card=fs.readFileSync("lib/tools/card-i18n.ts","utf8");
const patch=fs.readFileSync("scripts/patch-copy-v1469.mjs","utf8");

const start=patch.indexOf('const block=`      <section className="lx11-footer-brand">');
const end=patch.indexOf('`;\n  s=s.slice(0,start)+block',start);
const block=start>=0&&end>start?patch.slice(start,end):"";

const tests=[
 ["nine languages present",["zh","en","ja","ko","fr","de","es","pt","ar"].every(x=>card.includes(`${x}:`))],
 ["privacy label exists",card.includes("隐私保护 · 安全处理")],
 ["approved footer copy protected",patch.includes("一键创造，一念即达。")&&patch.includes("创作无限，工具不上限。")],
 ["footer block found",start>=0&&end>start],
 ["footer replacement explicitly closes section",block.includes("<span>lingxifield.com · lingxifield.cn</span>")&&block.trimEnd().endsWith("</section>")],
 ["no destructive git commands",!patch.includes("reset --hard")&&!patch.includes("clean -fd")&&!patch.includes("checkout .")],
];
let failed=false;
for(const [name,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${name}`);if(!ok)failed=true}
if(failed)process.exit(1);
console.log("V14.69.1_SELFTEST=PASS");
