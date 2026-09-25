import fs from "node:fs";
const icon=fs.readFileSync("components/LingxiMiniIcon.tsx","utf8");
const patch=fs.readFileSync("scripts/patch-v1478.mjs","utf8");
const tests=[
 ["PDF/TXT/OCR no longer giant letters",icon.includes('glyph:"📄"')&&icon.includes('glyph:"📝"')&&icon.includes('glyph:"🔎"')],
 ["tiny format badges",icon.includes('badge:"PDF"')&&icon.includes('badge:"TXT"')&&icon.includes('badge:"OCR"')],
 ["account card icons shrink to title size",patch.includes('size="title"')],
 ["account dropdown gets small icons",patch.includes('name="account" size="tiny"')&&patch.includes('name="orders" size="tiny"')],
 ["no copy rewrite",!patch.includes("descZh:")&&!patch.includes("descEn:")&&!patch.includes("titleZh:")],
 ["no destructive git",!patch.includes("reset --hard")&&!patch.includes("clean -fd")&&!patch.includes("checkout .")],
];
let bad=false;for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);console.log("V14.78_SELFTEST=PASS");
