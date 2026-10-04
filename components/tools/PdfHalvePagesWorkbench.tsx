"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import type { ToolResultFile } from "@/lib/tools/types";

type Direction = "left-right" | "top-bottom";

function pdfBlob(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}

export default function PdfHalvePagesWorkbench() {
  const [files, setFiles] = useState<File[]>([]);
  const [direction, setDirection] = useState<Direction>("left-right");
  const [order, setOrder] = useState<"first-second" | "second-first">("first-second");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ToolResultFile[]>([]);

  async function run() {
    setBusy(true);
    setError("");
    setResults([]);

    try {
      const output: ToolResultFile[] = [];

      for (const file of files) {
        const source = await PDFDocument.load(await file.arrayBuffer());
        const target = await PDFDocument.create();

        for (let index = 0; index < source.getPageCount(); index++) {
          const [first, second] = await target.copyPages(source, [index, index]);
          const sourcePage = source.getPage(index);
          const box = sourcePage.getCropBox();
          const width = box.width;
          const height = box.height;

          if (direction === "left-right") {
            first.setMediaBox(box.x, box.y, width / 2, height);
            first.setCropBox(box.x, box.y, width / 2, height);
            second.setMediaBox(box.x + width / 2, box.y, width / 2, height);
            second.setCropBox(box.x + width / 2, box.y, width / 2, height);
          } else {
            first.setMediaBox(box.x, box.y + height / 2, width, height / 2);
            first.setCropBox(box.x, box.y + height / 2, width, height / 2);
            second.setMediaBox(box.x, box.y, width, height / 2);
            second.setCropBox(box.x, box.y, width, height / 2);
          }

          if (order === "first-second") {
            target.addPage(first);
            target.addPage(second);
          } else {
            target.addPage(second);
            target.addPage(first);
          }
        }

        const bytes = await target.save({ useObjectStreams: true });
        const blob = pdfBlob(bytes);
        output.push({
          name: file.name.replace(/\.pdf$/i, "") + "-halved.pdf",
          blob,
          mime: "application/pdf",
          size: blob.size,
        });
      }

      setResults(output);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
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
        maxFiles={20}
        maxSizeMB={200}
        files={files}
        onChange={(next) => {
          setFiles(next);
          setResults([]);
          setError("");
        }}
        disabled={busy}
        kind="pdf"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          拆分方向
          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value as Direction)}
            className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2"
          >
            <option value="left-right">左右拆分 · A3 横版 → 两张 A4</option>
            <option value="top-bottom">上下拆分 · 长页面 → 上下两页</option>
          </select>
        </label>

        <label className="text-sm">
          输出顺序
          <select
            value={order}
            onChange={(event) =>
              setOrder(event.target.value as "first-second" | "second-first")
            }
            className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2"
          >
            <option value="first-second">左→右 / 上→下</option>
            <option value="second-first">右→左 / 下→上</option>
          </select>
        </label>
      </div>

      <p className="text-xs leading-5 text-[var(--lx-muted)]">
        直接调整 PDF 页面边界并保留原页面对象，不先把页面栅格化；适合双页扫描、A3 讲义和书籍跨页 PDF。复杂旋转页建议处理后抽查。
      </p>

      <button
        disabled={!files.length || busy}
        onClick={run}
        className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40"
      >
        {busy ? "正在拆分…" : "开始页面拆半"}
      </button>

      {!!results.length && (
        <ResultPanel
          sourceSlug="pdf-halve-pages"
          files={results}
          messageZh={`已处理 ${results.length} 个 PDF，每个原页面生成两个页面。`}
          messageEn={`Processed ${results.length} PDF file(s); each source page becomes two pages.`}
        />
      )}

      {error && <p className="text-sm text-[var(--lx-danger)]">{error}</p>}
    </div>
  );
}
