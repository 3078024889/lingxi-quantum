import fs from "node:fs";
const p=fs.readFileSync("scripts/patch-v1477.mjs","utf8");
const tests=[
  ["real import newlines",!p.includes('\\\\nimport LingxiMiniIcon')&&!p.includes('\\\\nimport Link')],
  ["build sequence safe",!p.includes('reset --hard')&&!p.includes('clean -fd')&&!p.includes('checkout .')],
  ["payload preserves copy",!p.includes('descZh:')&&!p.includes('descEn:')&&!p.includes('titleZh:')],
  ["product center patch present",p.includes('ProductCatalogClient.tsx')&&p.includes('LingxiMiniIcon name={item.icon}')],
  ["special tool returns present",p.includes('temp mail icon and back')&&p.includes('burn icon and back')],
  ["global visual css present",p.includes('V14.77 full visual rebuild')],
];
let bad=false;
for(const [name,cond] of tests){console.log(`${cond?"PASS":"FAIL"} SELFTEST ${name}`); if(!cond) bad=true}
if(bad) process.exit(1);
console.log("V14.77_SELFTEST=PASS");
