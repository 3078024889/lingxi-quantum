"use client";

import { useState, useRef, useEffect } from "react";
import { getCoreType, type WesternElement, type ChineseElement } from "@/lib/lifemap-calc";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/client";
import LifeMapCompass from "./LifeMapCompass";
import NatalChartWheel from "./NatalChartWheel";
import { analyzePhoneNumber, analyzePlateNumber } from "@/lib/number-energy-calc";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { lifemapTypeImage } from "@/lib/lifemap-type-images";

type Stage = "landing" | "form" | "loading" | "report";

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
  { zh: "✨ 排布你的紫微命盘", en: "✨ Charting your Ziwei Doushu palaces" },
  { zh: "✨ 换算玛雅Tzolkin圣历印记", en: "✨ Converting your Maya Tzolkin day sign" },
  { zh: "✨ 交叉五套系统，生成你的核心类型", en: "✨ Cross-referencing five systems into your core type" },
];

export default function LifeMapFlow() {
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

  const [stage, setStage] = useState<Stage>("landing");
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
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  // 登录跳转回来后，如果发现有未完成的解锁草稿，先放在这里等用户确认，
  // 不直接自动下单——避免"随便打开一下页面"就被静默带去付款页那种bug。
  const [resumedDraft, setResumedDraft] = useState<LifeMapDraft | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  const goForm = () => {
    setStage("form");
    setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

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
    if (!y || !m || !d || y < 1 || y > 2026 || m < 1 || m > 12 || d < 1 || d > 31) {
      setError(t("请填写完整、有效的出生日期（年份支持公元1年至今，暂不支持公元前）。", "Please enter a complete, valid birth date (year 1 CE to present; BCE dates aren't supported yet)."));
      return;
    }
    setError("");
    setStage("loading");
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
      const wx = facts.wuXingCount;
      const wxStr = `木${wx.wood} 火${wx.fire} 土${wx.earth} 金${wx.metal} 水${wx.water}`;
      const promptContent =
        `【核心类型】${coreType.name}（${coreType.nameEn}）——${coreType.essence}\n` +
        `【西方星盘】太阳：${facts.sunSignZh}；月亮：${facts.moonSignZh}；水星：${facts.mercury.signZh}；金星：${facts.venus.signZh}；火星：${facts.mars.signZh}；木星：${facts.jupiter.signZh}；土星：${facts.saturn.signZh}\n` +
        `【中式命盘】四柱：${facts.yearPillar} ${facts.monthPillar} ${facts.dayPillar}${facts.hourPillar ? " " + facts.hourPillar : "（未知具体时辰）"}；` +
        `日主：${facts.dayMasterGan}（${facts.dayMasterElement === "wood" ? "木" : facts.dayMasterElement === "fire" ? "火" : facts.dayMasterElement === "earth" ? "土" : facts.dayMasterElement === "metal" ? "金" : "水"}）；` +
        `年干十神：${facts.yearShiShen}；月干十神：${facts.monthShiShen}；日柱纳音：${facts.dayDetail.naYin}；命局五行分布：${wxStr}\n` +
        (facts.ziwei ? `【紫微斗数】命宫在${facts.ziwei.soulPalaceBranch}，身宫在${facts.ziwei.bodyPalaceBranch}，${facts.ziwei.fiveElementsClass}；命宫主星：${facts.ziwei.palaces.find(p => p.isSoulPalace)?.majorStars.map(s => s.name).join("、") || "无主星（借对宫星曜论）"}\n` : "") +
        `【玛雅Tzolkin】${facts.maya.tone} ${facts.maya.sign}（${facts.maya.meaning}／数字${facts.maya.tone}：${facts.maya.toneMeaning}）\n` +
        `【当前频率自测】能量水平${energyLevel}/5，头脑清晰度${clarityLevel}/5，内外对齐感${alignmentLevel}/5\n` +
        `【用户最想探索】${focusLabel.zh}\n【用户当前状态】${stateLabel.zh}` +
        (professionLabel ? `\n【用户职业】${professionLabel}` : "") +
        (relationshipLabel ? `\n【当前感情状态】${relationshipLabel}` : "") +
        (practiceLabel ? `\n【是否有修炼习惯】${practiceLabel}` : "") +
        (name.trim() ? `\n【称呼】${name.trim()}` : "");

      const aiRes = await fetch("/api/lingxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "lifemap", content: promptContent, lang: isEn() ? "en" : "zh" }),
      });
      const aiPayload = await aiRes.json();
      if (!aiRes.ok || !aiPayload.text) throw new Error("ai failed");

      clearInterval(stepTimer);
      setReport({ facts, coreType, narrative: aiPayload.text });
      setStage("report");

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
        facts, coreType, freeNarrative: aiPayload.text,
        focusLabel, stateLabel, energyLevel, clarityLevel, alignmentLevel, name,
        professionLabel, relationshipLabel, practiceLabel,
        phoneReading, plateReading,
      });
    } catch {
      clearInterval(stepTimer);
      setError(t("场域连接不稳定，请重试一次。", "The field connection was unstable — please try again."));
      setStage("form");
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
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "life-map-report", submissionId: id, returnPath: `/life-map/full?id=${id}&paid=1` }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("解锁完整报告失败:", data);
        setError(
          data.error === "支付未配置"
            ? t("支付网关尚未配置（缺少 PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET），请联系站点管理员配置后再试。", "Payment gateway isn't configured yet (missing PayPal credentials) — please contact the site admin.")
            : data.error || t("下单失败，请稍后再试。", "Order failed, please try again later.")
        );
        setUnlocking(false);
      }
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
      setReport(draft.report); setStage("report");
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
    const res = await fetch("/api/pay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "life-map-report", submissionId: result.id, returnPath: `/life-map/full?id=${result.id}&paid=1` }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setUnlocking(false);
      setError(t("信息已恢复，请再点一次「解锁完整报告」。", "Your info has been restored — please tap Unlock Full Report once more."));
    }
  };

  // ---------- 解析灵犀返回的三段式正文 ----------
  const parsed = (() => {
    if (!report) return null;
    const parts = stripMarkdownArtifacts(report.narrative).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const echoText = parts[0] || "";
    const normalizeDelims = (s: string) => s.replace(/[｜]/g, "|").replace(/[，、]/g, ",");
    const [stageName, stageDesc] = normalizeDelims(parts[1] || "").split("|").map((s) => s?.trim());
    const keywordParts = normalizeDelims(parts[2] || "").split("|").map((s) => s.trim()).filter(Boolean);
    const keywords = keywordParts
      .map((kp) => kp.split(",").map((s) => s?.trim()).filter(Boolean))
      .filter((pair) => {
        if (pair.length !== 2 || pair[0].length > 8) return false;
        // 兜底：AI有小概率把提示词里给它看的占位符（"关键词1""说明1"
        // 这种字样）原样抄回来，当成真实内容——这种情况词本身很短，
        // 能通过长度校验，得单独用正则抓出来剔除。
        if (/^【?关键词\s*\d/.test(pair[0]) || /^说明\s*\d/.test(pair[1])) return false;
        return true;
      })
      .map(([w, d]) => ({ word: w, desc: d }));
    return { echoText, stageName: stageName || "", stageDesc: stageDesc || "", keywords };
  })();

  return (
    <div ref={formTopRef}>
      {stage === "landing" && (
        <section className="relative min-h-[85vh] overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center opacity-70">
            <div className="lm-core" />
          </div>
          <div className="relative z-10">
            <div className="bg-lm2-card mx-auto max-w-2xl rounded-sm px-8 py-10">
            <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
              🌌 {t("发现你的生命频率", "Discover Your Life Frequency")}
            </p>
            <h1 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-light leading-tight text-lm2-text sm:text-5xl">
              <Bi zh="你携带的，从来不只是一具身体，还有一份只属于你的信息结构。" en="What you carry was never only a body — it is an information structure that belongs to you alone." />
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-9 text-lm2-text-dim">
              <Bi zh="填入你的出生信息，让西方占星、中式八字、紫微斗数、玛雅Tzolkin圣历、吠陀占星——五套各自独立演化了千年的语言，一起指向同一个人：你。它们不替你做决定，只是把你早已知道、却被日常的噪音盖住的那部分，重新照出来。" en="Enter your birth information, and let five languages — Western astrology, Chinese Bazi, Ziwei Doushu, the Maya Tzolkin calendar, and Vedic astrology, each evolved independently over a thousand years — point at the same person: you. None of them decide for you. They only re-light what you already knew, before the noise of ordinary life covered it over." />
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-lm2-text-dim/80">
              <Bi zh="只是你，作为容易遗忘的意识分身，暂时记不起自己了。" en="You've simply forgotten — the way a fragment of consciousness, wandering far from itself, always does for a while." />
            </p>
            <p className="mx-auto mt-4 max-w-xl text-xs leading-7 text-lm2-text-dim/60">
              <Bi
                zh="不是「水瓶座所以你怎样」这种通用说法——每一句解读，都精确到你星盘里具体哪颗行星、哪个宫位、哪个十神，交叉印证出来的，换一个人，换一套数据，同一句话不成立。"
                en={`Not "you're an Aquarius, so..." — every line is traced back to specific planets, houses, and chart placements unique to you, cross-verified across systems. Swap in a different person's data, and the same sentence stops being true.`}
              />
            </p>
            <button
              onClick={goForm}
              className="mt-10 inline-block bg-lm2-aurora px-12 py-4 font-display text-sm uppercase tracking-widest2 text-[#151222] shadow-[0_0_30px_rgba(180,150,255,0.4)] transition hover:brightness-110"
            >
              ✨ {t("开始探索", "Begin Exploring")}
            </button>
            <p className="mx-auto mt-6 max-w-md text-xs leading-6 text-lm2-text-dim">
              <Bi
                zh="这是一份自我探索与反思的参考，不是命运预言——生命的走向，始终由你自己选择。"
                en="This is a tool for self-exploration and reflection, not a prophecy — the direction of your life is always your own to choose."
              />
            </p>
            </div>
            <LifeMapCompass />
          </div>
        </section>
      )}

      {stage === "form" && (
        <section className="px-6 py-20">
          <div className="bg-reading-glass mx-auto max-w-xl px-6 py-10 sm:px-10">
            <p className="text-center font-display text-sm uppercase tracking-widest2 text-lm2-violet">
              <Bi zh="创建你的生命档案" en="Create Your Life Profile" />
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-light text-lm2-text">
              <Bi zh="一、基础信息" en="I. Basic Information" />
            </h2>

            <div className="mt-10 space-y-6">
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
                <p className="mt-1 text-xs leading-5 text-lm2-text-dim/60">
                  <Bi
                    zh="中国身份证上的出生日期，有的写的是阳历（公历/西历，国际通用的那种），有的写的是农历（中国传统历法）——两者是完全不同的历法系统，同一串数字，按错了历法，算出来的命盘会整个错位。不确定的话，通常身份证上写的是阳历；海外用户，一般直接选阳历即可。"
                    en="On Chinese ID cards, the birth date is sometimes Gregorian (Solar/Western calendar), sometimes Chinese Lunar — these are entirely different calendar systems, and picking the wrong one will throw off every calculation. If unsure, ID cards usually show the Gregorian date; users outside China should simply select Gregorian."
                  />
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button onClick={() => setCalendarType("solar")} className={`rounded-sm border px-4 py-3 text-sm transition ${calendarType === "solar" ? "border-lm2-violet bg-lm2-violet/10 text-lm2-text" : "border-lm2-text/20 bg-lm2-bg/40 text-lm2-text-dim hover:border-lm2-violet/40"}`}>
                    <Bi zh="阳历（公历/西历）" en="Gregorian (Solar / Western)" />
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
                  <label className="block text-sm text-lm2-text-dim"><Bi zh="出生时间" en="Birth Time" /></label>
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
                  <span className="ml-2 text-xs text-lm2-text-dim/50"><Bi zh="（紫微斗数排大限方向需要）" en="(needed for Zi Wei Dou Shu's decade-cycle direction)" /></span>
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

            <h2 className="mt-14 text-center font-display text-3xl font-light text-lm2-text">
              <Bi zh="二、当前人生状态" en="II. Where You Are Now" />
            </h2>
            <div className="mt-8">
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

            <h2 className="mt-14 text-center font-display text-3xl font-light text-lm2-text">
              <Bi zh="三、当前频率自测" en="III. Self-Assessment: Your Current Frequency" />
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm leading-7 text-lm2-text-dim">
              <Bi
                zh="命盘给出的是你与生俱来的结构，这三项，则是你此刻真实的状态——两者放在一起看，报告才知道，该把重点，放在哪里。"
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
                    <p className="font-display text-lg text-lm2-violet">{f.v}<span className="text-xs text-lm2-text-dim/50">/5</span></p>
                  </div>
                  <p className="mt-1 text-xs text-lm2-text-dim/60">{f.sub}</p>
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

            {error && <p className="mt-6 text-sm text-rose">{error}</p>}

            <button
              onClick={submit}
              className="mt-10 w-full bg-lm2-aurora py-4 font-display text-sm uppercase tracking-widest2 text-[#151222] shadow-[0_0_30px_rgba(180,150,255,0.4)] transition hover:brightness-110"
            >
              {t("生成我的生命图谱", "Generate My Life Map")}
            </button>
          </div>
        </section>
      )}

      {stage === "loading" && (
        <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="lm-core lm-core-active" />
          <div className="bg-void-deep mt-10 space-y-3 rounded-sm px-8 py-6">
            {LOADING_STEPS.slice(0, loadingStep + 1).map((s, i) => (
              <p key={i} className={`font-display text-base ${i === loadingStep ? "text-lm2-text" : "text-lm2-text-dim/75"}`}>
                <Bi zh={s.zh} en={s.en} />
              </p>
            ))}
          </div>
        </section>
      )}

      {stage === "report" && report && parsed && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl">
            {resumedDraft && (
              <div className="bg-void-deep mb-6 rounded-sm border border-lm2-violet/40 px-6 py-5 text-center">
                <p className="text-sm leading-6 text-lm2-text">
                  <Bi
                    zh="欢迎回来——你之前有一次没走完的解锁，信息已经帮你恢复好了。"
                    en="Welcome back — you had an unfinished unlock. We've restored your information."
                  />
                </p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    onClick={confirmResumedUnlock}
                    className="bg-lm2-violet/70 rounded-sm px-6 py-2 text-xs uppercase tracking-widest2 text-white transition hover:brightness-110"
                  >
                    <Bi zh="继续解锁" en="Continue Unlock" />
                  </button>
                  <button
                    onClick={() => setResumedDraft(null)}
                    className="text-xs text-lm2-text-dim underline underline-offset-2 hover:text-lm2-text"
                  >
                    <Bi zh="不用了，我再看看" en="Not now" />
                  </button>
                </div>
              </div>
            )}
            <div className="bg-void-deep rounded-sm px-8 py-8 text-center">
            <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
              🌌 {t("你的生命频率报告", "Your Life Frequency Report")}
            </p>
            <h2 className="mt-4 font-display text-4xl font-light text-lm2-text">
              {isEn() ? report.coreType.nameEn : report.coreType.name}
            </h2>
            {lifemapTypeImage(report.coreType.name) && (
              <div className="mt-5 flex justify-center">
                <div className="overflow-hidden rounded-sm border border-lm2-text/15" style={{ maxWidth: 240 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lifemapTypeImage(report.coreType.name)!} alt={report.coreType.name} className="block w-full" />
                </div>
              </div>
            )}
            <p className="mt-3 text-sm text-lm2-text-dim">
              {t("太阳", "Sun")} {isEn() ? report.facts.sunSignEn : report.facts.sunSignZh} · {t("日主", "Day Master")} {report.facts.dayMasterGan}
            </p>
            </div>

            <div className="bg-reading-glass mt-10 p-8">
              <p className="text-base leading-9 text-lm2-text-dim">{parsed.echoText}</p>
            </div>

            {/* 真实星盘：用已验证的行星黄经数据，画出标准占星轮图 */}
            <div className="mt-8 rounded-sm border border-lm2-text/10 bg-lm2-card p-6 backdrop-blur-xl">
              <p className="text-center font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                <Bi zh="你的星盘" en="Your Natal Chart" />
              </p>
              <NatalChartWheel
                sunLongitude={report.facts.sunLongitude} moonLongitude={report.facts.moonLongitude}
                mercury={report.facts.mercury.longitude} venus={report.facts.venus.longitude}
                mars={report.facts.mars.longitude} jupiter={report.facts.jupiter.longitude} saturn={report.facts.saturn.longitude}
              />
            </div>

            {/* 命盘数据面板：中西玛雅三方合参，全部真实计算，不是编的——这是免费版就能看到的"证据" */}
            <div className="mt-8 rounded-sm border border-lm2-violet/20 bg-lm2-violet/5 p-6 backdrop-blur-xl">
              <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                <Bi zh="你的命盘数据 · 西方占星 · 中式八字 · 紫微斗数 · 玛雅Tzolkin · 吠陀占星" en="Your Chart Data · Western Astrology · Chinese Bazi · Ziwei Doushu · Maya Tzolkin · Vedic Jyotish" />
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
                  <div key={p.label} className="rounded-sm border border-lm2-text/10 bg-lm2-card px-3 py-2 text-center backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-widest2 text-lm2-text-dim/60">{p.label}</p>
                    <p className="mt-1 font-display text-sm text-lm2-text">{p.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-lm2-text/10 pt-4 font-display text-sm text-lm2-text">
                <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5">{report.facts.yearPillar}</span>
                <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5">{report.facts.monthPillar}</span>
                <span className="rounded-sm border border-amber/40 bg-amber/10 px-3 py-1.5">{report.facts.dayPillar}</span>
                {report.facts.hourPillar && <span className="rounded-sm border border-lm2-text/10 px-3 py-1.5">{report.facts.hourPillar}</span>}
                {!report.facts.hourPillar && <span className="rounded-sm border border-lm2-text/5 px-3 py-1.5 text-lm2-text-dim/40">{t("时柱未知", "Hour pillar unknown")}</span>}
              </div>
              <p className="mt-3 text-center text-xs text-lm2-text-dim/50">
                <Bi zh={`日柱纳音：${report.facts.dayDetail.naYin}　命局五行：木${report.facts.wuXingCount.wood} 火${report.facts.wuXingCount.fire} 土${report.facts.wuXingCount.earth} 金${report.facts.wuXingCount.metal} 水${report.facts.wuXingCount.water}`} en={`Day Pillar Na Yin: ${report.facts.dayDetail.naYin}　Element Balance: Wood ${report.facts.wuXingCount.wood} Fire ${report.facts.wuXingCount.fire} Earth ${report.facts.wuXingCount.earth} Metal ${report.facts.wuXingCount.metal} Water ${report.facts.wuXingCount.water}`} />
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 border-t border-lm2-text/10 pt-4">
                <span className="rounded-sm border border-lm2-violet/30 bg-lm2-violet/10 px-4 py-2 text-center font-display text-sm text-lm2-text">
                  {t("玛雅印记", "Maya Sign")} {report.facts.maya.tone} {isEn() ? report.facts.maya.signEn : report.facts.maya.sign}
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-lm2-text-dim/50">{report.facts.maya.meaning} · {report.facts.maya.toneMeaning}</p>
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
              <p className="mt-2 text-center text-xs text-lm2-text-dim/50">
                {t(`岁差修正值 ${report.facts.vedic.ayanamsa.toFixed(2)}° · Lahiri恒星黄道`, `Ayanamsa ${report.facts.vedic.ayanamsa.toFixed(2)}° · Lahiri Sidereal`)}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 border-t border-lm2-text/10 pt-4">
                <span className="rounded-sm border border-lm2-mint/40 bg-lm2-mint/10 px-4 py-2 text-center font-display text-sm text-lm2-text">
                  {t("生命密码", "Life Path Number")} {report.facts.lifeCode.number}{report.facts.lifeCode.isMaster ? t("（大师数）", " (Master Number)") : ""}
                </span>
              </div>
            </div>

            {report.facts.humanDesign && (
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
              <div className="bg-void-deep mt-8 p-6 sm:p-8">
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

            <div className="bg-void-deep mt-8 p-6 sm:p-8">
              <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                <Bi zh="当前生命阶段" en="Your Current Life Stage" />
              </p>
              <h3 className="mt-2 font-display text-2xl text-lm2-text">「{parsed.stageName}」</h3>
              <p className="mt-3 text-base leading-8 text-lm2-text-dim">{parsed.stageDesc}</p>
            </div>

            <div className="mt-8">
              <p className="font-display text-sm uppercase tracking-widest2 text-lm2-violet">
                <Bi zh="你的三个关键词" en="Your Three Keywords" />
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {parsed.keywords.map((k, i) => (
                  <div key={i} className="rounded-sm border border-lm2-text/10 bg-lm2-card p-4 text-center backdrop-blur-xl">
                    <p className="font-display text-xl text-lm2-text">✨ {k.word}</p>
                    <p className="mt-1 text-xs text-lm2-text-dim/70">{k.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-lm2-card mt-14 rounded-sm border border-lm2-violet/40 p-8 text-center shadow-[0_0_40px_rgba(140,110,255,0.2)]">
              <p className="font-display text-lg text-lm2-text">
                🔒 <Bi zh="以上，只是命盘最外层的骨架。" en="What you've seen so far is only the outer frame of your chart." />
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-lm2-text-dim">
                <Bi
                  zh="七大行星只给了星座，没给你它们彼此之间的角度关系；四柱只列了干支，没给你藏干、地势、胎元命宫身宫这些更深的骨架；玛雅印记也只给了名字，没给你它在你命盘里真正意味着什么。三套系统、几十个真实数据点，交叉组合出的，是独属于你的一份命盘——完整报告，会把它们，逐一，为你解读。"
                  en="The planets above only show signs — not the angles between them. The Pillars only show characters — not the hidden stems, growth stages, or the deeper palaces beneath them. The Maya sign only shows a name — not what it actually means in your chart. Three systems, dozens of real data points, cross-combined into something uniquely yours — the full report interprets all of it, one layer at a time."
                />
              </p>
              <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm leading-7 text-lm2-text-dim">
                <li>01 · <Bi zh="逐一解读——七大行星，每一颗，都有单独的一段解读，不是罗列星座名字" en="Planet by planet — each of the seven gets its own reading, not just a sign name" /></li>
                <li>02 · <Bi zh="八字深层结构——十神、纳音、地势、藏干，逐柱展开，加上胎元命宫身宫的解读" en="Bazi in depth — Ten Gods, Na Yin, growth stages, hidden stems, pillar by pillar, plus the three palaces" /></li>
                <li>03 · <Bi zh="紫微命盘详解——命宫身宫的主星组合，在你身上具体如何呈现" en="Your Ziwei chart, decoded — what the stars in your Soul and Body Palace mean for you" /></li>
                <li>04 · <Bi zh="玛雅印记详解——你的图腾与数字，在你命盘里具体意味着什么" en="Your Maya sign, decoded — what your day sign and tone specifically mean in your chart" /></li>
                <li>05 · <Bi zh="大运走势——未来几个十年周期，各自的主题与转折点" en="Major Luck Cycles — the theme and turning point of each coming decade" /></li>
                <li>06 · <Bi zh="频率自测解读——你填的能量/清晰度/对齐感三项分数，对照命盘，看出真正的落差在哪里" en="Your frequency self-assessment, interpreted — where your actual state diverges from your chart, and why" /></li>
                <li>07 · <Bi zh="财富与事业频率地图——事业运势、适合的工作方式，与财富的关系、适合的创造路径" en="Wealth & Career Map — your career instincts, working style, relationship with money, paths suited to you" /></li>
                <li>08 · <Bi zh="关系共振地图——亲密关系的情感模式，加上家族归属、群体角色的解读" en="Relationship Resonance Map — your intimacy pattern, plus family dynamics and your role in groups" /></li>
                <li>09 · <Bi zh="人生周期导航——30天/90天/365天的关注方向" en="Life Cycle Navigation — focus points for the next 30/90/365 days" /></li>
                <li>10 · <Bi zh="专属灵犀练习——根据你的状态生成的呼吸与觉察练习" en="A Personal Lingxi Practice — breathing and awareness exercises shaped to your state" /></li>
                <li>11 · <Bi zh="前世今生印记——纯属脑洞的创意小板块，基于你的命盘元素，编一段好玩的前世片段与未来画面" en="Past & Future Imprint — a purely-for-fun creative bit, weaving your chart elements into a playful past-life vignette and a glimpse of what's ahead" /></li>
                <li>12 · <Bi zh="完整报告可下载 PDF，永久保存，随时回看" en="Full report available as a downloadable PDF — yours to keep, revisit anytime" /></li>
                <li>13 · <Bi zh="如果你填了手机号、车牌号或职业，这些也会被交叉解读，写进对应的章节里，不是白填" en="If you filled in a phone number, license plate, or occupation, those are cross-read too and woven into the relevant sections — not left unused" /></li>
              </ul>
              <p className="mx-auto mt-6 max-w-sm text-xs leading-6 text-lm2-text-dim">
                <Bi
                  zh="五套真实系统、上百个真实数据点，交叉着，写给你一个人——这份报告，帮你看见的，从来不只是一张命盘。"
                  en="Five real systems, over a hundred real data points, cross-woven for you alone — what this report helps you see was never just a chart."
                />
              </p>
              <div className="mt-8">
                <p className="text-sm text-lm2-text-dim/60 line-through">$29.9</p>
                <p className="font-display text-4xl text-lm2-violet">$9.9</p>
              </div>
              <button
                onClick={unlockFull}
                disabled={unlocking}
                className="mt-6 inline-block bg-lm2-aurora px-12 py-4 font-display text-sm uppercase tracking-widest2 text-[#151222] shadow-[0_0_30px_rgba(180,150,255,0.4)] transition hover:brightness-110 disabled:opacity-50"
              >
                {unlocking ? t("正在跳转支付…", "Redirecting to payment…") : <>✨ <Bi zh="解锁完整报告" en="Unlock My Full Life Map" /></>}
              </button>
              {error && (
                <p className="mx-auto mt-4 max-w-sm rounded-sm border border-rose/30 bg-rose/10 px-4 py-3 text-sm leading-6 text-rose">
                  {error}
                </p>
              )}
              {!error && !submissionId && (
                <p className="mx-auto mt-4 max-w-xs text-xs text-lm2-text-dim/50">
                  <Bi zh="需要先登录，才能保存并解锁你的完整报告。" en="Sign in first to save and unlock your full report." />
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <style>{`
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
