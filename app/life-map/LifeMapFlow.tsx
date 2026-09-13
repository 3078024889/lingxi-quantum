"use client";

import { useState, useRef, useEffect } from "react";
import { getCoreType, type WesternElement, type ChineseElement } from "@/lib/lifemap-calc";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";
import { analyzePhoneNumber, analyzePlateNumber } from "@/lib/number-energy-calc";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { lifemapTypeImage, lifemapTypeNameEn } from "@/lib/lifemap-type-images";
import { REVIEW_MODE } from "@/lib/reviewMode";
import FullReportView from "./full/FullReportView";

import { getProduct } from "@/lib/plans";

const LIFEMAP_FAQ: BilingualFaqItem[] = [
  {
    qZh: "生命图谱能够帮助我理解什么？", qEn: "What can a life blueprint help me understand?",
    aZh: "不是。灵犀场并不是一个告诉你「未来会发生什么」的预测工具，而是一处连接自我探索、生命结构理解与意识扩展的数字场域。它通过天文周期、传统象征体系、生命原型、多维叙事与意识探索模型，将这些不同维度的信息重新连接，帮助你从新的角度观察自己——这里不是替你定义人生，而是提供一面更深的镜子，你依然是自己生命的创造者。",
    aEn: "No. Lingxi Field isn't a tool that tells you what will happen next — it's a digital field connecting self-exploration, an understanding of your life structure, and consciousness expansion. Drawing on astronomical cycles, traditional symbolic systems, life archetypes, dimensional narrative, and consciousness models, it reconnects these different dimensions of information to help you observe yourself from a new angle. This isn't about defining your life for you — it's a deeper mirror. You remain the creator of your own life.",
  },
  {
    qZh: "生命图谱需要提供哪些信息？", qEn: "What information does the Life Map need?",
    aZh: "出生日期是基础信息，出生时间与出生地点是更深层的信息节点。信息越完整，灵犀场能够展开的生命结构维度越丰富——但灵犀场并不是简单复制某一种命理体系，出生信息更像是一组进入生命旅程时留下的坐标，不是决定你的程序，而是一组用于观察自己的镜面数据。即使信息不完整，也能展开基础探索；完整信息则能打开更多层次的结构。",
    aEn: "Your birth date is the foundation; birth time and birth place are deeper information nodes. The more complete the information, the richer the dimensions Lingxi Field can unfold — but Lingxi Field isn't simply replicating any one interpretive tradition. Birth information works more like a set of coordinates left behind as you entered this life's journey — not a program that determines you, but mirror data for observing yourself. Even incomplete information opens a basic exploration; complete information opens more layers of structure.",
  },
  {
    qZh: "场域入口的展开和完整生命图谱有什么区别？", qEn: "What's the difference between the field entrance preview and the full Life Map?",
    aZh: "灵犀场不会把生命探索切割成简单的「有」和「没有」。场域入口的展开，是让你先看见生命结构的轮廓——星体象征、生命原型、核心印记、基础频率。完整生命图谱，会进一步展开这些结构之间的连接关系：七大行星象征关系、八字生命结构、紫微结构探索、玛雅印记探索、人生周期导航、财富与创造路径、关系共振地图、灵犀场专属练习。最终形成的是一份属于你的生命探索档案，不是一张简单的生命坐标。",
    aEn: "Lingxi Field doesn't split self-exploration into a simple 'have' or 'don't have.' The entrance preview lets you first see the outline of your life structure — planetary symbols, life archetypes, core imprints, base frequencies. The full Life Map unfolds the connections between these structures further: the seven planets' symbolic relationships, your Bazi life structure, your Ziwei structure, your Maya sign, life cycle navigation, wealth and creative pathways, a relationship resonance map, and a personal Lingxi Field practice. What forms is a complete self-exploration record — not a simple chart.",
  },
  {
    qZh: "生命图谱可以下载PDF吗？", qEn: "Can I save the Life Map as a PDF?",
    aZh: "可以。完整生命图谱生成后，会保存在你的场域入口里，你可以在线查看、下载PDF保存、随时返回回看，也可以删除。它不是一次性的答案，而是一份可以陪伴你持续探索自己的生命档案。",
    aEn: "Yes. Once your full Life Map is generated, it's saved in your field entrance — you can view it online, download it as a PDF, come back to it anytime, or delete it. It isn't a one-time answer; it's a life record that can keep accompanying your ongoing self-exploration.",
  },
];

type Focus = "wealth" | "relationship" | "direction" | "growth" | "all";
type CurrentState = "transforming" | "lost" | "breakthrough" | "stable" | "exploring";

type PlanetPlacement = { signZh: string; signEn: string; element: WesternElement; longitude: number };
type PillarDetail = { ganZhi: string; shiShenGan: string; shiShenZhi: string; naYin: string; diShi: string; hideGan: string[] };
type MayaTzolkin = { sign: string; signEn: string; meaning: string; tone: number; toneZh: string; toneMeaning: string };
type ZiWeiStar = { name: string; brightness: string };
type ZiWeiPalace = { name: string; heavenlyStem: string; earthlyBranch: string; majorStars: ZiWeiStar[]; isSoulPalace: boolean; isBodyPalace: boolean; decadalRange: [number, number] };
type ZiWeiChart = { soulPalaceBranch: string; bodyPalaceBranch: string; fiveElementsClass: string; zodiac: string; palaces: ZiWeiPalace[] };

type VedicPlacement = { signZh: string; signEn: string };
type VedicChart = { ayanamsa: number; sunSidereal: VedicPlacement; moonSidereal: VedicPlacement };

type GateActivation = { key: string; zh: string; en: string; gate: number; line: number; longitude: number };
type HumanDesignResult = { personality: GateActivation[]; design: GateActivation[]; sunConsciousGate: number; sunUnconsciousGate: number };

type Facts = {
  sunSignZh: string; sunSignEn: string; sunElement: WesternElement; sunLongitude: number;
  moonSignZh: string; moonSignEn: string; moonElement: WesternElement; moonLongitude: number;
  mercury: PlanetPlacement; venus: PlanetPlacement; mars: PlanetPlacement; jupiter: PlanetPlacement; saturn: PlanetPlacement;
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
  dayMasterGan: string; dayMasterElement: ChineseElement;
  yearShiShen: string; monthShiShen: string; hourShiShen: string | null;
  daYunStartAge: number | null;
  yearDetail: PillarDetail; monthDetail: PillarDetail; dayDetail: PillarDetail; timeDetail: PillarDetail | null;
  taiYuan: string; taiYuanNaYin: string; mingGong: string; mingGongNaYin: string; shenGong: string; shenGongNaYin: string;
  wuXingCount: Record<ChineseElement, number>;
  maya: MayaTzolkin;
  ziwei: ZiWeiChart | null;
  lifeCode: { number: number; isMaster: boolean };
  vedic: VedicChart;
  humanDesign: HumanDesignResult | null;
};

type ReportData = {
  facts: Facts;
  coreType: { name: string; nameEn: string; essence: string; essenceEn: string };
  narrative: string; // 灵犀生成的正文（含三段：呼应/阶段/关键词）
};

// 未登录时点"解锁完整报告"，会被带去登录页——这一跳会清空所有 React state。
// 这个类型是跳转前存进 sessionStorage 的"草稿"，装着重建这次提交所需的
// 全部信息（包括手机号/车牌号），登录回来后用它自动恢复、接着解锁，
// 不需要用户重新填一遍表单。
type LifeMapDraft = {
  y: number; m: number; d: number; hasTime: boolean; hour: string; minute: string;
  name: string; focus: Focus; currentState: CurrentState;
  energyLevel: number; clarityLevel: number; alignmentLevel: number;
  profession: string; professionCustom: string; relationshipStatus: string; practiceStatus: string;
  phoneNumber: string; plateNumber: string;
  report: ReportData;
  savedAt: number; // 存草稿的时间戳（Date.now()）——用来判断这份草稿是不是"太久远了"
};
const LX_DRAFT_KEY = "lx-lifemap-pending-unlock";

const FOCUS_OPTIONS: { id: Focus; zh: string; en: string }[] = [
  { id: "wealth", zh: "财富与事业", en: "Wealth & Career" },
  { id: "relationship", zh: "感情与关系", en: "Love & Relationships" },
  { id: "direction", zh: "人生方向", en: "Life Direction" },
  { id: "growth", zh: "内在成长", en: "Inner Growth" },
  { id: "all", zh: "全面探索", en: "Full Exploration" },
];

// 职业：覆盖常见大类 + "其他"自定义兜底，而不是穷举每一个具体头衔
// （比如"总统""董事长"这类，落在"领导 · 管理 · 政界"这一类里，用户可以在
// 自定义栏里，写下更具体的头衔，报告解读时会引用这个具体描述）。
const PROFESSION_OPTIONS: { id: string; zh: string; en: string }[] = [
  { id: "student", zh: "学生", en: "Student" },
  { id: "education", zh: "教育 · 科研", en: "Education & Research" },
  { id: "healthcare", zh: "医疗 · 健康", en: "Healthcare" },
  { id: "finance", zh: "金融 · 商业", en: "Finance & Business" },
  { id: "tech", zh: "科技 · 互联网", en: "Tech & Internet" },
  { id: "founder", zh: "创业者", en: "Founder / Entrepreneur" },
  { id: "executive", zh: "高管 · 董事", en: "Executive / Board Member" },
  { id: "leadership", zh: "领导 · 管理 · 政界", en: "Leadership / Government" },
  { id: "military", zh: "军警", en: "Military / Police" },
  { id: "art", zh: "艺术 · 设计", en: "Art & Design" },
  { id: "media", zh: "影视 · 音乐 · 主播", en: "Film, Music & Streaming" },
  { id: "sales", zh: "销售 · 市场", en: "Sales & Marketing" },
  { id: "agriculture", zh: "农林牧渔", en: "Agriculture & Farming" },
  { id: "freelance", zh: "自由职业", en: "Freelance" },
  { id: "unemployed", zh: "待业 · 无业", en: "Between Jobs" },
  { id: "other", zh: "其他（自定义）", en: "Other (specify)" },
];

// 感情状态：作为上下文输入，帮关系章节写得更贴合当下处境，不是用来预测
// "会不会结婚"——单身/恋爱/已婚，三种处境需要的解读角度本来就不同。
const RELATIONSHIP_OPTIONS: { id: string; zh: string; en: string }[] = [
  { id: "single", zh: "单身", en: "Single" },
  { id: "dating", zh: "恋爱中", en: "In a Relationship" },
  { id: "married", zh: "已婚", en: "Married" },
  { id: "complicated", zh: "说不清楚", en: "It's Complicated" },
  { id: "prefer-not", zh: "不想说", en: "Prefer not to say" },
];

// 是否有修炼习惯：作为上下文输入，让"专属灵犀练习"那一章的落笔角度更贴合——
// 已经在修炼的人，练习建议可以更进阶；没有基础但感兴趣的人，练习建议会
// 自然带出site内"修炼技术"板块可以进一步探索，不是硬广告式的推销。
const PRACTICE_OPTIONS: { id: string; zh: string; en: string }[] = [
  { id: "regular", zh: "有稳定的修炼习惯", en: "I have a regular practice" },
  { id: "occasional", zh: "偶尔练习，不算规律", en: "I practice occasionally" },
  { id: "curious", zh: "没有，但很感兴趣", en: "No, but I'm curious" },
  { id: "none", zh: "没有，也不确定感不感兴趣", en: "No, and I'm not sure yet" },
];

const STATE_OPTIONS: { id: CurrentState; zh: string; en: string }[] = [
  { id: "transforming", zh: "正在转变期", en: "In a period of change" },
  { id: "lost", zh: "感觉迷茫", en: "Feeling lost" },
  { id: "breakthrough", zh: "寻找突破", en: "Seeking a breakthrough" },
  { id: "stable", zh: "稳定成长", en: "Growing steadily" },
  { id: "exploring", zh: "探索未知", en: "Exploring the unknown" },
];

const LOADING_STEPS = [
  { zh: "正在连接你的生命信息结构\u2026", en: "Connecting to your life information structure\u2026" },
  { zh: "✨ 推算七大行星的真实位置", en: "✨ Calculating the true positions of seven planets" },
  { zh: "✨ 排布你的四柱八字与十神", en: "✨ Charting your Four Pillars and Ten Gods" },
  { zh: "✨ 排布你的紫微生命坐标", en: "✨ Charting your Ziwei Doushu palaces" },
  { zh: "✨ 换算玛雅Tzolkin圣历印记", en: "✨ Converting your Maya Tzolkin day sign" },
  { zh: "✨ 交叉五套系统，生成你的核心类型", en: "✨ Cross-referencing five systems into your core type" },
];

export default function LifeMapFlow({ initialArchiveId }: { initialArchiveId?: string }) {
  // 双语状态：首次渲染（服务端与客户端 hydration 那一刻）都固定为 false，
  // 避免服务端不知道语言偏好、客户端却立刻读到 lang-en 导致的 hydration 不匹配报错
  // （React #418/#423/#425 那组错误，根源就在这里）。挂载后再用 useEffect 更新为真实语言。
  const [langEn, setLangEn] = useState(false);
  useEffect(() => {
    setLangEn(document.documentElement.classList.contains("lang-en"));
    const observer = new MutationObserver(() => {
      setLangEn(document.documentElement.classList.contains("lang-en"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const isEn = () => langEn;
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const [name, setName] = useState("");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hasTime, setHasTime] = useState(true);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [profession, setProfession] = useState("");
  const [professionCustom, setProfessionCustom] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [practiceStatus, setPracticeStatus] = useState("");
  const [focus, setFocus] = useState<Focus>("all");
  const [currentState, setCurrentState] = useState<CurrentState>("exploring");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [clarityLevel, setClarityLevel] = useState(3);
  const [alignmentLevel, setAlignmentLevel] = useState(3);
  const [loadingStep, setLoadingStep] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  // 登录跳转回来后，如果发现有未完成的解锁草稿，先放在这里等用户确认，
  // 不直接自动下单——避免"随便打开一下页面"就被静默带去付款页那种bug。
  const [resumedDraft, setResumedDraft] = useState<LifeMapDraft | null>(null);
  const [columnMode, setColumnMode] = useState<"balanced" | "input" | "preview" | "archive">(initialArchiveId ? "archive" : "balanced");
  const [mobilePane, setMobilePane] = useState<"input" | "preview" | "archive">(initialArchiveId ? "archive" : "input");
  const formTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialArchiveId) return;
    const restoreArchivePreview = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("life_map_submissions")
        .select("core_type_name, facts, free_narrative")
        .eq("id", initialArchiveId)
        .single();
      if (!submission?.facts || !submission?.free_narrative) return;
      const coreName = submission.core_type_name || "";
      setReport({
        facts: submission.facts as Facts,
        coreType: { name: coreName, nameEn: lifemapTypeNameEn(coreName) || coreName, essence: "", essenceEn: "" },
        narrative: submission.free_narrative,
      });
      setSubmissionId(initialArchiveId);
      setMobilePane("archive");
    };
    restoreArchivePreview();
  }, [initialArchiveId]);

  // 保存这份提交记录到 life_map_submissions 表，成功则记下 id 供解锁完整报告使用。
  // 失败时，把 Supabase/接口返回的真实错误打到 console，方便定位问题
  // （最常见的原因：还没在 Supabase SQL Editor 里跑过最新的 supabase/schema.sql，
  // 导致 life_map_submissions 这张表在数据库里还不存在）。
  const trySaveSubmission = async (args: {
    y: number; m: number; d: number; hasTime: boolean; hour: string; minute: string;
    facts: Facts; coreType: { name: string; nameEn: string };
    freeNarrative: string; focusLabel: { zh: string }; stateLabel: { zh: string };
    energyLevel: number; clarityLevel: number; alignmentLevel: number; name: string;
    professionLabel?: string; relationshipLabel?: string; practiceLabel?: string;
    phoneReading?: string; plateReading?: string;
  }): Promise<{ id: string | null; specificError: string | null }> => {
    try {
      // 客户端在此处才真正创建 Supabase 实例——只在用户交互触发的函数内部创建，
      // 绝不放在组件顶层：放在顶层会在 Next.js 构建时的服务端预渲染阶段也执行到，
      // 如果那个阶段环境变量不可用，会直接导致整个页面构建失败。
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { id: null, specificError: null };
      const saveRes = await fetch("/api/lifemap/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: args.name.trim() || null,
          birthInput: {
            year: args.y, month: args.m, day: args.d,
            hour: args.hasTime ? parseInt(args.hour, 10) || 0 : 12,
            minute: args.hasTime ? parseInt(args.minute, 10) || 0 : 0,
            hasTime: args.hasTime,
          },
          facts: args.facts,
          coreTypeName: isEn() ? args.coreType.nameEn : args.coreType.name,
          freeNarrative: args.freeNarrative,
          focus:
            args.focusLabel.zh +
            (args.professionLabel ? ` · 职业：${args.professionLabel}` : "") +
            (args.relationshipLabel ? ` · 感情状态：${args.relationshipLabel}` : "") +
            (args.practiceLabel ? ` · 修炼习惯：${args.practiceLabel}` : "") +
            (args.phoneReading ? ` · 手机号数字能量：${args.phoneReading}` : "") +
            (args.plateReading ? ` · 车牌号数字能量：${args.plateReading}` : ""),
          currentState: args.stateLabel.zh,
          energyLevel: args.energyLevel, clarityLevel: args.clarityLevel, alignmentLevel: args.alignmentLevel,
        }),
      });
      const saveData = await saveRes.json();
      if (saveRes.ok && saveData.id) {
        setSubmissionId(saveData.id);
        return { id: saveData.id as string, specificError: null };
      }
      console.error("保存生命图谱提交记录失败:", saveRes.status, saveData);
      // Postgres 错误码 42P01 = 表不存在，这是最常见的根因，直接给出明确的修复指令
      const specificError =
        saveData.code === "42P01"
          ? t(
              "数据库里还没有 life_map_submissions 这张表。请打开 Supabase 后台 → SQL Editor，粘贴运行项目里 supabase/schema.sql 的全部内容，运行完再回来重试。",
              "The life_map_submissions table doesn't exist in your database yet. Open Supabase → SQL Editor, paste and run the full contents of supabase/schema.sql, then come back and try again."
            )
          : null;
      return { id: null, specificError };
    } catch (e) {
      console.error("保存生命图谱提交记录出错:", e);
      return { id: null, specificError: null };
    }
  };

  const submit = async () => {
    const y = parseInt(year, 10), m = parseInt(month, 10), d = parseInt(day, 10);
    if (!y || !m || !d || y < 1 || y > new Date().getFullYear() || m < 1 || m > 12 || d < 1 || d > 31) {
      setError(t("请填写完整、有效的出生日期（年份支持公元1年至今，暂不支持公元前）。", "Please enter a complete, valid birth date (year 1 CE to present; BCE dates aren't supported yet)."));
      return;
    }
    setError("");
    setCalculating(true);
    setLoadingStep(0);
    const stepTimer = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1200);

    try {
      // 计算走服务端 API（含真实天文 + 八字算法），避免把算法逻辑暴露在客户端 bundle 里，也便于以后统一升级算法
      const calcRes = await fetch("/api/lifemap/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: y, month: m, day: d,
          hour: hasTime ? parseInt(hour, 10) || 0 : 12,
          minute: hasTime ? parseInt(minute, 10) || 0 : 0,
          hasTime, gender, calendarType,
        }),
      });
      const facts: Facts = await calcRes.json();
      if (!calcRes.ok) throw new Error("calc failed");

      const coreType = getCoreType(facts.sunElement, facts.dayMasterElement);

      const focusLabel = FOCUS_OPTIONS.find((f) => f.id === focus)!;
      const stateLabel = STATE_OPTIONS.find((s) => s.id === currentState)!;
      const professionOpt = PROFESSION_OPTIONS.find((p) => p.id === profession);
      const professionLabel = profession === "other" ? professionCustom.trim() : professionOpt?.zh || "";
      const relationshipLabel = RELATIONSHIP_OPTIONS.find((r) => r.id === relationshipStatus)?.zh || "";
      const practiceLabel = PRACTICE_OPTIONS.find((p) => p.id === practiceStatus)?.zh || "";
      // 免费预览必须在没有外部模型密钥时也稳定可用。它只使用上面已经算出的
      // 天文、历法节点和用户亲自填写的状态，生成一份确定性的入口解读；
      // 付费完整报告仍由带登录与付款校验的独立接口生成。
      const clarityWord = clarityLevel <= 2 ? t("澄明", "Clarity") : t("定向", "Direction");
      const energyWord = energyLevel <= 2 ? t("蓄能", "Renewal") : t("行动", "Action");
      const alignmentWord = alignmentLevel <= 2 ? t("校准", "Alignment") : t("一致", "Coherence");
      const freeNarrative = isEn()
        ? `Your calculated chart brings ${coreType.nameEn} into focus: a ${facts.sunSignEn} Sun meeting the day-master signature ${facts.dayMasterGan}. This is not a prediction of a fixed future. It is a structured mirror for noticing how you direct attention, choose and act around ${focusLabel.en.toLowerCase()}.\n\n${stateLabel.en}|You described this moment as “${stateLabel.en.toLowerCase()}.” Begin by working with what is present now: energy ${energyLevel}/5, clarity ${clarityLevel}/5 and alignment ${alignmentLevel}/5. The useful next step is the one you can repeat in real life.\n\n${clarityWord},Name the decision that most needs a clear answer|${energyWord},Choose one action that matches the energy available today|${alignmentWord},Notice where your daily choice and inner value can move closer together`
        : `真实排盘显示，你的核心生命原型为「${coreType.name}」：太阳落在${facts.sunSignZh}，并与日主「${facts.dayMasterGan}」共同构成这次生命结构入口。这不是对固定未来的预测，而是一面帮助你观察注意力、选择与行动方式的结构镜面；你此刻最想看清的是「${focusLabel.zh}」。\n\n${stateLabel.zh}|你把当下描述为「${stateLabel.zh}」。先不急着寻找一个包办人生的答案，从此刻真实状态开始：能量 ${energyLevel}/5、清晰度 ${clarityLevel}/5、内外对齐 ${alignmentLevel}/5。真正有用的下一步，是你能带回现实并持续验证的那一步。\n\n${clarityWord},写下当前最需要明确回答的一个选择|${energyWord},选择一个符合今天真实能量的具体行动|${alignmentWord},观察日常选择与内在价值可以靠近的地方`;

      clearInterval(stepTimer);
      setReport({ facts, coreType, narrative: freeNarrative });
      setCalculating(false);
      setMobilePane("preview");

      // 若已登录，保存这份提交记录，供之后解锁完整报告时使用；未登录则跳过，
      // 解锁完整报告时会引导先登录。手机号/车牌号如果填了，这里也折进去一起存——
      // 免费预览里显示的解读只是即时算出来展示一下，真正要留到付费完整报告里
      // 用，必须存进这条记录，不然后面解锁报告的时候，这两项数据已经不在了，
      // 等于白填。
      const phoneReading = phoneNumber.trim() ? (() => {
        const r = analyzePhoneNumber(phoneNumber);
        return `${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
      })() : undefined;
      const plateReading = plateNumber.trim() ? (() => {
        const r = analyzePlateNumber(plateNumber);
        return `${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
      })() : undefined;
      await trySaveSubmission({
        y, m, d, hasTime, hour, minute,
        facts, coreType, freeNarrative,
        focusLabel, stateLabel, energyLevel, clarityLevel, alignmentLevel, name,
        professionLabel, relationshipLabel, practiceLabel,
        phoneReading, plateReading,
      });
    } catch {
      clearInterval(stepTimer);
      setError(t("场域连接不稳定，请重试一次。", "The field connection was unstable — please try again."));
      setCalculating(false);
    }
  };

  const unlockFull = async () => {
    setUnlocking(true);
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // 之前这里直接跳转登录页，会把整个页面的 React state 清空——如果用户
        // 在"基础信息"里填了手机号/车牌号，这份数据从来没被存过（下面
        // trySaveSubmission 在未登录时会直接跳过存库），跳去登录页这一下，
        // 手机号/车牌号就真的丢了，等登录回来，报告里自然不会有这一节。
        // 这里改成：跳转前，先把这次提交需要的全部信息存进 sessionStorage，
        // 登录回来后由下面那个 effect 自动恢复并接着完成解锁，不需要用户
        // 重新填一遍。
        try {
          if (report) {
            const draft: LifeMapDraft = {
              y: parseInt(year, 10), m: parseInt(month, 10), d: parseInt(day, 10),
              hasTime, hour, minute, name, focus, currentState,
              energyLevel, clarityLevel, alignmentLevel,
              profession, professionCustom, relationshipStatus, practiceStatus,
              phoneNumber, plateNumber, report,
              savedAt: Date.now(),
            };
            sessionStorage.setItem(LX_DRAFT_KEY, JSON.stringify(draft));
          }
        } catch {
          // sessionStorage 不可用（隐私模式等）就算了，不阻塞正常的登录跳转
        }
        setError(t("需要先登录，正在带你去登录页面…", "You'll need to sign in first — taking you there now…"));
        setTimeout(() => { window.location.href = "/account"; }, 1200);
        return;
      }
      let id = submissionId;
      if (!id) {
        // 先重试保存一次，而不是直接放弃——常见原因是首次自动保存时网络还没就绪
        let specificError: string | null = null;
        if (report) {
          const focusLabel = FOCUS_OPTIONS.find((f) => f.id === focus)!;
          const stateLabel = STATE_OPTIONS.find((s) => s.id === currentState)!;
          const professionOpt2 = PROFESSION_OPTIONS.find((p) => p.id === profession);
          const professionLabel = profession === "other" ? professionCustom.trim() : professionOpt2?.zh || "";
          const relationshipLabel = RELATIONSHIP_OPTIONS.find((r) => r.id === relationshipStatus)?.zh || "";
          const practiceLabel = PRACTICE_OPTIONS.find((p) => p.id === practiceStatus)?.zh || "";
          const phoneReading2 = phoneNumber.trim() ? (() => {
            const r = analyzePhoneNumber(phoneNumber);
            return `${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
          })() : undefined;
          const plateReading2 = plateNumber.trim() ? (() => {
            const r = analyzePlateNumber(plateNumber);
            return `${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
          })() : undefined;
          const y = parseInt(year, 10), m = parseInt(month, 10), d = parseInt(day, 10);
          const result = await trySaveSubmission({
            y, m, d, hasTime, hour, minute,
            facts: report.facts, coreType: report.coreType, freeNarrative: report.narrative,
            focusLabel, stateLabel, energyLevel, clarityLevel, alignmentLevel, name,
            professionLabel, relationshipLabel, practiceLabel,
            phoneReading: phoneReading2, plateReading: plateReading2,
          });
          id = result.id;
          specificError = result.specificError;
        }
        if (!id) {
          setError(
            specificError ||
              t(
                "提交记录保存失败，可能是数据库还没准备好（请确认已在 Supabase 运行过最新的 schema.sql），或网络不稳定。请打开浏览器控制台查看具体错误后重试。",
                "Saving your submission failed — possibly the database isn't set up yet (please confirm the latest schema.sql has been run in Supabase), or a network issue. Check the browser console for the specific error and try again."
              )
          );
          setUnlocking(false);
          return;
        }
      }
      if (REVIEW_MODE) {
        window.location.href = `/life-map?archive=${id}`;
        return;
      }
      // v256：改成跳转到独立付款页，不再用弹窗。
      window.location.href = `/checkout?productId=life-map-report&submissionId=${id}&name=${encodeURIComponent(name)}&redirect=${encodeURIComponent(`/life-map?archive=${id}`)}`;
    } catch (e) {
      console.error("解锁完整报告出错:", e);
      setError(t("网络错误，请稍后再试。", "Network error, please try again later."));
      setUnlocking(false);
    }
  };

  // 登录回来后，检查 sessionStorage 里有没有跳转前存的草稿——有，且现在确实
  // 已经登录了，就自动恢复表单/报告状态，并直接接着完成"保存提交记录 + 下单"，
  // 用户不需要再点一次解锁、更不需要重新填手机号/车牌号。
  // 登录回来后，检查 sessionStorage 里有没有跳转前存的草稿——有，且现在确实
  // 已经登录了，就自动恢复表单/报告状态，但**不会**自动帮用户下单付款——
  // 这一步必须由用户自己点一下确认。之前是检测到草稿就直接自动下单、
  // 直接跳转 PayPal，结果测试/调试过程中留下的旧草稿，会在用户毫无预期
  // 的情况下，让"随便打开一下生命图谱页面"这个动作，直接冲去了付款页，
  // 体验上非常突兀，也不安全——谁都不该被"静默"带去一个要花钱的页面。
  useEffect(() => {
    const resume = async () => {
      let raw: string | null = null;
      try {
        raw = sessionStorage.getItem(LX_DRAFT_KEY);
      } catch {
        return;
      }
      if (!raw) return;

      let draft: LifeMapDraft;
      try {
        draft = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem(LX_DRAFT_KEY);
        return;
      }
      sessionStorage.removeItem(LX_DRAFT_KEY);

      // 草稿超过2小时就不再当作"刚才那次没走完的操作"，直接丢弃——
      // 避免很久以前调试/测试时留下的草稿，某天被无缘无故地翻出来用。
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      if (!draft.savedAt || Date.now() - draft.savedAt > TWO_HOURS) return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return; // 还没登录，草稿已经清了，等用户重新走一遍就好，不强求"找回"

      // 只恢复画面显示，不自动下单、不自动跳PayPal——用户看到自己填过的
      // 报告，和一个"继续解锁"的按钮，自己决定要不要接着付款。
      setYear(String(draft.y)); setMonth(String(draft.m)); setDay(String(draft.d));
      setHasTime(draft.hasTime); setHour(draft.hour); setMinute(draft.minute);
      setName(draft.name); setFocus(draft.focus); setCurrentState(draft.currentState);
      setEnergyLevel(draft.energyLevel); setClarityLevel(draft.clarityLevel); setAlignmentLevel(draft.alignmentLevel);
      setProfession(draft.profession); setProfessionCustom(draft.professionCustom);
      setRelationshipStatus(draft.relationshipStatus); setPracticeStatus(draft.practiceStatus);
      setPhoneNumber(draft.phoneNumber); setPlateNumber(draft.plateNumber);
      setReport(draft.report);
      setResumedDraft(draft);
    };
    resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 用户在"继续解锁"横幅里点了确认，才真正发起存库+下单——是上面 resume()
  // 曾经自动做的事，现在挪到这里，变成需要用户主动点一下才会执行。
  const confirmResumedUnlock = async () => {
    const draft = resumedDraft;
    if (!draft) return;
    setResumedDraft(null);
    setUnlocking(true);
    setError(t("正在继续为你解锁完整报告…", "Resuming your unlock…"));

    const focusLabel = FOCUS_OPTIONS.find((f) => f.id === draft.focus)!;
    const stateLabel = STATE_OPTIONS.find((s) => s.id === draft.currentState)!;
    const professionOpt = PROFESSION_OPTIONS.find((p) => p.id === draft.profession);
    const professionLabel = draft.profession === "other" ? draft.professionCustom.trim() : professionOpt?.zh || "";
    const relationshipLabel = RELATIONSHIP_OPTIONS.find((r) => r.id === draft.relationshipStatus)?.zh || "";
    const practiceLabel = PRACTICE_OPTIONS.find((p) => p.id === draft.practiceStatus)?.zh || "";
    const phoneReading = draft.phoneNumber.trim() ? (() => {
      const r = analyzePhoneNumber(draft.phoneNumber);
      return `${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
    })() : undefined;
    const plateReading = draft.plateNumber.trim() ? (() => {
      const r = analyzePlateNumber(draft.plateNumber);
      return `${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
    })() : undefined;

    const result = await trySaveSubmission({
      y: draft.y, m: draft.m, d: draft.d, hasTime: draft.hasTime, hour: draft.hour, minute: draft.minute,
      facts: draft.report.facts, coreType: draft.report.coreType, freeNarrative: draft.report.narrative,
      focusLabel, stateLabel, energyLevel: draft.energyLevel, clarityLevel: draft.clarityLevel, alignmentLevel: draft.alignmentLevel,
      name: draft.name, professionLabel, relationshipLabel, practiceLabel,
      phoneReading, plateReading,
    });
    if (!result.id) {
      setUnlocking(false);
      setError(
        result.specificError ||
          t("信息已恢复，请再点一次「解锁完整报告」。", "Your info has been restored — please tap Unlock Full Report once more.")
      );
      return;
    }
    setSubmissionId(result.id);
    if (REVIEW_MODE) {
      window.location.href = `/life-map?archive=${result.id}`;
      return;
    }
    // v256：改成跳转到独立付款页，不再用弹窗。
    window.location.href = `/checkout?productId=life-map-report&submissionId=${result.id}&name=${encodeURIComponent(name)}&redirect=${encodeURIComponent(`/life-map?archive=${result.id}`)}`;
  };

  // ---------- 解析灵犀返回的三段式正文 ----------
  const parsed = (() => {
    if (!report) return null;
    const parts = stripMarkdownArtifacts(report.narrative).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const echoText = parts[0] || "";
    const normalizeDelims = (s: string) => s.replace(/[｜]/g, "|").replace(/[，、]/g, ",");
    let [stageName, stageDesc] = normalizeDelims(parts[1] || "").split("|").map((s) => s?.trim());
    // 兜底：AI有小概率把提示词格式说明里的占位符（"阶段名称"这四个字
    // 本身）原样抄回来，当成真实的阶段名——这种情况必须识别出来，
    // 不能把占位符原样展示给用户看到"「阶段名称」"这种没有实际内容
    // 的结果。
    if (stageName && /^【?阶段名称】?$/.test(stageName.trim())) {
      stageName = "";
    }
    const keywordParts = normalizeDelims(parts[2] || "").split("|").map((s) => s.trim()).filter(Boolean);
    const keywords = keywordParts
      .map((kp) => {
        // 之前这里要求每组必须严格是"词,说明"两段，AI如果在说明文字里
        // 多写了一个逗号（比如"自我觉察,清晰,有深度"，被逗号切成3段），
        // 整组会被当成格式不对直接丢弃——这正是"三个关键词只显示两个"
        // 的真正原因，不是显示层的问题，是这三段被解析代码悄悄扔掉了
        // 一段。现在改成：只要第一段是关键词本身，其余不管有几段，
        // 都合并回说明文字里，不再因为多一个逗号就丢掉整组内容。
        const bits = kp.split(",").map((s) => s?.trim()).filter(Boolean);
        if (bits.length < 2) return null;
        return [bits[0], bits.slice(1).join("，")] as [string, string];
      })
      .filter((pair): pair is [string, string] => {
        if (!pair || pair[0].length > 8) return false;
        // 兜底：AI有小概率把提示词里给它看的占位符（"关键词1""说明1"
        // 这种字样）原样抄回来，当成真实内容——这种情况词本身很短，
        // 能通过长度校验，得单独用正则抓出来剔除。
        if (/^【?关键词\s*\d/.test(pair[0]) || /^说明\s*\d/.test(pair[1])) return false;
        return true;
      })
      .map(([w, d]) => ({ word: w, desc: d }));
    return { echoText, stageName: stageName || "", stageDesc: stageDesc || "", keywords };
  })();
  const profileSignals = [year, month, day, name, city, phoneNumber, plateNumber, profession, relationshipStatus, practiceStatus];
  const completionPercent = Math.round((profileSignals.filter((value) => value.trim().length > 0).length / profileSignals.length) * 100);

  return (
    <div ref={formTopRef}>
      <section className="lm-workbench-shell">
          <div className="lm-mobile-tabs" role="tablist" aria-label={t("生命图谱步骤", "Life Map steps")}>
            {(["input", "preview", "archive"] as const).map((pane, index) => <button key={pane} type="button" role="tab" aria-selected={mobilePane === pane} onClick={() => setMobilePane(pane)} className={mobilePane === pane ? "is-active" : ""}><b>{index + 1}</b>{pane === "input" ? t("填写", "Input") : pane === "preview" ? t("预览", "Preview") : t("档案", "Archive")}</button>)}
          </div>
          <div className="lm-column-controls" aria-label={t("工作区宽度", "Workspace width")}>
            <span><Bi zh="工作区视图" en="Workspace view" /></span>
            {(["balanced", "input", "preview", "archive"] as const).map((mode) => <button key={mode} type="button" onClick={() => setColumnMode(mode)} className={columnMode === mode ? "is-active" : ""}>{mode === "balanced" ? t("均衡", "Balanced") : mode === "input" ? t("放大填写", "Enlarge input") : mode === "preview" ? t("放大预览", "Enlarge preview") : t("放大档案", "Enlarge archive")}</button>)}
          </div>
          <div className={`lm-workbench-grid is-${columnMode}`}>
          <div className={`lm-workbench-column lm-workbench-form bg-reading-glass ${mobilePane === "input" ? "is-mobile-active" : ""}`}>
            <div className="lm-column-title"><b>1</b><div><h2><Bi zh="填写信息" en="Enter Your Details" /></h2><p><Bi zh="填写真实信息，开启你的生命探索" en="Use real details to begin your exploration" /></p></div></div>

            <div className="lm-restored-intro"><FieldProductIntroduction href="/life-map" compact targetId="lifemap-birth-input" /></div>
            <details id="lifemap-birth-input" className="lm-form-group" open>
              <summary><span><b>01</b><Bi zh="身份与出生" en="Identity and birth" /></span><small><Bi zh="基础坐标" en="Core coordinates" /></small></summary>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-lm2-text-dim"><Bi zh="姓名（选填）" en="Name (optional)" /></label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t("名字是一种身份频率符号", "A name is a symbol of your identity frequency")}
                  className="mt-2 w-full rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60"
                />
              </div>

              <div>
                <label className="block text-sm text-lm2-text-dim"><Bi zh="出生日期" en="Birth Date" /></label>
                <p className="mt-1 text-xs leading-5 text-lm2-text-dim/80">
                  <Bi
                    zh="请选择实际使用的历法：阳历（公历）或农历。两种历法并不相同，通常身份证日期为阳历，知晓是农历的选农历；海外用户一般直接选择阳历。若补充具体出生时刻，图谱可展开更细的时间层次与结构连接。"
                    en="Choose the calendar actually used for this date: Gregorian (solar) or Chinese lunar. They are different calendar systems. Dates on identity documents are usually Gregorian; choose lunar only when you know the recorded date is lunar. Users outside China can generally choose Gregorian. Adding the specific birth time can reveal finer time layers and structural connections."
                  />
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button onClick={() => setCalendarType("solar")} className={`rounded-sm border px-4 py-3 text-sm transition ${calendarType === "solar" ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh="阳历（公历）" en="Gregorian (Solar)" />
                  </button>
                  <button onClick={() => setCalendarType("lunar")} className={`rounded-sm border px-4 py-3 text-sm transition ${calendarType === "lunar" ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh="农历（中国传统历法）" en="Chinese Lunar Calendar" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <input value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Year")} inputMode="numeric" className="rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60" />
                  <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder={calendarType === "lunar" ? t("农历月", "Lunar Month") : t("月", "Month")} inputMode="numeric" className="rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60" />
                  <input value={day} onChange={(e) => setDay(e.target.value)} placeholder={calendarType === "lunar" ? t("农历日", "Lunar Day") : t("日", "Day")} inputMode="numeric" className="rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-lm2-text-dim"><Bi zh="具体出生时刻（选填）" en="Specific birth time (optional)" /></label>
                  <button onClick={() => setHasTime((v) => !v)} className="text-xs text-lm2-violet underline underline-offset-4">
                    {hasTime ? t("不知道也可以", "I don't know it") : t("我知道具体时间", "I know the exact time")}
                  </button>
                </div>
                {hasTime && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时 (0-23)", "Hour (0-23)")} inputMode="numeric" className="rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60" />
                    <input value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Minute")} inputMode="numeric" className="rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60" />
                  </div>
                )}
              </div>
            </div>
            </details>

            <details className="lm-form-group">
              <summary><span><b>02</b><Bi zh="补充坐标" en="Additional coordinates" /></span><small>{t(`已填 ${[city, phoneNumber, plateNumber, gender].filter(Boolean).length}/4`, `${[city, phoneNumber, plateNumber, gender].filter(Boolean).length}/4 complete`)}</small></summary>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-lm2-text-dim"><Bi zh="出生地点（选填）" en="Birth City (optional)" /></label>
                <input
                  value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder={t("城市", "City")}
                  className="mt-2 w-full rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60"
                />
              </div>

              <div>
                <label className="block text-sm text-lm2-text-dim">
                  <Bi zh="手机号（选填，会一并生成数字能量解读）" en="Phone number (optional — a number-energy reading will be included)" />
                </label>
                <input
                  value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("138 0000 0000", "e.g. 138 0000 0000")}
                  className="mt-2 w-full rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60"
                />
              </div>

              <div>
                <label className="block text-sm text-lm2-text-dim">
                  <Bi zh="车牌号（选填，只取数字部分测算）" en="License plate (optional — only the digits are used)" />
                </label>
                <input
                  value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder={t("京A 88888", "e.g. ABC 8888")}
                  className="mt-2 w-full rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60"
                />
              </div>

              <div>
                <label className="block text-sm text-lm2-text-dim">
                  <Bi zh="性别" en="Gender" />
                  <span className="ml-2 text-xs text-lm2-text-dim/72"><Bi zh="（紫微斗数排大限方向需要）" en="(needed for Zi Wei Dou Shu's decade-cycle direction)" /></span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button onClick={() => setGender("female")} className={`rounded-sm border px-4 py-3 text-sm transition ${gender === "female" ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh="女" en="Female" />
                  </button>
                  <button onClick={() => setGender("male")} className={`rounded-sm border px-4 py-3 text-sm transition ${gender === "male" ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh="男" en="Male" />
                  </button>
                </div>
              </div>
            </div>
            </details>

            <details className="lm-form-group">
              <summary><span><b>03</b><Bi zh="当前人生状态" en="Where you are now" /></span><small><Bi zh="选择与语境" en="Choices and context" /></small></summary>
            <div>
              <p className="text-sm text-lm2-text-dim"><Bi zh="你目前最想探索：" en="What you most want to explore right now:" /></p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FOCUS_OPTIONS.map((f) => (
                  <button key={f.id} onClick={() => setFocus(f.id)}
                    className={`rounded-sm border px-4 py-3 text-left text-sm transition ${focus === f.id ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh={f.zh} en={f.en} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-lm2-text-dim"><Bi zh="你的职业（选填，帮助财富与事业章节写得更具体）：" en="Your profession (optional — helps the career section speak to your actual work):" /></p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PROFESSION_OPTIONS.map((p) => (
                  <button key={p.id} onClick={() => setProfession(p.id)}
                    className={`rounded-sm border px-3 py-2.5 text-left text-xs transition ${profession === p.id ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh={p.zh} en={p.en} />
                  </button>
                ))}
              </div>
              {profession === "other" && (
                <input
                  value={professionCustom} onChange={(e) => setProfessionCustom(e.target.value)}
                  placeholder={t("具体是什么工作？", "What do you do?")}
                  className="mt-3 w-full rounded-sm border border-lm2-text/15 bg-lm2-bg px-4 py-3 text-lm2-text outline-none focus:border-lm2-violet/60"
                />
              )}
            </div>

            <div className="mt-8">
              <p className="text-sm text-lm2-text-dim"><Bi zh="当前感情状态（选填，帮助关系章节写得更贴合处境）：" en="Current relationship status (optional — helps the relationship section speak to your situation):" /></p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <button key={r.id} onClick={() => setRelationshipStatus(r.id)}
                    className={`rounded-sm border px-3 py-2.5 text-center text-xs transition ${relationshipStatus === r.id ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh={r.zh} en={r.en} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-lm2-text-dim"><Bi zh="是否有修炼/静心练习的习惯（选填）：" en="Do you have a practice / meditation habit (optional):" /></p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRACTICE_OPTIONS.map((p) => (
                  <button key={p.id} onClick={() => setPracticeStatus(p.id)}
                    className={`rounded-sm border px-3 py-2.5 text-center text-xs transition ${practiceStatus === p.id ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh={p.zh} en={p.en} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-lm2-text-dim"><Bi zh="最近你的状态：" en="Your state recently:" /></p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STATE_OPTIONS.map((s) => (
                  <button key={s.id} onClick={() => setCurrentState(s.id)}
                    className={`rounded-sm border px-4 py-3 text-left text-sm transition ${currentState === s.id ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh={s.zh} en={s.en} />
                  </button>
                ))}
              </div>
            </div>
            </details>

            <details className="lm-form-group">
              <summary><span><b>04</b><Bi zh="当前频率自测" en="Current frequency" /></span><small><Bi zh="3 项已就绪" en="3 measures ready" /></small></summary>
            <p className="max-w-md text-sm leading-7 text-lm2-text-dim">
              <Bi
                zh="生命坐标给出的是你与生俱来的结构，这三项，则是你此刻真实的状态——两者放在一起看，报告才知道，该把重点，放在哪里。"
                en="Your chart shows the structure you were born with. These three ratings show where you actually are right now — together, they tell the report where to focus."
              />
            </p>
            <div className="mt-8 space-y-6">
              {[
                { label: t("能量水平", "Energy Level"), sub: t("此刻，你感觉自己有多少行动的力气？", "Right now, how much drive do you feel to act?"), v: energyLevel, set: setEnergyLevel },
                { label: t("头脑清晰度", "Mental Clarity"), sub: t("此刻，你对自己想要什么，有多清楚？", "Right now, how clear are you on what you want?"), v: clarityLevel, set: setClarityLevel },
                { label: t("内外对齐感", "Sense of Alignment"), sub: t("此刻，你的生活方式，与你真正相信的东西，有多一致？", "Right now, how aligned does your daily life feel with what you actually believe?"), v: alignmentLevel, set: setAlignmentLevel },
              ].map((f) => (
                <div key={f.label}>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-lm2-text">{f.label}</p>
                    <p className="font-display text-lg text-lm2-violet">{f.v}<span className="text-xs text-lm2-text-dim/72">/5</span></p>
                  </div>
                  <p className="mt-1 text-xs text-lm2-text-dim/80">{f.sub}</p>
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => f.set(n)}
                        className={`h-8 flex-1 rounded-sm border transition ${n <= f.v ? "border-lm2-violet bg-lm2-violet/40" : "bg-lm2-card border-lm2-text/12"}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </details>

            {error && <p className="mt-6 text-sm text-rose">{error}</p>}

            <FaqSection items={LIFEMAP_FAQ} />
            <div className="lm-form-action">
              <div><span style={{ width: `${Math.max(8, completionPercent)}%` }} /><small>{t(`资料充实度 ${completionPercent}%`, `Profile depth ${completionPercent}%`)}</small></div>
              <button onClick={submit} disabled={calculating} className="lm-primary-button w-full">{calculating ? t("正在生成真实预览…", "Calculating your real preview…") : report ? t("更新我的免费预览", "Update my free preview") : t("生成免费预览", "Generate free preview")}</button>
            </div>
          </div>

          <div className={`lm-workbench-column lm-free-preview ${mobilePane === "preview" ? "is-mobile-active" : ""}`}>
            <div className="lm-column-title"><b>2</b><div><h2><Bi zh="免费预览" en="Free Preview" /></h2><p><Bi zh="根据你刚刚填写的信息生成，不使用示例分数" en="Generated from your own entries, never sample scores" /></p></div><span>FREE</span></div>
            {resumedDraft && (
              <div className="lm-resume-card">
                <p><Bi zh="欢迎回来，你上次未完成的生命图谱已经恢复。" en="Welcome back. Your unfinished Life Map has been restored." /></p>
                <button onClick={confirmResumedUnlock}><Bi zh="继续解锁" en="Continue unlocking" /> →</button>
              </div>
            )}
            {calculating ? (
              <div className="lm-preview-loading" role="status" aria-live="polite">
                <div className="lm-core lm-core-active" />
                <div>
                  <small><Bi zh="真实计算进行中" en="Calculating your chart" /></small>
                  {LOADING_STEPS.slice(0, loadingStep + 1).map((s, i) => (
                    <p key={i} className={i === loadingStep ? "is-current" : ""}><Bi zh={s.zh} en={s.en} /></p>
                  ))}
                </div>
              </div>
            ) : !report || !parsed ? (
              <div className="lm-preview-empty">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/lifemap/page-0.png" alt="生命图谱报告视觉预览" />
                <p><Bi zh="先完成左侧信息，你将免费看到核心生命原型、真实生命坐标节点、当前阶段与三个行动关键词。" en="Complete the form to see your core archetype, calculated chart points, current phase and three action keywords." /></p>
                <small><Bi zh="出生时间不知道也可以生成；信息越完整，可计算的结构层次越丰富。" en="You can continue without an exact birth time. More complete information opens more calculable layers." /></small>
              </div>
            ) : (
              <div className="lm-generated-preview">
                <div className="lm-generated-heading">
                  {lifemapTypeImage(report.coreType.name) && <img src={lifemapTypeImage(report.coreType.name)!} alt={report.coreType.name} />}
                  <div><small><Bi zh="你的生命频率报告" en="Your Life Frequency Report" /></small><h2>{isEn() ? report.coreType.nameEn : report.coreType.name}</h2><p>{t("太阳", "Sun")} {isEn() ? report.facts.sunSignEn : report.facts.sunSignZh} · {t("日主", "Day Master")} {report.facts.dayMasterGan}</p></div>
                </div>
                <blockquote>{parsed.echoText}</blockquote>
<div className="lm-restored-content"><div className="mt-8 rounded-sm border border-lm2-violet/20 bg-lm2-violet/5 p-6 backdrop-blur-xl">
              <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                <Bi zh="你的生命坐标数据 · 西方占星 · 中式八字 · 紫微斗数 · 玛雅Tzolkin · 吠陀占星" en="Your Chart Data · Western Astrology · Chinese Bazi · Ziwei Doushu · Maya Tzolkin · Vedic Jyotish" />
              </p>
              <p className="mt-2 text-xs leading-6 text-lm2-text-dim/70">
                <Bi
                  zh="以下每一项，都由真实的天文与历法算法计算得出——七大行星的黄道位置，与专业占星软件同源；四柱八字的干支、纳音、地势，采用标准命理算法；紫微斗数的命宫身宫排布，用专门的排盘算法计算，并手动按古法逐步核对过命宫、身宫、五行局三项，确认与算法输出一致；玛雅Tzolkin圣历的图腾与数字，用儒略日精确推算，并用两个真实的历史节点（创世日、2012年长历终止日）验证过准确性。不是语言模型现场编的数字。"
                  en="Every value below comes from real astronomical and calendrical calculation — planetary positions from the same class of method professional astrology software uses; Bazi characters, elements and stages from standard calendrical rules; Ziwei Doushu's Soul and Body Palace placement from a dedicated charting algorithm, manually cross-checked against the classical method for three key values; the Maya Tzolkin day sign and tone computed via Julian Day Number and verified against two real historical reference points. None of it is a number a language model made up."
                />
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: t("太阳", "Sun"), v: isEn() ? report.facts.sunSignEn : report.facts.sunSignZh },
                  { label: t("月亮", "Moon"), v: isEn() ? report.facts.moonSignEn : report.facts.moonSignZh },
                  { label: t("水星", "Mercury"), v: isEn() ? report.facts.mercury.signEn : report.facts.mercury.signZh },
                  { label: t("金星", "Venus"), v: isEn() ? report.facts.venus.signEn : report.facts.venus.signZh },
                  { label: t("火星", "Mars"), v: isEn() ? report.facts.mars.signEn : report.facts.mars.signZh },
                  { label: t("木星", "Jupiter"), v: isEn() ? report.facts.jupiter.signEn : report.facts.jupiter.signZh },
                  { label: t("土星", "Saturn"), v: isEn() ? report.facts.saturn.signEn : report.facts.saturn.signZh },
                ].map((p) => (
                  <div key={p.label} className="lx-glass-lifemap px-3 py-2 text-center backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-widest2 text-lm2-text-dim/80">{p.label}</p>
                    <p className="mt-1 font-display text-sm text-lm2-text">{p.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-lm2-text/10 pt-4 font-display text-sm text-lm2-text">
                <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5">{report.facts.yearPillar}</span>
                <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5">{report.facts.monthPillar}</span>
                <span className="rounded-sm border border-amber/40 bg-amber/10 px-3 py-1.5">{report.facts.dayPillar}</span>
                {report.facts.hourPillar && <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5">{report.facts.hourPillar}</span>}
                {!report.facts.hourPillar && <span className="rounded-sm border border-lm2-text/5 px-3 py-1.5 text-lm2-text-dim/65">{t("时柱未知", "Hour pillar unknown")}</span>}
              </div>
              <p className="mt-3 text-center text-xs text-lm2-text-dim/72">
                <Bi zh={`日柱纳音：${report.facts.dayDetail.naYin}　命局五行：木${report.facts.wuXingCount.wood} 火${report.facts.wuXingCount.fire} 土${report.facts.wuXingCount.earth} 金${report.facts.wuXingCount.metal} 水${report.facts.wuXingCount.water}`} en={`Day Pillar Na Yin: ${report.facts.dayDetail.naYin}　Element Balance: Wood ${report.facts.wuXingCount.wood} Fire ${report.facts.wuXingCount.fire} Earth ${report.facts.wuXingCount.earth} Metal ${report.facts.wuXingCount.metal} Water ${report.facts.wuXingCount.water}`} />
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 border-t border-lm2-text/10 pt-4">
                <span className="rounded-sm border border-lm2-violet/30 bg-lm2-violet/10 px-4 py-2 text-center font-display text-sm text-lm2-text">
                  {t("玛雅印记", "Maya Sign")} {report.facts.maya.tone} {isEn() ? report.facts.maya.signEn : report.facts.maya.sign}
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-lm2-text-dim/72">{report.facts.maya.meaning} · {report.facts.maya.toneMeaning}</p>
              {report.facts.ziwei && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-lm2-text/10 pt-4">
                  <span className="rounded-sm border border-amber/40 bg-amber/10 px-3 py-1.5 font-display text-sm text-lm2-text">
                    {t("紫微命宫", "Ziwei Soul Palace")} {report.facts.ziwei.soulPalaceBranch}
                  </span>
                  <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5 font-display text-sm text-lm2-text">
                    {t("身宫", "Body Palace")} {report.facts.ziwei.bodyPalaceBranch}
                  </span>
                  <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5 font-display text-sm text-lm2-text">
                    {report.facts.ziwei.fiveElementsClass}
                  </span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-lm2-text/10 pt-4">
                <span className="rounded-sm border border-lattice/40 bg-lattice/10 px-3 py-1.5 font-display text-sm text-lm2-text">
                  {t("吠陀太阳", "Vedic Sun")} {isEn() ? report.facts.vedic.sunSidereal.signEn : report.facts.vedic.sunSidereal.signZh}
                </span>
                <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5 font-display text-sm text-lm2-text">
                  {t("吠陀月亮", "Vedic Moon")} {isEn() ? report.facts.vedic.moonSidereal.signEn : report.facts.vedic.moonSidereal.signZh}
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-lm2-text-dim/72">
                {t(`岁差修正值 ${report.facts.vedic.ayanamsa.toFixed(2)}° · Lahiri恒星黄道`, `Ayanamsa ${report.facts.vedic.ayanamsa.toFixed(2)}° · Lahiri Sidereal`)}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 border-t border-lm2-text/10 pt-4">
                <span className="rounded-sm border border-lm2-mint/40 bg-lm2-mint/10 px-4 py-2 text-center font-display text-sm text-lm2-text">
                  {t("生命密码", "Life Path Number")} {report.facts.lifeCode.number}{report.facts.lifeCode.isMaster ? t("（大师数）", " (Master Number)") : ""}
                </span>
              </div>
            </div>{report.facts.humanDesign && (
              <div className="bg-reading-glass mt-8 p-6 sm:p-8">
                <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                  <Bi zh="人类图 · 门" en="Human Design · Gates" />
                </p>
                <p className="mt-2 text-xs leading-6 text-lm2-text-dim">
                  <Bi
                    zh="太阳门，是人类图里权重最高的单一信息（约占人格印记70%），已经用真实天文计算得出，下面列出的每一个门也是如此。完整的类型（生产者/投射者/显示者/反映者）与内在权威解读，将在后续版本中加入。"
                    en="The Sun gate is the single highest-weighted piece of information in Human Design (roughly 70% of the personality imprint), and it's computed from real astronomy — as is every gate listed below. Full Type (Generator / Projector / Manifestor / Reflector) and Authority readings will arrive in a future update."
                  />
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <span className="rounded-sm border border-lm2-amber/40 bg-lm2-amber/10 px-4 py-2 text-center font-display text-sm text-lm2-text">
                    {t("太阳门（意识）", "Sun Gate (Conscious)")} {report.facts.humanDesign.sunConsciousGate}
                  </span>
                  <span className="rounded-sm border border-lm2-text/10 px-4 py-2 text-center font-display text-sm text-lm2-text">
                    {t("太阳门（潜意识）", "Sun Gate (Unconscious)")} {report.facts.humanDesign.sunUnconsciousGate}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-lm2-text/10 pt-4 text-xs text-lm2-text-dim sm:grid-cols-3">
                  {report.facts.humanDesign.personality.map((g) => (
                    <span key={g.key}>
                      {isEn() ? g.en : g.zh} — {t("门", "Gate")} {g.gate}.{g.line}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(phoneNumber.trim() || plateNumber.trim()) && (
              <div className="lx-glass-lifemap mt-8 p-6 sm:p-8">
                <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                  <Bi zh="数字能量解读" en="Number Energy Reading" />
                </p>
                {phoneNumber.trim() && (() => {
                  const r = analyzePhoneNumber(phoneNumber);
                  return (
                    <div className="mt-4">
                      <p className="text-sm text-lm2-text-dim">{t("手机号", "Phone")} {r.digitsOnly}</p>
                      <p className="mt-1 font-display text-lg text-lm2-text">
                        {t("总和灵动数", "Total number")} {r.totalSum} · <Bi zh={r.lingdong.zh} en={r.lingdong.en} />
                      </p>
                    </div>
                  );
                })()}
                {plateNumber.trim() && (() => {
                  const r = analyzePlateNumber(plateNumber);
                  return (
                    <div className="mt-4 border-t border-lm2-text/10 pt-4">
                      <p className="text-sm text-lm2-text-dim">{t("车牌号", "Plate")} {r.digitsOnly}</p>
                      <p className="mt-1 font-display text-lg text-lm2-text">
                        {t("总和灵动数", "Total number")} {r.totalSum} · <Bi zh={r.lingdong.zh} en={r.lingdong.en} />
                      </p>
                    </div>
                  );
                })()}
                <p className="mt-5 text-xs leading-6 text-lm2-text-dim">
                  <Bi
                    zh="这是民俗数字能量学（81数灵动数体系），是约定俗成的符号含义表，不是天文或统计意义上算出来的结论，供参考。"
                    en="This is folk number-energy numerology (the 81-number system) — a conventional table of symbolic meanings, not an astronomically or statistically derived result. For reference only."
                  />
                </p>
              </div>
            )}

            </div>
                {parsed.stageName && <div className="lm-stage-summary"><small><Bi zh="当前生命阶段" en="Current Life Phase" /></small><h3>{parsed.stageName}</h3><p>{parsed.stageDesc}</p></div>}
                {parsed.keywords.length > 0 && <div className="lm-keywords">{parsed.keywords.slice(0,3).map((k,i)=><span key={i}><b>{k.word}</b><small>{k.desc}</small></span>)}</div>}
              </div>
            )}
            {report && <div className="lm-restored-content"><h3 className="mt-8 text-xl text-lm2-violet"><Bi zh="完整档案 · 十三项内容说明" en="Complete archive · Thirteen content highlights" /></h3><div className="mx-auto mt-8 max-w-xl space-y-6 text-left">
                <div>
                  <p className="font-display text-sm text-lm2-violet">01 · <Bi zh="逐一解读" en="Planet by Planet" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="每一颗行星，都代表生命中的一种核心功能。完整解读不会停留在「你是什么星座」，而会展开：你的太阳如何表达自我，月亮如何影响情绪与内在需求，水星如何影响思考方式，金星如何影响关系与价值感，火星如何影响行动动力——七大行星之间的连接关系，共同组成你独特的生命表达方式。" en="Each planet represents a core function of your life. The reading goes past 'what sign are you' — it unfolds how your Sun expresses itself, how your Moon shapes emotion and inner need, how Mercury shapes thought, how Venus shapes relationships and value, how Mars shapes drive. The connections between all seven form your own way of expressing life." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">02 · <Bi zh="八字深层结构" en="Bazi, in Depth" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="八字不仅是四柱干支，每一个天干地支背后，都隐藏着更细微的生命结构。完整解析将展开十神关系、藏干信息、纳音象征、十二地势，加上胎元、命宫、身宫——从表层出生信息，深入到你的内在运行逻辑。" en="Bazi is more than four pillars of characters — behind every stem and branch is a finer structure. The full analysis unfolds Ten Gods, hidden stems, Na Yin, the twelve growth stages, plus the Fetal Origin, Soul Palace, and Body Palace — from surface birth data into the logic that runs underneath." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">03 · <Bi zh="紫微生命坐标详解" en="Your Ziwei Chart, Decoded" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="紫微斗数关注的不仅是「有什么星」，更重要的是这些星曜如何组合、如何在你的生命领域中产生作用。完整解析命宫、身宫、主星组合，以及不同人生领域中的表现方式，帮你理解天赋在哪里、成长课题是什么。" en="Ziwei Doushu isn't only about which stars are present — what matters more is how they combine and act across your life. The full reading covers your Soul Palace, Body Palace, and star combinations, and how they show up across different life domains — where your gifts are, and what you're here to grow through." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">04 · <Bi zh="玛雅印记详解" en="Your Maya Sign, Decoded" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="玛雅圣历是一套关于时间与意识象征的古老系统。你的图腾与数字不是简单的标签——完整解读会结合你的整体生命结构，探索你的象征主题、表达方式，以及你与时间节奏之间的连接。" en="The Maya Tzolkin is an ancient system of time and consciousness symbolism. Your day sign and tone are more than labels — the full reading places them inside your whole structure, exploring your symbolic theme, your way of expressing it, and your connection to the rhythm of time." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">05 · <Bi zh="大运走势" en="Major Luck Cycles" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="人生并不是静止的结构，不同阶段会展开不同主题。大运分析帮你观察未来周期中的主要方向、阶段性的变化趋势，以及可能出现的重要生命课题——不是预测固定未来，而是帮你理解自己正在进入怎样的人生阶段。" en="Life isn't a static structure — different phases unfold different themes. The Luck Cycle analysis shows the main direction of what's ahead, the shifts by phase, and the themes likely to surface — not a fixed prediction, but a way to understand what stage of life you're entering." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">06 · <Bi zh="频率自测解读" en="Your Self-Assessment, Interpreted" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="你的主观感受，也是生命探索的重要部分。把你填的能量状态、清晰程度、内在对齐感，跟你的生命坐标结构进行对照，看见你感受到的自己，与生命坐标结构呈现出的自己，是否存在不同。" en="Your subjective sense of things is part of the exploration too. Your self-rated energy, clarity, and inner alignment are set against your chart structure, to see whether the self you feel and the self your chart shows actually agree." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">07 · <Bi zh="财富与事业频率地图" en="Wealth & Career Map" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="财富不仅是结果，更是一种价值交换方式。完整分析你的创造优势、适合的发展方向、事业表达方式，以及财富形成路径，帮你理解什么样的方式更容易发挥你的生命价值。" en="Wealth is more than an outcome — it's a way value moves through you. The full analysis covers your creative strengths, the directions suited to you, how you express work, and how wealth tends to form for you — a way to see what lets your value actually move." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">08 · <Bi zh="关系共振地图" en="Relationship Resonance Map" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="关系，是两个生命结构的相遇。完整解析会照见深度关系中的互动模式、情感表达、内在需求与安全感，也看见关系如何推动彼此成长。" en="A relationship is where two life structures meet. The full reading reflects interaction patterns, emotional expression, inner needs, and felt safety within deep relationships, and how connection invites both people to grow." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">09 · <Bi zh="人生周期导航" en="Life Cycle Navigation" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="生命探索不应该停留在一次阅读。根据你的当前状态，生成30天关注主题、90天调整方向、365天长期成长路径——让生命图谱，成为持续陪伴你的导航。" en="Exploring your life shouldn't end after one read. Based on your current state, it generates a 30-day focus, a 90-day direction, and a 365-day long-term path — so your Life Map becomes a navigation that stays with you." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">10 · <Bi zh="专属灵犀场练习" en="A Personal Lingxi Field Practice" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="每个人的状态不同，适合自己的练习也应该不同。灵犀场根据你的生命结构，生成对应的呼吸练习、觉察方式、内在整理路径，帮助理解，逐渐进入实践。" en="Everyone's state is different, and what fits should be too. Based on your structure, the field generates a breathing practice, a way of noticing, and a path for inner clearing — from understanding, into practice." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">11 · <Bi zh="象征叙事镜面" en="Symbolic Narrative Mirror" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="这是灵犀场中的创意叙事空间。根据你的生命坐标元素，创造一段象征性的生命故事——它不是历史证明，而是一种想象与自我探索，通过故事看见自己与生命主题之间的连接。" en="A creative narrative corner of the field. Using your chart's elements, it weaves a symbolic vignette of your life — not a historical claim, but a piece of imagination and self-exploration, seeing your connection to your life's themes through story." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">12 · <Bi zh="完整报告可下载PDF" en="Downloadable PDF" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="你的生命探索会形成一份完整档案——支持PDF保存、长期查看、随时回顾，让这次探索，成为属于你的生命记录。" en="Your exploration becomes a complete record — saved as a PDF, kept long-term, revisited anytime. This exploration becomes a record that's yours." />
                  </p>
                </div>
                <div>
                  <p className="font-display text-sm text-lm2-violet">13 · <Bi zh="额外信息也不会被浪费" en="Nothing You Enter Goes Unused" /></p>
                  <p className="mt-1.5 text-sm leading-7 text-lm2-text-dim">
                    <Bi zh="如果你填了手机号、车牌号或职业，你输入的每一项信息，都是连接你与灵犀场的一部分——不同信息会作为辅助维度，参与对应章节的交叉分析，让最终呈现的内容，更加贴近你的个人状态。" en="If you entered a phone number, license plate, or occupation, every piece you gave is part of your connection to the field — each becomes a supporting dimension, woven into the relevant section, so what you get back sits closer to who you actually are." />
                  </p>
                </div>
              </div></div>}
            {report && <div className="lm-unlock-card">
              <div><small><Bi zh="完整生命图谱" en="Complete Life Blueprint" /></small><strong>¥{getProduct("life-map-report")?.priceRmb}</strong><p><Bi zh="生成订单前会再次确认；付款完成后生成完整报告并开放 PDF 下载。" en="You confirm again before an order is created. After payment, the complete report and PDF download become available." /></p></div>
              <button onClick={unlockFull} disabled={unlocking}>{unlocking ? t("正在准备支付…", "Preparing payment…") : t(`解锁完整档案 ¥${getProduct("life-map-report")?.priceRmb}`, `Unlock complete archive ¥${getProduct("life-map-report")?.priceRmb}`)} →</button>
              {error && <p className="lm-workbench-error">{error}</p>}
            </div>}
          </div>

          <aside className={`lm-workbench-column lm-pdf-preview ${mobilePane === "archive" ? "is-mobile-active" : ""}`}>
            <div className="lm-column-title"><b>3</b><div><h2><Bi zh="完整档案与 PDF" en="Complete Archive and PDF" /></h2><p><Bi zh="支付成功后在这里生成、阅读与下载" en="Generate, read and download here after payment" /></p></div></div>
            {initialArchiveId ? (
              <div className="lm-archive-reader"><FullReportView id={initialArchiveId} /></div>
            ) : (
              <div className="lm-archive-locked">
                <div className="lm-pdf-stack">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/lifemap/page-0.png" alt="生命图谱 PDF 封面预览" />
                  <span><Bi zh="待解锁" en="LOCKED" /></span>
                </div>
                <h3><Bi zh="完整档案将在这里展开" en="Your complete archive will unfold here" /></h3>
                <p><Bi zh="先在左侧生成真实免费预览。确认解锁并支付成功后，十五个以上的实际报告章节会直接进入右侧阅读区，并开放 PDF 下载。" en="Generate your real free preview first. After confirmed payment, the actual report sections open directly in this reader with PDF download." /></p>
              </div>
            )}
          </aside>
          </div>
      </section>

      <style>{`
        .lm-restored-content { font-size: 14px; line-height: 1.85; }
        .lm-restored-content div { padding: 18px; }
        .lm-restored-intro section { padding: 0; margin: 0 0 20px; }
        .lm-restored-intro section div { padding: 18px; }
        .lm-restored-intro h1 { font-size: 24px; }
        .lm-restored-intro p { font-size: 14px; line-height: 1.9; }
        .lm-core {
          width: 120px; height: 120px; border-radius: 999px;
          background: conic-gradient(from 0deg, #E8869E, #E7B85C, #5FC79B, #5A9FDE, #A47ADC, #E8869E);
          animation: lm-breathe 4.2s ease-in-out infinite, lm-spin 18s linear infinite;
          filter: blur(9px) saturate(0.9);
          opacity: 0.85;
        }
        @keyframes lm-breathe { 0%,100% { transform: scale(1); opacity: .7; } 50% { transform: scale(1.15); opacity: .95; } }
        @keyframes lm-spin { from { filter: blur(9px) saturate(0.9) hue-rotate(0deg); } to { filter: blur(9px) saturate(0.9) hue-rotate(360deg); } }
        .lm-core-active { animation: lm-breathe 1.5s ease-in-out infinite, lm-spin 6s linear infinite; width: 90px; height: 90px; }
      `}</style>
    </div>
  );
}
