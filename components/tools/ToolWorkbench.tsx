"use client";

import { useMemo, useState } from "react";
import Bi from "@/components/Bi";
import type { ToolMeta } from "@/lib/tools/types";
import type { ToolRunResult } from "@/lib/tools/types";
import { targetBytesForSlug } from "@/lib/tools/registry";
import FileDropzone from "./FileDropzone";
import ResultPanel from "./ResultPanel";
import ErrorExplain from "./ErrorExplain";
import { convertImage, compressImageToTarget, resizeImage, stripImageMetadata } from "@/lib/tools/shared/image-canvas";
import { detectFileType, extensionMismatch } from "@/lib/tools/shared/magic-bytes";
import { md5Hex, sha256Hex, buffersEqual } from "@/lib/tools/shared/hash";

type Props = { tool: ToolMeta };

export default function ToolWorkbench({ tool }: Props) {
  if (tool.status === "planned") {
    return (
      <div className="rounded-sm border border-white/15 bg-void-deep p-6 text-sm leading-7 text-bone-dim">
        <Bi
          zh="此工具已在产品路线图中，但尚未实现真实处理逻辑。我们不会用假按钮或演示数据冒充上线。请先使用已标记为可用的工具。"
          en="This tool is on the roadmap but not implemented yet. We will not ship fake buttons or mock results. Please use tools marked as live."
        />
      </div>
    );
  }

  if (tool.slug === "json-formatter") return <JsonWorkbench />;
  if (tool.slug === "timestamp-converter") return <TimestampWorkbench />;
  if (tool.slug === "qr-code-generator") return <QrWorkbench />;

  return <FileToolWorkbench tool={tool} />;
}

function FileToolWorkbench({ tool }: { tool: ToolMeta }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ToolRunResult | null>(null);
  const [webpTarget, setWebpTarget] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [keepAspect, setKeepAspect] = useState(true);
  const [customKb, setCustomKb] = useState(100);

  const preciseTarget = useMemo(() => {
    const fromSlug = targetBytesForSlug(tool.slug);
    if (fromSlug) return fromSlug;
    if (tool.slug === "compress-image") return Math.round(customKb * 1024);
    return null;
  }, [tool.slug, customKb]);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const out = await runFileTool(tool, files, {
        webpTarget,
        quality,
        width,
        height,
        keepAspect,
        targetBytes: preciseTarget,
      });
      setResult(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setResult({
        ok: false,
        reasonZh: `处理时出错：${msg}`,
        reasonEn: `Processing error: ${msg}`,
        hintZh: "请换一张较小的图片，或换用 Chrome / Edge / Firefox 最新版本再试。",
        hintEn: "Try a smaller file, or the latest Chrome / Edge / Firefox.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <FileDropzone
        accept={tool.accept || "*/*"}
        multiple={!!tool.multiple}
        maxFiles={tool.maxFiles || 1}
        maxSizeMB={tool.maxSizeMB || 40}
        files={files}
        onChange={(f) => {
          setFiles(f);
          setResult(null);
        }}
        disabled={busy}
      />

      {tool.slug === "webp-to-jpg" && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-bone-dim">
          <label className="flex items-center gap-2">
            <input type="radio" checked={webpTarget === "image/jpeg"} onChange={() => setWebpTarget("image/jpeg")} />
            JPG
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={webpTarget === "image/png"} onChange={() => setWebpTarget("image/png")} />
            PNG
          </label>
        </div>
      )}

      {tool.slug === "compress-image" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-bone-dim">
            <Bi zh="目标大小 (KB)" en="Target size (KB)" />
            <input
              type="number"
              min={10}
              max={5000}
              value={customKb}
              onChange={(e) => setCustomKb(Number(e.target.value) || 100)}
              className="bg-void mt-1 w-full rounded-sm border border-white/15 px-3 py-2 text-bone outline-none focus:border-lattice/50"
            />
          </label>
          <label className="text-sm text-bone-dim">
            <Bi zh="质量起点 (0.4–0.95)" en="Quality seed (0.4–0.95)" />
            <input
              type="number"
              step={0.05}
              min={0.4}
              max={0.95}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value) || 0.8)}
              className="bg-void mt-1 w-full rounded-sm border border-white/15 px-3 py-2 text-bone outline-none focus:border-lattice/50"
            />
          </label>
        </div>
      )}

      {tool.slug === "resize-image" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-bone-dim">
            Width
            <input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value) || 1)} className="bg-void mt-1 w-full rounded-sm border border-white/15 px-3 py-2 text-bone" />
          </label>
          <label className="text-sm text-bone-dim">
            Height
            <input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value) || 1)} className="bg-void mt-1 w-full rounded-sm border border-white/15 px-3 py-2 text-bone" />
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm text-bone-dim">
            <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} />
            <Bi zh="保持比例" en="Keep aspect ratio" />
          </label>
        </div>
      )}

      <button
        type="button"
        disabled={busy || files.length === 0}
        onClick={run}
        className="mt-6 w-full rounded-sm bg-lattice px-6 py-3.5 text-sm font-medium uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {busy ? <Bi zh="处理中…" en="Working…" /> : <Bi zh="立即处理" en="Process now" />}
      </button>

      {result?.ok === true && (
        <ResultPanel files={result.files} messageZh={result.messageZh} messageEn={result.messageEn} details={result.details} />
      )}
      {result?.ok === false && (
        <ErrorExplain reasonZh={result.reasonZh} reasonEn={result.reasonEn} hintZh={result.hintZh} hintEn={result.hintEn} />
      )}
    </div>
  );
}

async function runFileTool(
  tool: ToolMeta,
  files: File[],
  opts: {
    webpTarget: "image/jpeg" | "image/png";
    quality: number;
    width: number;
    height: number;
    keepAspect: boolean;
    targetBytes: number | null;
  },
): Promise<ToolRunResult> {
  if (!files.length) {
    return {
      ok: false,
      reasonZh: "还没有选择文件。",
      reasonEn: "No file selected.",
      hintZh: "请先拖拽或点击上传区域选择文件。",
      hintEn: "Drop or choose a file first.",
    };
  }

  const file = files[0];

  if (tool.slug === "png-to-jpg") {
    const r = await convertImage(file, "image/jpeg", 0.92);
    return {
      ok: true,
      files: [{ name: r.name, blob: r.blob, mime: "image/jpeg", size: r.blob.size }],
      messageZh: `已转换为 JPG（${r.width}×${r.height}）。透明区域会变成白底。`,
      messageEn: `Converted to JPG (${r.width}×${r.height}). Transparency becomes white.`,
      details: { width: r.width, height: r.height, bytes: r.blob.size },
    };
  }

  if (tool.slug === "jpg-to-png") {
    const r = await convertImage(file, "image/png");
    return {
      ok: true,
      files: [{ name: r.name, blob: r.blob, mime: "image/png", size: r.blob.size }],
      messageZh: `已转换为 PNG（${r.width}×${r.height}）。`,
      messageEn: `Converted to PNG (${r.width}×${r.height}).`,
      details: { width: r.width, height: r.height, bytes: r.blob.size },
    };
  }

  if (tool.slug === "webp-to-jpg") {
    const r = await convertImage(file, opts.webpTarget, 0.92);
    return {
      ok: true,
      files: [{ name: r.name, blob: r.blob, mime: opts.webpTarget, size: r.blob.size }],
      messageZh: `已转换（${r.width}×${r.height}）。`,
      messageEn: `Converted (${r.width}×${r.height}).`,
      details: { width: r.width, height: r.height, bytes: r.blob.size },
    };
  }

  if (tool.slug === "compress-image" || tool.slug.startsWith("compress-image-to-")) {
    const target = opts.targetBytes || 100 * 1024;
    const r = await compressImageToTarget(file, target);
    const exceeded = r.blob.size > target;
    return {
      ok: true,
      files: [{ name: r.name, blob: r.blob, mime: "image/jpeg", size: r.blob.size }],
      messageZh: exceeded
        ? `已尽力压缩到 ${(r.blob.size / 1024).toFixed(1)} KB（目标 ${(target / 1024).toFixed(0)} KB）。源图信息量过大，无法在不严重糊化的前提下进一步缩小。`
        : `已压缩到 ${(r.blob.size / 1024).toFixed(1)} KB（目标 ≤${(target / 1024).toFixed(0)} KB），质量约 ${r.quality.toFixed(2)}。`,
      messageEn: exceeded
        ? `Reached ${(r.blob.size / 1024).toFixed(1)} KB (target ${(target / 1024).toFixed(0)} KB). Source has too much detail to go lower without severe quality loss.`
        : `Compressed to ${(r.blob.size / 1024).toFixed(1)} KB (target ≤${(target / 1024).toFixed(0)} KB), quality ≈ ${r.quality.toFixed(2)}.`,
      details: {
        width: r.width,
        height: r.height,
        quality: Number(r.quality.toFixed(3)),
        rounds: r.rounds,
        originalKB: Number((file.size / 1024).toFixed(1)),
        resultKB: Number((r.blob.size / 1024).toFixed(1)),
      },
    };
  }

  if (tool.slug === "resize-image") {
    const r = await resizeImage(file, opts.width, opts.height, opts.keepAspect, "image/jpeg", 0.92);
    return {
      ok: true,
      files: [{ name: r.name, blob: r.blob, mime: "image/jpeg", size: r.blob.size }],
      messageZh: `已调整为 ${r.width}×${r.height}。`,
      messageEn: `Resized to ${r.width}×${r.height}.`,
      details: { width: r.width, height: r.height, bytes: r.blob.size },
    };
  }

  if (tool.slug === "remove-exif") {
    const r = await stripImageMetadata(file);
    return {
      ok: true,
      files: [{ name: r.name, blob: r.blob, mime: r.blob.type, size: r.blob.size }],
      messageZh: "已通过画布重编码去除 EXIF / GPS 等元数据。",
      messageEn: "Metadata (EXIF/GPS etc.) removed by re-encoding on canvas.",
      details: { originalKB: Number((file.size / 1024).toFixed(1)), resultKB: Number((r.blob.size / 1024).toFixed(1)) },
    };
  }

  if (tool.slug === "file-type-detector") {
    const detected = await detectFileType(file);
    const mismatch = extensionMismatch(file, detected);
    return {
      ok: true,
      messageZh: mismatch
        ? `检测到真实类型更像 ${detected.label}（${detected.mime}），但扩展名是 .${file.name.split(".").pop()}——这常导致上传失败。`
        : `检测到：${detected.label}（${detected.mime}），与扩展名一致。`,
      messageEn: mismatch
        ? `Real type looks like ${detected.label} (${detected.mime}), but extension is .${file.name.split(".").pop()} — a common upload failure cause.`
        : `Detected: ${detected.label} (${detected.mime}), consistent with the extension.`,
      details: {
        label: detected.label,
        mime: detected.mime,
        ext: detected.ext,
        confidence: detected.confidence,
        claimedType: file.type || "(empty)",
        size: file.size,
        mismatch,
      },
    };
  }

  if (tool.slug === "md5-sha256") {
    const buf = await file.arrayBuffer();
    const [md5, sha] = await Promise.all([md5Hex(buf), sha256Hex(buf)]);
    return {
      ok: true,
      messageZh: "哈希已在本地计算完成。",
      messageEn: "Hashes computed locally.",
      details: { file: file.name, size: file.size, MD5: md5, SHA256: sha },
    };
  }

  if (tool.slug === "file-compare") {
    if (files.length < 2) {
      return {
        ok: false,
        reasonZh: "请选择两个文件再对比。",
        reasonEn: "Please select two files to compare.",
      };
    }
    const [a, b] = files;
    const [ba, bb] = await Promise.all([a.arrayBuffer(), b.arrayBuffer()]);
    const sameSize = ba.byteLength === bb.byteLength;
    const equal = await buffersEqual(ba, bb);
    const [ha, hb] = await Promise.all([sha256Hex(ba), sha256Hex(bb)]);
    return {
      ok: true,
      messageZh: equal ? "两个文件完全一致（内容相同）。" : "两个文件不一致。",
      messageEn: equal ? "The two files are identical." : "The two files differ.",
      details: {
        fileA: a.name,
        fileB: b.name,
        sizeA: a.size,
        sizeB: b.size,
        sameSize,
        identical: equal,
        sha256A: ha,
        sha256B: hb,
      },
    };
  }

  return {
    ok: false,
    reasonZh: "未知工具逻辑。",
    reasonEn: "Unknown tool handler.",
  };
}

function JsonWorkbench() {
  const [text, setText] = useState('{\n  "hello": "lingxi"\n}');
  const [result, setResult] = useState<ToolRunResult | null>(null);

  function format(pretty: boolean) {
    try {
      const obj = JSON.parse(text);
      const out = pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
      setText(out);
      setResult({
        ok: true,
        messageZh: pretty ? "已格式化。" : "已压缩为一行。",
        messageEn: pretty ? "Pretty-printed." : "Minified.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setResult({
        ok: false,
        reasonZh: `JSON 无法解析：${msg}`,
        reasonEn: `Invalid JSON: ${msg}`,
        hintZh: "检查是否漏了逗号、引号是否成对、是否使用了尾随逗号。",
        hintEn: "Check missing commas, unmatched quotes, or trailing commas.",
      });
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        className="bg-void w-full rounded-sm border border-white/15 px-4 py-3 font-mono text-sm text-bone outline-none focus:border-lattice/50"
        spellCheck={false}
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => format(true)} className="rounded-sm bg-lattice px-5 py-2.5 text-sm text-void-deep">
          <Bi zh="格式化" en="Pretty print" />
        </button>
        <button type="button" onClick={() => format(false)} className="rounded-sm border border-white/20 px-5 py-2.5 text-sm text-bone">
          <Bi zh="压缩" en="Minify" />
        </button>
      </div>
      {result?.ok === true && <ResultPanel messageZh={result.messageZh} messageEn={result.messageEn} />}
      {result?.ok === false && <ErrorExplain reasonZh={result.reasonZh} reasonEn={result.reasonEn} hintZh={result.hintZh} hintEn={result.hintEn} />}
    </div>
  );
}

function TimestampWorkbench() {
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [mode, setMode] = useState<"sec" | "ms">("sec");

  const parsed = useMemo(() => {
    const n = Number(input.trim());
    if (!Number.isFinite(n)) return null;
    const ms = mode === "sec" ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [input, mode]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 text-sm text-bone-dim">
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode === "sec"} onChange={() => setMode("sec")} />
          <Bi zh="秒" en="Seconds" />
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode === "ms"} onChange={() => setMode("ms")} />
          <Bi zh="毫秒" en="Milliseconds" />
        </label>
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="bg-void mt-3 w-full rounded-sm border border-white/15 px-4 py-3 font-mono text-bone outline-none focus:border-lattice/50"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-sm border border-white/20 px-4 py-2 text-sm text-bone"
          onClick={() => {
            setMode("sec");
            setInput(String(Math.floor(Date.now() / 1000)));
          }}
        >
          <Bi zh="填入当前时间" en="Use now" />
        </button>
      </div>
      {parsed ? (
        <ResultPanel
          messageZh="转换成功（按本机时区显示）。"
          messageEn="Converted (shown in your local timezone)."
          details={{
            ISO: parsed.toISOString(),
            local: parsed.toLocaleString(),
            unixSec: Math.floor(parsed.getTime() / 1000),
            unixMs: parsed.getTime(),
          }}
        />
      ) : (
        <ErrorExplain reasonZh="无法解析该时间戳。" reasonEn="Could not parse this timestamp." hintZh="请输入数字；注意秒与毫秒不要搞反。" hintEn="Enter a number; do not mix seconds and milliseconds." />
      )}
    </div>
  );
}

function QrWorkbench() {
  const [text, setText] = useState("https://lingxifield.cn");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const QR = (await import("qrcode")).default;
      const url = await QR.toDataURL(text || " ", { width: 512, margin: 2 });
      setDataUrl(url);
    } catch (e) {
      setDataUrl(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="bg-void w-full rounded-sm border border-white/15 px-4 py-3 text-bone outline-none focus:border-lattice/50"
        placeholder="https://"
      />
      <button
        type="button"
        disabled={busy}
        onClick={generate}
        className="mt-4 rounded-sm bg-lattice px-6 py-3 text-sm text-void-deep disabled:opacity-40"
      >
        {busy ? <Bi zh="生成中…" en="Generating…" /> : <Bi zh="生成二维码" en="Generate QR" />}
      </button>
      {error && <ErrorExplain reasonZh={error} reasonEn={error} />}
      {dataUrl && (
        <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="QR code" className="mx-auto h-64 w-64 bg-white p-2" />
          <a href={dataUrl} download="qrcode.png" className="mt-4 inline-block rounded-sm bg-lattice px-5 py-2.5 text-sm text-void-deep">
            <Bi zh="下载 PNG" en="Download PNG" />
          </a>
        </div>
      )}
    </div>
  );
}
