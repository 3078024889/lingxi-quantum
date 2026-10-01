import fs from"node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const caps=read("lib/tools/platform/capability-genome.json");
const recipes=read("lib/tools/platform/tool-recipes.json");
const licenses=read("lib/tools/platform/license-firewall.json");
const radar=read("lib/tools/platform/global-product-radar.json");
const io=read("lib/tools/platform/io-contract.json");
const workflows=read("lib/tools/platform/workflow-presets.json");
const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
const publicSlugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(x=>x[1]);
function must(v,m){if(!v)throw new Error(m)}
const capIds=new Set(caps.map(x=>x.id));
must(capIds.size===caps.length,"DUPLICATE_CAPABILITY_ID");
must(publicSlugs.length===new Set(publicSlugs).size,"DUPLICATE_PUBLIC_TOOL");
must(recipes.length===publicSlugs.length,`PUBLIC_TOOL_RECIPE_COUNT:${recipes.length}:PUBLIC:${publicSlugs.length}`);
must(new Set(recipes.map(x=>x.slug)).size===recipes.length,"DUPLICATE_TOOL_RECIPE");
const recipeSlugs=new Set(recipes.map(x=>x.slug));
for(const slug of publicSlugs)must(recipeSlugs.has(slug),`PUBLIC_TOOL_RECIPE_MISSING:${slug}`);
for(const r of recipes){
 must(r.capabilities.length>0,`EMPTY_RECIPE:${r.slug}`);
 must(r.requiresNineLanguage===true,`NINE_LANGUAGE_REQUIRED:${r.slug}`);
 must(r.requiresDesktop===true&&r.requiresMobile===true,`BROWSER_MATRIX_REQUIRED:${r.slug}`);
 must(r.requiresRealFixture===true,`REAL_FIXTURE_REQUIRED:${r.slug}`);
 for(const id of r.capabilities)must(capIds.has(id),`UNKNOWN_CAPABILITY:${r.slug}:${id}`);
}
for(const w of workflows)for(const id of w.steps)must(capIds.has(id),`WORKFLOW_UNKNOWN_CAPABILITY:${w.id}:${id}`);
const blocked=new Set(licenses.filter(x=>["DENY","REFERENCE_ONLY"].includes(x.status)).map(x=>x.id));
must(!blocked.has("ffmpeg"),"FFMPEG_WRONGLY_BLOCKED");
must(radar.length>=12,"GLOBAL_RADAR_TOO_SMALL");must(io.rules.length>=6,"IO_CONTRACT_TOO_WEAK");
console.log(`CAPABILITY_GENOME_COUNT=${caps.length}`);
console.log(`PUBLIC_TOOL_RECIPES=${recipes.length}`);
console.log(`PUBLIC_TOOL_CATALOG=${publicSlugs.length}`);
console.log("CAPABILITY_GENOME_AUDIT=PASS");
console.log("TOOL_FACTORY_CONTRACT=PASS");
console.log("LICENSE_FIREWALL=PASS");
console.log(`ALL_${recipes.length}_TOOL_RECIPES=PASS`);
