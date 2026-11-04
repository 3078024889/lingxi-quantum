import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync,readdirSync} from "node:fs";
import {join} from "node:path";

const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");
const source=read("lib/siai-brand-icon-ids.ts");
const iconNames=[...readdirSync(new URL("public/siai-brand-icons/",root))].filter(x=>x.endsWith(".svg")).sort();
const assigned=[...source.matchAll(/^\s*"([^"]+)":\s*"([^"]+)"/gm)].map(m=>({id:m[1],icon:m[2]}));

test("all 49 mapped catalog products have one of 47 local, identified brand SVGs",()=>{
 assert.ok(assigned.length>=49,"incomplete product-ID mapping");
 assert.ok(iconNames.length>=47,"missing local brand files");
 assert.equal(new Set(assigned.map(x=>x.id)).size,assigned.length,"duplicate product IDs");
 assert.equal(new Set(iconNames).size,iconNames.length,"duplicate SVG names");
 const used=new Set(assigned.map(x=>x.icon+".svg"));
 for(const item of assigned){
  assert.match(item.id,/^[a-z0-9-]+$/,"unexpected catalog ID");
  assert.match(item.icon,/^[a-z0-9-]+$/,"unsafe icon path");
  assert.ok(iconNames.includes(item.icon+".svg"),"mapped icon not available: "+item.id);
 }
 assert.deepEqual(iconNames.filter(x=>!used.has(x)),[],"orphan brand SVG must be reviewed");
 assert.equal(assigned.find(x=>x.id==="microsoft-copilot")?.icon,"copilot-color");
 assert.equal(assigned.find(x=>x.id==="adobe-firefly")?.icon,"adobefirefly-color");
 assert.equal(assigned.find(x=>x.id==="gemini")?.icon,"gemini-color");
 assert.equal(assigned.find(x=>x.id==="kling")?.icon,"kling-color");
});
test("local SVGs have self-contained viewBox and no executable or remote content",()=>{
 for(const file of iconNames){
  const svg=read("public/siai-brand-icons/"+file);
  assert.match(svg,/<svg(?:\s|>)/,file);
  assert.match(svg,/<\/svg>/,file);
  assert.match(svg,/\bviewBox\s*=/,file);
  assert.ok(svg.length>120&&svg.length<100000,"invalid size "+file);
  assert.doesNotMatch(svg,/<\s*(?:script|foreignObject|iframe|object|embed|animate|set)\b/i,file);
  assert.doesNotMatch(svg,/\bon(?:load|error|click|mouseover)\s*=|javascript:|data:text\/html/i,file);
  assert.doesNotMatch(svg,/\b(?:href|xlink:href)\s*=\s*["'](?:https?:)?\/\//i,file);
 }
 const notice=read("public/siai-brand-icons/NOTICE.md");
 assert.match(notice,/Lobe Icons/);
 assert.match(notice,/MIT License/);
 assert.match(notice,/trademark/);
});
