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

const ROUTE_CREDITS_PER_SECOND: Record<string, number> = {
  "motion-essential": 69,
  "studio-balanced": 119,
  "signature-cinema": 349,
};

export const SASI_SKILLS = [
  { id: "website-architect", glyph: "</>", zh: "网站架构师", en: "Website Architect", noteZh: "从需求生成信息架构、技术栈、数据模型与验收清单。", noteEn: "Turn requirements into architecture, stack, data model and acceptance checks.", modes: ["code"] },
  { id: "repository-builder", glyph: "⌘", zh: "仓库构建者", en: "Repository Builder", noteZh: "按现有代码规范实施、测试并生成可审阅变更。", noteEn: "Implement and verify reviewable changes inside an existing repository.", modes: ["code"] },
  { id: "deployment-guardian", glyph: "↗", zh: "部署守门人", en: "Deployment Guardian", noteZh: "区分提交、部署、域名、环境变量和真实公网状态。", noteEn: "Verify commits, deployment, domains, environment variables and live state.", modes: ["code"] },
  { id: "hit-story-analyzer", glyph: "爆", zh: "爆款故事结构", en: "Hit Story Structure", noteZh: "提取开场钩子、冲突密度、情绪回报与集尾悬念；不复制现有作品。", noteEn: "Extract hooks, conflict density, emotional payoff and cliffhangers without copying existing works.", modes: ["drama"] },
  { id: "character-bible", glyph: "人", zh: "人物身份板", en: "Character Bible", noteZh: "锁定角色外貌、服装、性格、关系和跨镜头连续性。", noteEn: "Lock appearance, wardrobe, personality, relationships and shot continuity.", modes: ["drama"] },
  { id: "storyboard-director", glyph: "景", zh: "故事板导演", en: "Storyboard Director", noteZh: "把剧本拆成可生成的短镜头、机位、动作、对白与转场。", noteEn: "Break scripts into generatable shots, camera, action, dialogue and transitions.", modes: ["drama"] },
  { id: "voice-casting", glyph: "声", zh: "配音与声音设计", en: "Voice & Sound", noteZh: "规划角色音色、语速、情绪、环境声和音乐位置。", noteEn: "Plan voices, pace, emotion, ambience and music cues.", modes: ["drama"] },
  { id: "continuity-auditor", glyph: "✓", zh: "连续性审校", en: "Continuity Auditor", noteZh: "检查人物、道具、空间、时间与对白在各镜头间是否一致。", noteEn: "Check character, prop, space, time and dialogue continuity.", modes: ["drama"] },
] as const;

export const CREDIT_PACKS = [
  { id: "sasi-credit-entry", points: 2000, priceRmb: 20, priceUsd: 3, zh: "创作启程", en: "Creative Start" },
  { id: "sasi-credit-studio", points: 10000, priceRmb: 100, priceUsd: 15, zh: "持续制作", en: "Studio Flow" },
  { id: "sasi-credit-reserve", points: 50000, priceRmb: 500, priceUsd: 75, zh: "工作室储备", en: "Studio Reserve" },
] as const;

export function getSasiCreditPack(id: string) {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}

export function productionQuote(routeId: string, seconds: number) {
  const duration = Math.max(5, Math.min(600, Math.round(seconds)));
  const points = Math.round((ROUTE_CREDITS_PER_SECOND[routeId] ?? 0) * duration);
  return { routeId, duration, points };
}

export function routeForQuality(quality: SasiQuality) {
  return SASI_QUALITY_TIERS.find((item) => item.id === quality)?.routeId ?? "motion-essential";
}

export function budgetAssessment(routeId: string, seconds: number, allocationPoints: number) {
  const quote = productionQuote(routeId, seconds);
  const budget = Math.max(0, Number.isFinite(allocationPoints) ? Math.round(allocationPoints) : 0);
  const ratio = quote.points > 0 ? budget / quote.points : 0;
  const level = ratio >= 1 ? "sufficient" : ratio >= 0.65 ? "tradeoff" : "insufficient";
  return {
    ...quote,
    budget,
    gap: Math.max(0, quote.points - budget),
    level,
    canConfirm: ratio >= 1,
  } as const;
}
