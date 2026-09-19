export type KnowledgeSource = { id: string; title: string; text: string; createdAt: string };
export type Evidence = { sourceId: string; title: string; paragraph: number; text: string; score: number };

export function searchKnowledge(sources: KnowledgeSource[], query: string): Evidence[] {
  const normalized = query.normalize("NFKC").toLowerCase();
  const terms = new Set(normalized.match(/[a-z0-9]{2,}|[\u3400-\u9fff]{2,}/g) ?? []);
  for (const phrase of [...terms]) if (/^[\u3400-\u9fff]+$/.test(phrase)) {
    for (let i = 0; i < phrase.length - 1; i++) terms.add(phrase.slice(i, i + 2));
  }
  if (!terms.size) return [];
  return sources.flatMap(source => source.text.split(/\n\s*\n/).flatMap((paragraph, index) => {
    const chunks = paragraph.match(/[\s\S]{1,1000}/g) ?? [];
    return chunks.map(text => ({ sourceId: source.id, title: source.title, paragraph: index + 1, text,
      score: [...terms].reduce((score, term) => score + (text.toLowerCase().includes(term) ? term.length : 0), 0) }));
  })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
}

function openStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("lingxifield-private-knowledge-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("sources", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readSources(): Promise<KnowledgeSource[]> {
  const db = await openStore();
  try { return await new Promise((resolve, reject) => {
    const transaction = db.transaction("sources", "readonly");
    const request = transaction.objectStore("sources").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }); } finally { db.close(); }
}
export async function saveSource(source: KnowledgeSource | string): Promise<void> {
  const db = await openStore();
  try { await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("sources", "readwrite");
    const store = transaction.objectStore("sources");
    if (typeof source === "string") store.delete(source); else store.put(source);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }); } finally { db.close(); }
}
