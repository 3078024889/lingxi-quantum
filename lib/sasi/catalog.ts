export type SasiMode = "code" | "drama" | "skills" | "billing";
export type SasiQuality = "fast" | "balanced" | "cinema";

export type SasiCapability = {
  id: string;
  zh: string;
  en: string;
  kind: "code" | "video";
  status: "curated" | "planned";
  noteZh: string;
  noteEn: string;
};

export const SASI_QUALITY_TIERS = [
  { id: "fast", zh: "灵感验证", en: "Concept", routeId: "motion-essential", noteZh: "快速形成可判断的视觉样片", noteEn: "Shape a reviewable visual study quickly" },
  { id: "balanced", zh: "正式制作", en: "Studio", routeId: "studio-balanced", noteZh: "兼顾叙事完整、角色延续与画面表现", noteEn: "Balance narrative, continuity and visual finish" },
  { id: "cinema", zh: "典藏呈现", en: "Premiere", routeId: "signature-cinema", noteZh: "把最高规格集中于决定作品气质的镜头", noteEn: "Concentrate premium craft on defining moments" },
] as const;

export const SASI_CAPABILITIES: SasiCapability[] = [
  { id: "reasoning", zh: "叙事与决策", en: "Narrative Intelligence", kind: "code", status: "curated", noteZh: "理解目标、组织长文本、形成可执行的创作判断。", noteEn: "Understand intent, structure long contexts and form executable decisions." },
  { id: "engineering", zh: "产品与工程", en: "Product Engineering", kind: "code", status: "curated", noteZh: "覆盖架构、实现、验证、安全审阅与交付证据。", noteEn: "Cover architecture, implementation, verification, security review and delivery evidence." },
  { id: "visual", zh: "视觉世界构建", en: "Visual Worldbuilding", kind: "video", status: "curated", noteZh: "统筹人物、场景、镜头语言与跨镜头延续性。", noteEn: "Orchestrate characters, scenes, cinematography and cross-shot continuity." },
  { id: "motion", zh: "动态影像制作", en: "Motion Production", kind: "video", status: "planned", noteZh: "依据作品目标分配不同制作规格，并保留逐镜头复核。", noteEn: "Assign production grades by creative intent with shot-level review." },
  { id: "voice", zh: "声音叙事", en: "Sonic Narrative", kind: "video", status: "planned", noteZh: "统一角色声线、对白节奏、环境声与音乐位置。", noteEn: "Unify casting, dialogue rhythm, ambience and score placement." },
];

// Integer fen only. The UI formats these values as RMB and never exposes an
// internal point/credit unit.
const ROUTE_AMOUNT_FEN_PER_SECOND: Record<string, number> = {
  "motion-essential": 69,
  "studio-balanced": 119,
  "signature-cinema": 349,
};

export const SASI_SKILLS = [
  { id: "website-architect", glyph: "</>", zh: "网站架构师", en: "Website Architect", category: "code", status: "enabled", fitZh: "网站 · 应用 · 产品重构", fitEn: "Sites · apps · product rebuilds", noteZh: "把模糊需求整理成页面结构、技术方案、数据模型与可核验的完成标准。", noteEn: "Turn an unclear brief into page structure, technical direction, data models and verifiable acceptance criteria.", modes: ["code"] },
  { id: "repository-builder", glyph: "⌘", zh: "仓库构建者", en: "Repository Builder", category: "code", status: "enabled", fitZh: "现有仓库 · 修复 · 功能开发", fitEn: "Repositories · fixes · features", noteZh: "先理解已有代码和用户资产，再实施、测试并交付可审阅的变更。", noteEn: "Understand existing code and user assets before implementing, testing and delivering reviewable changes.", modes: ["code"] },
  { id: "deployment-guardian", glyph: "↗", zh: "部署守门人", en: "Deployment Guardian", category: "deploy", status: "enabled", fitZh: "Git · Vercel · 数据库 · 域名", fitEn: "Git · Vercel · database · domain", noteZh: "分别核对提交、构建、环境变量、数据库与公网响应，避免把代码完成误当成上线。", noteEn: "Verify commits, builds, environment variables, databases and public response instead of mistaking code completion for launch.", modes: ["code"] },
  { id: "hit-story-analyzer", glyph: "爆", zh: "爆款故事结构", en: "Hit Story Structure", category: "drama", status: "planned", fitZh: "漫剧 · 短剧 · 系列内容", fitEn: "Comics · drama · series", noteZh: "提炼开场钩子、冲突密度、情绪回报与集尾悬念，但不复制现有作品。", noteEn: "Shape hooks, conflict density, emotional payoff and cliffhangers without copying existing work.", modes: ["drama"] },
  { id: "character-bible", glyph: "人", zh: "人物身份板", en: "Character Bible", category: "director", status: "planned", fitZh: "角色设定 · 多集连续性", fitEn: "Character design · continuity", noteZh: "把外貌、服装、性格、关系与剧情状态写成可以持续调用的角色基线。", noteEn: "Turn appearance, wardrobe, personality, relationships and story state into a reusable character baseline.", modes: ["drama"] },
  { id: "storyboard-director", glyph: "景", zh: "故事板导演", en: "Storyboard Director", category: "director", status: "planned", fitZh: "分镜 · 机位 · 动作 · 转场", fitEn: "Shots · camera · action · transitions", noteZh: "把剧本拆成能制作、能调整、能逐镜验收的画面、动作、对白与转场。", noteEn: "Break scripts into producible, editable and reviewable shots, action, dialogue and transitions.", modes: ["drama"] },
  { id: "voice-casting", glyph: "声", zh: "配音与声音设计", en: "Voice & Sound", category: "assets", status: "planned", fitZh: "角色声线 · 环境声 · 音乐", fitEn: "Voices · ambience · music", noteZh: "统一角色音色、语速和情绪，并规划环境声、音乐进入与对白空间。", noteEn: "Unify voice, pace and emotion while planning ambience, music cues and dialogue space.", modes: ["drama"] },
  { id: "continuity-auditor", glyph: "✓", zh: "连续性审校", en: "Continuity Auditor", category: "review", status: "planned", fitZh: "人物 · 道具 · 空间 · 时间", fitEn: "Cast · props · space · time", noteZh: "逐镜检查人物、道具、场景、时间与对白，让修改有依据、返工有范围。", noteEn: "Check cast, props, setting, time and dialogue shot by shot so revisions stay explainable and contained.", modes: ["drama"] },
  { id: "prompt-compiler", glyph: "译", zh: "提示词编译器", en: "Prompt Compiler", category: "prompt", status: "planned", fitZh: "导演语言 · 多模型适配", fitEn: "Direction · multi-model adaptation", noteZh: "把导演意图翻译成结构清晰、可编辑并适配不同模型的执行提示，不要求用户学习 Prompt。", noteEn: "Translate directing intent into structured, editable prompts for different models without making users learn prompting.", modes: ["code", "drama"] },
  { id: "release-troubleshooter", glyph: "诊", zh: "部署报错排查", en: "Release Troubleshooter", category: "deploy", status: "planned", fitZh: "构建日志 · 环境变量 · 回滚", fitEn: "Build logs · environment · rollback", noteZh: "从错误日志定位构建、权限和配置问题，并给出可验证、可回退的修复路径。", noteEn: "Trace build, access and configuration failures from logs and propose verifiable, reversible fixes.", modes: ["code"] },
  { id: "subtitle-dialogue", glyph: "幕", zh: "字幕与对白整理", en: "Subtitle & Dialogue", category: "assets", status: "planned", fitZh: "对白 · 字幕 · 时间轴", fitEn: "Dialogue · subtitles · timeline", noteZh: "统一人物称谓、对白语气、时间轴和字幕规范，减少成片阶段的反复校对。", noteEn: "Align names, dialogue tone, timing and subtitle rules to reduce late-stage correction.", modes: ["drama"] },
  { id: "asset-organizer", glyph: "库", zh: "素材资产整理", en: "Asset Organizer", category: "assets", status: "planned", fitZh: "角色图 · 场景 · 镜头 · 版本", fitEn: "Characters · scenes · shots · versions", noteZh: "按项目归档角色、场景、镜头和版本，让团队始终知道该用哪一份素材。", noteEn: "Organize characters, scenes, shots and versions by project so teams know which asset is current.", modes: ["code", "drama"] },
] as const;

export const CREDIT_PACKS = [
  { id: "sasi-balance-10", amountFen: 1000, priceRmb: 10, priceUsd: 1.5, zh: "轻量体验", en: "Starter" },
  { id: "sasi-credit-entry", amountFen: 2000, priceRmb: 20, priceUsd: 3, zh: "创作启程", en: "Creative Start" },
  { id: "sasi-balance-50", amountFen: 5000, priceRmb: 50, priceUsd: 7.5, zh: "单次制作", en: "Single Production" },
  { id: "sasi-credit-studio", amountFen: 10000, priceRmb: 100, priceUsd: 15, zh: "持续制作", en: "Studio Flow" },
  { id: "sasi-balance-200", amountFen: 20000, priceRmb: 200, priceUsd: 30, zh: "系列起步", en: "Series Start" },
  { id: "sasi-credit-reserve", amountFen: 50000, priceRmb: 500, priceUsd: 75, zh: "工作室储备", en: "Studio Reserve" },
  { id: "sasi-balance-1000", amountFen: 100000, priceRmb: 1000, priceUsd: 150, zh: "系列制作", en: "Series Production" },
  { id: "sasi-balance-2000", amountFen: 200000, priceRmb: 2000, priceUsd: 300, zh: "长期制作", en: "Long Production" },
  { id: "sasi-balance-10000", amountFen: 1000000, priceRmb: 10000, priceUsd: 1500, zh: "大型项目", en: "Major Production" },
] as const;

export function getSasiCreditPack(id: string) {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}

export function productionQuote(routeId: string, seconds: number) {
  const duration = Math.max(5, Math.min(600, Math.round(seconds)));
  const amountFen = Math.round((ROUTE_AMOUNT_FEN_PER_SECOND[routeId] ?? 0) * duration);
  return { routeId, duration, amountFen };
}

export function routeForQuality(quality: SasiQuality) {
  return SASI_QUALITY_TIERS.find((item) => item.id === quality)?.routeId ?? "motion-essential";
}

export function budgetAssessment(routeId: string, seconds: number, budgetFen: number) {
  const quote = productionQuote(routeId, seconds);
  const budget = Math.max(0, Number.isFinite(budgetFen) ? Math.round(budgetFen) : 0);
  const ratio = quote.amountFen > 0 ? budget / quote.amountFen : 0;
  const level = ratio >= 1 ? "sufficient" : ratio >= 0.65 ? "tradeoff" : "insufficient";
  return {
    ...quote,
    budget,
    gap: Math.max(0, quote.amountFen - budget),
    level,
    canConfirm: ratio >= 1,
  } as const;
}
