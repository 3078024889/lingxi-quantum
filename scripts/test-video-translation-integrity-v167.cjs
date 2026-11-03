const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const code=ts.transpileModule(fs.readFileSync("lib/tools/media/video-subtitle-integrity.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const m={};vm.runInNewContext(code,{exports:m,Array,Map,Number});
const marker=id=>"⟦LX"+String(id).padStart(4,"0")+"⟧";
const valid=marker(5)+" Bonjour monde\n"+marker(6)+" Une autre phrase";
assert.deepEqual(Array.from(m.extractExactTranslatedCues(valid,5,2)),["Bonjour monde","Une autre phrase"]);
for(const bad of [
 marker(5)+" Bonjour "+marker(5)+" dupliqué",marker(4)+" wrong "+marker(6)+" correct",
 marker(5)+" Bonjour",marker(5)+" Bonjour "+marker(6)+" cassé \uFFFD",
 "Extra commentary: "+valid,valid+marker(7)+" extra",
 marker(6)+" Wrong "+marker(6)+" repeated","", "Nothing"
])assert.equal(m.extractExactTranslatedCues(bad,5,2),null,"invalid model reply must trigger per-cue recovery: "+bad);
const orig=[{start:0,end:1.2,text:"Hello world"},{start:2,end:3.5,text:"Another line"}];
const translated=[{start:0,end:1.2,text:"Bonjour monde"},{start:2,end:3.5,text:"Une autre phrase"}];
assert.equal(m.requireCuesWithinVideo(orig,4).length,2);
const bilingual=m.pairBilingualCues(orig,translated);
assert.equal(bilingual[0].text,"Hello world\nBonjour monde");
assert.equal(bilingual[1].start,2);
assert.throws(()=>m.pairBilingualCues(orig,[{...translated[0],end:3.4},translated[1]]),/BILINGUAL_TIMELINE_MISMATCH/);
for(const invalid of [
 [{start:0,end:12,text:"fabricated full-video cue"}],
 [{start:2,end:3,text:"first"},{start:1,end:2,text:"unordered"}],
 [{start:0,end:1,text:"Hello"},{start:4,end:25,text:"fabricated"}],
 [{start:0,end:1,text:"\uFFFD broken"}]
])assert.throws(()=>m.requireCuesWithinVideo(invalid,4),/VIDEO_TIMELINE_INVALID/);
assert.throws(()=>m.requireCuesWithinVideo(orig,0),/VIDEO_TIMELINE_UNVERIFIED/);
assert.throws(()=>m.requireCuesWithinVideo([],4),/VIDEO_TIMELINE_UNVERIFIED/);
const work=fs.readFileSync("components/tools/VideoTranslateWorkbench.tsx","utf8");
assert(work.includes("extractExactTranslatedCues(translated,base,group.length)"));
assert(work.includes("requireCuesWithinVideo(requireTimedTranscript(local.segments"));
assert(work.includes("-bilingual.srt")&&work.includes("-bilingual.vtt"));
assert(work.includes("pairBilingualCues(original,checked)"));
console.log("VIDEO_TRANSLATION_INTEGRITY_V167=PASS: translated cue IDs, genuine clock, bilingual timed SRT/VTT; live provider/model separate");
