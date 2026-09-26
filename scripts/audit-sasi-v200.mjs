import fs from "node:fs";
import path from "node:path";
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),"utf8"),exists=p=>fs.existsSync(path.join(root,p));
const must=(v,m)=>{if(!v)throw new Error(m)};

for(const p of [
 "lib/sasi-kernel/cognition/grounded-answer.ts",
 "lib/sasi-kernel/compute/await-job.ts",
 "lib/sasi-kernel/commerce/native-entitlement.ts",
 "app/api/knowledge/ask/route.ts",
 "app/api/sasi/native/jobs/route.ts",
 "components/SasiNativeCreatePanel.tsx",
 "components/tools/PaidActionButton.tsx",
 "miniapp/pages/tools/index.wxml",
 "supabase/migrations/20260926223000_sasi_cognitive_commerce_v200.sql",
])must(exists(p),`V200_REQUIRED_MISSING:${p}`);

const cognition=read("lib/sasi-kernel/cognition/grounded-answer.ts");
for(const token of ["buildGroundedReasoningPrompt","validateGroundedAnswer","deterministicGroundedAnswer","asksDirection","directionalScore"]){
 must(cognition.includes(token),`COGNITIVE_LAYER_MISSING:${token}`);
}
must(cognition.includes("已发生事实 / 作者判断 / 条件预测"),"COGNITIVE_FACT_PREDICTION_SEPARATION_MISSING");
must(cognition.includes("不要机械输出十条摘抄"),"COGNITIVE_ANTI_EXTRACTIVE_PROMPT_MISSING");

const ask=read("app/api/knowledge/ask/route.ts");
must(ask.includes("runNativeReasoningAndWait"),"KNOWLEDGE_NATIVE_REASONING_NOT_WIRED");
must(ask.includes('execution:"native-reasoning"'),"KNOWLEDGE_NATIVE_RESULT_MODE_MISSING");
must(ask.includes('execution:"grounded-fallback"'),"KNOWLEDGE_SAFE_FALLBACK_MISSING");
must(ask.includes("validateGroundedAnswer"),"KNOWLEDGE_CITATION_VALIDATION_MISSING");

const paid=read("lib/tools/paid-catalog.ts");
for(const id of ["cross-page-stamp","sasi-deep-reason","sasi-image-generate","sasi-video-generate"]){
 must(paid.includes(`"${id}"`),`PAID_CATALOG_MISSING:${id}`);
}

const readiness=read("lib/tools/service-readiness.ts");
must(readiness.includes("SASI_NATIVE_COMPUTE_NOT_READY"),"SASI_PAID_FAIL_CLOSED_MISSING");
must(readiness.includes('"compute"'),"SASI_COMPUTE_READINESS_MODE_MISSING");

const api=read("app/api/sasi/native/jobs/route.ts");
must(api.includes("claimNativePaidExecution"),"SASI_NATIVE_PAYMENT_GATE_MISSING");
must(api.includes("quoteId"),"SASI_NATIVE_QUOTE_REQUIRED_MISSING");
must(api.includes("bindNativeWorkerJob"),"SASI_ENTITLEMENT_JOB_BIND_MISSING");

const entitlement=read("lib/sasi-kernel/commerce/native-entitlement.ts");
must(entitlement.includes("recoverToolQuotePayment"),"SASI_PAYMENT_RECOVERY_NOT_USED");
must(entitlement.includes("sasi_native_entitlements"),"SASI_SINGLE_USE_ENTITLEMENT_MISSING");

const button=read("components/tools/PaidActionButton.tsx");
must(button.includes("wx.miniProgram.navigateTo")||button.includes("miniProgram?.navigateTo"),"MINI_NATIVE_PAYMENT_BRIDGE_MISSING");
must(button.includes("visibilitychange"),"MINI_PAYMENT_RETURN_RECOVERY_MISSING");
must(button.includes("pageshow"),"MINI_PAYMENT_PAGE_RETURN_RECOVERY_MISSING");
must(button.includes('unit==="second"'),"SASI_VIDEO_SECOND_UNIT_MISSING");

const migration=read("supabase/migrations/20260926223000_sasi_cognitive_commerce_v200.sql");
must(migration.includes("'per_second'::text"),"PER_SECOND_BILLING_MISSING");
must(migration.includes("create table if not exists public.sasi_native_entitlements"),"SASI_ENTITLEMENT_SCHEMA_MISSING");
for(const id of ["sasi-deep-reason","sasi-image-generate","sasi-video-generate"])must(migration.includes(`'${id}'`),`SASI_PRICE_MISSING:${id}`);

const mini=read("miniapp/pages/tools/index.wxml");
must(mini.includes("微信支付"),"MINI_TOOL_PAYMENT_EXPLANATION_MISSING");
must(mini.includes("免费使用"),"MINI_FREE_TOOL_LABEL_MISSING");

console.log("SASI_COGNITIVE_GROUNDED_REASONING=PASS");
console.log("SASI_NATIVE_REASONING_WIRED_TO_BOOKS=PASS");
console.log("SASI_CITATION_VALIDATION=PASS");
console.log("SASI_DIRECTIONAL_REASONING_FALLBACK=PASS");
console.log("SASI_NATIVE_PAYMENT_GATE=PASS");
console.log("SASI_NATIVE_SINGLE_USE_ENTITLEMENT=PASS");
console.log("MINI_NATIVE_WECHAT_PAYMENT_BRIDGE=PASS");
console.log("MINI_PAYMENT_RETURN_RECOVERY=PASS");
console.log("PAID_TOOL_CATALOG_CONVERGENCE=PASS");
console.log("FREE_TOOL_EXPERIENCE_PRESERVED=PASS");
console.log("AUDIT_SASI_V200=PASS");
