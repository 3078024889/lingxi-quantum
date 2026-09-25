import fs from "node:fs";
const failures=[];
const read=p=>fs.readFileSync(p,"utf8");
const save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function rep(p,a,b,n){
  let s=read(p);
  if(s.includes(b)){console.log(`ALREADY ${n}`);return}
  if(!s.includes(a)){console.error(`MISS ${n} :: ${p}`);failures.push(n);return}
  save(p,s.replace(a,b));console.log(`PASS ${n}`);
}

// ---------- keep V14.71 runtime fixes ----------
rep(
  "app/api/ai/image-cleanup/route.ts",
  'process.env.OPENAI_IMAGE_EDIT_MODEL||"gpt-image-2.5-sunburst"',
  'process.env.OPENAI_IMAGE_EDIT_MODEL||"gpt-image-2"',
  "image cleanup default model"
);

{
  const p="components/tools/VideoWatermarkWorkbench.tsx";
  let s=read(p);

  if(s.includes('type MediaItem={file:File;duration:number;key:string};')){
    s=s.replace(
      'type MediaItem={file:File;duration:number;key:string};',
      'type MediaItem={file:File;duration:number;width:number;height:number;key:string};'
    );
  } else if(!s.includes('type MediaItem={file:File;duration:number;width:number;height:number;key:string};')){
    failures.push("video item dimensions"); console.error("MISS video item dimensions");
  }

  const oldFn='function durationOf(file:File){return new Promise<number>((resolve,reject)=>{const el=document.createElement("video"),u=URL.createObjectURL(file),timer=setTimeout(()=>{URL.revokeObjectURL(u);reject(new Error("无法读取视频时长"))},15000);el.preload="metadata";el.onloadedmetadata=()=>{clearTimeout(timer);const d=el.duration;URL.revokeObjectURL(u);Number.isFinite(d)&&d>0?resolve(d):reject(new Error("无法读取视频时长"))};el.onerror=()=>{clearTimeout(timer);URL.revokeObjectURL(u);reject(new Error("视频格式不受当前浏览器支持"))};el.src=u})}';
  const newFn='function mediaMetaOf(file:File){return new Promise<{duration:number;width:number;height:number}>((resolve,reject)=>{const el=document.createElement("video"),u=URL.createObjectURL(file),timer=setTimeout(()=>{URL.revokeObjectURL(u);reject(new Error("无法读取视频信息"))},15000);el.preload="metadata";el.onloadedmetadata=()=>{clearTimeout(timer);const duration=el.duration,width=el.videoWidth,height=el.videoHeight;URL.revokeObjectURL(u);Number.isFinite(duration)&&duration>0&&width>0&&height>0?resolve({duration,width,height}):reject(new Error("无法读取视频信息"))};el.onerror=()=>{clearTimeout(timer);URL.revokeObjectURL(u);reject(new Error("视频格式不受当前浏览器支持"))};el.src=u})}';
  if(s.includes(oldFn)) s=s.replace(oldFn,newFn);
  else if(!s.includes(newFn)){failures.push("video metadata probe"); console.error("MISS video metadata probe")}

  const oldHydrate='async function hydrate(files:File[]){setError("");const next:MediaItem[]=[];for(const file of files.slice(0,10)){try{next.push({file,duration:await durationOf(file),key:`${file.name}-${file.size}-${file.lastModified}`})}catch(e){setError(e instanceof Error?e.message:String(e))}}setItems(next);setResults([]);if(preview)URL.revokeObjectURL(preview);setPreview(next[0]?URL.createObjectURL(next[0].file):"")}';
  const newHydrate='async function hydrate(files:File[]){setError("");const next:MediaItem[]=[];for(const file of files.slice(0,10)){try{const m=await mediaMetaOf(file);next.push({file,duration:m.duration,width:m.width,height:m.height,key:`${file.name}-${file.size}-${file.lastModified}`})}catch(e){setError(e instanceof Error?e.message:String(e))}}setItems(next);setResults([]);if(preview)URL.revokeObjectURL(preview);setPreview(next[0]?URL.createObjectURL(next[0].file):"")}';
  if(s.includes(oldHydrate)) s=s.replace(oldHydrate,newHydrate);
  else if(!s.includes(newHydrate)){failures.push("video hydrate dimensions"); console.error("MISS video hydrate dimensions")}

  const oldCoords='const w=meta.w||1920,h=meta.h||1080,px=Math.round(w*box.x/100),py=Math.round(h*box.y/100),pw=Math.max(8,Math.round(w*box.w/100)),ph=Math.max(8,Math.round(h*box.h/100));';
  const newCoords='const w=item.width,h=item.height,px=Math.round(w*box.x/100),py=Math.round(h*box.y/100),pw=Math.max(8,Math.round(w*box.w/100)),ph=Math.max(8,Math.round(h*box.h/100));';
  if(s.includes(oldCoords)) s=s.replace(oldCoords,newCoords);
  else if(!s.includes(newCoords)){failures.push("video per-item coordinates"); console.error("MISS video per-item coordinates")}

  save(p,s);
  console.log("PASS video watermark batch dimensions");
}

// ---------- lighter living glyphs ----------
{
  const p="components/tools/ToolGlyph.tsx";
  let s=read(p);
  const start=s.indexOf('const GLYPHS:');
  const end=s.indexOf('export default function ToolGlyph');
  if(start<0||end<0){failures.push("glyph block");console.error("MISS glyph block")}
  else{
    const head=s.slice(0,start);
    const tail=`const GLYPHS: Record<Kind, { icon: string; bg: string; fg:string }> = {
  image: { icon: "◉", bg: "linear-gradient(135deg,#fff1f7,#fff8dc)", fg:"#e45b91" },
  document: { icon: "▤", bg: "linear-gradient(135deg,#eef4ff,#f0fbff)", fg:"#5279d8" },
  video: { icon: "▷", bg: "linear-gradient(135deg,#f2edff,#fff0f7)", fg:"#8c63d8" },
  audio: { icon: "∿", bg: "linear-gradient(135deg,#ecfff8,#edf9ff)", fg:"#2fa88f" },
  privacy: { icon: "◇", bg: "linear-gradient(135deg,#ecfff4,#f2f8ff)", fg:"#319b6b" },
  utility: { icon: "✦", bg: "linear-gradient(135deg,#fff6df,#fff0e8)", fg:"#d48536" },
  ai: { icon: "✧", bg: "linear-gradient(135deg,#f4efff,#edf7ff)", fg:"#7b65d9" },
  qr: { icon: "⌗", bg: "linear-gradient(135deg,#eef3ff,#f7efff)", fg:"#6078c8" },
};

export default function ToolGlyph({kind}:{kind:Kind}) {
  const value = GLYPHS[kind] ?? GLYPHS.utility;
  return (
    <span
      aria-hidden="true"
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        fontSize: 19,
        fontWeight: 700,
        lineHeight: 1,
        color: value.fg,
        background: value.bg,
        boxShadow: "inset 0 0 0 1px rgba(15,23,42,.055),0 5px 16px rgba(45,65,95,.055)",
      }}
    >
      {value.icon}
    </span>
  );
}
`;
    save(p,head+tail);
    console.log("PASS lighter living glyphs");
  }
}

// ---------- remove repetitive “Open” text and make each card itself the action ----------
{
  const p="components/tools/ToolsHubV11.tsx";
  let s=read(p);
  const old=`                  {summary?<p className="lx-tools-v124-desc">{summary}</p>:null}
                  <div className="lx11-tool-meta"><b>{toolHubCopy(lang,"open")}</b></div>`;
  const neu=`                  {summary?<p className="lx-tools-v124-desc">{summary}</p>:null}
                  <span className="lx-tool-card-arrow" aria-hidden="true">→</span>`;
  if(s.includes(old)) s=s.replace(old,neu);
  else if(!s.includes(neu)){failures.push("tool card action");console.error("MISS tool card action")}
  save(p,s);
  console.log("PASS cards remove repeated open");
}

// ---------- compact airy card layout ----------
{
  const p="app/globals.css";
  let s=read(p);
  const marker="/* V14.71.1 compact living tools */";
  if(!s.includes(marker)){
    s+=`

${marker}
.lx-tools-v124 .lx11-wrap{max-width:1180px}
.lx-tools-v124 .lx11-tools-hero{padding:20px 0 18px;min-height:0}
.lx-tools-v124 .lx11-tools-hero h1{margin-top:4px;font-size:clamp(1.65rem,2.4vw,2.25rem);line-height:1.15}
.lx-tools-v124 .lx11-tool-searchbar{margin-top:0}
.lx-tools-v124-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px;
}
.lx-tools-v124-card{
  position:relative;
  display:grid;
  grid-template-columns:42px minmax(0,1fr);
  align-items:start;
  gap:10px;
  min-height:0!important;
  height:auto!important;
  padding:13px 14px!important;
  border-radius:14px!important;
  box-shadow:0 7px 22px rgba(36,55,82,.035)!important;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
}
.lx-tools-v124-card:hover{
  transform:translateY(-2px);
  box-shadow:0 12px 28px rgba(36,55,82,.075)!important;
}
.lx-tools-v124-card .lx11-tool-cover{
  height:auto!important;
  min-height:0!important;
  padding:0!important;
  display:block!important;
}
.lx-tools-v124-card .lx11-tool-copy{
  min-height:0!important;
  padding:0!important;
  display:block!important;
}
.lx-tools-v124-card .lx11-tool-title-row{padding-right:22px}
.lx-tools-v124-card .lx11-tool-title-row h3{
  margin:1px 0 0!important;
  font-size:14px!important;
  line-height:1.42!important;
  font-weight:650!important;
}
.lx-tools-v124-card .lx-tools-v124-desc{
  margin:5px 0 0!important;
  display:-webkit-box;
  overflow:hidden;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
  font-size:12px!important;
  line-height:1.55!important;
}
.lx-tools-v124-card .lx-tool-card-arrow{
  position:absolute;
  right:12px;
  top:13px;
  color:rgba(54,74,104,.34);
  font-size:14px;
  transition:transform .18s ease,color .18s ease;
}
.lx-tools-v124-card:hover .lx-tool-card-arrow{
  color:rgba(78,96,190,.72);
  transform:translateX(2px);
}
@media (max-width:1180px){.lx-tools-v124-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:820px){.lx-tools-v124-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:520px){
  .lx-tools-v124-grid{grid-template-columns:1fr}
  .lx-tools-v124-card{padding:12px!important}
}
`;
    save(p,s);
    console.log("PASS compact living tools CSS");
  }else console.log("ALREADY compact living tools CSS");
}

if(failures.length){
  console.error(`V14.71.1_PATCH_FAILURES=${failures.length}`);
  failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));
  process.exit(1);
}
console.log("V14.71.1_PATCH=PASS");
