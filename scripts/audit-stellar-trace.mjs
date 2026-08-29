import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const source=readFileSync(resolve(process.cwd(),"lib/stellar-trace-math.ts"),"utf8");
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
const math=await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
const cases=[
  ["same",[40,40,40,40],true,"high"],["slight",[40,43,46,48],true,"high"],["zero-cross",[350,355,2,8],true,"high"],
  ["moderate",[0,0,120,120],true,"moderate"],["strong",[0,0,90,90],true,"strong"],
  ["quadrants",[0,90,180,270],false,"divergent"],["opposites",[0,0,180,180],false,"divergent"],
  ["review-sample",[15,116.6,182.7,320.8],false,"divergent"],["two-modes",[350,10,170,190],false,"divergent"],
  ["spread-a",[5,100,205,300],false,"divergent"],["spread-b",[30,120,210,300],false,"divergent"],
  ["three-one",[20,24,28,210],true,"moderate"],["wide-three",[330,5,40,130],true,"moderate"],
  ["cross-zero-wide",[320,350,20,50],true,"strong"],["east-cluster",[70,80,90,100],true,"high"],
  ["south-cluster",[160,175,185,200],true,"high"],["west-cluster",[250,265,280,295],true,"high"],
  ["random-1",[12,147,233,311],false,"divergent"],["random-2",[61,139,221,343],false,"divergent"],["single",[72],true,"high"],
];
const failures=[];
for(const [name,bearings,qualified,level] of cases){const result=math.analyzeCircularDirections(bearings);if(result.qualified!==qualified)failures.push(`${name}: qualified=${result.qualified}`);if(result.level!==level)failures.push(`${name}: level=${result.level}`);if(!qualified&&result.sector!==null)failures.push(`${name}: ghost sector`)}
const review=math.analyzeCircularDirections([15,116.6,182.7,320.8]);
if(Math.abs(review.resultantLength-0.139)>0.003)failures.push(`review sample R expected ~0.139, got ${review.resultantLength}`);
if(review.modes.length<1)failures.push("multi-mode description is absent");
const engine=readFileSync(resolve(process.cwd(),"lib/stellar-trace.ts"),"utf8");
for(const token of ['version:"lingxifield-stellar-trace-v2"','candidateRegions:[]','candidateCenter:null','rangeKm:null','resultingRangeKm:null'])if(!engine.includes(token))failures.push(`engine missing ${token}`);
if(failures.length){console.error(failures.map(item=>`FAIL ${item}`).join("\n"));process.exit(1)}
console.log(`PASS ${cases.length} circular cases; divergent samples create no ghost direction or coordinate`);
