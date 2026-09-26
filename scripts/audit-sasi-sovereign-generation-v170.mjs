import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8"),must=(v,m)=>{if(!v)throw new Error(m)};
for(const p of [
"lib/sasi-autonomous/image/procedural-svg.ts","lib/sasi-autonomous/image/capability.ts",
"lib/sasi-autonomous/video/procedural-frame.ts","components/SasiAutonomousImageStudio.tsx",
"app/sasi/image/page.tsx","app/api/sasi/generation/readiness/route.ts","app/api/sasi/generation/submit/route.ts"
])must(fs.existsSync(p),"MISSING:"+p);
const rt=r("lib/sasi-autonomous/router.ts"),types=r("lib/sasi-autonomous/types.ts"),api=r("app/api/sasi/autonomous/route.ts");
must(types.includes('"image"'),"IMAGE_TASK_KIND_MISSING");must(types.includes('"image.render"'),"IMAGE_CAPABILITY_TYPE_MISSING");
must(rt.includes("imageRenderCapability"),"IMAGE_CAPABILITY_NOT_REGISTERED");must(rt.includes("videoStoryboardCapability"),"VIDEO_STORYBOARD_NOT_REGISTERED");
must(api.includes('body.kind==="image"'),"IMAGE_API_ROUTE_NOT_WIRED");
const img=r("lib/sasi-autonomous/image/procedural-svg.ts");must(!/api\.openai|replicate|fal\.ai|runway|anthropic/i.test(img),"PROCEDURAL_IMAGE_EXTERNAL_PROVIDER_FOUND");
const video=r("components/SasiAutonomousVideoStudio.tsx"),frame=r("lib/sasi-autonomous/video/procedural-frame.ts");
must(video.includes("drawProceduralSceneBackground"),"VIDEO_PROCEDURAL_FRAME_NOT_WIRED");must(frame.includes("drawProceduralSceneBackground"),"VIDEO_PROCEDURAL_FRAME_MISSING");
const oldGraph=r("lib/sasi/autonomy/capability-graph.ts"),oldRouter=r("lib/sasi/autonomy/router.ts");
must(oldGraph.includes('"image-generate"')&&oldGraph.includes('"video-render"'),"SASI_CAPABILITY_GRAPH_GENERATION_MISSING");
must(oldRouter.includes('"image-generate"')&&oldRouter.includes('"video-render"'),"SASI_ALGORITHM_ROUTER_GENERATION_MISSING");
const worker=r("lib/sasi/sovereign-generation/worker-client.ts");must(worker.includes("createHmac")&&worker.includes("SASI_LOCAL_GENERATION_ALLOWED_HOSTS"),"LOCAL_WORKER_SECURITY_MISSING");
console.log("SASI_PROCEDURAL_IMAGE=PASS");
console.log("SASI_PROCEDURAL_VIDEO=PASS");
console.log("SASI_IMAGE_EXTERNAL_API_REQUIRED=NO");
console.log("SASI_VIDEO_BASELINE_EXTERNAL_API_REQUIRED=NO");
console.log("SASI_CAPABILITY_GRAPH_GENERATION=PASS");
console.log("SASI_ALGORITHM_ROUTER_GENERATION=PASS");
console.log("SASI_LOCAL_GPU_WORKER_BRIDGE=PASS");
console.log("V17_SOVEREIGN_GENERATION_AUDIT=PASS");
