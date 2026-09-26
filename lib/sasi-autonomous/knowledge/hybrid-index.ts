import { tokenize, uniqueTokens } from "./tokenize";

export type EvidenceInput = { index?: number; sourceId?: string; title: string; locator?: string; text: string };
export type RankedEvidence = EvidenceInput & { score: number; matchedTerms: string[] };

function countTerms(tokens: string[]) {
  const map = new Map<string, number>();
  for (const token of tokens) map.set(token, (map.get(token) ?? 0) + 1);
  return map;
}

export class HybridEvidenceIndex {
  private readonly docs: Array<EvidenceInput & { tokens: string[]; tf: Map<string, number> }>;
  private readonly df = new Map<string, number>();
  private readonly avgLength: number;

  constructor(evidence: EvidenceInput[]) {
    this.docs = evidence.filter((x) => x && String(x.text ?? "").trim()).map((x) => {
      const tokens = tokenize(x.text);
      return { ...x, tokens, tf: countTerms(tokens) };
    });
    this.avgLength = this.docs.length ? this.docs.reduce((sum, x) => sum + x.tokens.length, 0) / this.docs.length : 1;
    for (const doc of this.docs) for (const term of new Set(doc.tokens)) this.df.set(term, (this.df.get(term) ?? 0) + 1);
  }

  search(query: string, limit = 8): RankedEvidence[] {
    const q = uniqueTokens(query);
    if (!q.length || !this.docs.length) return [];
    const N = this.docs.length, k1 = 1.2, b = 0.75;
    return this.docs.map((doc, idx) => {
      let score = 0;
      const matchedTerms: string[] = [];
      for (const term of q) {
        const f = doc.tf.get(term) ?? 0;
        if (!f) continue;
        matchedTerms.push(term);
        const n = this.df.get(term) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        const denom = f + k1 * (1 - b + b * (doc.tokens.length / Math.max(1, this.avgLength)));
        score += idf * ((f * (k1 + 1)) / Math.max(0.0001, denom));
      }
      const normalized = doc.text.normalize("NFKC").toLowerCase();
      const phrase = query.normalize("NFKC").toLowerCase().trim();
      if (phrase.length >= 2 && normalized.includes(phrase)) score += 3;
      if (doc.title && phrase && doc.title.toLowerCase().includes(phrase)) score += 1.2;
      return { ...doc, index: doc.index ?? idx + 1, score, matchedTerms: [...new Set(matchedTerms)].slice(0, 12) };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, Math.max(1, limit));
  }

  searchExpanded(query: string, limit = 8): RankedEvidence[] {
    const first = this.search(query, Math.max(limit, 4));
    const expansion = new Map<string, number>();
    for (const doc of first.slice(0, 4)) {
      for (const token of uniqueTokens(`${doc.title} ${doc.text.slice(0, 1400)}`)) {
        if (token.length < 2) continue;
        expansion.set(token, (expansion.get(token) ?? 0) + 1);
      }
    }
    const original = new Set(uniqueTokens(query));
    const extra = [...expansion.entries()].filter(([token]) => !original.has(token)).sort((a,b)=>b[1]-a[1]).slice(0, 8).map(([token])=>token);
    return this.search(`${query} ${extra.join(" ")}`, limit);
  }
}
