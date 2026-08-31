import { createHash } from "node:crypto";
import { getDendriteProduct, type DendriteResult, type RelationshipAssessmentType } from "@/lib/mini/dendrite-engine";
import type { ReportEvidenceLeaf } from "@/lib/mini/report-entry-library";

type WebPublicationInput = {
  id: string;
  productId: string;
  report: string;
  relationshipType?: RelationshipAssessmentType;
};

function units(value: string) {
  const normalized = value.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/[^\p{L}\p{N}]+/gu, "");
  const result = new Set<string>();
  for (let index = 0; index < normalized.length - 1; index += 1) result.add(normalized.slice(index, index + 2));
  return result;
}

function overlap(left: string, right: string) {
  const a = units(left);
  const b = units(right);
  if (!a.size || !b.size) return 0;
  let hits = 0;
  a.forEach((value) => { if (b.has(value)) hits += 1; });
  return hits / Math.sqrt(a.size * b.size);
}

function clean(value: string) {
  return value
    .replace(/<!--\s*classical-editorial:[^>]+-->/gi, "")
    .replace(/^===\s*\d+\s*===\s*/gm, "")
    .trim();
}

function sections(report: string) {
  const value = clean(report);
  const split = value.includes("===SECTION===")
    ? value.split(/\n\s*===SECTION===\s*\n/g)
    : value.split(/\n\s*===\s*\d+\s*===\s*\n/g);
  return split.map((part, index) => {
    const lines = part.split("\n").map((line) => line.trim()).filter(Boolean);
    const title = lines[0]?.replace(/^#{1,4}\s*/, "") || `第 ${index + 1} 篇`;
    const body = lines.slice(1).join("\n").trim() || lines[0] || "";
    return { title, body };
  }).filter((part) => part.body.length >= 12).slice(0, 24);
}

/**
 * Adapts an already-published web report into the same evidence contract used
 * by native Mini Program assessments.  The report's own chapters are the
 * evidence: no questionnaire answer is invented and no web report is counted
 * until its complete publication text exists.
 */
export function webPublicationEvidence(input: WebPublicationInput): DendriteResult | null {
  const product = getDendriteProduct(input.productId, input.relationshipType);
  const publicationSections = sections(input.report);
  if (!product || publicationSections.length < 3) return null;

  const assignments = publicationSections.map((section, sectionIndex) => {
    const ranked = product.nodes.map((node, nodeIndex) => ({
      node,
      nodeIndex,
      relevance: overlap(`${section.title}\n${section.body}`, `${node.zh}\n${node.meaningZh}\n${node.actionZh}`),
    })).sort((left, right) => right.relevance - left.relevance || left.nodeIndex - right.nodeIndex);
    return { section, node: ranked[0]?.relevance ? ranked[0].node : product.nodes[sectionIndex % product.nodes.length] };
  });

  const nodeScores = product.nodes.map((node) => {
    const related = assignments.filter((item) => item.node.id === node.id);
    const evidenceText = related.map((item) => `${item.section.title}\n${item.section.body}`).join("\n");
    const digest = createHash("sha256").update(`${input.id}:${node.id}:${evidenceText}`).digest();
    const score = related.length ? Math.min(92, 58 + related.length * 7 + digest[0] % 9) : 38 + digest[0] % 13;
    return { ...node, score };
  });
  const dominant = [...nodeScores].sort((left, right) => right.score - left.score).slice(0, 3);
  const evidenceLeaves: ReportEvidenceLeaf[] = assignments.map(({ section, node }, index) => ({
    sourceProductId: input.productId,
    questionId: `web-publication-${index + 1}`,
    evidenceDimension: "web-published-chapter",
    promptZh: section.title,
    promptEn: section.title,
    answerId: `chapter-${index + 1}`,
    answerZh: section.body.slice(0, 420),
    answerEn: section.body.slice(0, 420),
    answerSemantic: "published-web-report",
    polarity: "support",
    nodeIds: [node.id],
    counterNodeIds: [],
    strength: 0.78,
    responseKind: "preset",
    matchConfidence: 0.78,
  }));

  return {
    algorithm: "lingxifield-dendritic-v2",
    nodes: nodeScores,
    dominant,
    edges: dominant.flatMap((left, index) => dominant.slice(index + 1).map((right) => ({
      from: left.id,
      to: right.id,
      weight: Math.max(0.2, 1 - Math.abs(left.score - right.score) / 100),
    }))),
    titleZh: `${product.nameZh} · 网页完整报告证据`,
    titleEn: `${product.nameEn} · Web Publication Evidence`,
    insightZh: "本支流取自已经生成并保存的网页完整报告，以章节原文为证，不以缺失的小程序旧题卷阻断汇流。",
    insightEn: "This tributary is grounded in the saved complete web publication and does not invent missing questionnaire answers.",
    chapters: publicationSections.slice(0, 11).map((section, index) => ({
      id: `web-${index + 1}`,
      titleZh: section.title,
      titleEn: section.title,
      bodyZh: section.body,
      bodyEn: section.body,
    })),
    evidence: {
      answered: evidenceLeaves.length,
      total: evidenceLeaves.length,
      historyProducts: 1,
      sourceZh: "网页完整报告章节",
      sourceEn: "Complete web report chapters",
    },
    evidenceLeaves,
  };
}
