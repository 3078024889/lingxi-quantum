const fs=require("node:fs"),ts=require("typescript"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("lib/tools/autonomous/transcribe-local.ts","utf8");
const ast=ts.createSourceFile("transcribe-local.ts",source,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TS);
const normalize=ast.statements.find(x=>ts.isFunctionDeclaration(x)&&x.name?.text==="normalizeAsrSegments");
assert(normalize,"The actual ASR inference path must provide an explicit timing guard");
const js=ts.transpileModule(normalize.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const context={exports:{},Number,Array,Object,String};
vm.runInNewContext(js,context);
const guard=context.exports.normalizeAsrSegments;
assert.equal(typeof guard,"function");
const cleaned=guard([
 {timestamp:[0.5,1.9],text:"Hi, World!"},
 {timestamp:[1.9,null],text:"Open-ended segment, no time."},
 {timestamp:null,text:"No timestamps"},
 {timestamp:[0,0],text:"Zero-duration cue"},
 {timestamp:[-1,2],text:"Negative start"},
 {timestamp:[5,3],text:"Reversed timestamps"},
 {timestamp:["2","3"],text:"String timestamps"},
 {timestamp:[NaN,3],text:"NaN"},
 {timestamp:[2,Infinity],text:"Infinity"},
 {timestamp:[3,4],text:"  Has time.  "},
 {timestamp:[5,6],text:"   "}
]);
assert.equal(cleaned.length,2,"Only genuinely timed, nonempty Whisper chunks may generate SRT/VTT");
assert.equal(cleaned[0].start,0.5);assert.equal(cleaned[0].end,1.9);assert.equal(cleaned[0].text,"Hi, World!");
assert.equal(cleaned[1].text,"Has time.");
assert.equal(guard(null).length,0);
const inference=source.slice(source.indexOf("export async function transcribeLocal("),source.indexOf("function timestamp("));
assert(inference.includes("normalizeAsrSegments(result?.chunks)"),"Actual inference result must be passed through the timestamp guard");
assert(!inference.includes("Number(c?.timestamp?.[0]||0)"),"Do not fabricate a zero timestamp for un-timed segments");
console.log("WHISPER_REAL_TIMING_V143=PASS: genuine model timestamps only, no fake subtitles for open-ended/malformed chunks, real inference path uses validation");
