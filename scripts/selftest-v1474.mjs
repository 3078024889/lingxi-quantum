import fs from "node:fs";
const p=fs.readFileSync("scripts/patch-tools-v1474.mjs","utf8"),g=fs.readFileSync("components/tools/ToolGlyph.tsx","utf8");
const tests=[
["emoji covers",g.includes('"batch-image":"🖼️"')&&g.includes('"food-calorie":"🥗"')&&g.includes('"burn-after-read":"🔥"')],
["preserve current prose",!p.includes("SUMMARY[")&&!p.includes("descZh:")],
["remove blank-box behavior",p.includes("height:auto!important")&&p.includes("min-height:158px!important")],
["full description wrap",p.includes("-webkit-line-clamp:unset!important")],
["larger typography",p.includes("font-size:17px!important")&&p.includes("font-size:14px!important")],
["back tools button",p.includes('href="/tools"')&&p.includes("返回实用工具")],
["no destructive git",!p.includes("reset --hard")&&!p.includes("clean -fd")&&!p.includes("checkout .")],
];
let bad=false;for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}if(bad)process.exit(1);console.log("V14.74_SELFTEST=PASS");
