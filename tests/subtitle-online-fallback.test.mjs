import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";

test("subtitle processing continues online when a browser language pack is missing",async()=>{
 const code=readFileSync(new URL("../components/tools/SubtitleTranslateWorkbench.tsx",import.meta.url),"utf8");
 const start=code.indexOf(" async function run()"),end=code.indexOf(" async function exportPaid()",start);
 assert(start>=0&&end>start);
 let output="",onlineCalls=0,onlineSelected=false;
 const runtime={AbortController,Error,files:[{name:"sample.srt",text:async()=>"source subtitle"}],busy:false,online:false,source:"en",target:"es",
 active:{current:null},c:["","","failed","login"],setBusy(){},setError(){},setOut:value=>{output=value},setNeedsLogin(){},setCharCount(){},setName(){},setOnline:value=>{onlineSelected=value},
 translateSubtitleLocal:async()=>{throw Error("LOCAL_LANGUAGE_PACK_NOT_READY")},
 translateSubtitleOnline:async(text,target,source,signal)=>{assert.equal(text,"source subtitle");assert.equal(signal.aborted,false);onlineCalls++;return "translated subtitle"}};
 vm.runInNewContext(ts.transpileModule(code.slice(start,end)+"\n globalThis.run=run;",{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,runtime);
 await runtime.run();
 assert.equal(output,"translated subtitle");assert.equal(onlineCalls,1);assert.equal(onlineSelected,true);
 runtime.translateSubtitleLocal=async()=>{runtime.active.current.abort();throw Error("LOCAL_LANGUAGE_PACK_NOT_READY")};
 await runtime.run();
 assert.equal(onlineCalls,1);
});

