import {ensureToolExportAccess} from '../commerce/export-access-client';
export type DownloadOutcome = "download" | "preview";
export type FileShareOutcome = "shared" | "cancelled" | "unsupported" | "failed";
export function miniLikeEnvironment() {
  try { if (new URLSearchParams(window.location.search).get("mini") === "1") return true; } catch {}
  return /MicroMessenger|WeChat|QQ\/|MQQBrowser|baiduboxapp|BytedanceWebview|Toutiao|Aweme|TikTok|XiaoHongShu|Weibo|; wv\)|Android.*\bwv\b/i.test(navigator.userAgent || "");
}
export function safeFilename(name: string, fallback = "result") {
  const base = (name || fallback).replace(/[\u0000-\u001f\u007f\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim() || fallback;
  if (base.length <= 120) return base;
  const dot = base.lastIndexOf("."), suffix = dot > 0 && base.length - dot <= 12 ? base.slice(dot) : "";
  return base.slice(0, 120 - suffix.length) + suffix;
}
export function replaceExt(name: string, ext: string) {
  const clean = safeFilename(name), i = clean.lastIndexOf("."), stem = i > 0 ? clean.slice(0, i) : clean;
  return `${stem}.${ext.replace(/^\./, "")}`;
}
// Encoder output extensions determine MIME even when an FFmpeg/ZIP Blob is untyped.
const MIME: Record<string, string> = {
  mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  pdf: "application/pdf", zip: "application/zip", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", txt: "text/plain", csv: "text/csv",
  json: "application/json", srt: "application/x-subrip", vtt: "text/vtt",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
export function deliveryFile(blob: Blob, filename: string): File {
  const name = safeFilename(filename), extension = name.split(".").pop()?.toLowerCase() || "";
  return new File([blob], name, {type: MIME[extension] || blob.type || "application/octet-stream"});
}
/** Prepare native file sharing after allowance/payment is resolved.
 * Call the returned function directly inside a fresh click handler: do not await
 * another gate or fetch before navigator.share, which requires user activation.
 * The closure is issued only after successful authorization.
 * Resolution confirms OS handoff only, never delivery to a recipient.
 */
export async function prepareAuthorizedFileShare(blob: Blob, filename: string): Promise<() => Promise<FileShareOutcome>> {
  const file = deliveryFile(blob, filename), payload = {files: [file]};
  if (!navigator.share || !navigator.canShare || !navigator.canShare(payload)) {
    return () => Promise.resolve("unsupported" as const);
  }
  await ensureToolExportAccess(blob, filename, "share");
  return () => {
    try {
      // navigator.share is invoked synchronously before the returned promise is observed.
      return navigator.share(payload).then(
        () => "shared" as const,
        (error: unknown) => error && typeof error === "object" && "name" in error && error.name === "AbortError" ? "cancelled" as const : "failed" as const
      );
    } catch {
      return Promise.resolve("failed" as const);
    }
  };
}

// Cloud fallback requires a separate explicit consent click in the UI.
// Saving and sharing local files never call this upload function automatically.
export async function privateMobilePreview(blob: Blob, name: string) {
  await ensureToolExportAccess(blob,name);
  const file = deliveryFile(blob, name);
  const r = await fetch("/api/tools/mobile-file", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({name: file.name, type: file.type, size: file.size})});
  if (!r.ok) throw new Error(r.status === 401 ? "AUTH_REQUIRED" : "TEMP_FILE_SESSION_FAILED");
  const d = await r.json() as {putUrl: string; getUrl: string};
  const put = await fetch(d.putUrl, {method: "PUT", body: file, headers: {"content-type": file.type}});
  if (!put.ok) throw new Error("TEMP_FILE_UPLOAD_FAILED");
  window.location.assign(d.getUrl);
  return "preview" as const;
}
export async function downloadBlob(blob: Blob, filename: string): Promise<DownloadOutcome> {
  await ensureToolExportAccess(blob,filename);
  const file = deliveryFile(blob, filename), url = URL.createObjectURL(file), a = document.createElement("a");
  a.href = url; a.download = file.name; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  // Mobile viewers can still be reading after the click handler returns.
  setTimeout(() => URL.revokeObjectURL(url), 300_000);
  return "download";
}
const urlFiles=new Map<string,Promise<Blob|null>>();
const urlMarkers=new Map<string,Blob>();
export async function downloadUrl(url:string,filename:string):Promise<DownloadOutcome>{
 const parsed=new URL(url,location.href);if(!['https:','http:','blob:','data:'].includes(parsed.protocol))throw Error('DOWNLOAD_URL_INVALID');
 const safe=safeFilename(filename),key=location.pathname+'\0'+url;
 let pending=urlFiles.get(key);
 if(!pending){pending=fetch(url,{credentials:'same-origin'}).then(async r=>r.ok?await r.blob():null).catch(()=>null);urlFiles.set(key,pending);if(urlFiles.size>32)urlFiles.delete(urlFiles.keys().next().value!)}
 const blob=await pending;
 // Authorization errors must propagate; they cannot enter a direct-link fallback.
 if(blob)return downloadBlob(blob,safe);
 let marker=urlMarkers.get(key);if(!marker){marker=new Blob([url]);urlMarkers.set(key,marker);if(urlMarkers.size>32)urlMarkers.delete(urlMarkers.keys().next().value!)}
 await ensureToolExportAccess(marker,safe);
 const a=document.createElement('a');a.href=url;a.download=safe;a.rel='noopener noreferrer';a.target='_blank';document.body.appendChild(a);a.click();a.remove();return 'preview';
}
