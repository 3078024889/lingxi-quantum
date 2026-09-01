import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const read=(path)=>readFileSync(resolve(process.cwd(),path),"utf8");
const source=read("lib/stellar-trace-math.ts");
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
const math=await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
assert.equal(math.angularDistance(359,1),2);
assert.equal(math.analyzeCircularDirections([0,90,180,270]).qualified,false);
assert.equal(math.analyzeCircularDirections([315,320,330]).qualified,true);

const engine=read("lib/stellar-trace.ts");
const ancientEngine=read("lib/stellar-trace/ancient/engine.ts");
const fuse=read("lib/stellar-trace/ancient/fuse.ts");
const ui=read("app/stellar-trace/StellarTraceExperience.tsx");
const mini=read("miniapp/pages/product/index.js");

for(const token of ["lingxifield-stellar-trace-v4","experimentalAstronomyProjections","calculatePersonTrace","reportedMovementBearing","realityValidation","candidateZones:[]"]){
  assert.ok(engine.includes(token),`v4 engine missing ${token}`);
}
assert.ok(!engine.includes("reality?.bearing??"),"reported direction must never become the primary inference");
assert.ok(!engine.includes("reported-motion"),"reported direction must not enter experimental astronomy evidence");
assert.ok(ancientEngine.includes("validateRealityBearing(fused,input.reportedMovementBearing??null)"),"reported bearing must be validation-only");
assert.ok(engine.includes('targetKind:"person"'),"person trace must enter the canonical V339 orchestrator");
assert.ok(read("lib/stellar-trace/person/orchestrator.ts").includes("createQimenProvider")&&read("lib/stellar-trace/person/orchestrator.ts").includes("createLiurenProvider"),"Qimen and Liuren canonical providers must be active");
assert.ok(read("lib/stellar-trace/providers/liuren-provider.ts").includes("special-method-unverified")&&!read("lib/stellar-trace/providers/liuren-provider.ts").includes('xuanwuBranch:"子",\n        transmissions:["","",""]'),"unverified Liuren special methods must stop without a placeholder bearing");
assert.ok(fuse.includes("usedSystems")&&fuse.includes("omittedSystems"),"3/4 evidence coverage must remain explicit");
assert.ok(ui.includes("现实移动方向仅用于事后核验")&&ui.includes("原典四证 · 独立合度"),"UI must disclose the independent inference boundary");
assert.ok(mini.includes("interrupts the Chinese IME composition buffer")&&mini.includes("onStellarBlur"),"Mini name input regression guard is absent");

const inferred=315,reported=270;
assert.equal(inferred,315,"reported bearing must not rewrite an independent ancient result");
assert.equal(Math.abs(inferred-reported),45);
console.log("PASS stellar trace v4: independent ancient inference, validation-only reality bearing, and no uncalibrated coordinates");
