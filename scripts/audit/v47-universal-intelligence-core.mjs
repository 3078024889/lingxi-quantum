import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const files=[
 "lib/sasi/intelligence/provider-defaults.ts",
 "lib/sasi/intelligence/user-text.ts",
 "app/api/sasi/connections/test/route.ts",
 "app/api/sasi/byok/text/route.ts",
 "lib/sasi/intelligence/user-video.ts",
 "app/api/sasi/byok/video/route.ts",
 "supabase/migrations/20261002193000_connection_capabilities_unified.sql",
 "app/sasi/build/page.tsx",
];
for(const f of files)must(fs.existsSync(f),`V47_MISSING:${f}`);
const providers=read("lib/sasi/intelligence/provider-defaults.ts");
for(const id of ["openai","xai","anthropic","gemini","deepseek","openrouter","volcengine","aliyun","compatible"]){must(providers.includes(`${id}:`)||providers.includes(`provider:\"${id}\"`),`V47_PROVIDER_MISSING:${id}`)}
const runner=read("lib/sasi/intelligence/user-text.ts");
for(const token of ["selectUserTextConnection","runUserText","anthropic","gemini","chat/completions","decryptProviderKey"]){must(runner.includes(token),`V47_TEXT_RUNTIME_MISSING:${token}`)}
const test=read("app/api/sasi/connections/test/route.ts");
for(const token of ["capabilities","model_id","chooseTextModel","providerPublicCapabilities"]){must(test.includes(token),`V47_CAPABILITY_PROBE_MISSING:${token}`)}
const text=read("app/api/sasi/byok/text/route.ts");
must(text.includes("runUserText"),"V47_BYOK_TEXT_NOT_UNIFIED");
must(!text.includes('eq("provider", "volcengine")'),"V47_BYOK_TEXT_STILL_VOLCENGINE_ONLY");
must(text.includes('billing:"supplier_direct"'),"V47_SUPPLIER_DIRECT_BILLING_MISSING");
const video=read("app/api/sasi/byok/video/route.ts");
must(video.includes("selectUserVideoConnection"),"V47_BYOK_VIDEO_NOT_UNIFIED");
for(const id of ["volcengine","xai","openai","aliyun"])must(read("lib/sasi/intelligence/user-video.ts").includes(`===\"${id}\"`)||read("lib/sasi/intelligence/user-video.ts").includes(`${id}\"`),`V47_VIDEO_PROVIDER_MISSING:${id}`);
must(video.includes('billing:"supplier_direct"'),"V47_VIDEO_SUPPLIER_DIRECT_BILLING_MISSING");
const command=read("components/SasiCommandCenter.tsx");
must(command.includes("连接我的智能服务"),"V47_PUBLIC_COPY_MISSING");
const account=read("app/account/connections/page.tsx");
must(account.includes('redirect("/sasi/connections")'),"V47_DUPLICATE_CONNECTION_UI_REMAINS");
const migration=read("supabase/migrations/20261002193000_connection_capabilities_unified.sql");
must(migration.includes("capabilities jsonb"),"V47_CAPABILITY_SCHEMA_MISSING");
must(migration.includes("estimated_fen >= 0"),"V47_SUPPLIER_DIRECT_QUOTE_SCHEMA_MISSING");

const userVideo=read("lib/sasi/intelligence/user-video.ts");
must(userVideo.includes("Promise<SelectedUserVideoConnection|null>"),"V47R1_VIDEO_CONNECTION_NULLABILITY_MISSING");
must(userVideo.includes("row is SelectedUserVideoConnection"),"V47R1_VIDEO_MODEL_TYPE_GUARD_MISSING");
const videoRoute=read("app/api/sasi/byok/video/route.ts");
must(videoRoute.includes("ReturnType<typeof selectUserVideoConnection>>|null"),"V47R1_VIDEO_PROFILE_NULL_GUARD_MISSING");

console.log("V47R1_VIDEO_NULLABILITY_FIX=PASS");
console.log("V47_UNIVERSAL_INTELLIGENCE_SOURCE=PASS");
console.log("V47_MULTI_PROVIDER_TEXT=PASS");
console.log("V47_CAPABILITY_DISCOVERY=PASS");
console.log("V47_MULTI_PROVIDER_VIDEO=PASS");
console.log("V47_CONNECTION_COPY=PASS");
console.log("V47_WEBSITE_ENTRY=PASS");
