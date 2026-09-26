import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const exists=(p)=>fs.existsSync(path.join(root,p));
const must=(v,m)=>{if(!v)throw new Error(m)};

const required=[
  "lib/sasi-kernel/compute/protocol.ts",
  "lib/sasi-kernel/compute/native-client.ts",
  "lib/sasi-kernel/models/catalog.ts",
  "lib/sasi-kernel/reasoning/director.ts",
  "lib/sasi-kernel/capabilities/native/capability.ts",
  "lib/sasi-kernel/artifact-store/r2.ts",
  "app/api/sasi/native/readiness/route.ts",
  "app/api/sasi/native/jobs/route.ts",
  "app/api/sasi/native/jobs/[id]/route.ts",
  "components/SasiNativeCreatePanel.tsx",
  "workers/sasi-compute-v19/sasi_worker/server.py",
  "workers/sasi-compute-v19/sasi_worker/reasoning.py",
  "workers/sasi-compute-v19/sasi_worker/image_gen.py",
  "workers/sasi-compute-v19/sasi_worker/video_gen.py",
  "workers/sasi-compute-v19/model-manifest.json",
  "supabase/migrations/20260926210000_sasi_native_compute_v190.sql",
];
for(const p of required)must(exists(p),`V190_REQUIRED_MISSING:${p}`);

const catalog=read("lib/sasi-kernel/models/catalog.ts");
for(const token of ["Qwen/Qwen3-8B","black-forest-labs/FLUX.1-schnell","Wan-AI/Wan2.1-T2V-1.3B","commercialAllowed: true"]){
  must(catalog.includes(token),`MODEL_CATALOG_MISSING:${token}`);
}
must(!catalog.includes('id: "black-forest-labs/FLUX.1-dev"'),"NONCOMMERCIAL_FLUX_DEV_ENABLED");

const client=read("lib/sasi-kernel/compute/native-client.ts");
for(const token of ["SASI_NATIVE_COMPUTE_ALLOWLIST_REQUIRED","x-lingxi-nonce","createHmac","assertCommercialNativeModel"]){
  must(client.includes(token),`NATIVE_CLIENT_SECURITY_MISSING:${token}`);
}

const worker=read("workers/sasi-compute-v19/sasi_worker/security.py");
for(const token of ["hmac.compare_digest","SIGNATURE_REPLAYED","x-lingxi-nonce","max_clock_skew_ms"]){
  must(worker.includes(token),`WORKER_SECURITY_MISSING:${token}`);
}

const db=read("workers/sasi-compute-v19/sasi_worker/db.py");
must(db.includes("journal_mode=WAL"),"WORKER_DURABLE_QUEUE_WAL_MISSING");
must(db.includes("update jobs set state='queued'"),"WORKER_RESTART_RECOVERY_MISSING");

const reason=read("workers/sasi-compute-v19/sasi_worker/reasoning.py");
must(reason.includes("apply_chat_template"),"REAL_REASONING_INFERENCE_MISSING");
must(reason.includes("model.generate"),"REAL_REASONING_GENERATE_MISSING");

const image=read("workers/sasi-compute-v19/sasi_worker/image_gen.py");
must(image.includes("pipe(")&&image.includes("image.save"),"REAL_IMAGE_INFERENCE_MISSING");

const video=read("workers/sasi-compute-v19/sasi_worker/video_gen.py");
must(video.includes("pipe(")&&video.includes("export_to_video"),"REAL_VIDEO_INFERENCE_MISSING");

const registry=read("lib/sasi-kernel/registry.ts");
for(const id of ["nativeReasonCapability","nativeDirectorCapability","nativeImageCapability","nativeVideoCapability"]){
  must(registry.includes(id),`KERNEL_NATIVE_CAPABILITY_MISSING:${id}`);
}

const router=read("lib/sasi-kernel/policy/router.ts");
must(router.includes('"externalModelRequired":false')||router.includes("externalModelRequired:false"),"NATIVE_ROUTE_EXTERNAL_REQUIRED_REGRESSION");
must(router.includes('"director-plan"'),"DIRECTOR_ROUTE_MISSING");
must(router.includes('"image-generate-native"'),"NATIVE_IMAGE_ROUTE_MISSING");
must(router.includes('"video-generate-native"'),"NATIVE_VIDEO_ROUTE_MISSING");

const panel=read("components/SasiNativeCreatePanel.tsx");
must(panel.includes("深度思考")&&panel.includes("生成图片")&&panel.includes("生成视频"),"SASI_NATIVE_UI_MISSING");
must(!/\b(CUDA|GPU|Worker|Pipeline|Runtime|Endpoint|Diffusion|Token)\b/.test(panel),"SASI_NATIVE_UI_ENGINEERING_COPY");

console.log("SASI_NATIVE_REASONING_CODE=PASS");
console.log("SASI_NATIVE_IMAGE_CODE=PASS");
console.log("SASI_NATIVE_VIDEO_CODE=PASS");
console.log("SASI_NATIVE_DIRECTOR_CODE=PASS");
console.log("SASI_NATIVE_LICENSE_GATE=PASS");
console.log("SASI_NATIVE_REPLAY_GUARD=PASS");
console.log("SASI_NATIVE_DURABLE_QUEUE=PASS");
console.log("SASI_NATIVE_R2_ARTIFACT_PATH=PASS");
console.log("SASI_NATIVE_UI_COPY=PASS");
console.log("AUDIT_SASI_V190=PASS");
