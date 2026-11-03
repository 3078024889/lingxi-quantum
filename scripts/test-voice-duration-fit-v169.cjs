const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const js=ts.transpileModule(fs.readFileSync("lib/tools/media/voice-duration-plan.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const api={};vm.runInNewContext(js,{exports:api,Number,Math,Error});
const p=api.planVoiceDurationFit;
const plan=p(4.6,3.4);
assert.equal(plan.needsFit,true);
assert(plan.tempo>1.3&&plan.tempo<1.4);
assert(/^atempo=\d\.\d{6},apad$/.test(plan.filter));
assert.equal(p(2,3.4).needsFit,false);
assert.equal(p(3.4,3.4).needsFit,false);
assert.throws(()=>p(9,2),/DUB_AUDIO_TOO_LONG_FOR_VIDEO/);
for(const a of [[NaN,4],[0,4],[4,0],[4,NaN],[Infinity,3],[3,7201]])
 assert.throws(()=>p(...a),/DUB_DURATION_UNVERIFIED/);
const runtime=fs.readFileSync("lib/tools/media/voice-duration-fit.ts","utf8");
assert(runtime.includes("planVoiceDurationFit(measured,videoSeconds)"));
assert(runtime.includes('"-af",plan.filter'));
assert(runtime.includes("DUB_AUDIO_FIT_DURATION_MISMATCH"));
for(const path of ["components/tools/VideoDubbingWorkbench.tsx","components/tools/VideoTranslateWorkbench.tsx"])
 assert(fs.readFileSync(path,"utf8").includes("fitVoiceDurationToVideo("),path);
for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
 const copy=api.voiceDurationCopy(lang);
 assert(copy.stage&&copy.tooLong&&copy.failed,"missing translation "+lang);
 assert(api.voiceDurationInfo(lang).length>24,"missing localized narration detail "+lang);
 assert(!/DUB_/.test(copy.failed),"engineering error leaked "+lang);
 assert.equal(api.voiceDurationError(lang,new Error("DUB_AUDIO_TOO_LONG_FOR_VIDEO")),copy.tooLong);
 assert.equal(api.voiceDurationError(lang,new Error("DUB_AUDIO_FIT_FAILED")),copy.failed);
 assert.equal(api.voiceDurationError(lang,new Error("OTHER_ERROR")),null);
}
console.log("VOICE_DURATION_FIT_V169=PASS: real TTS duration required, bounded atempo speed, no silent truncation; static tests do not contact providers.");
