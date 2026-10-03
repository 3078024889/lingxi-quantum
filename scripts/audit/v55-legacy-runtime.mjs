import fs from"node:fs";
const index=fs.readFileSync("lib/sasi/core/index.ts","utf8");
const candidates=["runtime.ts","unified-execution-loop.ts","runtime-session.ts"];
const present=candidates.filter(x=>fs.existsSync(`lib/sasi/core/${x}`));
if(!present.length){
 for(const x of["./runtime","./unified-execution-loop","./runtime-session"])if(index.includes(`export * from "${x}"`)){console.error(`orphan legacy export remains: ${x}`);process.exit(1)}
 console.log("V55_LEGACY_RUNTIME_RETIREMENT=PASS");
}else{
 console.log(`V55_LEGACY_RUNTIME_RETIREMENT=DEFERRED_REFERENCED:${present.join(",")}`);
}
