import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";

test("dubbing translates every subtitle cue and keeps its original time",async()=>{
 const source=readFileSync(new URL("../components/tools/VideoDubbingWorkbench.tsx",import.meta.url),"utf8");
 const start=source.indexOf(" async function run("),end=source.indexOf("\n return <div",start);
 assert(start>=0&&end>start);
 const subtitles={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../lib/tools/shared/subtitle-document.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:subtitles});
 const outputs=[],spoken=[];
 const srt="1\n00:00:01,000 --> 00:00:02,500\nHello world.\n\n2\n00:00:04,000 --> 00:00:06,000\nThank you.";
 const runtime={Blob,Map,Array,Date,Error,source:"en",target:"es",files:[{name:"speech.mp4"}],
  setBusy(){},setError(){},setOutputs(){},setSubtitles:items=>outputs.push(...items),setStage(){},
  transcribeLocal:async()=>({text:"Hello world. Thank you.",segments:[]}),toSrt:()=>srt,
  remoteTranslate:async text=>({"Hello world.":"Hola mundo.","Thank you.":"Gracias."}[text]),
  remoteTts:async text=>{spoken.push(text);return new Blob(["voice"])},muxDubbedVideo:async()=>new Blob(["mp4"]),
  subtitleBlocks:subtitles.subtitleBlocks,rebuildSubtitles:subtitles.rebuildSubtitles};
 vm.runInNewContext(ts.transpileModule(source.slice(start,end)+"\n globalThis.run=run;",{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,runtime);
 await runtime.run("test-quote");
 assert.equal(outputs.length,1);
 assert.equal(await outputs[0].blob.text(),"1\n00:00:01,000 --> 00:00:02,500\nHola mundo.\n\n2\n00:00:04,000 --> 00:00:06,000\nGracias.\n");
 assert.deepEqual(spoken,["Hola mundo.\nGracias."]);
});

