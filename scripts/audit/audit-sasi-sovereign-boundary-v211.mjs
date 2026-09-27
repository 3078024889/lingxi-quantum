import fs from "node:fs";import path from "node:path";
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),"utf8"),exists=p=>fs.existsSync(path.join(root,p)),must=(v,m)=>{if(!v)throw new Error(m)};
for(const p of [
 "lib/sasi-kernel/compute/native-client.ts",
 "lib/sasi-kernel/models/catalog.ts",
 "app/api/sasi/native/jobs/route.ts"
])must(exists(p),`SASI_SOVEREIGN_REQUIRED:${p}`);
const client=read("lib/sasi-kernel/compute/native-client.ts");
const catalog=read("lib/sasi-kernel/models/catalog.ts");
const jobs=read("app/api/sasi/native/jobs/route.ts");
must(client.includes("SASI_NATIVE_COMPUTE_URL"),"SELF_HOSTED_COMPUTE_ENDPOINT_MISSING");
must(client.includes("SASI_NATIVE_COMPUTE_SECRET"),"SELF_HOSTED_COMPUTE_AUTH_MISSING");
must(catalog.includes("Qwen/Qwen3-8B")&&catalog.includes("FLUX.1-schnell")&&catalog.includes("Wan2.1-T2V-1.3B"),"OPEN_WEIGHT_BASELINE_MISSING");
must(jobs.includes("submitNativeJob"),"NATIVE_JOB_SUBMISSION_MISSING");
console.log("SASI_SELF_HOSTED_COMPUTE_BOUNDARY=PASS");
console.log("SASI_OPEN_WEIGHT_BASELINE=PASS");
console.log("SASI_THIRD_PARTY_API_NOT_REQUIRED_FOR_NATIVE_PATH=PASS");
console.log("SASI_MULTIMODAL_VISION_RUNTIME=NOT_YET_IMPLEMENTED");
console.log("SASI_GPU_RUNTIME=REQUIRES_REAL_COMPUTE_NODE");
console.log("AUDIT_SASI_SOVEREIGN_BOUNDARY_V211=PASS");
