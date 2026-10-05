import assert from"node:assert/strict";

function oldAudit(route){
 return route.includes("deterministicGroundedAnswer")&&route.includes("resilientText");
}
function newAudit(route,adapter){
 const fallback=route.includes("deterministicGroundedAnswer");
 const direct=route.includes("resilientText");
 const delegated=route.includes("runKnowledgeText")&&adapter.includes("resilientText")&&adapter.includes("durableRuntimeAvailable");
 return fallback&&(direct||delegated);
}

const route='import{deterministicGroundedAnswer}from"x"; import{runKnowledgeText}from"adapter";';
const adapter='import{resilientText}from"resilient"; const durableRuntimeAvailable=()=>true;';
assert.equal(oldAudit(route),false);
assert.equal(newAudit(route,adapter),true);
console.log("R14R1_STALE_IMPLEMENTATION_AUDIT_REGRESSION=PASS");
console.log("R14R1_CAPABILITY_CONTRACT_ACCEPTS_DELEGATION=PASS");
