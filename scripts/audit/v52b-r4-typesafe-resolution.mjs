import fs from "node:fs";
const p="components/SasiChatCreationStudio.tsx";
const s=fs.readFileSync(p,"utf8");
const bad=[];
if(!s.includes('const next:Array<"720p"|"1080p"|"4k">=found.length?found:["720p","1080p"];'))
 bad.push("typed resolution fallback missing");
if(s.includes('const next=found.length?found:["720p","1080p"];'))
 bad.push("widened string[] fallback still present");
if(!s.includes('next[0]??"720p"'))
 bad.push("resolution setter fallback missing");
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52B_R4_TYPESAFE_RESOLUTION=PASS");
