import type { Intelligence } from "../types";
import type { RankedEvidence } from "./hybrid-index";
import { classifyKnowledgeIntent, type KnowledgeIntent } from "./intent";
import { normalizeText, uniqueTokens } from "./tokenize";

const CAUSAL = /因为|由于|因此|所以|导致|原因|because|therefore|caused|reason/i;
const PROCEDURAL = /首先|其次|然后|最后|步骤|方法|如何|怎么|first|then|next|finally|how to/i;
const DEFINITION = /是指|定义|意味着|称为|属于|is defined|means|refers to/i;
const TIME = /(19|20)\d{2}(?:[-/.年]\d{1,2})?|\d{1,2}月\d{1,2}日|此前|随后|之后|之前|later|before|after/i;
const NEGATION = /不|没有|并非|未|无|not|never|no\b/i;

function splitSentences(text: string) {
  return text.split(/(?<=[。！？!?；;\.])\s*|\n+/u).map((s) => s.trim()).filter((s) => s.length >= 6 && s.length <= 900);
}

function intentBonus(intent: KnowledgeIntent, sentence: string) {
  if (intent === "causal" && CAUSAL.test(sentence)) return 2.2;
  if (intent === "procedure" && PROCEDURAL.test(sentence)) return 2.2;
  if (intent === "definition" && DEFINITION.test(sentence)) return 1.8;
  if (intent === "timeline" && TIME.test(sentence)) return 1.8;
  if (intent === "comparison" && /相比|不同|而|但是|分别|versus|while|however|difference/i.test(sentence)) return 1.4;
  return 0;
}

function sentenceKey(sentence: string) {
  return normalizeText(sentence).replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 120);
}

function detectPossibleConflicts(rows: Array<{ sentence: string; ref: number }>) {
  const conflicts: Array<{ refs: number[]; note: string }> = [];
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
    const a = rows[i], b = rows[j];
    const overlap = uniqueTokens(a.sentence).filter((token) => uniqueTokens(b.sentence).includes(token));
    if (overlap.length >= 3 && NEGATION.test(a.sentence) !== NEGATION.test(b.sentence)) {
      conflicts.push({ refs: [...new Set([a.ref,b.ref])], note: "相关原文存在肯定/否定方向差异，建议回到对应出处核对上下文。" });
    }
  }
  return conflicts.slice(0, 4);
}

export function synthesizeEvidenceAnswer(input: { question: string; evidence: RankedEvidence[]; intelligence?: Intelligence; mode?: "book"|"learning"|"research" }) {
  const intelligence = input.intelligence ?? "standard";
  const intent = classifyKnowledgeIntent(input.question);
  const q = new Set(uniqueTokens(input.question));
  const maxSentences = intelligence === "light" ? 4 : intelligence === "high" ? 10 : 7;
  const candidates = input.evidence.flatMap((item, evidenceIndex) => splitSentences(item.text).map((sentence, sentenceIndex) => {
    const terms = uniqueTokens(sentence);
    const overlap = terms.reduce((sum, term) => sum + (q.has(term) ? 1 : 0), 0);
    const density = overlap / Math.max(1, Math.sqrt(terms.length));
    return {
      sentence,
      ref: Number(item.index ?? evidenceIndex + 1),
      score: item.score * 0.38 + density * 1.4 + intentBonus(intent, sentence) + (sentenceIndex < 2 ? 0.18 : 0),
    };
  }));

  const selected: typeof candidates = [];
  const seen = new Set<string>();
  for (const row of candidates.sort((a,b)=>b.score-a.score)) {
    const key = sentenceKey(row.sentence);
    if (!key || seen.has(key)) continue;
    seen.add(key); selected.push(row);
    if (selected.length >= maxSentences) break;
  }
  if (!selected.length) return { answer: "现有资料不足以确认这个问题。可以补充更相关的原文后再问。", citations: [] as number[], confidence: 0, intent, conflicts: [] as Array<{refs:number[];note:string}> };

  const lead: Record<KnowledgeIntent,string> = {
    definition:"根据原文，可以这样界定：", causal:"资料中与原因直接相关的依据是：", procedure:"按原文信息，可以整理成这些步骤：",
    comparison:"把相关原文并列后，可以看到这些差异或对应关系：", timeline:"按资料中的时间与先后关系，可以整理为：",
    summary:"这批资料最重要的信息可以压缩为：", fact:"根据当前资料，可以确认：",
  };
  const bullets = selected.map((row, index) => `${index + 1}. ${row.sentence} [${row.ref}]`).join("\n");
  const citations = [...new Set(selected.map((x)=>x.ref))];
  const conflicts = detectPossibleConflicts(selected);
  const boundary = input.mode === "research" || intelligence === "high" ? "\n\n边界：以上结论只来自当前提供的原文；资料没有直接支持的内容没有补写。" : "";
  const conflictText = conflicts.length ? `\n\n需要核对：\n${conflicts.map((x)=>`- ${x.note} [${x.refs.join("][")}]`).join("\n")}` : "";
  const confidence = Math.min(1, selected.reduce((sum,row)=>sum+Math.max(0,row.score),0) / Math.max(4, selected.length * 3.5));
  return { answer: `${lead[intent]}\n\n${bullets}${conflictText}${boundary}`, citations, confidence, intent, conflicts };
}
