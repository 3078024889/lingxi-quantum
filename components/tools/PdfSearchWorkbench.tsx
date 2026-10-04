"use client";

import { useMemo, useState } from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type { ToolResultFile } from "@/lib/tools/types";
import { openPdf } from "@/lib/tools/pdf-render-client";

type Hit = {
  file: string;
  page: number;
  count: number;
  snippet: string;
};

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function findHits(text: string, query: string, caseSensitive: boolean, regexMode: boolean) {
  if (!query) return { count: 0, index: -1 };

  if (regexMode) {
    const flags = caseSensitive ? "g" : "gi";
    const expression = new RegExp(query, flags);
    const matches = [...text.matchAll(expression)];
    return { count: matches.length, index: matches[0]?.index ?? -1 };
  }

  const haystack = caseSensitive ? text : text.toLocaleLowerCase();
  const needle = caseSensitive ? query : query.toLocaleLowerCase();
  let count = 0;
  let cursor = 0;
  let first = -1;

  while (needle && cursor <= haystack.length) {
    const index = haystack.indexOf(needle, cursor);
    if (index < 0) break;
    if (first < 0) first = index;
    count++;
    cursor = index + Math.max(1, needle.length);
  }

  return { count, index: first };
}

function snippetAround(text: string, index: number, length: number) {
  if (index < 0) return "";
  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + Math.max(1, length) + 120);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}

export default function PdfSearchWorkbench() {
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regexMode, setRegexMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  const totalMatches = useMemo(
    () => hits.reduce((sum, hit) => sum + hit.count, 0),
    [hits],
  );

  const exportFiles = useMemo<ToolResultFile[]>(() => {
    if (!hits.length) return [];
    const rows = [
      ["file", "page", "matches", "snippet"],
      ...hits.map((hit) => [hit.file, hit.page, hit.count, hit.snippet]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    return [{ name: "pdf-search-results.csv", blob, mime: "text/csv", size: blob.size }];
  }, [hits]);

  async function run() {
    if (!query.trim()) return;

    setBusy(true);
    setError("");
    setHits([]);

    try {
      const output: Hit[] = [];

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const pdf = await openPdf(files[fileIndex]);

        try {
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            setStage(`${fileIndex + 1}/${files.length} · page ${pageNumber}/${pdf.numPages}`);
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            const text = (content.items || [])
              .map((item: any) => String(item.str || ""))
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();

            const result = findHits(text, query, caseSensitive, regexMode);
            if (result.count > 0) {
              output.push({
                file: files[fileIndex].name,
                page: pageNumber,
                count: result.count,
                snippet: snippetAround(text, result.index, query.length),
              });
            }
          }
        } finally {
          pdf.destroy?.();
        }
      }

      setHits(output);
      setStage("");
    } catch (cause) {
      setStage("");
      setError(
        regexMode
          ? `搜索失败；请检查正则表达式。${cause instanceof Error ? " " + cause.message : ""}`
          : cause instanceof Error
            ? cause.message
            : String(cause),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropzone
        accept="application/pdf,.pdf"
        multiple
        append
        maxFiles={50}
        maxSizeMB={200}
        files={files}
        onChange={(next) => {
          setFiles(next);
          setHits([]);
          setError("");
        }}
        disabled={busy}
        kind="pdf"
      />

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="输入姓名、合同编号、关键词或正则表达式…"
        className="w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-3"
      />

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(event) => setCaseSensitive(event.target.checked)}
          />
          区分大小写
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={regexMode}
            onChange={(event) => setRegexMode(event.target.checked)}
          />
          正则表达式
        </label>
      </div>

      <button
        disabled={!files.length || !query.trim() || busy}
        onClick={run}
        className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40"
      >
        {busy ? "正在搜索…" : "搜索所有 PDF"}
      </button>

      {stage && <p className="text-sm text-[var(--lx-muted)]">{stage}</p>}

      {hits.length > 0 && (
        <>
          <div className="rounded-xl bg-[var(--lx-soft)] p-4 text-sm">
            找到 <b>{totalMatches}</b> 处匹配，分布在 <b>{hits.length}</b> 个页面。
          </div>

          <div className="space-y-2">
            {hits.map((hit, index) => (
              <article
                key={`${hit.file}-${hit.page}-${index}`}
                className="rounded-xl border border-[var(--lx-line)] p-3"
              >
                <div className="text-sm font-medium">
                  {hit.file} · 第 {hit.page} 页 · {hit.count} 处
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--lx-muted)]">
                  {hit.snippet}
                </p>
              </article>
            ))}
          </div>

          <ResultPanel
            sourceSlug="pdf-search"
            files={exportFiles}
            messageZh="搜索结果可导出为 CSV。"
            messageEn="Search results can be exported as CSV."
          />
        </>
      )}

      {!busy && query.trim() && files.length > 0 && hits.length === 0 && !error && (
        <p className="text-sm text-[var(--lx-muted)]">
          当前文本层没有找到匹配。扫描 PDF 请先使用 PDF OCR。
        </p>
      )}

      {error && <p className="text-sm text-[var(--lx-danger)]">{error}</p>}
    </div>
  );
}
