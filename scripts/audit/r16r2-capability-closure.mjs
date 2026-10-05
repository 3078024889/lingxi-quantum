import fs from"node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const caps=read("lib/tools/platform/capability-genome.json");
const recipes=read("lib/tools/platform/tool-recipes.json");
const workflows=read("lib/tools/platform/workflow-presets.json");
const ids=new Set(caps.map(x=>x.id));

const unknown=[];
for(const r of recipes)for(const id of r.capabilities||[])if(!ids.has(id))unknown.push({kind:"recipe",owner:r.slug,id});
for(const w of workflows)for(const id of w.steps||[])if(!ids.has(id))unknown.push({kind:"workflow",owner:w.id,id});

if(unknown.length){
 console.error(JSON.stringify(unknown,null,2));
 throw new Error("R16R2_UNKNOWN_CAPABILITY_REFERENCES:"+unknown.length);
}

for(const id of["document.pdf-structural","document.pdf-structural-inspection"]){
 if(!ids.has(id))throw new Error("R16R2_REQUIRED_CAPABILITY_MISSING:"+id);
}

const structuralUsers=recipes.filter(r=>(r.capabilities||[]).includes("document.pdf-structural")).map(r=>r.slug).sort();
const inspectionUsers=recipes.filter(r=>(r.capabilities||[]).includes("document.pdf-structural-inspection")).map(r=>r.slug).sort();

const expectedStructural=["pdf-permissions","pdf-protect","pdf-unlock","pdf-web-optimize"].sort();
const expectedInspection=["pdf-attachments","pdf-bookmarks","pdf-inspect"].sort();

if(JSON.stringify(structuralUsers)!==JSON.stringify(expectedStructural))
 throw new Error("R16R2_STRUCTURAL_CONSUMERS_DRIFT:"+structuralUsers.join(","));
if(JSON.stringify(inspectionUsers)!==JSON.stringify(expectedInspection))
 throw new Error("R16R2_INSPECTION_CONSUMERS_DRIFT:"+inspectionUsers.join(","));

console.log("R16R2_ALL_RECIPE_CAPABILITIES_KNOWN=PASS");
console.log("R16R2_ALL_WORKFLOW_CAPABILITIES_KNOWN=PASS");
console.log("R16R2_PDF_STRUCTURAL_CONTRACT=PASS");
console.log("R16R2_PDF_INSPECTION_CONTRACT=PASS");
