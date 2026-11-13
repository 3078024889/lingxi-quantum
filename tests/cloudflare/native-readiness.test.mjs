import test from "node:test";
import assert from "node:assert/strict";
import {assertNativeComputeInfrastructure} from "../../lib/sasi-kernel/compute/native-readiness.mjs";

const healthy=()=>({
 ok:true,service:"lingxifield-sasi-native-compute",version:"19.0",
 state:"ready",gpu:{available:true,count:1,name:"GPU",freeVramGb:8,totalVramGb:16},
 storage:{r2:true},models:{
  reasoning:"Qwen/Qwen3-8B",
  image:"black-forest-labs/FLUX.1-schnell",
  video:"Wan-AI/Wan2.1-T2V-1.3B"
 }
});
test("accepts genuine infrastructure-ready v19 GPU compute health without conflating with actual generation",()=>{
 const response=healthy();
 assert.equal(assertNativeComputeInfrastructure(response),response);
});
test("rejects superficially HTTP-200 but degraded GPU",()=>{
 const cases=[
  {...healthy(),state:"degraded"},
  {...healthy(),gpu:{...healthy().gpu,available:false}},
  {...healthy(),gpu:{...healthy().gpu,count:0}},
  {...healthy(),gpu:{...healthy().gpu,freeVramGb:0}},
  {...healthy(),storage:{r2:false}},
  {...healthy(),models:{...healthy().models,video:""}},
  {...healthy(),service:"lingxifield"},
  {...healthy(),version:"0.0"},
  {...healthy(),ok:false},
  null,
  "healthy",
 ];
 for(const candidate of cases)
  assert.throws(()=>assertNativeComputeInfrastructure(candidate),/SASI_NATIVE_/);
});
test("requires real storage config, not a fake response with just ok:true",()=>{
 assert.throws(()=>assertNativeComputeInfrastructure({ok:true}),/SASI_NATIVE_/);
});
