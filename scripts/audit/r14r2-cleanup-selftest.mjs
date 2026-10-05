import assert from"node:assert/strict";

async function fakeBuilder(result){
 return result;
}

async function cleanupPattern(originalError,cleanupThrows){
 let surfaced;
 try{
  throw originalError;
 }catch(e){
  try{
   if(cleanupThrows)throw new Error("CLEANUP_FAILED");
   await fakeBuilder({data:null,error:null});
  }catch{}
  surfaced=e;
 }
 return surfaced;
}

const original=new Error("ORIGINAL_FAILURE");
assert.equal(await cleanupPattern(original,false),original);
assert.equal(await cleanupPattern(original,true),original);

console.log("R14R2_ORIGINAL_ERROR_PRESERVED=PASS");
console.log("R14R2_BEST_EFFORT_CLEANUP_SELFTEST=PASS");
