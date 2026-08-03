// ────────────────────────────────────────────────────────────────
// 灵犀场 · 规则/AI 混合层
// ────────────────────────────────────────────────────────────────
// 这一层是知识库从"图纸"变成"生产线"的接口。
//
// 为什么要混合，而不是等知识库写完再一次性切换：
//   等的话，写的每一条节点在上线之前都无法验证，只能靠想象判断好不好；
//   而且要等几周，这期间 429 限流、报告截断这些问题一个都不会缓解。
// 混合之后：
//   · 每写一条节点，立刻就在生产环境生效，效果当场可见
//   · 节点越多，AI 调用越少，429 自然缓解
//   · 某一天所有章节都有节点了，AI 就可以关掉——那时切换是无感的，
//     不是一次有风险的大爆炸
//
// 判定规则很简单：某一章如果规则引擎能产出内容，就用规则的；
// 产不出来（该分数带还没写节点），这一章交给 AI。
// 两者产出的章节标题一致（chapters.json 已对齐线上 buildChapters），
// 所以拼在一起用户看不出接缝。

import { buildReport, type Library, type Scores, type FieldState } from "@/lib/knowledge-engine";

export type HybridChapter = {
  key: string;
  titleZh: string;
  titleEn: string;
  /** 规则引擎产出的正文；null 表示这一章需要 AI 生成 */
  ruleTextZh: string | null;
  ruleTextEn: string | null;
  source: "rule" | "ai";
};

export type HybridPlan = {
  chapters: HybridChapter[];
  /** 需要交给 AI 的章节，按线上原有的批次逻辑处理 */
  aiChapterKeys: string[];
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
        ruleTextZh: null, ruleTextEn: null, source: "ai",
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
    aiChapterKeys: chapters.filter((c) => c.source === "ai").map((c) => c.key),
    coverage: {
      total: chapters.length,
      byRule,
      percent: chapters.length ? Math.round((byRule / chapters.length) * 100) : 0,
    },
  };
}

/**
 * 把规则章节与 AI 章节合并成最终报告文本。
 * aiSections 的键是章节 key，值是该章的正文。
 * 顺序永远以 chapters.json 为准，不受两边生成顺序影响。
 */
export function mergeReport(
  plan: HybridPlan,
  aiSections: Record<string, string>,
  lang: "zh" | "en" = "zh"
): string {
  return plan.chapters
    .map((ch, i) => {
      const title = lang === "en" ? ch.titleEn : ch.titleZh;
      const body =
        ch.source === "rule"
          ? (lang === "en" ? ch.ruleTextEn : ch.ruleTextZh) ?? ""
          : aiSections[ch.key] ?? "";
      if (!body.trim()) return "";
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
