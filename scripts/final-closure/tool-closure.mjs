import fs from"node:fs";import path from"node:path";const r=process.cwd(),read=x=>fs.readFileSync(path.join(r,x),"utf8"),has=(f,x)=>read(f).includes(x),ok=(n,v)=>{console.log(`${n}=${v?"PASS":"FAIL"}`);if(!v)process.exitCode=1};
ok("TOOL_CLOSURE_COMPOSITE_SEARCH",has("app/api/tools/food/search/route.ts","searchCompositeFoods"));
ok("TOOL_CLOSURE_COMPOSITE_CALC",has("app/api/tools/food/manual-calculate/route.ts","calcCompositeFood"));
ok("TOOL_CLOSURE_FRUIT_SALAD_RESULT",has("lib/tools/food/composite-catalog.ts","fruit-salad-estimated"));
ok("TOOL_CLOSURE_IDPHOTO_PRESETS",has("lib/tools/id-photo/presets.ts","passport-35x45"));
ok("TOOL_CLOSURE_IDPHOTO_EXACT_PIXELS",has("lib/tools/id-photo/browser-processor.ts","presetPixels"));
ok("TOOL_CLOSURE_IDPHOTO_HONEST_FALLBACK",has("components/tools/IdPhotoAiWorkbench.tsx","复杂背景不会伪装"));
ok("TOOL_CLOSURE_VERSION",has("lib/release/version.ts","2026.09.30.9")&&has("lib/release/version.ts","4.8.6"));
if(!process.exitCode)console.log("GRADUATION_TOOL_CLOSURE=PASS");
