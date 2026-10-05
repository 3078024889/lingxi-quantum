import fs from"node:fs";
for(const p of ["lib/sasi/experience/free-provider-config.ts","lib/sasi/experience/free-text-router.ts"]){
 if(!fs.existsSync(p))throw new Error("FREE_ROUTER_FILE_MISSING:"+p);
}
const cfg=fs.readFileSync("lib/sasi/experience/free-provider-config.ts","utf8");
for(const id of ["openrouter-free","groq-free","cerebras-free","nvidia-nim-free","gemini-free","cloudflare-workers-ai","zhipu-experience","volcengine-experience","aliyun-experience","mistral-free","fireworks-trial"]){
 if(!cfg.includes(id))throw new Error("FREE_ROUTER_PROVIDER_MISSING:"+id);
}
const router=fs.readFileSync("lib/sasi/experience/free-text-router.ts","utf8");
for(const s of ["cooldown","429","list.slice(0,5)"]){
 if(!router.includes(s))throw new Error("FREE_ROUTER_GUARD_MISSING:"+s);
}
const hasBoundedTimeout =
 router.includes("AbortSignal.timeout(") ||
 (router.includes("new AbortController()")&&router.includes("setTimeout(")&&router.includes(".abort()"));
if(!hasBoundedTimeout)throw new Error("FREE_ROUTER_BOUNDED_TIMEOUT_MISSING");

const env=fs.readFileSync(".env.example","utf8");
if(!env.includes("SASI_EXPERIENCE_OPENROUTER_ENABLED"))throw new Error("EXPERIENCE_ENV_BLOCK_MISSING");
if(/NEXT_PUBLIC_SASI_EXPERIENCE_/.test(env))throw new Error("EXPERIENCE_SECRET_EXPOSED_PUBLICLY");
console.log("FREE_PROVIDER_POOL_CONFIG=PASS");
console.log("FREE_PROVIDER_COOLDOWN_FALLBACK=PASS");
console.log("FREE_PROVIDER_BOUNDED_TIMEOUT=PASS");
console.log("EXPERIENCE_KEYS_SERVER_ONLY=PASS");
