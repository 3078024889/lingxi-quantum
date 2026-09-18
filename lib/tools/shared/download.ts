export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a tick so the download can start
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function safeFilename(name: string, fallback = "result") {
  const base = (name || fallback).replace(/[\\/:*?"<>|]+/g, "_").trim() || fallback;
  return base.slice(0, 180);
}

export function replaceExt(name: string, ext: string) {
  const clean = safeFilename(name);
  const i = clean.lastIndexOf(".");
  const stem = i > 0 ? clean.slice(0, i) : clean;
  return `${stem}.${ext.replace(/^\./, "")}`;
}
