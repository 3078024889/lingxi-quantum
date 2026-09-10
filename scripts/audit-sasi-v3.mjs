import fs from "node:fs";

const workspace = fs.readFileSync("app/sasi/SasiWorkspace.tsx", "utf8");
const panels = fs.readFileSync("app/sasi/SasiV3Panels.tsx", "utf8");
const productionPanels = fs.readFileSync("app/sasi/SasiProductionPanels.tsx", "utf8");
const manifestation = fs.readFileSync("app/live-as/page.tsx", "utf8");
const manifestationGuide = fs.readFileSync("app/live-as/ManifestationGuide.tsx", "utf8");
const realityLoop = fs.readFileSync("app/live-as/RealityLoop.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");
const navigation = fs.readFileSync("components/Nav.tsx", "utf8");
const projectRoute = fs.readFileSync("app/api/sasi/projects/[id]/route.ts", "utf8");
const footer = fs.readFileSync("components/Footer.tsx", "utf8");
const connections = fs.readFileSync("app/sasi/ConnectionCenter.tsx", "utf8");
const integrations = fs.readFileSync("lib/sasi/integration-catalog.ts", "utf8");
const squareProductCovers = ["cangxuan-director-v1.png","ai-drama-studio-v1.png","build-deploy-v1.png","skills-marketplace-v1.png","models-api-v1.png","balance-usage-v1.png","works-library-v1.png","account-security-v1.png"];

const checks = [
  ["canonical SASI promise", workspace.includes("把想法，变成真实可用的作品") && workspace.includes("一键成片，一念即达，一念显化")],
  ["nine first-layer entries", ["SASI 首页","苍玄 AI 导演","AI 短剧工坊","编程构建部署","Skills","模型与 API","余额与用量","我的作品库","我的账户"].every((value)=>workspace.includes(value))],
  ["second-layer navigation keeps all first-layer entrances", ["苍玄 AI 导演","AI 短剧工坊","编程构建部署","模型与 API","余额与用量","我的作品库","我的账户"].every((value)=>navigation.includes(value))],
  ["drama has three production rooms", ["项目总览","人物与连续性","故事板与镜头生产"].every((value)=>workspace.includes(value))],
  ["drama workspaces use removable blank templates", panels.includes("删除当前角色") && panels.includes("下面是空白制作模板") && !panels.includes("沈晚棠")],
  ["work library is not empty-state only", ["品牌官网模板","AI 短剧模板","产品应用模板","宣传视频模板","故事宇宙模板"].every((value)=>panels.includes(value))],
  ["work templates open with usable starter briefs", panels.includes("prompt: \"为我的品牌构建") && workspace.includes("setScript(preset)") && workspace.includes("setBrief(preset)")],
  ["account center separates identity from works and usage", panels.includes("这里只管理身份、安全、订单凭证、文件与权限") && panels.includes("余额和真实用量回到独立结算页") && !panels.includes("onOpenBilling")],
  ["account center avoids fabricated commerce and audit data", panels.includes("支付接入后开放") && panels.includes("统一下载审计尚未开放") && panels.includes("方案预览 · 暂不可购买")],
  ["manifestation exposes six honest entry windows", ["六段显化路径","六个入口免费可见","登录并激活意识显化后"].every((value)=>`${manifestation}\n${manifestationGuide}`.includes(value)) && ["manifestation-core.webp","manifestation-step-1.webp","manifestation-step-2.webp","manifestation-step-3.webp","manifestation-step-4.webp","manifestation-material.webp"].every((file)=>fs.existsSync(`public/images/manifestation/${file}`) && manifestationGuide.includes(file))],
  ["manifestation gates full guidance behind real access", manifestation.includes("manifestActive &&") && manifestation.includes("ManifestationChapters") && manifestation.includes("RealityLoop") && manifestation.includes("不展示虚构进度")],
  ["manifestation preserves real records and save failures", ["visions","reality_entries","今日记录没有保存成功","只统计你真正提交的日期"].every((value)=>`${realityLoop}\n${manifestation}`.includes(value))],
  ["manifestation avoids promised material outcomes", manifestation.includes("不承诺任何特定外部结果") || manifestationGuide.includes("不承诺任何特定外部结果")],
  ["artwork uses ratio-safe rendering", css.includes("aspect-ratio:1.424/1") && css.includes("object-fit:cover") && css.includes("aspect-ratio:16/9") && !css.includes("background-size:400% 200%")],
  ["shared entry template uses independent square artwork and readable copy", css.includes(".sasi-product-cover { display:block; width:100%; aspect-ratio:1/1") && css.includes(".sasi-product-cover img { display:block; width:100%; height:100%; object-fit:cover") && css.includes(".sasi-home-v4-product-copy { position:relative; display:block; min-height:178px") && css.includes(".sasi-home-v4-product-copy b { display:block; font-size:17px") && css.includes("font-size:13px") && css.includes("font-size:14px")],
  ["all eight homepage covers are independent square source files", squareProductCovers.every((file)=>fs.existsSync(`public/images/sasi/cards/${file}`) && workspace.includes(`/images/sasi/cards/${file}`)) && !workspace.includes("art-${item.art}")],
  ["CangXuan uses an independent cinematic director hero", fs.existsSync("public/images/sasi/director/cangxuan-director-hero-v1.png") && css.includes("/images/sasi/director/cangxuan-director-hero-v1.png") && ["角色连续性控制","场景世界观设定","镜头语言设计","提示词智能编译"].every((value)=>fs.readFileSync("app/sasi/CangXuanDirectorStudio.tsx","utf8").includes(value))],
  ["AI Drama Studio has an independent continuity-led hero", fs.existsSync("public/images/sasi/drama/ai-drama-studio-hero-v1.png") && css.includes("/images/sasi/drama/ai-drama-studio-hero-v1.png") && ["角色一致","分集规划","逐镜生产","成本先看清"].every((value)=>workspace.includes(value))],
  ["Build & Deploy has an independent evidence-led hero", fs.existsSync("public/images/sasi/build/sasi-build-deploy-hero-v1.png") && css.includes("/images/sasi/build/sasi-build-deploy-hero-v1.png") && workspace.includes("代码完成不等于已经上线")],
  ["Skills combines discovery, owned capabilities and authoring", ["探索能力","我的能力","编制与发布","sasi-skills-grid"].every((value)=>workspace.includes(value))],
  ["Skills exposes problem-led category filters", ["导演","短剧","编程","提示词","审校","部署","素材"].every((value)=>workspace.includes(value))],
  ["Skills separates enabled flows from planned capability", workspace.includes("内置流程 · 已启用") && workspace.includes("专业能力 · 即将开放") && fs.readFileSync("lib/sasi/catalog.ts","utf8").includes('status: "planned"')],
  ["Models & API separates six capability areas", ["模型与 API","图像与视频","SASI 编排","开发与部署","安全与密钥","训练资料库"].every((value)=>connections.includes(value))],
  ["provider cards derive truthful verification state", ["未连接","已安全保存 · 待验证","正在验证","验证成功","验证失败","/api/sasi/connections/test"].every((value)=>connections.includes(value))],
  ["provider cards use verified brand marks and capability copy", connections.includes("PROVIDER_LOGOS") && connections.includes("logo`} />") && integrations.includes("跨媒介创作主线") && integrations.includes("人物档案与复杂资料")],
  ["customer connection center excludes internal multiplier pricing", !connections.includes("RMB COST STUDY") && !connections.includes("× 2.0") && connections.includes("WHY SASI")],
  ["connection center preserves security and unsupported-provider boundaries", connections.includes("未验证的连接不会标记为可生产") && connections.includes("SSRF 防护") && connections.includes("腾讯云双密钥签名尚未开放")],
  ["Balance & Usage combines verified dashboard with the real ledger", ["sasi-balance-kpis","sasi-balance-trend","sasi-balance-reserve","sasi-balance-ledger"].every((value)=>productionPanels.includes(value)) && css.includes(".sasi-balance-kpis")],
  ["balance metrics derive from owned 30-day jobs and ledger data", productionPanels.includes("recentJobs") && productionPanels.includes("settledPoints") && productionPanels.includes("supplierCost") && productionPanels.includes("account.ledger.slice") && fs.readFileSync("app/api/sasi/account/route.ts","utf8").includes('.gte("updated_at", thirtyDaysAgo)')],
  ["balance page does not fabricate usage or open checkout early", productionPanels.includes("当前不使用演示数据") && productionPanels.includes("支付接入后开放") && productionPanels.includes("前端按钮不会直接增加额度")],
  ["SASI home uses an independent cinematic asset", css.includes("sasi-home-hero-v2.png") && fs.existsSync("public/images/console/sasi-home-hero-v2.png")],
  ["SASI home follows the dense product-console hierarchy", ["sasi-home-v4-command","sasi-home-v4-products","sasi-home-v4-recent","sasi-home-v4-flow","sasi-home-v4-news"].every((value)=>workspace.includes(value))],
  ["home product grid presents all eight entries in one desktop row", css.includes("grid-template-columns:repeat(8,minmax(0,1fr))") && css.includes("@media(max-width:1500px){.sasi-home-v4-products{grid-template-columns:repeat(4,minmax(0,1fr))")],
  ["notification bell exposes truthful updates", workspace.includes("查看通知") && workspace.includes("角色连续性工作台正在构建") && workspace.includes("真实供应商生成闭环待验证")],
  ["footer uses current product taxonomy", ["苍玄 AI 导演","AI 短剧工坊","编程构建部署","模型与 API","作品库"].every((value)=>footer.includes(value)) && !["影像创作","产品构建","能力作品库","制作账户"].some((value)=>footer.includes(value))],
  ["mockup screenshots are not embedded", !workspace.includes("codex-clipboard") && !panels.includes("codex-clipboard")],
  ["work library has real project actions", ["rename","duplicate","export","delete"].every((value)=>panels.includes(`\"${value}\"`)) && panels.includes("lingxifield.sasi.project.v1")],
  ["work library supports individual and bulk deletion", panels.includes("deleteSelected") && panels.includes("全选当前结果") && panels.includes("删除所选") && panels.includes('method: "DELETE"')],
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
