import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const exists=(p)=>fs.existsSync(path.join(root,p));
const must=(v,m)=>{if(!v)throw new Error(m)};

const required=[
  "components/SasiAutonomousVideoStudio.tsx",
  "components/SasiAutonomyEntrances.tsx",
  "app/sasi/drama/page.tsx",
  "lib/sasi-kernel/capabilities/video/script.ts",
  "lib/sasi-kernel/capabilities/video/procedural-frame.ts",
];
for(const p of required)must(exists(p),`V181_REQUIRED_MISSING:${p}`);

const studio=read("components/SasiAutonomousVideoStudio.tsx");
must(studio.includes("async function saveVideo()"),"VIDEO_SAVE_HANDLER_MISSING");
must(studio.includes("navigator as Navigator"),"VIDEO_NATIVE_SHARE_PATH_MISSING");
must(studio.includes("canShare"),"VIDEO_FILE_SHARE_CHECK_MISSING");
must(studio.includes("function openVideo()"),"VIDEO_OPEN_FALLBACK_MISSING");
must(studio.includes("window.open(output.url"),"VIDEO_OPEN_FALLBACK_NOT_WIRED");
must(studio.includes("保存视频"),"VIDEO_SAVE_CTA_MISSING");
must(studio.includes("打开视频"),"VIDEO_OPEN_CTA_MISSING");
must(studio.includes("playsInline"),"IOS_INLINE_VIDEO_MISSING");
must(!studio.includes("下载视频初稿"),"OLD_BROKEN_DOWNLOAD_CTA_RETURNED");

const director=read("lib/sasi-kernel/capabilities/video/script.ts");
for(const token of ["moodFrom","actionFrom","propsFrom","directionFor","visualIntent"]){
  must(director.includes(token),`DIRECTOR_GRAMMAR_MISSING:${token}`);
}
must(director.includes("停顿后推近"),"DIRECTOR_CAMERA_REASONING_MISSING");
must(director.includes("静止特写"),"DIRECTOR_DETAIL_SHOT_MISSING");

const frame=read("lib/sasi-kernel/capabilities/video/procedural-frame.ts");
for(const token of ["drawMetro","person(","oldPhoto(","一模一样","车门关闭"]){
  must(frame.includes(token),`SEMANTIC_SCENE_RENDER_MISSING:${token}`);
}
must(frame.includes('return"stage"')||frame.includes('return "stage"'),"SEMANTIC_DEFAULT_STAGE_MISSING");
must(frame.includes("else drawStage("),"SEMANTIC_DEFAULT_RENDER_NOT_STAGE");
must(!frame.includes('return"abstract"')&&!frame.includes('return "abstract"'),"ABSTRACT_DEFAULT_MOTIF_RETURNED");

// Only inspect text that can plausibly reach users.
// Source-code identifiers and module paths (for example @ffmpeg/ffmpeg) are implementation details,
// and must not be confused with visible interface copy.
function quotedStrings(source){
  const out=[];
  const rx=/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  for(const match of source.matchAll(rx)){
    const value=match[2];
    if(!value)continue;
    if(/^[@./][A-Za-z0-9@._~/-]+$/.test(value))continue; // module / file path
    if(/^(?:https?:|\/api\/|\/media\/|\/sasi\/|\/tools\/)/i.test(value))continue; // URL / route
    if(/^[A-Z0-9_:-]{4,}$/.test(value))continue; // internal error / event code
    if(/^(?:[a-z0-9_-]+:)*[a-z0-9_-]+$/i.test(value)&&!/[ ]/.test(value))continue; // identifiers / MIME fragments
    out.push(value);
  }
  return out.join("\n");
}

const userFacing=[
  "components/SasiAutonomousVideoStudio.tsx",
  "components/SasiAutonomyEntrances.tsx",
  "app/sasi/drama/page.tsx",
];
const forbidden=/外部模型|本地高性能计算节点|浏览器成片能力|\bFFMPEG\b|\bWorker\b|\bPipeline\b|\bRuntime\b|\bEndpoint\b|推理节点|增强计算/i;
for(const p of userFacing){
  const visible=quotedStrings(read(p));
  must(!forbidden.test(visible),`SASI_ENGINEERING_COPY:${p}`);
}

console.log("SASI_VIDEO_SAVE_MOBILE_FALLBACK=PASS");
console.log("SASI_DIRECTOR_GRAMMAR=PASS");
console.log("SASI_SEMANTIC_SCENE_RENDER=PASS");
console.log("SASI_SEMANTIC_DEFAULT_STAGE=PASS");
console.log("SASI_VISIBLE_COPY_SCOPE=PASS");
console.log("SASI_ENGINEERING_COPY_CLEAN=PASS");
console.log("AUDIT_SASI_V181=PASS");
