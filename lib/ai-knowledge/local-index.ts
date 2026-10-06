export const KNOWLEDGE_SOURCE_MAX = 60;

export type KnowledgeSource = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  kind?: "text" | "pdf" | "image" | "docx" | "sheet" | "rtf" | "epub" | "pptx" | "structured";
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
  const normalized = query.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
  const terms = new Set(normalized.match(/[a-z0-9]{2,}|[\u3400-\u9fff]{2,}/g) ?? []);
  for (const phrase of [...terms]) {
    if (/^[\u3400-\u9fff]+$/.test(phrase)) {
      for (let size = 2; size <= Math.min(4, phrase.length); size++) {
        for (let i = 0; i <= phrase.length - size; i++) terms.add(phrase.slice(i, i + size));
      }
    }
  }
  return { normalized, terms: [...terms] };
}

function locatorAt(source: KnowledgeSource, start: number, paragraph: number) {
  const hit = source.locators?.find((x) => start >= x.start && start < x.end);
  return hit?.label || `第 ${paragraph} 段`;
}

function occurrences(text:string, term:string){
  let n=0,pos=0;
  while((pos=text.indexOf(term,pos))>=0){n++;pos+=Math.max(1,term.length)}
  return n;
}

export function searchKnowledge(sources: KnowledgeSource[], query: string,options?:{limit?:number;perSource?:number}): Evidence[] {
  const parsed = termsFor(query);
  if (!parsed.terms.length) return [];
  const candidates = sources.flatMap((source) => {
    let cursor = 0;
    return source.text.split(/\n\s*\n/).flatMap((paragraph, index) => {
      const paragraphStart = source.text.indexOf(paragraph, cursor);
      cursor = Math.max(cursor, paragraphStart + paragraph.length);
      const chunks = paragraph.match(/[\s\S]{1,1400}/g) ?? [];
      return chunks.map((text, chunkIndex) => ({source,index,text,paragraphStart,chunkIndex}));
    });
  });
  const documentFrequency = new Map<string,number>();
  for(const term of parsed.terms){
    documentFrequency.set(term,candidates.reduce((n,c)=>n+(c.text.toLowerCase().includes(term)?1:0),0));
  }
  const N=Math.max(1,candidates.length), avgLen=Math.max(1,candidates.reduce((n,c)=>n+c.text.length,0)/N);
  const scored=candidates.map(c=>{
    const lower=c.text.normalize("NFKC").toLowerCase();
    let score=0, matched=0;
    for(const term of parsed.terms){
      const tf=occurrences(lower,term); if(!tf) continue; matched++;
      const df=documentFrequency.get(term)||0;
      const idf=Math.log(1+(N-df+.5)/(df+.5));
      const norm=tf*(1.2+1)/(tf+1.2*(.25+.75*(lower.length/avgLen)));
      score += idf*norm*(1+Math.min(1.5,term.length/4));
    }
    if(parsed.normalized.length>=3 && lower.includes(parsed.normalized)) score+=8;
    score += matched/parsed.terms.length*4;
    return {sourceId:c.source.id,title:c.source.title,paragraph:c.index+1,locator:locatorAt(c.source,c.paragraphStart+c.chunkIndex*1400,c.index+1),text:c.text,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  const picked:Evidence[]=[]; const perSource=new Map<string,number>();
  for(const item of scored){
    const used=perSource.get(item.sourceId)||0;
    if(used>=(options?.perSource??4)) continue;
    if(picked.some(x=>x.sourceId===item.sourceId && x.text===item.text)) continue;
    picked.push(item); perSource.set(item.sourceId,used+1);
    if(picked.length>=(options?.limit??18)) break;
  }
  return picked;
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
      let settled = false;

      const rejectOnce = (error: unknown) => {
        if (settled) return;
        settled = true;
        reject(error instanceof Error ? error : new Error(String(error)));
      };

      if (typeof source === "string") {
        store.delete(source);
      } else {
        const existing = store.get(source.id);
        existing.onerror = () => rejectOnce(existing.error ?? new Error("KNOWLEDGE_SOURCE_LOOKUP_FAILED"));
        existing.onsuccess = () => {
          if (existing.result) {
            store.put(source);
            return;
          }

          const count = store.count();
          count.onerror = () => rejectOnce(count.error ?? new Error("KNOWLEDGE_SOURCE_COUNT_FAILED"));
          count.onsuccess = () => {
            if (count.result >= KNOWLEDGE_SOURCE_MAX) {
              rejectOnce(new Error("KNOWLEDGE_SOURCE_LIMIT"));
              transaction.abort();
              return;
            }
            store.put(source);
          };
        };
      }

      transaction.oncomplete = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      transaction.onerror = () => rejectOnce(transaction.error ?? new Error("KNOWLEDGE_SOURCE_WRITE_FAILED"));
      transaction.onabort = () => rejectOnce(transaction.error ?? new Error("KNOWLEDGE_SOURCE_WRITE_ABORTED"));
    });
  } finally {
    db.close();
  }
}
