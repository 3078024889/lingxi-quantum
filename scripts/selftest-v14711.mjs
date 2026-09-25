import fs from "node:fs";
const patch=fs.readFileSync("scripts/patch-tools-v14711.mjs","utf8");
const audit=fs.readFileSync("scripts/audit-tools-truth-v14711.mjs","utf8");
const tests=[
 ["audit handles dynamic [slug] route",audit.includes('app","tools","[slug]","page.tsx')&&audit.includes("registryBacked&&hasDynamic")],
 ["audit no longer assumes every slug needs folder",!audit.includes("missing tool page /tools/")],
 ["compact card CSS",patch.includes("min-height:0!important")&&patch.includes("grid-template-columns:42px minmax(0,1fr)")],
 ["lighter glyphs",patch.includes('utility: { icon: "✦"')&&patch.includes('document: { icon: "▤"')],
 ["runtime fixes carried forward",patch.includes('gpt-image-2"')&&patch.includes("const w=item.width,h=item.height")],
 ["no destructive git",!patch.includes("reset --hard")&&!patch.includes("clean -fd")&&!patch.includes("checkout .")],
];
let bad=false;for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);
console.log("V14.71.1_SELFTEST=PASS");
