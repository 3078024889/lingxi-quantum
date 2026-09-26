const LATIN_OR_NUMBER = /[a-z0-9_]+/giu;
const HAN = /[\u3400-\u9fff]+/gu;

export function normalizeText(input: string) {
  return String(input ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function tokenize(input: string): string[] {
  const text = normalizeText(input);
  const out: string[] = [];
  for (const m of text.match(LATIN_OR_NUMBER) ?? []) if (m.length >= 2 || /^\d+$/.test(m)) out.push(m);
  for (const block of text.match(HAN) ?? []) {
    if (block.length === 1) out.push(block);
    for (let n = 2; n <= Math.min(4, block.length); n++) {
      for (let i = 0; i <= block.length - n; i++) out.push(block.slice(i, i + n));
    }
  }
  return out;
}

export function uniqueTokens(input: string) {
  return [...new Set(tokenize(input))];
}
