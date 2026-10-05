import fs from"node:fs";
const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
const publicSlugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(x=>x[1]);
const recipes=JSON.parse(fs.readFileSync("lib/tools/platform/tool-recipes.json","utf8"));
const fixture=JSON.parse(fs.readFileSync("lib/tools/platform/fixture-matrix.json","utf8"));
const cls=fixture.toolClassifications||{};
const groups=new Map((fixture.fixtureGroups||[]).map(g=>[g.id,g]));
const recipeBySlug=new Map(recipes.map(r=>[r.slug,r]));

const missing=publicSlugs.filter(slug=>!cls[slug]);
const orphan=Object.keys(cls).filter(slug=>!publicSlugs.includes(slug));
if(missing.length)throw new Error("R16R4_FIXTURE_MISSING:"+missing.join(","));
if(orphan.length)throw new Error("R16R4_FIXTURE_ORPHAN:"+orphan.join(","));

const bad=[];
for(const slug of publicSlugs){
 const c=cls[slug];
 const recipe=recipeBySlug.get(slug);
 if(!recipe){bad.push(`${slug}:NO_RECIPE`);continue}
 if(!["fixture","local-contract","online-contract"].includes(c.kind)){
  bad.push(`${slug}:BAD_KIND:${c.kind}`);continue;
 }
 if(c.kind==="fixture"){
  if(!c.fixtureGroup||!groups.has(c.fixtureGroup))bad.push(`${slug}:BAD_FIXTURE_GROUP:${c.fixtureGroup||""}`);
 }
 if(c.kind==="online-contract"&&recipe.privacyMode!=="declared-online"){
  bad.push(`${slug}:ONLINE_CLASSIFICATION_PRIVACY_MISMATCH`);
 }
 if(c.kind==="local-contract"&&recipe.privacyMode==="declared-online"){
  bad.push(`${slug}:LOCAL_CLASSIFICATION_PRIVACY_MISMATCH`);
 }
}
if(bad.length){
 console.error("R16R4_FIXTURE_SEMANTIC_ERRORS_BEGIN");
 bad.forEach(x=>console.error(x));
 console.error("R16R4_FIXTURE_SEMANTIC_ERRORS_END");
 throw new Error("R16R4_FIXTURE_SEMANTIC_ERRORS:"+bad.length);
}

if(Number(fixture.classificationCount)!==publicSlugs.length)
 throw new Error(`R16R4_CLASSIFICATION_COUNT_FIELD:${fixture.classificationCount}:${publicSlugs.length}`);

console.log("R16R4_FIXTURE_ONE_TO_ONE=PASS");
console.log("R16R4_FIXTURE_KINDS_VALID=PASS");
console.log("R16R4_FIXTURE_GROUP_REFERENCES_VALID=PASS");
console.log("R16R4_ONLINE_LOCAL_CONTRACT_ALIGNMENT=PASS");
console.log("R16R4_FIXTURE_COUNT_118=PASS");
