import fs from"node:fs";
const capPath="lib/tools/platform/capability-genome.json";
const recipePath="lib/tools/platform/tool-recipes.json";
const workflowPath="lib/tools/platform/workflow-presets.json";

const caps=JSON.parse(fs.readFileSync(capPath,"utf8"));
const recipes=JSON.parse(fs.readFileSync(recipePath,"utf8"));
const workflows=JSON.parse(fs.readFileSync(workflowPath,"utf8"));

const additions=[
 {
  id:"document.pdf-structural",
  domain:"document",
  input:["pdf"],
  output:["pdf"],
  localPreferred:true
 },
 {
  id:"document.pdf-structural-inspection",
  domain:"document",
  input:["pdf"],
  output:["pdf-structure"],
  localPreferred:true
 }
];

const ids=new Set(caps.map(x=>x.id));
for(const cap of additions){
 if(!ids.has(cap.id)){caps.push(cap);ids.add(cap.id);console.log("R16R2_CAPABILITY_ADDED="+cap.id);}
}

const unknown=[];
for(const r of recipes)for(const id of r.capabilities||[])if(!ids.has(id))unknown.push(`recipe:${r.slug}:${id}`);
for(const w of workflows)for(const id of w.steps||[])if(!ids.has(id))unknown.push(`workflow:${w.id}:${id}`);

if(unknown.length){
 console.error("R16R2_UNKNOWN_CAPABILITIES_BEGIN");
 for(const row of unknown)console.error(row);
 console.error("R16R2_UNKNOWN_CAPABILITIES_END");
 throw new Error("R16R2_CAPABILITY_CLOSURE_INCOMPLETE:"+unknown.length);
}

caps.sort((a,b)=>a.id.localeCompare(b.id));
fs.writeFileSync(capPath,JSON.stringify(caps,null,2)+"\n","utf8");

console.log("R16R2_CAPABILITY_COUNT="+caps.length);
console.log("R16R2_RECIPE_COUNT="+recipes.length);
console.log("R16R2_UNKNOWN_CAPABILITY_COUNT=0");
console.log("R16R2_CAPABILITY_GRAPH_CLOSED=PASS");
