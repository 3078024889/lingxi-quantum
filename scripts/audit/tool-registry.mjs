import fs from "node:fs";

const requiredPlatformFiles=[
 "lib/tools/platform/capability-genome.json",
 "lib/tools/platform/tool-recipes.json",
 "lib/tools/platform/license-firewall.json",
 "lib/tools/platform/global-product-radar.json",
 "lib/tools/platform/io-contract.json",
 "lib/tools/platform/workflow-presets.json",
 "lib/tools/platform/fixture-matrix.json",
 "lib/tools/platform/tool-registry.ts",
 "lib/tools/platform/workflow-compatibility.ts",
 "lib/tools/platform/index.ts"
];
for(const p of requiredPlatformFiles){
 if(!fs.existsSync(p))throw new Error(`PLATFORM_FILE_MISSING:${p}`);
}
if(fs.existsSync("lib/tools/platform/platform"))throw new Error("NESTED_PLATFORM_DIRECTORY_PRESENT");

const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
const recipes=JSON.parse(fs.readFileSync("lib/tools/platform/tool-recipes.json","utf8"));
const caps=JSON.parse(fs.readFileSync("lib/tools/platform/capability-genome.json","utf8"));
const fixture=JSON.parse(fs.readFileSync("lib/tools/platform/fixture-matrix.json","utf8"));

function must(v,m){if(!v)throw new Error(m)}

const slugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(m=>m[1]);
must(slugs.length===64,`PUBLIC_CATALOG_COUNT:${slugs.length}`);
must(new Set(slugs).size===64,"PUBLIC_CATALOG_DUPLICATE");

must(recipes.length===64,`RECIPE_COUNT:${recipes.length}`);
const recipeSlugs=new Set(recipes.map(x=>x.slug));
for(const slug of slugs)must(recipeSlugs.has(slug),`RECIPE_MISSING:${slug}`);
for(const recipe of recipes)must(slugs.includes(recipe.slug),`ORPHAN_RECIPE:${recipe.slug}`);

const capIds=new Set(caps.map(x=>x.id));
for(const recipe of recipes){
 must(recipe.capabilities.length>0,`EMPTY_CAPABILITY_RECIPE:${recipe.slug}`);
 for(const id of recipe.capabilities)must(capIds.has(id),`CAPABILITY_MISSING:${recipe.slug}:${id}`);
}

const classifications=fixture.toolClassifications||{};
const classifiedSlugs=Object.keys(classifications);
must(classifiedSlugs.length===64,`FIXTURE_CLASSIFICATION_COUNT:${classifiedSlugs.length}`);
must(fixture.classificationCount===64,`FIXTURE_CLASSIFICATION_DECLARED_COUNT:${fixture.classificationCount}`);

for(const slug of slugs){
 const c=classifications[slug];
 must(c,`FIXTURE_CLASSIFICATION_MISSING:${slug}`);
 must(["fixture","online-contract","local-contract"].includes(c.kind),`INVALID_FIXTURE_CLASSIFICATION:${slug}:${c.kind}`);
 if(c.kind==="fixture"){
   const group=fixture.fixtureGroups.find(g=>g.id===c.fixtureGroup);
   must(group,`FIXTURE_GROUP_MISSING:${slug}:${c.fixtureGroup}`);
   must(group.covers.includes(slug),`FIXTURE_GROUP_DOES_NOT_COVER_TOOL:${slug}:${c.fixtureGroup}`);
 }
}
for(const slug of classifiedSlugs)must(slugs.includes(slug),`ORPHAN_FIXTURE_CLASSIFICATION:${slug}`);

const pdfBasic=fixture.fixtureGroups.find(g=>g.id==="pdf-basic");
must(pdfBasic?.covers.includes("pdf-merge-split"),"PDF_MERGE_SPLIT_FIXTURE_MISSING");

console.log("PUBLIC_TOOL_CATALOG=64");
console.log("TOOL_RECIPE_ONE_TO_ONE=PASS");
console.log("CAPABILITY_REFERENCES=PASS");
console.log("FIXTURE_CLASSIFICATION_COUNT=64");
console.log("FIXTURE_MATRIX_ONE_TO_ONE=PASS");
console.log("PDF_MERGE_SPLIT_FIXTURE=PASS");
console.log("PLATFORM_CANONICAL_PATHS=PASS");
console.log("TOOL_REGISTRY_AUDIT=PASS");
