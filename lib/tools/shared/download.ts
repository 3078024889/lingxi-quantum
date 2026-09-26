export type DownloadOutcome = "download" | "share" | "preview";

function miniLikeEnvironment() {
  try {
    if (new URLSearchParams(window.location.search).get("mini") === "1") return true;
  } catch {}
  return /MicroMessenger|WeChat|QQ\/|MQQBrowser|baiduboxapp|BaiduBoxApp|BytedanceWebview|Toutiao|Aweme|TikTok|XiaoHongShu|Weibo|; wv\)|Android.*\bwv\b/i.test(navigator.userAgent || "");
}

export function safeFilename(name: string, fallback = "result") {
  const base = (name || fallback)
    .replace(/[\u0000-\u001f\u007f\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim() || fallback;
  return base.slice(0, 180);
}

export function replaceExt(name: string, ext: string) {
  const clean = safeFilename(name);
  const i = clean.lastIndexOf(".");
  const stem = i > 0 ? clean.slice(0, i) : clean;
  return `${stem}.${ext.replace(/^\./, "")}`;
}

export async function downloadBlob(blob: Blob, filename: string): Promise<DownloadOutcome> {
  const safe = safeFilename(filename);
  const file = new File([blob], safe, { type: blob.type || "application/octet-stream" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (miniLikeEnvironment() && nav.share) {
    try {
      const payload: ShareData = { title: safe, files: [file] };
      if (!nav.canShare || nav.canShare(payload)) {
        await nav.share(payload);
        return "share";
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "share";
    }
  }

  const url = URL.createObjectURL(blob);

  if (miniLikeEnvironment()) {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return "preview";
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = safe;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
  return "download";
}

export async function downloadUrl(url: string, filename: string): Promise<DownloadOutcome> {
  const safe = safeFilename(filename);

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    try {
      const r = await fetch(url);
      if (!r.ok && !url.startsWith("blob:")) throw new Error("DOWNLOAD_FETCH_FAILED");
      return await downloadBlob(await r.blob(), safe);
    } catch {
      if (miniLikeEnvironment()) {
        window.open(url, "_blank", "noopener,noreferrer");
        return "preview";
      }
    }
  }

  if (miniLikeEnvironment()) {
    try {
      const r = await fetch(url, { credentials: "omit" });
      if (r.ok) return await downloadBlob(await r.blob(), safe);
    } catch {}
    window.open(url, "_blank", "noopener,noreferrer");
    return "preview";
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = safe;
  a.rel = "noopener";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return "download";
}
