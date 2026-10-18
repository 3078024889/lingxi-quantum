"use client";

import ToolUiText,{useToolUiCopy} from "@/components/tools/ToolUiText";
import { useEffect, useMemo, useRef, useState } from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type { ToolResultFile } from "@/lib/tools/types";
import { openPdf } from "@/lib/tools/pdf-render-client";
import {runRegexSafely} from '@/lib/tools/shared/regex-worker-client';

type Hit = {
  file: string;
  page: number;
  count: number;
  snippet: string;
};

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

async function findHits(text: string, query: string, caseSensitive: boolean, regexMode: boolean, signal?:AbortSignal) {
  if (!query) return { count: 0, index: -1 };

  if (regexMode) {
    const flags = caseSensitive ? "g" : "gi";
    const matches = await runRegexSafely(`/${query}/${flags}`,text,signal);
    return { count: matches.length, index: matches[0]?.position ?? -1 };
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
 const toolUiCopy=useToolUiCopy();

  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regexMode, setRegexMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searched,setSearched]=useState(false);
  const active=useRef<AbortController|null>(null);
  useEffect(()=>()=>active.current?.abort(),[]);
  function invalidate(){setHits([]);setError("");setSearched(false)}

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
    setSearched(false);
    const controller=new AbortController();active.current=controller;

    try {
      const output: Hit[] = [];

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const pdf = await openPdf(files[fileIndex]);

        try {
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            if(controller.signal.aborted)return;
            setStage(`${fileIndex + 1}/${files.length} · page ${pageNumber}/${pdf.numPages}`);
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            const text = (content.items || [])
              .map((item: any) => String(item.str || ""))
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();

            const result = await findHits(text, query, caseSensitive, regexMode,controller.signal);
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
      setSearched(true);
      setStage("");
    } catch (cause) {
      setStage("");
      if(controller.signal.aborted)return;
      const code=cause instanceof Error?cause.message:"";
      setError(regexMode&&code.startsWith('REGEX_')
        ?toolUiCopy("搜索未完成。请简化正则表达式，或关闭正则模式后重试。")
        :toolUiCopy("无法处理此文件。请确认文件完整、可以打开，解锁加密文件后再试。"));
    } finally {
      setBusy(false);
      if(active.current===controller)active.current=null;
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
          invalidate();
        }}
        disabled={busy}
        kind="pdf"
      />

      <input
        value={query}
        disabled={busy}
        onChange={(event) => {setQuery(event.target.value);invalidate()}}
        placeholder={toolUiCopy("输入姓名、合同编号、关键词或正则表达式…")}
        className="w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-3"
      />

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={caseSensitive}
            disabled={busy}
            onChange={(event) => {setCaseSensitive(event.target.checked);invalidate()}}
          />
          <ToolUiText text="区分大小写" />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={regexMode}
            disabled={busy}
            onChange={(event) => {setRegexMode(event.target.checked);invalidate()}}
          />
          <ToolUiText text="正则表达式" />
        </label>
      </div>

      <button
        disabled={!files.length || !query.trim() || busy}
        onClick={run}
        className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40"
      >
        <ToolUiText text={busy ? "正在搜索…" : "搜索所有 PDF"} />
      </button>

      {stage && <p className="text-sm text-[var(--lx-muted)]">{stage}</p>}

      {hits.length > 0 && (
        <>
          <div className="rounded-xl bg-[var(--lx-soft)] p-4 text-sm">
            <ToolUiText text="找到" /> <b>{totalMatches}</b> <ToolUiText text="处匹配，分布在" /> <b>{hits.length}</b> <ToolUiText text="个页面。" />
          </div>

          <div className="space-y-2">
            {hits.map((hit, index) => (
              <article
                key={`${hit.file}-${hit.page}-${index}`}
                className="rounded-xl border border-[var(--lx-line)] p-3"
              >
                <div className="text-sm font-medium">
                  {hit.file} <ToolUiText text="· 第" /> {hit.page} <ToolUiText text="页 ·" /> {hit.count} <ToolUiText text="处" />
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

      {!busy && searched && query.trim() && files.length > 0 && hits.length === 0 && !error && (
        <p className="text-sm text-[var(--lx-muted)]">
          <ToolUiText text="当前文本层没有找到匹配。扫描 PDF 请先使用 PDF OCR。" />
        </p>
      )}

      {error && <p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
    </div>
  );
}
