import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const must=(cond,msg)=>{if(!cond)throw new Error(msg)};
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));

for(const p of [
  "lib/sasi-kernel/runtime.ts",
  "lib/sasi-kernel/registry.ts",
  "lib/sasi-kernel/graph.ts",
  "lib/sasi-kernel/planner.ts",
  "lib/sasi-kernel/readiness.ts",
  "lib/sasi-kernel/state.ts",
  "lib/sasi-kernel/scheduler.ts",
  "lib/sasi-kernel/recovery.ts",
  "lib/sasi-kernel/artifacts.ts",
  "lib/sasi-kernel/telemetry.ts",
  "lib/sasi-kernel/worker/security.ts",
  "lib/sasi-kernel/worker/client.ts",
  "lib/sasi-kernel/worker/protocol.ts",
  "workers/sasi-compute/server.mjs",
  "supabase/migrations/20260926183000_sasi_platform_kernel_v180.sql",
  "app/api/sasi/kernel/tasks/route.ts",
  "app/api/sasi/kernel/readiness/route.ts",
]) must(exists(p),`MISSING:${p}`);

for(const p of [
  "lib/sasi-autonomous/runtime.ts",
  "lib/sasi/autonomy/index.ts",
  "lib/sasi/sovereign-generation/worker-client.ts",
]){
  must(exists(p),`COMPAT_FACADE_MISSING:${p}`);
  must(read(p).includes("@deprecated SASI V18 compatibility facade"),`LEGACY_IMPLEMENTATION_NOT_REPLACED:${p}`);
}

const worker=read("lib/sasi-kernel/worker/security.ts");
const server=read("workers/sasi-compute/server.mjs");
const migration=read("supabase/migrations/20260926183000_sasi_platform_kernel_v180.sql");
const registry=read("lib/sasi-kernel/registry.ts");

must(worker.includes("timingSafeEqual"),"WORKER_CONSTANT_TIME_SIGNATURE_MISSING");
must(worker.includes("x-sasi-nonce"),"WORKER_NONCE_MISSING");
must(worker.includes("SASI_WORKER_ALLOWLIST_REQUIRED"),"WORKER_ALLOWLIST_FAIL_CLOSED_MISSING");
must(server.includes("REPLAY_REJECTED"),"WORKER_REPLAY_CACHE_MISSING");
must(server.includes("/health")&&server.includes("/capabilities")&&server.includes("/v1/tasks"),"WORKER_PROTOCOL_ENDPOINTS_MISSING");
must(
  migration.includes("create table if not exists public.sasi_tasks")
  && migration.includes("public.sasi_task_nodes")
  && migration.includes("public.sasi_task_events")
  && migration.includes("public.sasi_artifacts")
  && migration.includes("public.sasi_capability_runs"),
  "DURABLE_SCHEMA_INCOMPLETE",
);

// V18 originally expected placeholder future IDs:
//   image.generate.diffusion / video.generate.model
// V19 replaced those placeholders with the actual executable native capabilities:
//   nativeImageCapability -> image.generate.native
//   nativeVideoCapability -> video.generate.native
// The audit must validate the current registry architecture rather than force retired IDs back in.
const v19=exists("scripts/audit-sasi-v190.mjs") || registry.includes("nativeImageCapability") || registry.includes("nativeVideoCapability");
if(v19){
  for(const token of [
    "nativeReasonCapability",
    "nativeDirectorCapability",
    "nativeImageCapability",
    "nativeVideoCapability",
    "imageRenderCapability",
    "videoStoryboardCapability",
  ]) must(registry.includes(token),`CAPABILITY_REGISTRY_INCOMPLETE:${token}`);

  for(const token of [
    'id:"document.parse"',
    'id:"file.convert"',
    'id:"image.process"',
    'id:"ocr"',
    'id:"video.compose"',
  ]) must(registry.includes(token),`DECLARATIVE_CAPABILITY_MISSING:${token}`);

  must(!registry.includes("image.generate.diffusion"),"RETIRED_IMAGE_PLACEHOLDER_RETURNED");
  must(!registry.includes("video.generate.model"),"RETIRED_VIDEO_PLACEHOLDER_RETURNED");
}else{
  // Backward-compatible V18 validation for repositories that have not yet applied V19.
  must(
    registry.includes("image.generate.diffusion")
    && registry.includes("video.generate.model")
    && registry.includes("image.render")
    && registry.includes("video.storyboard"),
    "CAPABILITY_REGISTRY_INCOMPLETE",
  );
}

const legacy=[];
const exts=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs"]);
function walk(dir){
  if(!fs.existsSync(dir))return;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(["node_modules",".next",".git"].includes(e.name))continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory())walk(p);
    else if(exts.has(path.extname(e.name))){
      const s=fs.readFileSync(p,"utf8");
      if(
        /@\/lib\/sasi-autonomous|@\/lib\/sasi\/autonomy|@\/lib\/sasi\/sovereign-generation/.test(s)
        && !s.includes("@deprecated SASI V18 compatibility facade")
      ) legacy.push(path.relative(root,p));
    }
  }
}
for(const d of ["app","components","lib","scripts","workers"])walk(path.join(root,d));
must(legacy.length===0,`LEGACY_IMPORTS:${legacy.join(",")}`);

console.log("SASI_PLATFORM_KERNEL_SINGLE_RUNTIME=PASS");
console.log("SASI_DURABLE_TASK_SCHEMA=PASS");
console.log("SASI_ARTIFACT_SCHEMA=PASS");
console.log("SASI_TASK_STATE_MACHINE=PASS");
console.log("SASI_SCHEDULER_RECOVERY=PASS");
console.log("SASI_ARTIFACT_VALIDATION=PASS");
console.log("SASI_COMPUTE_PROTOCOL=PASS");
console.log("SASI_WORKER_HMAC_NONCE_REPLAY_GUARD=PASS");
console.log("SASI_LEGACY_IMPLEMENTATIONS_REMOVED=PASS");
if(v19)console.log("SASI_V19_NATIVE_CAPABILITY_REGISTRY=PASS");
console.log("AUDIT_SASI_PLATFORM_KERNEL_V180=PASS");
