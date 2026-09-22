export type KnowledgeSource = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  kind?: "text" | "pdf" | "image";
  locators?: Array<{ start: number; end: number; label: string }>;
};

export type Evidence = {
  sourceId: string;
  title: string;
  paragraph: number;
  locator: string;
  text: string;
  score: number;
};

function termsFor(query: string) {
  const normalized = query.normalize("NFKC").toLowerCase();
  const terms = new Set(normalized.match(/[a-z0-9]{2,}|[\u3400-\u9fff]{2,}/g) ?? []);
  for (const phrase of [...terms]) {
    if (/^[\u3400-\u9fff]+$/.test(phrase)) {
      for (let i = 0; i < phrase.length - 1; i++) terms.add(phrase.slice(i, i + 2));
    }
  }
  return [...terms];
}

function locatorAt(source: KnowledgeSource, start: number, paragraph: number) {
  const hit = source.locators?.find((x) => start >= x.start && start < x.end);
  return hit?.label || `第 ${paragraph} 段`;
}

export function searchKnowledge(sources: KnowledgeSource[], query: string): Evidence[] {
  const terms = termsFor(query);
  if (!terms.length) return [];

  return sources
    .flatMap((source) => {
      let cursor = 0;
      return source.text.split(/\n\s*\n/).flatMap((paragraph, index) => {
        const paragraphStart = source.text.indexOf(paragraph, cursor);
        cursor = Math.max(cursor, paragraphStart + paragraph.length);
        const chunks = paragraph.match(/[\s\S]{1,1800}/g) ?? [];
        return chunks.map((text, chunkIndex) => {
          const lower = text.toLowerCase();
          const score = terms.reduce((sum, term) => {
            const first = lower.indexOf(term);
            if (first < 0) return sum;
            const repeats = lower.split(term).length - 1;
            return sum + term.length * Math.min(4, repeats);
          }, 0);
          return {
            sourceId: source.id,
            title: source.title,
            paragraph: index + 1,
            locator: locatorAt(source, paragraphStart + chunkIndex * 1800, index + 1),
            text,
            score,
          };
        });
      });
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function openStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("lingxifield-private-knowledge-v2", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("sources", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readSources(): Promise<KnowledgeSource[]> {
  const db = await openStore();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("sources", "readonly");
      const request = transaction.objectStore("sources").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveSource(source: KnowledgeSource | string): Promise<void> {
  const db = await openStore();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("sources", "readwrite");
      const store = transaction.objectStore("sources");
      if (typeof source === "string") store.delete(source);
      else store.put(source);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}
