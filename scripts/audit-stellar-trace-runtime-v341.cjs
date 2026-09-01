const fs=require("node:fs");
const path=require("node:path");
const Module=require("node:module");
const ts=require("typescript");

const root=path.resolve(__dirname,"..");
const originalResolve=Module._resolveFilename;
Module._resolveFilename=function(request,parent,isMain,options){
  if(request.startsWith("@/"))request=path.join(root,request.slice(2));
  return originalResolve.call(this,request,parent,isMain,options);
};
require.extensions[".ts"]=function(module,filename){
  const source=fs.readFileSync(filename,"utf8");
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText;
  module._compile(output,filename);
};

const {calculateStellarTrace}=require(path.join(root,"lib/stellar-trace.ts"));
const {calculateObjectTrace}=require(path.join(root,"lib/stellar-trace/targets/object.ts"));
const {calculateAnimalTrace}=require(path.join(root,"lib/stellar-trace/targets/animal.ts"));

const query=new Date("2026-09-01T04:49:52.000Z");
const shared={targetName:"V341验收",queryTime:query.toISOString(),lastSeenAt:"2026-08-31T10:30:00.000Z",lastKnownPlace:"上海市中心验收点",lastKnownCoordinate:{lat:31.2304,lon:121.4737,label:"上海市中心验收点"},reportedMovementBearing:null,context:"仅用于规则与出版验收",liuyaoCast:null};

(async()=>{
  const personInput={name:"V341寻人验收",relationship:"family",birthDate:"1990-05-01",birthTime:"08:30",birthPlace:"上海",lastContactAt:"2026-08-31 18:30",lastKnownPlace:shared.lastKnownPlace,lastKnownLat:31.2304,lastKnownLon:121.4737,movementDirection:"",context:shared.context};
  let person=null;let personQuery=null;
  for(let hour=0;hour<24&&!person;hour+=1){const candidate=new Date(`2026-09-01T${String(hour).padStart(2,"0")}:30:00.000Z`);const report=await calculateStellarTrace(personInput,candidate);if(report.ancient.fused.qualified){person=report;personQuery=candidate.toISOString();}}
  if(!person)throw new Error("no qualified person fixture formed during the deterministic QA day");
  const object=await calculateObjectTrace({...shared,targetKind:"object",targetName:"钱包",objectKind:"wallet",container:null,lastHandledBy:null,likelyTransport:"unknown"});
  const livestock=await calculateAnimalTrace({...shared,targetKind:"animal",targetName:"牛羊牲畜验收",animalKind:"livestock",microchipped:null,indoorOutdoor:"unknown",temperament:"unknown",escapeMode:"unknown"});
  const dog=await calculateAnimalTrace({...shared,targetKind:"animal",targetName:"犬类证界验收",animalKind:"dog",microchipped:null,indoorOutdoor:"unknown",temperament:"unknown",escapeMode:"unknown"});
  const cat=await calculateAnimalTrace({...shared,targetKind:"animal",targetName:"猫类证界验收",animalKind:"cat",microchipped:null,indoorOutdoor:"unknown",temperament:"unknown",escapeMode:"unknown"});

  const systems=(result)=>result.ancient.results.filter(item=>item.status==="ok"||item.status==="partial").map(item=>item.system);
  const personSystems=systems(person);const objectSystems=systems(object);const livestockSystems=systems(livestock);const dogSystems=systems(dog);const catSystems=systems(cat);
  if(!personSystems.includes("qimen")||!personSystems.includes("liuren")||!person.ancient.fused.qualified)throw new Error(`person providers incomplete: ${personSystems}`);
  if(!objectSystems.includes("qimen")||!objectSystems.includes("liuren")||!object.ancient.fused.qualified)throw new Error(`object convergence failed: ${objectSystems}`);
  if(livestockSystems.join(",")!=="qimen"||livestock.ancient.fused.qualified)throw new Error(`livestock must deliver one source-traced Qimen result: ${livestockSystems}`);
  if(dogSystems.length!==0||dog.ancient.fused.qualified)throw new Error(`dog must not be folded into the cattle/sheep rule: ${dogSystems}`);
  if(catSystems.length!==0||cat.ancient.fused.qualified)throw new Error(`cat must remain at evidence boundary without a real cast: ${catSystems}`);
  const livestockQimen=livestock.ancient.results.find(item=>item.system==="qimen");
  if(!livestockQimen?.evidence.some(item=>item.ruleId==="QM-ANIMAL-001")||!livestockQimen.direction)throw new Error("livestock Qimen evidence is missing source trace or direction");
  if(object.ancient.results.some(item=>item.status==="ok"&&item.evidence.length===0))throw new Error("formed object evidence lacks provenance");
  console.log(JSON.stringify({person:{queryTime:personQuery,systems:personSystems,bearing:person.ancient.fused.primary?.centerDeg??null,r:person.ancient.fused.resultantLength},object:{queryTime:query.toISOString(),systems:objectSystems,bearing:object.ancient.fused.primary?.centerDeg??null,r:object.ancient.fused.resultantLength},livestock:{queryTime:query.toISOString(),systems:livestockSystems,bearing:livestockQimen.direction.centerDeg,r:livestock.ancient.fused.resultantLength},dog:{queryTime:query.toISOString(),systems:dogSystems,bearing:null,r:dog.ancient.fused.resultantLength},cat:{queryTime:query.toISOString(),systems:catSystems,bearing:null,r:cat.ancient.fused.resultantLength}},null,2));
  console.log("PASS V342 runtime: person/object converge from complete chart adapters; livestock uses the cited cattle/sheep rule; pets remain non-fabricated.");
})().catch(error=>{console.error(error);process.exit(1);});
