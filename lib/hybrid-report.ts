// ────────────────────────────────────────────────────────────────
// 灵犀场 · 规则报告引擎（不含 AI）
// ────────────────────────────────────────────────────────────────
// 报告完全由规则产出，不调用任何外部模型。
//
// 这是刻意的架构决定，不是过渡状态：
//   · token 成本与速率限制不再是变量——报告生成是纯计算，零调用
//   · 同一份输入永远同一份输出，可复算，这是"结构层"承诺的技术基础
//   · 断网、断供、涨价都不影响用户能不能拿到报告
//
// 因此这里没有"回落 AI"这条路径。某一章产不出内容，是知识库
// 缺节点，属于必须修复的缺陷，会被 reportGaps() 报出来，
// 而不是悄悄交给模型糊过去——那样会让缺口永远藏着。
//
// AI 只保留在三处真正接自由文本的功能：提问灵犀、梦境探索、
// 意识显化签到，且只当后备（见 lib/gate-tone.ts 的关键词优先策略）。

import { buildReport, type Library, type Scores, type FieldState } from "@/lib/knowledge-engine";

export type HybridChapter = {
  key: string;
  titleZh: string;
  titleEn: string;
  /** 规则引擎产出的正文；null 表示知识库在这一章缺节点（缺陷，需补） */
  ruleTextZh: string | null;
  ruleTextEn: string | null;
  source: "rule" | "gap";
};

export type HybridPlan = {
  chapters: HybridChapter[];
  /** 缺节点的章节——这是知识库的待补清单，不是给 AI 的任务清单 */
  gapChapterKeys: string[];
  /** 规则覆盖率，用于日志与后台观察进度 */
  coverage: { total: number; byRule: number; percent: number };
};

/**
 * 规划一份报告：哪些章节走规则、哪些回落 AI。
 *
 * seed 必须稳定——用出生数据序列化后的字符串。同一个人每次传进来的
 * 必须一样，否则变体选择会变，"可复算"这个承诺就破了。
 */
export function planReport(
  lib: Library,
  scores: Scores,
  seed: string,
  state: FieldState | null = null
): HybridPlan {
  const rendered = buildReport(lib, scores, seed, state);

  const chapters: HybridChapter[] = rendered.map((ch) => {
    // blocks 为空 = 这一章的分数带还没有节点，回落 AI
    const hasContent = ch.blocks.length > 0;
    if (!hasContent) {
      return {
        key: ch.chapter, titleZh: ch.titleZh, titleEn: ch.titleEn,
        ruleTextZh: null, ruleTextEn: null, source: "gap",
      };
    }
    // 一章内可能有多块（组合/单维 + 状态层），用空行连接成完整章节
    return {
      key: ch.chapter, titleZh: ch.titleZh, titleEn: ch.titleEn,
      ruleTextZh: ch.blocks.map((b) => b.zh).join("\n\n"),
      ruleTextEn: ch.blocks.map((b) => b.en).join("\n\n"),
      source: "rule",
    };
  });

  const byRule = chapters.filter((c) => c.source === "rule").length;
  return {
    chapters,
    gapChapterKeys: chapters.filter((c) => c.source === "gap").map((c) => c.key),
    coverage: {
      total: chapters.length,
      byRule,
      percent: chapters.length ? Math.round((byRule / chapters.length) * 100) : 0,
    },
  };
}

/**
 * 渲染成最终报告文本。缺节点的章节直接跳过——宁可少一章，
 * 也不能输出空标题让用户以为内容丢了。
 */
export function renderReport(plan: HybridPlan, lang: "zh" | "en" = "zh"): string {
  return plan.chapters
    .map((ch, i) => {
      const body = (lang === "en" ? ch.ruleTextEn : ch.ruleTextZh) ?? "";
      if (!body.trim()) return "";
      const title = lang === "en" ? ch.titleEn : ch.titleZh;
      return `=== ${i + 1} ===\n${title}\n\n${body.trim()}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * 载入某个产品的知识库。
 * 用静态 import 而非 fs 读取——Next.js 构建时会把 JSON 打进产物，
 * 运行时零文件 IO、零延迟，也不依赖部署环境的文件系统布局。
 */
export async function loadLibrary(product: "resilience"): Promise<Library> {
  if (product === "resilience") {
    const [chapters, nodes, combos, states] = await Promise.all([
      import("@/knowledge/resilience/chapters.json"),
      import("@/knowledge/resilience/nodes.json"),
      import("@/knowledge/resilience/combos.json"),
      import("@/knowledge/resilience/states.json"),
    ]);
    return {
      chapters: (chapters.default ?? chapters).chapters as Library["chapters"],
      nodes: ((nodes.default ?? nodes).nodes ?? []) as Library["nodes"],
      combos: ((combos.default ?? combos).combos ?? []) as Library["combos"],
      states: ((states.default ?? states).nodes ?? []) as Library["states"],
    };
  }
  throw new Error(`未知产品：${product}`);
}
