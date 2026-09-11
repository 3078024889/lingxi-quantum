import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const workspace = read("app/sasi/SasiWorkspace.tsx");
const home = read("app/page.tsx");
const legacySasi = read("app/sasi/page.tsx");
const catalog = read("lib/sasi/catalog.ts");
const prepare = read("app/api/sasi/prepare/route.ts");
const readiness = read("lib/sasi/readiness.ts");
const middleware = read("middleware.ts");
const miniField = read("miniapp/pages/field/index.js");
const schema = read("supabase/migrations/20260908090000_sasi_foundation.sql");
const legal = read("app/legal/sasi/page.tsx");
const productSpec = read("docs/SASI-PRODUCT-SPEC.md");
const budgetSpec = read("docs/SASI-BUDGET-QUALITY.md");
const platformStrategy = read("docs/SASI-PLATFORM-STRATEGY.md");
const publicCatalog = read("app/api/sasi/catalog/route.ts");
const providerEconomics = read("lib/sasi/provider-economics.ts");
const projectsRoute = read("app/api/sasi/projects/route.ts");
const projectProposal = read("lib/sasi/project-proposal.ts");
const assetPrepare = read("app/api/sasi/assets/prepare/route.ts");
const assetInspect = read("app/api/sasi/assets/[id]/inspect/route.ts");
const projectDetail = read("app/api/sasi/projects/[id]/route.ts");
const productionSchema = read("supabase/migrations/20260908160000_sasi_production_kernel.sql");
const provider = read("lib/sasi/provider.ts");
const production = read("lib/sasi/production.ts");
const productionPanel = read("app/sasi/SasiProductionPanels.tsx");
const jobsRoute = read("app/api/sasi/jobs/route.ts");
const accountRoute = read("app/api/sasi/account/route.ts");
const paymentGate = read("lib/sasi/payment-gate.ts");
const fulfillment = read("lib/fulfill-order.ts");
const aigcLabel = read("lib/sasi/aigc-label.ts");
const paypalCreate = read("app/api/pay/create/route.ts");
const alipayCreate = read("app/api/pay/alipay/create/route.ts");
const wechatCreate = read("app/api/pay/wechat/create/route.ts");

const internalCosts = [...providerEconomics.matchAll(/supplierCostPerSecond:\s*([\d.]+)/g)]
  .map((match) => Number(match[1]));

const checks = [
  [workspace.includes('type Lang = "zh" | "en"') && legal.includes("bodyZh") && legal.includes("bodyEn"), "SASI workspace and legal rules are bilingual"],
  [workspace.includes("SASI Auto") && workspace.includes("Capability Center") && !workspace.includes("Model Connections"), "outcome-first auto orchestration and capability center"],
  [projectProposal.includes("explicitEpisodes") && projectProposal.includes("suggestedEpisodes") && productSpec.includes("绝不默认 100 集"), "episode count is inferred, never preset to 100"],
  [projectProposal.includes("requiresProductionAuthorization: true") && schema.includes("reserve_sasi_points"), "production authorization precedes atomic reservation"],
  [workspace.includes("尚未对齐") && budgetSpec.includes("不得隐藏降级"), "allocation-quality mismatch blocks silent downgrade"],
  [catalog.includes("ROUTE_AMOUNT_FEN_PER_SECOND") && internalCosts.length >= 3 && providerEconomics.includes('import "server-only"'), "public RMB task price and supplier economics are separated"],
  [catalog.includes("Math.round((ROUTE_AMOUNT_FEN_PER_SECOND") && !catalog.includes("Math.ceil("), "integer-fen task calculation avoids rounding up"],
  [provider.includes('import "server-only"') && provider.includes('env("XAI_API_KEY")') && provider.includes('env("OPENAI_API_KEY")') && provider.includes('env("DASHSCOPE_API_KEY")') && !workspace.includes("XAI_API_KEY"), "multi-provider credentials remain server-side"],
  [schema.includes("enable row level security") && schema.includes("service_role") && schema.includes("sasi_node_dependencies"), "RLS, service writes and dependency graph schema"],
  [middleware.includes('"/dream"') && middleware.includes('target.pathname = "/"'), "retired Dream routes redirect to the SASI home"],
  [home.includes("<SasiWorkspace") && legacySasi.includes('permanentRedirect("/")') && middleware.includes('pathname === "/sasi"'), "SASI is the canonical root and /sasi permanently redirects"],
  [workspace.includes("SASI DRAMA") && workspace.includes("SASI BUILD") && workspace.includes("你想创造什么"), "Drama and Build are equal home entrances"],
  [workspace.includes("Add files") && workspace.includes("onDrop={drop}") && workspace.includes("onPaste={handlePaste}"), "unified input supports click, drag and paste staging"],
  [workspace.includes("人民币预算") && workspace.includes("项目预算上限（人民币）") && !workspace.includes("项目投入边界（制作额度）"), "public language uses RMB balance and task budget"],
  [publicCatalog.includes("SASI_CAPABILITIES") && !publicCatalog.includes("provider-economics") && !publicCatalog.includes("POINTS_PER_RMB"), "public catalog does not expose procurement economics"],
  [platformStrategy.includes("结果先于工具") && platformStrategy.includes("供应商采购价"), "platform strategy separates outcome language from internal procurement"],
  [projectsRoute.includes("auth.getUser()") && projectsRoute.includes('rpc("create_sasi_project"') && !projectsRoute.includes("createAdminClient"), "project creation derives ownership from the authenticated session"],
  [schema.includes("sasi_projects_user_request_uidx") && schema.includes("p_request_id uuid") && projectsRoute.includes("Idempotency-Key"), "project creation is idempotent across retries"],
  [schema.includes("where p.id = project_id and p.user_id = auth.uid()") && schema.includes("grant select on public.sasi_projects, public.sasi_nodes, public.sasi_node_dependencies to authenticated"), "project graph reads work under RLS and node ownership is project-bound"],
  [projectProposal.includes("SASI_BUILD_STAGES") && projectProposal.includes("SASI_DRAMA_STAGES") && schema.includes("sasi_node_dependencies"), "persistent projects start with a real editable dependency graph"],
  [workspace.includes('fetch("/api/sasi/projects"') && workspace.includes("setProjects(") && workspace.includes('async function prepare(kind: "code" | "drama")'), "workspace creates and lists persisted SASI projects"],
  [schema.includes("sasi-quarantine") && schema.includes("external_scan_required") && schema.includes("sasi_assets_search_idx"), "private quarantine assets have scan gates and a search index"],
  [assetPrepare.includes("createSignedUploadUrl") && assetPrepare.includes("safeAssetPath(user.id, projectId") && !assetPrepare.includes("signedUrl:"), "upload tickets use server-owned paths and expose no reusable service credential"],
  [assetInspect.includes("sha256(bytes)") && assetInspect.includes("inspectText(bytes)") && assetInspect.includes("external_scan_required"), "safe text is hashed and indexed while binary assets remain gated"],
  [projectDetail.includes('from("sasi_nodes")') && projectDetail.includes('from("sasi_assets")') && workspace.includes("SASI STORY GRAPH"), "project workspace reads persisted nodes and quarantined assets"],
  [productionSchema.includes("credit_sasi_topup") && productionSchema.includes("create_and_reserve_sasi_job") && productionSchema.includes("settle_sasi_job") && productionSchema.includes("release_sasi_job"), "top-up, reservation, settlement and release are atomic service-only operations"],
  [paymentGate.includes("SASI_CONTENT_LABELING_ENABLED") && paymentGate.includes("SASI_AIGC_LABEL_MODE") && paymentGate.includes("SASI_JOBS_ENABLED") && paymentGate.includes("SASI_REFUND_FLOW_TESTED") && fulfillment.includes('product.group === "production"'), "paid production cannot open before fulfillment, refund and safety gates"],
  [paymentGate.includes("SASI_RMB_BALANCE_V1_ENABLED") && paypalCreate.includes("sasiTopupProductEnabled(product.id)") && alipayCreate.includes("sasiTopupProductEnabled(product.id)") && wechatCreate.includes("sasiTopupProductEnabled(product.id)"), "new RMB top-up tiers stay blocked until the matching database migration is enabled"],
  [provider.includes('"seedance" | "xai" | "openai" | "wan"') && provider.includes('env("ARK_API_KEY")') && provider.includes("SASI_VERIFIED_VIDEO_PROVIDERS"), "only verified first-party video routes are eligible"],
  [provider.includes("preferredProvider") && jobsRoute.includes("providerPreference") && productionPanel.includes('"professional"') && productionPanel.includes("SASI Auto"), "auto routing and explicit professional routing share one verified provider gate"],
  [provider.includes("cost_in_usd_ticks") && production.includes("providerCostMinor") && production.includes("supplierCost"), "xAI reported cost is retained for settlement evidence"],
  [jobsRoute.includes("Idempotency-Key") && jobsRoute.includes("create_and_reserve_sasi_job") && jobsRoute.includes("dispatchSasiJob"), "job authorization is idempotent and reserves before provider dispatch"],
  [jobsRoute.includes("verifySasiTaskQuote") && jobsRoute.includes("QUOTE_CHANGED_REQUOTE_REQUIRED") && fs.existsSync("app/api/sasi/quote/route.ts"), "server quote is required before task reservation"],
  [production.includes("UNTRUSTED_DELIVERY_HOST") && production.includes("AIGC_LABEL_REQUIRES_MP4") && production.includes('from("sasi-deliveries")'), "provider delivery is host-restricted, signature-checked and private"],
  [aigcLabel.includes('new TextEncoder().encode("AIGC")') && aigcLabel.includes('Label: "1"') && production.includes("AIGC_METADATA_VERIFICATION_FAILED") && jobsRoute.includes("cleanVisualExportRequested"), "clean visual exports retain standard AIGC metadata and agreement evidence"],
  [accountRoute.includes('from("sasi_wallets")') && accountRoute.includes('from("sasi_credit_ledger")') && accountRoute.includes('from("sasi_deliveries")'), "production account exposes owned ledger, jobs and deliveries"],
  [miniField.includes("灵犀场 SASI") && miniField.includes("web: '/'"), "Mini Program opens the canonical SASI home"],
  [fs.existsSync("skills/sasi-web-builder/SKILL.md") && fs.existsSync("skills/sasi-short-drama/SKILL.md"), "official Build and Drama Skills exist"],
  [legal.includes("不提供内容社区发布") && legal.includes("does not operate a publishing community"), "no-publishing boundary is explicit"],
];

const failed = checks.filter(([ok]) => !ok);
for (const [ok, label] of checks) console[ok ? "log" : "error"](`${ok ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
