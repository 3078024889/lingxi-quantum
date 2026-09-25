"use client";

import { useState } from "react";
import { downloadBlob } from "@/lib/tools/shared/download";
import type { ToolResultFile } from "@/lib/tools/types";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { toolRuntimeText } from "@/lib/tool-runtime-i18n";

function safeZipName(name: string) {
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 180) || "result";
}
function uniqueZipName(name: string, used: Set<string>) {
  const safe = safeZipName(name);
  if (!used.has(safe)) { used.add(safe); return safe; }
  const dot = safe.lastIndexOf(".");
  const base = dot > 0 ? safe.slice(0, dot) : safe;
  const ext = dot > 0 ? safe.slice(dot) : "";
  let index = 2;
  let candidate = `${base} (${index})${ext}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${base} (${index})${ext}`;
  }
  used.add(candidate);
  return candidate;
}

export default function ResultPanel({
  files, messageZh, messageEn, details,
}: {
  files?: ToolResultFile[];
  messageZh?: string;
  messageEn?: string;
  details?: Record<string, string | number | boolean>;
}) {
  const { lang } = useLingxiLang();
  const t = (zh: string, en: string) => toolRuntimeText(lang, zh, en);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function downloadOne(file: ToolResultFile) {
    setDownloadError(null); setDownloading(file.name);
    try { downloadBlob(file.blob, file.name); }
    catch (error) {
      setDownloadError(error instanceof Error ? error.message : t("下载失败，请重试。", "Download failed. Please try again."));
    } finally { setDownloading(null); }
  }

  async function downloadAllAsZip() {
    if (!files?.length) return;
    setDownloadError(null); setDownloading("__all__");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Set<string>();
      for (const file of files) zip.file(uniqueZipName(file.name, used), file.blob);
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      downloadBlob(blob, `lingxifield-results-${Date.now()}.zip`);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : t("打包失败，请逐个下载。", "Could not create the ZIP. Download files individually."));
    } finally { setDownloading(null); }
  }

  return <div className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-6">
    <p className="text-sm font-medium text-[var(--lx-faint)]">{t("处理完成", "Ready")}</p>

    {(messageZh || messageEn) && <p className="mt-3 text-base leading-7 text-[var(--lx-ink)]">
      {t(messageZh || "", messageEn || messageZh || "")}
    </p>}

    {details && Object.keys(details).length > 0 && <dl className="mt-4 grid gap-2 sm:grid-cols-2">
      {Object.entries(details).map(([key, value]) => <div
        key={key}
        className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-2 text-sm"
      >
        <dt className="text-[var(--lx-faint)]">{key}</dt>
        <dd className="mt-0.5 break-all font-mono text-[var(--lx-ink)]">{String(value)}</dd>
      </div>)}
    </dl>}

    {files && files.length > 0 && <div className="mt-5 space-y-3">
      {files.length > 1 && <button
        type="button"
        disabled={downloading !== null}
        onClick={downloadAllAsZip}
        className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-5 py-2.5 text-sm font-medium text-[var(--lx-ink)] transition hover:border-[var(--lx-line-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloading === "__all__" ? t("正在打包…", "Creating ZIP…") : t(`打包下载全部（${files.length}）`, `Download all as ZIP (${files.length})`)}
      </button>}

      {files.map((file) => <div key={file.name + file.size} className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 text-sm text-[var(--lx-muted)]">
          <span className="break-all text-[var(--lx-ink)]">{file.name}</span>
          <span className="ml-2">· {(file.size / 1024).toFixed(1)} KB</span>
        </div>
        <button
          type="button"
          disabled={downloading !== null}
          onClick={() => downloadOne(file)}
          className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading === file.name ? t("正在下载…", "Downloading…") : t("下载", "Download")}
        </button>
      </div>)}
    </div>}

    {downloadError && <p role="alert" className="mt-4 text-sm leading-6 text-[var(--lx-danger)]">
      {t("下载未完成：", "Download did not finish: ")}{downloadError}
    </p>}
  </div>;
}
