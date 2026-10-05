import fs from"node:fs";
function must(v,m){if(!v)throw new Error(m)}
const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
const recipes=JSON.parse(fs.readFileSync("lib/tools/platform/tool-recipes.json","utf8"));
const caps=JSON.parse(fs.readFileSync("lib/tools/platform/capability-genome.json","utf8"));
const fixture=JSON.parse(fs.readFileSync("lib/tools/platform/fixture-matrix.json","utf8"));
const slugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(m=>m[1]);

must(slugs.length===new Set(slugs).size,"PUBLIC_CATALOG_DUPLICATE");
must(recipes.length===slugs.length,`RECIPE_COUNT_MISMATCH:${recipes.length}:${slugs.length}`);

const recipeSlugs=new Set(recipes.map(x=>x.slug));
const missingRecipes=slugs.filter(slug=>!recipeSlugs.has(slug));
if(missingRecipes.length)throw new Error("RECIPE_MISSING_ALL:"+missingRecipes.join(","));

const capIds=new Set(caps.map(x=>x.id));
const unknownCaps=[];
for(const r of recipes)for(const id of r.capabilities)if(!capIds.has(id))unknownCaps.push(`${r.slug}:${id}`);
if(unknownCaps.length)throw new Error("CAPABILITY_MISSING_ALL:"+unknownCaps.join(","));

const cls=fixture.toolClassifications||{};
const missingClassifications=slugs.filter(slug=>!cls[slug]);
const orphanClassifications=Object.keys(cls).filter(slug=>!slugs.includes(slug));
if(missingClassifications.length)throw new Error("FIXTURE_CLASSIFICATION_MISSING_ALL:"+missingClassifications.join(","));
if(orphanClassifications.length)throw new Error("ORPHAN_FIXTURE_CLASSIFICATION_ALL:"+orphanClassifications.join(","));
must(Object.keys(cls).length===slugs.length,`FIXTURE_CLASSIFICATION_COUNT:${Object.keys(cls).length}:${slugs.length}`);

must(slugs.includes("image-translator"),"IMAGE_TRANSLATOR_NOT_PUBLIC");
console.log(`PUBLIC_TOOL_CATALOG=${slugs.length}`);
console.log("TOOL_RECIPE_ONE_TO_ONE=PASS");
console.log("CAPABILITY_REFERENCES=PASS");
console.log(`FIXTURE_CLASSIFICATION_COUNT=${Object.keys(cls).length}`);
console.log("FIXTURE_MATRIX_ONE_TO_ONE=PASS");
console.log("IMAGE_TRANSLATOR_PUBLIC=PASS");
console.log("TOOL_REGISTRY_AUDIT=PASS");
