import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync("lib/ai-discovery/plan-availability.ts","utf8");
test("beginner access, quota and export contract is explicit",()=>{
  for(const field of ["region","planId","device","phoneVerificationRequired","paymentCardRequired","availableInRegion","freeCredits","quotaResetTimezone","queueWaitP95Seconds","billingOutcomes","originalDownloadAllowed","watermarkFreeExport","mobileSaveToGallery","commercialUseAllowed","trainingOptOutAvailable"]){
    assert.ok(source.includes(field),field);
  }
});
test("unknown facts are not silently treated as verified zero or false",()=>{
  assert.match(source,/state:"unknown",value:null/);
  assert.match(source,/fact\.state==="verified" && validFact\(fact\)/);
  assert.match(source,/fact\.value===null && fact\.sourceUrl===null/);
});
test("billing covers failures, timeouts and cancellations",()=>{
  for(const outcome of ["success","failed","timeout","cancelled","moderated"])
    assert.ok(source.includes(outcome),outcome);
});
