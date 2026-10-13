import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");
const director=read("lib/sasi/cangxuan-director.ts");
const studio=read("components/SasiChatCreationStudio.tsx");
const center=read("app/sasi/ConnectionCenter.tsx");
const billingPanel=read("components/SasiPricingCurrencyClient.tsx");
const catalog=read("lib/sasi/integration-catalog.ts");
const vault=read("lib/sasi/credential-vault.ts");
const connectionApi=read("app/api/sasi/connections/route.ts");
const testApi=read("app/api/sasi/connections/test/route.ts");
const probe=read('lib/security/provider-json-probe.ts');
const migration=read("supabase/migrations/20260909110000_sasi_byok_vault.sql");
const requestSecurity=read("lib/sasi/request-security.ts");
const foundry=read("lib/sasi/cangxuan-foundry.ts");
const foundryApi=read("app/api/sasi/foundry/route.ts");
const foundryMigration=read("supabase/migrations/20260909130000_cangxuan_data_foundry.sql");
const checks=[
  ["six director modes",["motion-comic","short-drama","film","advertising","music-video","game-cg"].every(v=>director.includes(`\"${v}\"`))],
  ["one active creation studio preserves background production",studio.includes('/api/sasi/drama/series')&&studio.includes('/api/sasi/drama/batch')&&studio.includes('continuity.workspace.approvedScript')],
  ["unused duplicate director and foundry interfaces removed",!fs.existsSync('app/sasi/CangXuanDirectorStudio.tsx')&&!fs.existsSync('app/sasi/CangXuanDataFoundry.tsx')&&!fs.existsSync('components/SasiByokVideoStudio.tsx')],
  ["official model guides",["platform.openai.com/api-keys","console.x.ai","console.anthropic.com","platform.lumalabs.ai","console.volcengine.com","bailian.console.aliyun.com","console.cloud.tencent.com"].every(v=>catalog.includes(v))],
  ["build connectors",["GitHub","Vercel","Supabase","Cloudflare"].every(v=>catalog.includes(v))],
  ["shared balance dashboard",billingPanel.includes("legacyAvailableMinor")&&billingPanel.includes("activeAvailableMinor")&&billingPanel.includes("useMoneyAutoRefresh")&&!center.includes("cost*2")&&!center.includes("cost*.2")],
  ["browser never persists BYOK",center.includes('type="password"')&&!center.includes("localStorage")&&!center.includes("sessionStorage")],
  ["BYOK uses authenticated server-side AES-GCM",vault.includes('import "server-only"')&&vault.includes('aes-256-gcm')&&vault.includes("setAAD")&&connectionApi.includes("supabase.auth.getUser")],
  ["BYOK ciphertext is service-role only",migration.includes('using (false)')&&migration.includes('revoke all')&&migration.includes('service_role')],
  ["BYOK supports bounded health check and deletion",testApi.includes('providerJsonProbe')&&probe.includes('deadline')&&connectionApi.includes("export async function DELETE")],
  ["BYOK mutations enforce origin and health rate limit",requestSecurity.includes('site!=="same-origin"')&&connectionApi.includes("isSameOriginMutation")&&testApi.includes("HEALTH_CHECK_RATE_LIMITED")],
  ["training license gate",["Wikimedia Commons","Project Gutenberg","YouTube-8M","First-party / opt-in"].every(v=>catalog.includes(v))],
  ["foundry has provenance and explicit consent",foundryMigration.includes("rights_scope")&&foundryMigration.includes("consent_version")&&foundryApi.includes("TRAINING_CONSENT_REQUIRED")],
  ["private content is not trainable by default",foundry.includes('return "private_only"')&&foundryApi.includes('TRAINING_CONSENT_REQUIRED')],
  ["raw conversations are not persisted",foundryApi.includes("rawConversationStored:false")&&!foundryMigration.includes("raw_content")],
  ["foundry redacts common credentials and deduplicates",foundry.includes("REDACTED_CREDENTIAL")&&foundryApi.includes("deduplicated:true")],
  ["continuity separates permanent identity and state events",foundryMigration.includes("permanent_identity")&&foundryMigration.includes("state_patch")&&foundry.includes("resolveContinuityTimeline")],
  ["teacher generation and training remain disabled",foundryApi.includes("teacherGenerationEnabled:false")&&foundryApi.includes("trainingEnabled:false")],
];
let failed=0;
for(const [name,ok] of checks){ console.log(`${ok?"PASS":"FAIL"} ${name}`); if(!ok) failed++; }
if(failed) process.exit(1);
console.log(`PASS ${checks.length}/${checks.length} CangXuan and connection-center contracts`);
