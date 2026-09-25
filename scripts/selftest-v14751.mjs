import fs from "node:fs";
const patch=fs.readFileSync("scripts/patch-v14751.mjs","utf8");
const icon=fs.readFileSync("components/LingxiMiniIcon.tsx","utf8");
const glyph=fs.readFileSync("components/tools/ToolGlyph.tsx","utf8");

const tests=[
 ["semantic icons",icon.includes('home:"🏠"')&&icon.includes('tools:"🧰"')&&icon.includes('sasi:"🪄"')&&icon.includes('research:"🔬"')],
 ["consistent size modes",icon.includes('"nav"|"title"|"card"|"tiny"')],
 ["tool system reuses shared icons",glyph.includes('LingxiMiniIcon')&&glyph.includes('"food-calorie":"food"')],
 ["does not rewrite tool prose",!patch.includes("SUMMARY[")&&!patch.includes("noteZh:")&&!patch.includes("descZh:")],
 ["connection visual only",patch.includes("connection tabs vivid icons")&&!patch.includes("selected.stepsZh")],
 ["no literal backslash-n import injection",!patch.includes('\\\\nimport LingxiMiniIcon')],
 ["no destructive git",!patch.includes("reset --hard")&&!patch.includes("clean -fd")&&!patch.includes("checkout .")],
];

function simulate(source,anchor,insert){
  return source.replace(anchor,anchor+"\n"+insert);
}
const fixtures=[
  ['import NotificationBell from "@/components/NotificationBell";','import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";'],
  ['import {useLingxiLang} from "@/lib/lingxi-i18n";','import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";'],
  ['import Bi from "@/components/Bi";','import LingxiMiniIcon from "@/components/LingxiMiniIcon";'],
  ['import LxText from "@/components/LxText";','import LingxiMiniIcon from "@/components/LingxiMiniIcon";'],
  ['import SasiConnectionsClient from "@/components/SasiConnectionsClient";','import LingxiMiniIcon from "@/components/LingxiMiniIcon";'],
];
for(const [anchor,insert] of fixtures){
  const out=simulate(`${anchor}\nexport default function X(){return null}`,anchor,insert);
  tests.push([`import insertion syntax ${insert.includes("type")?"typed":"plain"}`,out.includes(anchor+"\n"+insert)&&!out.includes("\\\\nimport")]);
}

let bad=false;
for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);
console.log("V14.75.1_SELFTEST=PASS");
