import fs from"node:fs";

const seoPath="lib/seo/global-seo.ts";
const recipePath="lib/tools/platform/tool-recipes.json";
const fixturePath="lib/tools/platform/fixture-matrix.json";

const seo=fs.readFileSync(seoPath,"utf8");
const publicSlugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(x=>x[1]);
const recipes=JSON.parse(fs.readFileSync(recipePath,"utf8"));
const fixture=JSON.parse(fs.readFileSync(fixturePath,"utf8"));

if(publicSlugs.length!==118)throw new Error("R16R4_PUBLIC_TOOL_COUNT_DRIFT:"+publicSlugs.length);
if(recipes.length!==publicSlugs.length)throw new Error(`R16R4_RECIPE_COUNT_DRIFT:${recipes.length}:${publicSlugs.length}`);

fixture.toolClassifications ||= {};
fixture.onlineContractOnly ||= [];

const recipeBySlug=new Map(recipes.map(r=>[r.slug,r]));
const existing=fixture.toolClassifications;
const added=[];

for(const slug of publicSlugs){
 if(existing[slug])continue;
 const recipe=recipeBySlug.get(slug);
 if(!recipe)throw new Error("R16R4_RECIPE_MISSING:"+slug);

 // Keep the contract honest:
 // online provider/cost paths become online-contract.
 // deterministic/local tools become local-contract until a dedicated real fixture is added.
 const isOnline=recipe.privacyMode==="declared-online";
 existing[slug]={kind:isOnline?"online-contract":"local-contract"};
 if(isOnline&&!fixture.onlineContractOnly.includes(slug))fixture.onlineContractOnly.push(slug);
 added.push({slug,kind:existing[slug].kind});
}

const publicSet=new Set(publicSlugs);
for(const slug of Object.keys(existing)){
 if(!publicSet.has(slug))throw new Error("R16R4_ORPHAN_FIXTURE_CLASSIFICATION:"+slug);
}
fixture.onlineContractOnly=[...new Set(fixture.onlineContractOnly)].filter(slug=>publicSet.has(slug)).sort();

fixture.classificationCount=Object.keys(existing).length;
if(fixture.classificationCount!==publicSlugs.length)
 throw new Error(`R16R4_FIXTURE_CLOSURE_INCOMPLETE:${fixture.classificationCount}:${publicSlugs.length}`);

fs.writeFileSync(fixturePath,JSON.stringify(fixture,null,2)+"\n","utf8");

console.log("R16R4_FIXTURE_CLASSIFICATIONS_ADDED="+added.length);
console.log("R16R4_FIXTURE_CLASSIFICATION_COUNT="+fixture.classificationCount);
console.log("R16R4_FIXTURE_MATRIX_PUBLIC_PARITY=PASS");
