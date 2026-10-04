"use client";

import { useMemo, useState } from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import PaidActionButton from "@/components/tools/PaidActionButton";
import type { ToolResultFile } from "@/lib/tools/types";
import { buildEditableDocx } from "@/lib/tools/shared/docx-builder";

type Mode = "english-handwriting" | "multilingual";

async function canvasToPng(canvas: HTMLCanvasElement) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => value ? resolve(value) : reject(new Error("LINE_EXPORT_FAILED")),
      "image/png",
    );
  });
}

async function segmentLines(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const maxWidth = 1800;
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("HANDWRITING_CANVAS_UNAVAILABLE");

    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const pixels = context.getImageData(0, 0, width, height).data;
    const darkPixelsPerRow = new Array<number>(height).fill(0);

    for (let y = 0; y < height; y++) {
      let dark = 0;
      for (let x = 0; x < width; x += 2) {
        const index = (y * width + x) * 4;
        const luminance =
          0.2126 * pixels[index] +
          0.7152 * pixels[index + 1] +
          0.0722 * pixels[index + 2];
        if (luminance < 190) dark++;
      }
      darkPixelsPerRow[y] = dark;
    }

    const rowThreshold = Math.max(2, width / 120);
    const bands: Array<[number, number]> = [];
    let start = -1;

    for (let y = 0; y < height; y++) {
      if (darkPixelsPerRow[y] > rowThreshold && start < 0) start = y;

      const lineEnded = darkPixelsPerRow[y] <= rowThreshold || y === height - 1;
      if (lineEnded && start >= 0) {
        const end = y;
        if (end - start > 4) {
          bands.push([
            Math.max(0, start - 6),
            Math.min(height, end + 6),
          ]);
        }
        start = -1;
      }
    }

    const blobs: Blob[] = [];
    for (const [top, bottom] of bands.slice(0, 120)) {
      const line = document.createElement("canvas");
      line.width = width;
      line.height = bottom - top;

      const lineContext = line.getContext("2d");
      if (!lineContext) continue;

      lineContext.drawImage(
        canvas,
        0,
        top,
        width,
        bottom - top,
        0,
        0,
        width,
        bottom - top,
      );
      blobs.push(await canvasToPng(line));
      line.width = 1;
      line.height = 1;
    }

    canvas.width = 1;
    canvas.height = 1;
    return blobs.length ? blobs : [file];
  } finally {
    bitmap.close?.();
  }
}

export default function HandwritingOcrWorkbench() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("english-handwriting");
  const [lang, setLang] = useState("chi_sim+eng");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [texts, setTexts] = useState<Array<{ name: string; text: string }>>([]);

  const exports = useMemo<ToolResultFile[]>(
    () =>
      texts.map((result) => {
        const blob = new Blob([result.text], {
          type: "text/plain;charset=utf-8",
        });
        return {
          name: result.name.replace(/\.[^.]+$/, "") + ".txt",
          blob,
          mime: "text/plain",
          size: blob.size,
        };
      }),
    [texts],
  );

  async function run() {
    if (!files.length) return;

    setBusy(true);
    setTexts([]);
    setError("");

    try {
      const output: Array<{ name: string; text: string }> = [];

      if (mode === "english-handwriting") {
        const transformers: any = await import("@huggingface/transformers");
        transformers.env.allowRemoteModels = true;
        transformers.env.useBrowserCache = true;

        setStage("首次使用正在加载手写识别模型…");
        const pipeline = await transformers.pipeline(
          "image-to-text",
          "Xenova/trocr-small-handwritten",
          { dtype: "q8" },
        );

        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
          const lines = await segmentLines(files[fileIndex]);
          const parts: string[] = [];

          for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            setStage(
              `${fileIndex + 1}/${files.length} · line ${lineIndex + 1}/${lines.length}`,
            );

            const url = URL.createObjectURL(lines[lineIndex]);
            try {
              const result: any = await pipeline(url);
              const text = String(
                Array.isArray(result)
                  ? result[0]?.generated_text
                  : result?.generated_text || "",
              ).trim();

              if (text) parts.push(text);
            } finally {
              URL.revokeObjectURL(url);
            }
          }

          output.push({
            name: files[fileIndex].name,
            text: parts.join("\n"),
          });
        }
      } else {
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker(lang, undefined, {
          logger(message) {
            if (!message.status) return;
            setStage(
              `${message.status}${
                typeof message.progress === "number"
                  ? ` · ${Math.round(message.progress * 100)}%`
                  : ""
              }`,
            );
          },
        });

        try {
          for (let index = 0; index < files.length; index++) {
            setStage(`${index + 1}/${files.length} · ${files[index].name}`);
            const result = await worker.recognize(files[index]);
            output.push({
              name: files[index].name,
              text: String(result.data.text || "").trim(),
            });
          }
        } finally {
          await worker.terminate();
        }
      }

      setTexts(output);
      setStage("识别完成");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStage("");
    } finally {
      setBusy(false);
    }
  }

  async function downloadDocx() {
    if (!texts.length) return;

    const docxResult = await buildEditableDocx(
      texts.map((item) => `${item.name}\n${item.text}`),
      "handwriting-ocr.docx",
    );

    const url = URL.createObjectURL(docxResult.blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = docxResult.name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  return (
    <div className="space-y-4">
      <FileDropzone
        accept="image/*"
        multiple
        append
        maxFiles={20}
        maxSizeMB={30}
        files={files}
        onChange={(next) => {
          setFiles(next);
          setTexts([]);
          setError("");
        }}
        disabled={busy}
        kind="image"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          识别模式
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as Mode)}
            className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2"
          >
            <option value="english-handwriting">英文手写 · TrOCR 本地模型</option>
            <option value="multilingual">多语言文字/工整手写 · Tesseract</option>
          </select>
        </label>

        {mode === "multilingual" && (
          <label className="text-sm">
            语言
            <select
              value={lang}
              onChange={(event) => setLang(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-2"
            >
              <option value="chi_sim+eng">简体中文 + English</option>
              <option value="chi_tra+eng">繁體中文 + English</option>
              <option value="eng">English</option>
              <option value="jpn+eng">日本語 + English</option>
              <option value="kor+eng">한국어 + English</option>
              <option value="fra+eng">Français + English</option>
              <option value="deu+eng">Deutsch + English</option>
              <option value="spa+eng">Español + English</option>
            </select>
          </label>
        )}
      </div>

      <div className="rounded-xl bg-[var(--lx-soft)] p-3 text-xs leading-5 text-[var(--lx-muted)]">
        {mode === "english-handwriting"
          ? "英文手写模式会先自动分行，再由 TrOCR 手写模型逐行识别；模型首次使用会下载并缓存，之后可复用。"
          : "多语言模式适合印刷体和较工整手写。潦草手写尤其中文/日文仍可能误识别，重要内容请核对；这一模式不冒充专业多语言手写模型。"}
      </div>

      {files.length > 0 && !busy && (<PaidActionButton toolId="handwriting-ocr" quantity={files.length} metadata={{pages:files.length,mode}} onPaid={run} label="查看本次手写识别价格" />)}

      {stage && <p className="text-sm text-[var(--lx-muted)]">{stage}</p>}

      {texts.map((result, index) => (
        <section
          key={`${result.name}-${index}`}
          className="rounded-xl border border-[var(--lx-line)] p-4"
        >
          <b className="text-sm">{result.name}</b>
          <textarea
            value={result.text}
            onChange={(event) =>
              setTexts((current) =>
                current.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, text: event.target.value }
                    : item,
                ),
              )
            }
            rows={10}
            className="mt-3 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm"
          />
        </section>
      ))}

      {exports.length > 0 && (
        <>
          <ResultPanel
            sourceSlug="handwriting-ocr"
            files={exports}
            messageZh="识别完成；可以修改文字后复制或导出。"
            messageEn="Recognition complete. Review/edit before export."
          />
          <button
            onClick={downloadDocx}
            className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm"
          >
            导出 Word DOCX
          </button>
        </>
      )}

      {error && (
        <p className="text-sm text-[var(--lx-danger)]">{error}</p>
      )}
    </div>
  );
}
