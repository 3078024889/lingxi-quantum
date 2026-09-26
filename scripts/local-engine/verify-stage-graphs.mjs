#!/usr/bin/env node
import fs from "node:fs";const p="lib/tools/engine/stage-graph.ts",s=fs.readFileSync(p,"utf8");
for(const tool of ["food-calorie","ocr","pdf-ocr","pdf-compress","pdf-redact","audio-transcription","video-transcription","subtitle-translate","video-dubbing","id-photo-ai","web-extract","docx-to-txt","xlsx-to-csv","csv-to-xlsx","e-sign-pdf","pdf-pages","screenshot-redact"]){
 if(!s.includes(`g("${tool}"`))throw new Error(`TOOL_GRAPH_MISSING:${tool}`)
}
for(const stage of ["normalize","search","calculate","parse","recognize","rebuild","validate","asr","translate","tts","compose","redact"]){
 if(!s.includes(`"${stage}"`))throw new Error(`STAGE_MISSING:${stage}`)
}
const dub=(s.split('g("video-dubbing"')[1]||"").split('g("')[0]||"";
if(!dub.includes("text-to-speech"))throw new Error("VIDEO_DUBBING_TTS_STAGE_MISSING");
console.log("STAGE_GRAPH_V1593=PASS");
