"use client";

export type SasiHandoffMode = "auto" | "drama" | "build" | "research";

export type SasiHandoff = {
  version: 1;
  createdAt: number;
  prompt: string;
  mode: SasiHandoffMode;
  files: File[];
};

const DB_NAME = "lingxifield-sasi-handoff-v1";
const STORE_NAME = "handoffs";
const HANDOFF_KEY = "pending";
const MAX_AGE_MS = 30 * 60 * 1000;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("SASI_HANDOFF_DB_OPEN_FAILED"));
  });
}

export async function saveSasiHandoff(
  input: Omit<SasiHandoff, "version" | "createdAt">
): Promise<void> {
  const db = await openDb();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(
        {
          version: 1,
          createdAt: Date.now(),
          prompt: input.prompt,
          mode: input.mode,
          files: input.files,
        } satisfies SasiHandoff,
        HANDOFF_KEY
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("SASI_HANDOFF_SAVE_FAILED"));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("SASI_HANDOFF_SAVE_ABORTED"));
    });
  } finally {
    db.close();
  }
}

export async function consumeSasiHandoff(): Promise<SasiHandoff | null> {
  const db = await openDb();

  try {
    return await new Promise<SasiHandoff | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(HANDOFF_KEY);
      let value: SasiHandoff | null = null;

      request.onsuccess = () => {
        const candidate = request.result as SasiHandoff | undefined;
        if (
          candidate &&
          candidate.version === 1 &&
          Number.isFinite(candidate.createdAt) &&
          Date.now() - candidate.createdAt <= MAX_AGE_MS &&
          Array.isArray(candidate.files)
        ) {
          value = candidate;
        }
        store.delete(HANDOFF_KEY);
      };

      transaction.oncomplete = () => resolve(value);
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("SASI_HANDOFF_CONSUME_FAILED"));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("SASI_HANDOFF_CONSUME_ABORTED"));
    });
  } finally {
    db.close();
  }
}
