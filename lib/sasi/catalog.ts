export type SasiMode = "code" | "drama" | "skills" | "billing";
export type SasiQuality = "fast" | "balanced" | "cinema";

export type SasiProvider = {
  id: string;
  name: string;
  kind: "code" | "video";
  status: "ready-when-keyed" | "planned";
  costRmbPerSecond?: number;
  sellRmbPerSecond?: number;
  noteZh: string;
  noteEn: string;
};

export const POINTS_PER_RMB = 100;

export const SASI_QUALITY_TIERS = [
  { id: "fast", zh: "快速", en: "Fast", providerId: "veo-lite" },
  { id: "balanced", zh: "高清", en: "High Definition", providerId: "sora-2" },
  { id: "cinema", zh: "电影级", en: "Cinema", providerId: "sora-2-pro" },
] as const;

export const SASI_PROVIDERS: SasiProvider[] = [
  { id: "codex", name: "Codex", kind: "code", status: "ready-when-keyed", noteZh: "复杂编程、修复、测试与仓库级任务", noteEn: "Repository-scale coding, repair and verification" },
  { id: "claude", name: "Claude", kind: "code", status: "ready-when-keyed", noteZh: "长上下文分析、架构与文档", noteEn: "Long-context analysis, architecture and documentation" },
  { id: "grok", name: "Grok", kind: "code", status: "ready-when-keyed", noteZh: "联网研究与快速方案探索", noteEn: "Connected research and rapid solution exploration" },
  { id: "veo-lite", name: "Veo 3.1 Lite", kind: "video", status: "ready-when-keyed", costRmbPerSecond: 0.36, sellRmbPerSecond: 0.69, noteZh: "经济档 · 720p 含声音", noteEn: "Economy · 720p with audio" },
  { id: "sora-2", name: "Sora 2", kind: "video", status: "ready-when-keyed", costRmbPerSecond: 0.71, sellRmbPerSecond: 1.19, noteZh: "均衡档 · 720p 同步声音", noteEn: "Balanced · 720p with synced audio" },
  { id: "sora-2-pro", name: "Sora 2 Pro", kind: "video", status: "ready-when-keyed", costRmbPerSecond: 2.13, sellRmbPerSecond: 3.49, noteZh: "电影档 · 高质量镜头", noteEn: "Cinema · high-quality shots" },
  { id: "veo-standard", name: "Veo 3.1 Standard", kind: "video", status: "ready-when-keyed", costRmbPerSecond: 2.84, sellRmbPerSecond: 4.59, noteZh: "电影档 · 720p/1080p 含声音", noteEn: "Cinema · 720p/1080p with audio" },
];

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
  { id: "sasi-credit-20", rmb: 20, points: 2000 },
  { id: "sasi-credit-100", rmb: 100, points: 10000 },
  { id: "sasi-credit-500", rmb: 500, points: 50000 },
] as const;

export function videoQuote(providerId: string, seconds: number) {
  const provider = SASI_PROVIDERS.find((item) => item.id === providerId && item.kind === "video");
  const duration = Math.max(5, Math.min(600, Math.round(seconds)));
  const cost = Number(((provider?.costRmbPerSecond ?? 0) * duration).toFixed(2));
  const price = Number(((provider?.sellRmbPerSecond ?? 0) * duration).toFixed(2));
  return { provider, duration, cost, price, points: Math.round(price * POINTS_PER_RMB) };
}

export function providerForQuality(quality: SasiQuality) {
  return SASI_QUALITY_TIERS.find((item) => item.id === quality)?.providerId ?? "veo-lite";
}

export function budgetAssessment(providerId: string, seconds: number, budgetRmb: number) {
  const quote = videoQuote(providerId, seconds);
  const budget = Math.max(0, Number.isFinite(budgetRmb) ? budgetRmb : 0);
  const ratio = quote.price > 0 ? budget / quote.price : 0;
  const level = ratio >= 1 ? "sufficient" : ratio >= 0.65 ? "tradeoff" : "insufficient";
  return {
    ...quote,
    budget: Number(budget.toFixed(2)),
    gap: Number(Math.max(0, quote.price - budget).toFixed(2)),
    level,
    canConfirm: ratio >= 1,
  } as const;
}
