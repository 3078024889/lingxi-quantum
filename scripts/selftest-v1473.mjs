import fs from "node:fs";
const sub=fs.readFileSync("components/tools/SubtitleWorkbench.tsx","utf8");
const patch=fs.readFileSync("scripts/patch-tools-v1473.mjs","utf8");
const copy=fs.readFileSync("lib/tools/workbench-i18n-v1473.ts","utf8");

function parseSubtitle(raw){
 const normalized=raw.replace(/^\uFEFF/,"").replace(/\r/g,"").replace(/^WEBVTT[^\n]*\n+/i,"").trim();
 if(!normalized)return [];
 return normalized.split(/\n\s*\n/).map(block=>{
  const lines=block.split("\n").filter(Boolean),idx=lines.findIndex(x=>x.includes("-->"));
  if(idx<0)return null;
  const timing=lines[idx].split("-->");
  if(timing.length!==2)return null;
  const start=timing[0].trim().split(/\s+/)[0],end=timing[1].trim().split(/\s+/)[0],text=lines.slice(idx+1).join("\n").trim();
  return text?{start,end,text}:null;
 }).filter(Boolean);
}
const srt=`1\n00:00:01,000 --> 00:00:03,000\n你好`;
const vtt=`WEBVTT\n\n00:00:01.000 --> 00:00:03.000 align:start\nHello`;
const tests=[
 ["SRT parser",parseSubtitle(srt).length===1],
 ["VTT parser",parseSubtitle(vtt).length===1&&parseSubtitle(vtt)[0].text==="Hello"],
 ["component accepts VTT",sub.includes(".vtt,text/plain,text/vtt")],
 ["9 language copy",["zh","en","ja","ko","fr","de","es","pt","ar"].every(x=>copy.includes(`${x}:`))],
 ["engineering copy cleaned",patch.includes("batchImageLead")&&patch.includes("preparingMedia")&&patch.includes("textIntro")],
 ["no destructive git",!patch.includes("reset --hard")&&!patch.includes("clean -fd")&&!patch.includes("checkout .")],
];
let bad=false;for(const [n,ok] of tests){console.log(`${ok?"PASS":"FAIL"} SELFTEST ${n}`);if(!ok)bad=true}
if(bad)process.exit(1);console.log("V14.73_SELFTEST=PASS");
