import fs from "node:fs";

const workspace = fs.readFileSync("app/sasi/SasiWorkspace.tsx", "utf8");
const panels = fs.readFileSync("app/sasi/SasiV3Panels.tsx", "utf8");
const manifestation = fs.readFileSync("app/live-as/page.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");
const navigation = fs.readFileSync("components/Nav.tsx", "utf8");
const projectRoute = fs.readFileSync("app/api/sasi/projects/[id]/route.ts", "utf8");

const checks = [
  ["canonical SASI promise", workspace.includes("把想法，变成真实可用的作品") && workspace.includes("一键成片，一念即达，一念显化")],
  ["nine first-layer entries", ["SASI 首页","苍玄 AI 导演","AI 短剧工坊","编程构建部署","Skills","模型与 API","余额与用量","我的作品库","我的账户"].every((value)=>workspace.includes(value))],
  ["second-layer navigation keeps all first-layer entrances", ["苍玄 AI 导演","AI 短剧工坊","编程构建部署","模型与 API","余额与用量","我的作品库","我的账户"].every((value)=>navigation.includes(value))],
  ["drama has three production rooms", ["项目总览","人物与连续性","分镜与镜头生产"].every((value)=>workspace.includes(value))],
  ["work library is not empty-state only", ["品牌官网模板","AI 短剧模板","产品应用模板","宣传视频模板","故事宇宙模板"].every((value)=>panels.includes(value))],
  ["work templates open with usable starter briefs", panels.includes("prompt: \"为我的品牌构建") && workspace.includes("setScript(preset)") && workspace.includes("setBrief(preset)")],
  ["account and field are distinct", panels.includes("账户负责安全与结算；作品与生命档案分别留在作品库和我的场域")],
  ["manifestation records material evidence", ["显化成果档案","想法开始时间","现实行动时长","进入物质世界的结果"].every((value)=>manifestation.includes(value))],
  ["manifestation example is disclosed", manifestation.includes("下方为结构示例，不代表当前用户的真实进度")],
  ["artwork uses ratio-safe rendering", css.includes("aspect-ratio:1.424/1") && css.includes("object-fit:cover")],
  ["SASI home uses an independent cinematic asset", css.includes("sasi-home-hero-v2.png") && fs.existsSync("public/images/console/sasi-home-hero-v2.png")],
  ["SASI home follows the dense product-console hierarchy", ["sasi-home-v4-command","sasi-home-v4-products","sasi-home-v4-recent","sasi-home-v4-flow","sasi-home-v4-news"].every((value)=>workspace.includes(value))],
  ["mockup screenshots are not embedded", !workspace.includes("codex-clipboard") && !panels.includes("codex-clipboard")],
  ["work library has real project actions", ["rename","duplicate","export","delete"].every((value)=>panels.includes(`\"${value}\"`)) && panels.includes("lingxifield.sasi.project.v1")],
  ["project mutations enforce ownership and origin", projectRoute.includes("isSameOriginMutation") && projectRoute.includes("authenticatedOwner") && projectRoute.includes("PROJECT_HAS_ACTIVE_JOB")],
  ["project deletion cleans private storage", projectRoute.includes("sasi-quarantine") === false && projectRoute.includes("admin.storage.from(bucket).remove(paths)")],
];

let failed = false;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed = true;
}
if (failed) process.exit(1);
console.log(`PASS ${checks.length}/${checks.length} SASI V3 structure and visual contracts`);
