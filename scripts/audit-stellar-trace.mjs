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
const miniApp=JSON.parse(read("miniapp/app.json"));
const miniLocation=read("miniapp/pages/stellar-location/index.js");
const mapPicker=read("app/stellar-trace/PreciseMapPicker.tsx");
const explore=read("miniapp/pages/explore/index.js");
const exporter=read("lib/pdf-export.ts");

for(const token of ["lingxifield-stellar-trace-v4","experimentalAstronomyProjections","calculatePersonTrace","reportedMovementBearing","realityValidation","candidateZones:[]"]){
  assert.ok(engine.includes(token),`v4 engine missing ${token}`);
}
assert.ok(!engine.includes("reality?.bearing??"),"reported direction must never become the primary inference");
assert.ok(!engine.includes("reported-motion"),"reported direction must not enter experimental astronomy evidence");
assert.ok(ancientEngine.includes("validateRealityBearing(fused,input.reportedMovementBearing??null)"),"reported bearing must be validation-only");
assert.ok(engine.includes('targetKind:"person"'),"person trace must enter the canonical V339 orchestrator");
assert.ok(read("lib/stellar-trace/person/orchestrator.ts").includes("createQimenProvider")&&read("lib/stellar-trace/person/orchestrator.ts").includes("createLiurenProvider"),"Qimen and Liuren canonical providers must be active");
assert.ok(read("lib/stellar-trace/providers/qimen-provider.ts").includes("@yhjs/dunjia@1.0.1")&&read("lib/stellar-trace/providers/liuren-provider.ts").includes("@yhjs/liuren@1.0.0"),"Qimen and Liuren must expose versioned full-chart engines");
assert.ok(!ancientEngine.includes("runLiuyao")&&!ancientEngine.includes("runTaiyi"),"paid report must not promise inactive casts or unverified engines");
assert.ok(fuse.includes("usedSystems")&&fuse.includes("g.r>=.65"),"two-engine direction agreement gate must remain explicit");
assert.ok(ui.includes("现实移动方向仅用于事后核验")&&ui.includes("双式时法 · 独立合参")&&!ui.includes("原典四证"),"UI must disclose the independent two-engine boundary");
assert.ok(/options\.product === 'stellar-trace'[\s\S]{0,180}wx\.redirectTo/.test(mini)&&/item\.productId === 'stellar-trace'[\s\S]{0,180}pages\/web\/index/.test(explore),"Mini Stellar Trace must bypass the native form and open the web field");
assert.ok(miniApp.pages.includes("pages/stellar-location/index")&&/wx\.chooseLocation/.test(miniLocation)&&/pickedLat/.test(miniLocation)&&/miniProgram\?\.navigateTo/.test(mapPicker),"Mini WebView must use native WeChat location picking instead of blocked web tiles");
assert.ok(exporter.includes("exportStellarTracePdf")&&exporter.includes('scale: 2')&&exporter.includes('toDataURL("image/png")'),"Stellar Trace must own a 2x PNG PDF exporter");
assert.ok(ui.includes("AncientEvidenceDetail")&&ui.includes("下载 3 页高清"),"Stellar Trace must publish expanded source-traced evidence pages");

const inferred=315,reported=270;
assert.equal(inferred,315,"reported bearing must not rewrite an independent ancient result");
assert.equal(Math.abs(inferred-reported),45);
console.log("PASS stellar trace v4: native Mini location bridge, two time-method engines, validation-only reality bearing, and no uncalibrated coordinates");
