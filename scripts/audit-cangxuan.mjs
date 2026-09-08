import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");
const director=read("lib/sasi/cangxuan-director.ts");
const studio=read("app/sasi/CangXuanDirectorStudio.tsx");
const center=read("app/sasi/ConnectionCenter.tsx");
const catalog=read("lib/sasi/integration-catalog.ts");
const checks=[
  ["six director modes",["motion-comic","short-drama","film","advertising","music-video","game-cg"].every(v=>director.includes(`\"${v}\"`))],
  ["director choices precede brief",studio.indexOf("director-mode-grid")<studio.indexOf("作品名")],
  ["official model guides",["platform.openai.com/api-keys","console.x.ai","console.anthropic.com","platform.lumalabs.ai","console.volcengine.com","bailian.console.aliyun.com","console.cloud.tencent.com"].every(v=>catalog.includes(v))],
  ["build connectors",["GitHub","Vercel","Supabase","Cloudflare"].every(v=>catalog.includes(v))],
  ["billing policies",center.includes("cost*2")&&center.includes("cost*.2")],
  ["no browser key collection",!center.includes('type="password"')&&!center.includes("setApiKey")],
  ["training license gate",["Wikimedia Commons","Project Gutenberg","YouTube-8M","First-party / opt-in"].every(v=>catalog.includes(v))],
];
let failed=0;
for(const [name,ok] of checks){ console.log(`${ok?"PASS":"FAIL"} ${name}`); if(!ok) failed++; }
if(failed) process.exit(1);
console.log(`PASS ${checks.length}/${checks.length} CangXuan and connection-center contracts`);
