export type AutonomousEvidence = {
  index: number;
  title: string;
  locator?: string;
  text: string;
};

type Mode = "book" | "learning" | "research";
type Intelligence = "light" | "standard" | "high";

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function terms(question: string) {
  const q = normalize(question);
  const out = new Set(q.match(/[a-z0-9][a-z0-9_-]{1,}|[\u3400-\u9fff]{2,}/g) ?? []);
  for (const token of [...out]) {
    if (/^[\u3400-\u9fff]+$/.test(token) && token.length > 2) {
      for (let i = 0; i < token.length - 1; i++) out.add(token.slice(i, i + 2));
    }
  }
  return [...out].filter((x) => x.length >= 2).slice(0, 64);
}

function splitSentences(text: string) {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[。！？!?；;])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8)
    .slice(0, 800);
}

function scoreSentence(sentence: string, queryTerms: string[], evidenceRank: number) {
  const lower = normalize(sentence);
  let score = Math.max(0, 18 - evidenceRank * 2);
  for (const term of queryTerms) {
    let from = 0;
    let hits = 0;
    while (hits < 4) {
      const at = lower.indexOf(term, from);
      if (at < 0) break;
      score += Math.min(12, term.length * 2) + (hits === 0 ? 5 : 1);
      from = at + term.length;
      hits++;
    }
  }
  if (sentence.length >= 20 && sentence.length <= 220) score += 3;
  if (/[0-9一二三四五六七八九十%％]/.test(sentence)) score += 1;
  return score;
}

function uniqueByMeaning<T extends { sentence: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalize(item.sentence).replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 80);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function autonomousAnswer(input: {
  question: string;
  mode: Mode;
  intelligence: Intelligence;
  evidence: AutonomousEvidence[];
}) {
  const question = input.question.trim();
  const queryTerms = terms(question);
  const ranked = uniqueByMeaning(
    input.evidence.flatMap((e, evidenceRank) =>
      splitSentences(e.text).map((sentence) => ({
        sentence,
        score: scoreSentence(sentence, queryTerms, evidenceRank),
        evidence: e,
      })),
    ),
  ).sort((a, b) => b.score - a.score);

  const desired = input.intelligence === "light" ? 4 : input.intelligence === "high" ? 10 : 7;
  const selected = ranked.filter((x) => x.score > 0).slice(0, desired);
  const fallback = selected.length ? selected : ranked.slice(0, Math.min(desired, 5));

  if (!fallback.length) {
    return {
      answer: "现有资料不足以确认。请继续加入资料，或把问题改得更接近原文中的关键词。",
      evidenceCount: 0,
      confidence: "insufficient" as const,
      method: "lingxifield-local-evidence-synthesis-v1",
    };
  }

  const grouped = new Map<number, typeof fallback>();
  for (const item of fallback) {
    const list = grouped.get(item.evidence.index) ?? [];
    list.push(item);
    grouped.set(item.evidence.index, list);
  }

  const lead =
    input.mode === "research"
      ? "根据当前资料中与问题最相关的证据，可以先得到以下可核对的研究结论："
      : input.mode === "learning"
        ? "把相关原文放在一起看，可以这样理解："
        : "根据你提供的原文，答案可以整理为：";

  const bullets = fallback
    .map((item) => `- ${item.sentence} [${item.evidence.index}]`)
    .join("\n");

  const sourceNotes = [...grouped.entries()]
    .map(([index, items]) => {
      const e = items[0].evidence;
      const locators = [...new Set(items.map((x) => x.evidence.locator).filter(Boolean))].join("、");
      return `[${index}] ${e.title}${locators ? ` · ${locators}` : ""}`;
    })
    .join("\n");

  const boundary =
    input.intelligence === "high"
      ? "\n\n边界：以上只使用你提供的原文证据进行检索、排序与重组；资料没有明确支持的内容没有补写。"
      : "";

  return {
    answer: `${lead}\n\n${bullets}\n\n依据：\n${sourceNotes}${boundary}`,
    evidenceCount: grouped.size,
    confidence: selected.length >= 3 ? ("supported" as const) : ("limited" as const),
    method: "lingxifield-local-evidence-synthesis-v1",
  };
}
