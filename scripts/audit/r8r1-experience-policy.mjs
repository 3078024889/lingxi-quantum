import fs from"node:fs";
const policy=fs.readFileSync("lib/sasi/experience-policy.ts","utf8");
const copy=fs.readFileSync("lib/sasi/experience-copy.ts","utf8");
if(!policy.includes("dailyBudgetSecondsEquivalent:180"))throw new Error("EXPERIENCE_DAILY_BUDGET_DRIFT");
if(!policy.includes("displayRemainingCountdown:false"))throw new Error("EXPERIENCE_COUNTDOWN_MUST_STAY_HIDDEN");
if(!policy.includes("chargeFailedProviderAttempts:false"))throw new Error("FAILED_PROVIDER_ATTEMPTS_MUST_NOT_CHARGE");
if(!policy.includes("exposeProviderNamesInExperienceUi:false"))throw new Error("PROVIDER_NAMES_MUST_STAY_INTERNAL");
for(const bad of ["Gemini","OpenRouter","Groq","Cerebras","GLM","Qwen","DeepSeek","火山","百炼"]){
 if(copy.includes(bad))throw new Error("PROVIDER_NAME_LEAK_IN_EXPERIENCE_COPY:"+bad);
}
if(!copy.includes("今天的体验额度已经用完"))throw new Error("HUMAN_EXHAUSTED_COPY_MISSING");
if(!copy.includes("连接我的智能服务"))throw new Error("HUMAN_CONNECT_COPY_MISSING");
console.log("SASI_DAILY_EXPERIENCE_INTERNAL_180S=PASS");
console.log("EXPERIENCE_COUNTDOWN_HIDDEN=PASS");
console.log("EXPERIENCE_PROVIDER_NAMES_HIDDEN=PASS");
console.log("FAILED_FALLBACK_ATTEMPTS_FREE=PASS");
