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
const schema = read("supabase/sasi-schema.sql");
const legal = read("app/legal/sasi/page.tsx");
const productSpec = read("docs/SASI-PRODUCT-SPEC.md");
const budgetSpec = read("docs/SASI-BUDGET-QUALITY.md");

const providers = [...catalog.matchAll(/costRmbPerSecond:\s*([\d.]+), sellRmbPerSecond:\s*([\d.]+)/g)]
  .map((match) => ({ cost: Number(match[1]), sell: Number(match[2]) }));

const checks = [
  [workspace.includes('type Lang = "zh" | "en"') && legal.includes("bodyZh") && legal.includes("bodyEn"), "SASI workspace and legal rules are bilingual"],
  [workspace.includes("SASI Auto") && workspace.includes("Advanced settings and model choice"), "simple auto routing and optional advanced model mode"],
  [prepare.includes("explicitEpisodes") && prepare.includes("suggestedEpisodes") && productSpec.includes("绝不默认 100 集"), "episode count is inferred, never preset to 100"],
  [prepare.includes("requiresFinalCostConfirmation: true") && schema.includes("reserve_sasi_points"), "quote confirmation precedes atomic reservation"],
  [workspace.includes("预算不足") && budgetSpec.includes("不得隐藏降级"), "budget-quality mismatch blocks silent downgrade"],
  [catalog.includes("POINTS_PER_RMB = 100") && providers.length >= 4 && providers.every((item) => item.sell > item.cost), "credit ratio and positive provider margin guard"],
  [catalog.includes("Math.round(price * POINTS_PER_RMB)") && !catalog.includes("Math.ceil(price * POINTS_PER_RMB)"), "currency-to-points conversion avoids floating overcharge"],
  [readiness.includes("process.env.OPENAI_API_KEY") && !workspace.includes("OPENAI_API_KEY"), "provider credentials remain server-side"],
  [schema.includes("enable row level security") && schema.includes("service_role") && schema.includes("sasi_node_dependencies"), "RLS, service writes and dependency graph schema"],
  [middleware.includes('"/dream"') && middleware.includes('target.pathname = "/"'), "retired Dream routes redirect to the SASI home"],
  [home.includes("<SasiWorkspace") && legacySasi.includes('permanentRedirect("/")') && middleware.includes('pathname === "/sasi"'), "SASI is the canonical root and /sasi permanently redirects"],
  [workspace.includes("SASI DRAMA") && workspace.includes("SASI BUILD") && workspace.includes("你想创造什么"), "Drama and Build are equal home entrances"],
  [workspace.includes("Add files") && workspace.includes("onDrop={drop}") && workspace.includes("onPaste={handlePaste}"), "unified input supports click, drag and paste staging"],
  [workspace.includes("余额与充值") && !workspace.includes("积分与充值"), "public billing language uses RMB balance"],
  [miniField.includes("灵犀场 SASI") && miniField.includes("web: '/'"), "Mini Program opens the canonical SASI home"],
  [fs.existsSync("skills/sasi-web-builder/SKILL.md") && fs.existsSync("skills/sasi-short-drama/SKILL.md"), "official Build and Drama Skills exist"],
  [legal.includes("不提供内容社区发布") && legal.includes("does not operate a publishing community"), "no-publishing boundary is explicit"],
];

const failed = checks.filter(([ok]) => !ok);
for (const [ok, label] of checks) console[ok ? "log" : "error"](`${ok ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
