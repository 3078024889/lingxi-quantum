import fs from "node:fs";
import path from "node:path";

const repo=process.argv[2]||process.cwd();
const read=(p)=>fs.readFileSync(path.join(repo,p),"utf8");
const exists=(p)=>fs.existsSync(path.join(repo,p));

const checks=[];
function add(name,ok,detail=""){checks.push({name,ok,detail})}

const knowledge=read("app/api/knowledge/ask/route.ts");
add("knowledge same-origin",knowledge.includes("isSameOriginMutation")&&knowledge.includes("Invalid request origin."));
add("knowledge learning event",knowledge.includes("recordBookAnswerEvent")&&knowledge.includes("learningEventId"));

const workspace=read("components/KnowledgeWorkspace.tsx");
add("book feedback UI",workspace.includes("SASI LEARNING FEEDBACK"));
add("book feedback endpoint",workspace.includes("/api/sasi/learning/feedback"));
add("feedback not direct truth",workspace.includes("不会直接覆盖知识")||workspace.includes("does not directly overwrite knowledge"));

for(const p of [
 "app/api/sasi/learning/feedback/route.ts",
 "app/api/sasi/operator/status/route.ts",
 "app/api/sasi/operator/evidence/route.ts",
 "app/api/sasi/operator/health/route.ts",
 "app/sasi/operator/page.tsx",
 "lib/sasi/operator/production-health.ts",
 "lib/sasi/integration/book-learning.ts",
 "lib/sasi/integration/feedback-repository.ts"
]) add(`exists ${p}`,exists(p));

for(const p of [
 "app/api/tools/pay/status/route.ts",
 "app/api/tools/pay/recover/route.ts",
 "app/api/tools/media-import/route.ts",
 "app/api/tools/local-paid/job/route.ts",
 "components/tools/RemoteMediaImporter.tsx",
 "components/tools/VideoWatermarkWorkbench.tsx"
]) add(`exists ${p}`,exists(p));

const pay=read("components/tools/PaidActionButton.tsx");
add("paid popup confirmation",pay.includes("LINGXIFIELD_TOOL_PAYMENT_CONFIRMED"));
add("paid recovery poll",pay.includes("/api/tools/pay/status"));

const orders=read("app/account/orders/page.tsx");
add("tool orders account group",orders.includes("实用工具")&&orders.includes("toolquote:"));

const media=read("app/api/tools/media-import/route.ts");
add("share resolver Douyin",media.includes("douyin.com"));
add("share resolver TikTok",media.includes("tiktok.com"));
add("share resolver Xiaohongshu",media.includes("xiaohongshu.com"));
add("share resolver Kuaishou",media.includes("kuaishou.com"));
add("media SSRF guard",media.includes("PRIVATE_NETWORK_FORBIDDEN"));

const video=read("components/tools/VideoWatermarkWorkbench.tsx");
add("video watermark 1.20 copy",video.includes("¥1.20 / 分钟"));
add("video watermark paid",video.includes('toolId="video-watermark-remover"'));

const migrationNames=[
 "20260923093820_sasi_cognitive_kernel_v01.sql",
 "20260923093824_sasi_self_evolution_control_v01.sql",
 "20260923093857_sasi_general_intelligence_seed_v01.sql",
 "20260923093901_sasi_knowledge_ingestion_teacher_mesh_v01.sql",
 "20260923093931_sasi_learning_runtime_stage2.sql",
 "20260923093936_sasi_self_evolution_stage3.sql",
 "20260923093956_sasi_model_authored_code_stage4.sql",
 "20260923094000_sasi_user_triggered_intelligence_control.sql",
 "20260923094028_sasi_measured_benchmark_stage7.sql",
 "20260923094032_sasi_promotion_rollback_stage8.sql",
 "20260923094036_sasi_completion_runtime_learning.sql",
 "20260923094053_tools_full_production_v1150.sql",
 "20260923094108_sasi_cognitive_least_privilege_v1161.sql",
 "20260923094300_sasi_cognitive_performance_v1170.sql",
 "20260923094451_sasi_topup_rpc_drift_repair.sql"
];
for(const n of migrationNames)add(`migration ${n}`,exists(`supabase/migrations/${n}`));

const failed=checks.filter(x=>!x.ok);
console.log(JSON.stringify({version:"11.80",checks,failed},null,2));
if(failed.length)process.exit(2);
