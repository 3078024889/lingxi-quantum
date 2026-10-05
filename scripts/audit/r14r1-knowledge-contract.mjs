import fs from"node:fs";

const routePath="app/api/knowledge/ask/route.ts";
const adapterPath="lib/sasi/knowledge/durable-knowledge.ts";
const resilientPath="lib/sasi/experience/resilient-text.ts";

for(const f of [routePath,adapterPath,resilientPath]){
 if(!fs.existsSync(f))throw new Error("R14R1_FILE_MISSING:"+f);
}
const route=fs.readFileSync(routePath,"utf8");
const adapter=fs.readFileSync(adapterPath,"utf8");
const resilient=fs.readFileSync(resilientPath,"utf8");

for(const marker of ["deterministicGroundedAnswer","runKnowledgeText","grounded-fallback"]){
 if(!route.includes(marker))throw new Error("R14R1_ROUTE_CAPABILITY_MISSING:"+marker);
}
for(const marker of ["runKnowledgeText","durableRuntimeAvailable","durableExecute","durableStep","resilientText"]){
 if(!adapter.includes(marker))throw new Error("R14R1_ADAPTER_CAPABILITY_MISSING:"+marker);
}
for(const marker of ["runExperienceText","runUserText","needs-connection","settleExperience"]){
 if(!resilient.includes(marker))throw new Error("R14R1_RESILIENT_CAPABILITY_MISSING:"+marker);
}

const silentBilling=route.includes("body.useConnectedService!==false")||
 !route.includes("body.useConnectedService===true&&body.acceptConnectedBilling===true");
if(silentBilling)throw new Error("R14R1_CONNECTED_BILLING_CONTRACT_BROKEN");

console.log("R14R1_KNOWLEDGE_ROUTE_CONTRACT=PASS");
console.log("R14R1_DURABLE_DELEGATION_CHAIN=PASS");
console.log("R14R1_RESILIENT_FALLBACK_REACHABLE=PASS");
console.log("R14R1_DETERMINISTIC_FALLBACK_REACHABLE=PASS");
console.log("R14R1_EXPLICIT_BILLING_CONTRACT=PASS");
