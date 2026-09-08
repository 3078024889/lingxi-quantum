import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");
const director=read("lib/sasi/cangxuan-director.ts");
const studio=read("app/sasi/CangXuanDirectorStudio.tsx");
const center=read("app/sasi/ConnectionCenter.tsx");
const catalog=read("lib/sasi/integration-catalog.ts");
const vault=read("lib/sasi/credential-vault.ts");
const connectionApi=read("app/api/sasi/connections/route.ts");
const testApi=read("app/api/sasi/connections/test/route.ts");
const migration=read("supabase/migrations/20260909110000_sasi_byok_vault.sql");
const requestSecurity=read("lib/sasi/request-security.ts");
const checks=[
  ["six director modes",["motion-comic","short-drama","film","advertising","music-video","game-cg"].every(v=>director.includes(`\"${v}\"`))],
  ["director choices precede brief",studio.indexOf("director-mode-grid")<studio.indexOf("作品名")],
  ["official model guides",["platform.openai.com/api-keys","console.x.ai","console.anthropic.com","platform.lumalabs.ai","console.volcengine.com","bailian.console.aliyun.com","console.cloud.tencent.com"].every(v=>catalog.includes(v))],
  ["build connectors",["GitHub","Vercel","Supabase","Cloudflare"].every(v=>catalog.includes(v))],
  ["billing policies",center.includes("cost*2")&&center.includes("cost*.2")],
  ["browser never persists BYOK",center.includes('type="password"')&&!center.includes("localStorage")&&!center.includes("sessionStorage")],
  ["BYOK uses authenticated server-side AES-GCM",vault.includes('import "server-only"')&&vault.includes('aes-256-gcm')&&vault.includes("setAAD")&&connectionApi.includes("supabase.auth.getUser")],
  ["BYOK ciphertext is service-role only",migration.includes('using (false)')&&migration.includes('revoke all')&&migration.includes('service_role')],
  ["BYOK supports health check and deletion",testApi.includes("AbortSignal.timeout")&&connectionApi.includes("export async function DELETE")],
  ["BYOK mutations enforce origin and health rate limit",requestSecurity.includes('fetchSite!=="same-origin"')&&connectionApi.includes("isSameOriginMutation")&&testApi.includes("HEALTH_CHECK_RATE_LIMITED")],
  ["training license gate",["Wikimedia Commons","Project Gutenberg","YouTube-8M","First-party / opt-in"].every(v=>catalog.includes(v))],
];
let failed=0;
for(const [name,ok] of checks){ console.log(`${ok?"PASS":"FAIL"} ${name}`); if(!ok) failed++; }
if(failed) process.exit(1);
console.log(`PASS ${checks.length}/${checks.length} CangXuan and connection-center contracts`);
