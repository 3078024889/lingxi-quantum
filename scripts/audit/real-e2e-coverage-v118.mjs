import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const catalog=fs.readFileSync(path.join(root,"lib/seo/global-seo.ts"),"utf8");
const slugs=[...new Set([...catalog.matchAll(/[{]slug:"([^"]+)"/g)].map(m=>m[1]))].sort();
if(slugs.length<100)throw Error("PUBLIC_TOOL_CATALOG_INCOMPLETE");

const v118=["text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode","json-formatter","timestamp-converter","md5-sha256","file-type-detector","file-compare","png-to-jpg","jpg-to-png","webp-to-jpg","compress-image-to-20kb","compress-image-to-50kb","compress-image-to-100kb","compress-image-to-200kb","compress-image-to-500kb","csv-to-xlsx","xlsx-to-csv"];
const earlier=[
 ["png-to-jpg","Historical real-file sample: 2026-11-01"],
 ["merge-pdf","Historical real-file sample: 2026-11-01"],
 ["csv-to-xlsx","Historical real-file sample: 2026-11-01"],
 ["pdf-to-txt","Historical real-file sample: 2026-11-01"],
 ["pdf-to-jpg","Historical real-file sample: 2026-11-01"],
 ["remove-exif","Historical real-file sample: 2026-11-01"],
 ["rotate-video","Historical real-file sample: 2026-11-01"],
 ["video-trim","Historical real-file sample: 2026-11-01"],
 ["video-compress","Historical real-file sample: 2026-11-01"],
 ["video-speed","Historical real-file sample: 2026-11-01"],
 ["video-mute","Historical real-file sample: 2026-11-01"],
];
const liveTest=["tests/final-closure/tool-real-operations-v118.spec.ts","tests/final-closure/tool-image-file-e2e-v118.spec.ts","tests/final-closure/tool-office-roundtrip-v118.spec.ts"].map(p=>fs.readFileSync(path.join(root,p),"utf8")).join("\\n");
const scenarioSet=new Set(v118);
for(const slug of v118){
 if(!slugs.includes(slug))throw Error("SCENARIO_NOT_IN_PUBLIC_CATALOG:"+slug);
 if(!liveTest.includes(slug))throw Error("REAL_SCENARIO_NOT_REGISTERED:"+slug);
}
const recorded=new Map(earlier);
const escaping=value=>'"'+String(value).replace(/"/g,'""')+'"';
const rows=[["slug","status","evidence","what_is_NOT_proven"]];
for(const slug of slugs){
 const current=scenarioSet.has(slug),old=recorded.has(slug);
 rows.push([
  slug,
  current?"AUTOMATED_REAL_OPERATION_SCENARIO":old?"HISTORICAL_SAMPLE_RECORDED":"FULL_E2E_NOT_PROVEN",
  current?"tests/final-closure/tool-real-operations-v118.spec.ts":old?recorded.get(slug):"",
  current?"CI outcome, production deployment, physical device and all controls":old?"Full controls, mobile, production and billing":"Input, processing, export integrity, mobile and billing",
 ]);
}
const dir=path.join(root,"test-results");fs.mkdirSync(dir,{recursive:true});
const out=path.join(dir,"tool-real-operation-coverage-v118.csv");
fs.writeFileSync(out,rows.map(row=>row.map(escaping).join(",")).join("\n")+"\n");
const remaining=slugs.filter(slug=>!scenarioSet.has(slug)&&!recorded.has(slug));
console.log(`TOOL_CATALOG_TOTAL=${slugs.length}`);
console.log(`NEW_E2E_SCENARIO_REGISTERED=${scenarioSet.size}`);
console.log(`HISTORICAL_PARTIAL_SAMPLES=${slugs.filter(slug=>recorded.has(slug)&&!scenarioSet.has(slug)).length}`);
console.log(`NO_FULL_E2E_EVIDENCE=${remaining.length}`);
console.log(`PER_TOOL_AUDIT_CSV=${out}`);
console.log("SCENARIO_REGISTERED_IS_NOT_PASSED_OR_DEPLOYED");
