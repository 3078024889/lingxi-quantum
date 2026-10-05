import fs from"node:fs";
const s=fs.readFileSync("components/SasiUnifiedLauncher.tsx","utf8");
const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];
for(const lang of langs)if(!s.includes(`${lang},`)&&!s.includes(`${lang}:`))throw new Error("R17_LAUNCHER_LANG_MISSING:"+lang);
if(!s.includes("const L=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string)"))
 throw new Error("R17_LAUNCHER_9LANG_FACTORY_MISSING");
console.log("R17_UNIFIED_LAUNCHER_9LANG=PASS");
