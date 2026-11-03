const fs=require("node:fs"),ts=require("typescript"),vm=require("node:vm"),assert=require("node:assert/strict");
const cache=new Map();
function load(p){
 if(cache.has(p))return cache.get(p);
 const module={exports:{}};cache.set(p,module.exports);
 const output=ts.transpileModule(fs.readFileSync(p,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const requireLocal=name=>{
  if(name==="./series-plan")return load("lib/sasi/series-plan.ts");
  if(name==="./drama-quality-guidance")return load("lib/sasi/drama-quality-guidance.ts");
  throw new Error("Unexpected import: "+name);
 };
 vm.runInNewContext(output,{module,exports:module.exports,require:requireLocal,JSON},{filename:p});
 return module.exports;
}
const {parseAutomaticVideoPlan}=load("lib/sasi/automatic-video-plan.ts");
const shots=[{episode:1,duration:8,prompt:'The captain says "look {inside}" as the camera circles the observatory.',assetIds:[]}];
const valid=JSON.stringify({title:"Starling Story",shots});
assert.equal(parseAutomaticVideoPlan(valid).shots.length,1);
assert.equal(parseAutomaticVideoPlan("Here is your storyboard:\n\`\`\`json\n"+valid+"\n\`\`\`").title,"Starling Story");
assert.equal(parseAutomaticVideoPlan("\`\`\`json\n"+valid+"\n\`\`\`").shots[0].prompt,shots[0].prompt);
assert.throws(()=>parseAutomaticVideoPlan(valid,"共2集"),/VIDEO_EPISODE_COUNT_MISMATCH/);
assert.throws(()=>parseAutomaticVideoPlan('{"title":"Broken","shots":[{]'),/SyntaxError|VIDEO_PLAN_INVALID/);
assert.throws(()=>parseAutomaticVideoPlan("Preface "+valid+" {incomplete"),/VIDEO_PLAN_INVALID/);
assert.throws(()=>parseAutomaticVideoPlan("x".repeat(80001)+valid),/VIDEO_PLAN_INVALID/);
assert.throws(()=>parseAutomaticVideoPlan(JSON.stringify({title:"Too long",shots:[{...shots[0],duration:9}]})),/VIDEO_PLAN_INVALID/);
assert.throws(()=>parseAutomaticVideoPlan(JSON.stringify({title:"External input",shots:[{...shots[0],assetIds:["foreign"]}]})),/VIDEO_PLAN_INVALID/);
console.log("PASS: SASI structured storyboard valid JSON/fences/preface/quoted braces accepted; invalid JSON, oversize, wrong episode and disallowed media refs rejected. No model calls.");
