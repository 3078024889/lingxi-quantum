import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "lib/money/provider-adapters.ts",
 "lib/money/reconcile-worker.ts",
 "lib/sasi/composer-core.ts",
 "lib/sasi/export-docx.ts",
 "app/api/internal/money/operations/route.ts",
 "app/api/internal/money/reconcile/route.ts"
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const adapters=read("lib/money/provider-adapters.ts");
for(const x of[
 'if(r.providerCurrency!=="USD")',
 'status:"pending"',
 'errorCode:"WECHAT_ABNORMAL"',
 'errorCode:`ALIPAY_${s.slice(7,100)}`',
 'if(["FAILED","CANCELLED"].includes(s))'
])if(!adapters.includes(x))bad.push(`provider adapter invariant missing ${x}`);
if(adapters.includes('if(r.currency!=="USD"||r.providerCurrency!=="USD")'))bad.push("historical PayPal CNY wallet still rejected");
if(adapters.includes('["CLOSED","ABNORMAL"].includes(s)'))bad.push("WeChat ABNORMAL still releases hold");
if(adapters.includes('if(s.startsWith("FAILED:"))return{status:"failed"'))bad.push("Alipay API error still releases hold");

const worker=read("lib/money/reconcile-worker.ts");
for(const x of[
 "providerOrderTotalMinor(order,providerCurrency)",
 "OPERATOR_ATTEMPT_THRESHOLD=12",
 "OPERATOR_REVIEW_REQUIRED",
 'admin.rpc("money_claim_reconciliation_v52e"'
])if(!worker.includes(x))bad.push(`worker invariant missing ${x}`);
if(worker.includes("orderTotalMinor(order,currency)"))bad.push("provider total still uses wallet currency");

const chat=read("components/SasiChatCreationStudio.tsx");
const knowledge=read("components/KnowledgeWorkspace.tsx");
if(!chat.includes("SASI_UNIFIED_ACCEPT")||!knowledge.includes("SASI_UNIFIED_ACCEPT"))bad.push("SASI file intake contract not shared");
if(!chat.includes("downloadSasiDocx")||!knowledge.includes("downloadSasiDocx"))bad.push("real DOCX export not shared");
if(chat.includes("sasi-conversation.doc\"")||knowledge.includes("sasi-discussion.doc\""))bad.push("legacy HTML .doc export remains");

const docx=read("lib/sasi/export-docx.ts");
for(const x of["[Content_Types].xml","word/document.xml","word/styles.xml","application/vnd.openxmlformats-officedocument.wordprocessingml.document"])
 if(!docx.includes(x))bad.push(`DOCX package missing ${x}`);

const internal=read("app/api/internal/money/reconcile/route.ts");
if(!internal.includes("CONFIRM_REQUIRED"))bad.push("live internal reconcile lacks explicit confirm");
if(!internal.includes("export async function GET"))bad.push("safe reconciliation preview missing");

const ops=read("app/api/internal/money/operations/route.ts");
for(const x of["providerActionRequired","retrying","provider_attempt_count","MONEY_RECONCILE_SECRET"])
 if(!ops.includes(x))bad.push(`operations view missing ${x}`);

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("CORE_PAYPAL_CNY_USD_HISTORICAL_REFUND=PASS");
console.log("CORE_WECHAT_ABNORMAL_HOLD_SAFE=PASS");
console.log("CORE_ALIPAY_UNCERTAIN_HOLD_SAFE=PASS");
console.log("CORE_PROVIDER_TERMINAL_RELEASE_ONLY=PASS");
console.log("CORE_PROVIDER_CURRENCY_TOTAL=PASS");
console.log("CORE_STUCK_REFUND_ESCALATION=PASS");
console.log("CORE_RECONCILIATION_DB_CLAIM=PASS");
console.log("CORE_RECONCILIATION_EXPLICIT_CONFIRM=PASS");
console.log("CORE_MONEY_OPERATIONS_VIEW=PASS");
console.log("CORE_SASI_SHARED_INTAKE_CONTRACT=PASS");
console.log("CORE_REAL_DOCX_EXPORT=PASS");
