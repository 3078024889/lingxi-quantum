import fs from"node:fs";
import path from"node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const write=(p,v)=>fs.writeFileSync(path.join(root,p),v,"utf8");

// 1) Remove UTF BOM from every SQL migration, not only the one currently failing Supabase Preview.
const migDir=path.join(root,"supabase","migrations");
let bomFixed=0;
for(const name of fs.readdirSync(migDir).filter(x=>x.endsWith(".sql"))){
 const p=path.join(migDir,name),buf=fs.readFileSync(p);
 if(buf.length>=3&&buf[0]===0xEF&&buf[1]===0xBB&&buf[2]===0xBF){
  fs.writeFileSync(p,buf.subarray(3));bomFixed++;
 }
 if(buf.length>=2&&((buf[0]===0xFF&&buf[1]===0xFE)||(buf[0]===0xFE&&buf[1]===0xFF))){
  throw new Error("R16_UTF16_SQL_NOT_ALLOWED:"+name);
 }
}
console.log("R16_SQL_UTF8_BOM_REMOVED="+bomFixed);

// 2) Bring Tool Factory recipes in lock-step with the actual public catalog.
const recipePath="lib/tools/platform/tool-recipes.json";
const recipes=JSON.parse(read(recipePath));
const seo=read("lib/seo/global-seo.ts");
const publicSlugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(x=>x[1]);
const current=new Set(recipes.map(x=>x.slug));
const capabilityMap={
 "regex-tester":["text.transform"],
 "text-diff":["text.transform"],
 "csv-json":["text.transform"],
 "xml-formatter":["text.transform"],
 "jwt-decoder":["text.transform"],
 "url-parser":["text.transform"],
 "case-converter":["text.transform"],
 "number-base-converter":["text.transform"]
};
const missing=publicSlugs.filter(x=>!current.has(x));
const unknown=missing.filter(x=>!capabilityMap[x]);
if(unknown.length)throw new Error("R16_UNKNOWN_PUBLIC_TOOL_RECIPE:"+unknown.join(","));
for(const slug of missing){
 recipes.push({
  slug,
  capabilities:capabilityMap[slug],
  contractVersion:1,
  requiresNineLanguage:true,
  requiresDesktop:true,
  requiresMobile:true,
  requiresRealFixture:true,
  privacyMode:"local-first"
 });
}
recipes.sort((a,b)=>a.slug.localeCompare(b.slug));
write(recipePath,JSON.stringify(recipes,null,2)+"\n");
console.log("R16_TOOL_RECIPES_ADDED="+missing.length);
console.log("R16_TOOL_RECIPE_PUBLIC_PARITY="+recipes.length+"/"+publicSlugs.length);
