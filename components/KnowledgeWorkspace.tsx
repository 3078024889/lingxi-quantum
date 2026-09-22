"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KnowledgeSource,
  readSources,
  saveSource,
  searchKnowledge,
} from "@/lib/ai-knowledge/local-index";
import { openPdf } from "@/lib/tools/pdf-render-client";

type Mode = "book" | "learning" | "research";
type Intelligence = "light" | "standard" | "high";

async function pdfToSource(file: File): Promise<Pick<KnowledgeSource, "text" | "locators">> {
  const pdf = await openPdf(file);
  const pieces: string[] = [];
  const locators: NonNullable<KnowledgeSource["locators"]> = [];
  let offset = 0;

  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const text = (content.items || [])
        .map((item: any) => String(item?.str || ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const pageText = `第 ${n} 页\n${text}`;
      const start = offset;
      pieces.push(pageText);
      offset += pageText.length + 2;
      locators.push({ start, end: offset, label: `第 ${n} 页` });
    }
  } finally {
    pdf.destroy?.();
  }
  return { text: pieces.join("\n\n"), locators };
}

async function imageToText(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("chi_sim+eng");
  try {
    const result = await worker.recognize(file);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}

export default function KnowledgeWorkspace({ mode = "book" }: { mode?: Mode }) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [askBusy, setAskBusy] = useState(false);
  const [intelligence, setIntelligence] = useState<Intelligence>("standard");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readSources()
      .then((rows) => { setSources(rows); setReady(true); })
      .catch(() => setNotice("浏览器资料库暂时无法打开，请检查浏览器存储权限。"));
  }, []);

  const activeQuery = (query || question).trim();
  const results = useMemo(() => searchKnowledge(sources, activeQuery), [sources, activeQuery]);

  async function saveCurrent() {
    if (!title.trim() || !text.trim()) {
      setNotice("请先提供资料名称与正文。");
      return;
    }
    if (text.length > 1_500_000 || sources.length >= 60) {
      setNotice("当前本地资料库最多 60 份，每份约 150 万字符。大书请按章节拆分。");
      return;
    }
    setBusy(true);
    try {
      const source: KnowledgeSource = {
        id: crypto.randomUUID(),
        title: title.trim().slice(0, 200),
        text: text.trim(),
        createdAt: new Date().toISOString(),
        kind: "text",
      };
      await saveSource(source);
      setSources((previous) => [...previous, source]);
      setTitle("");
      setText("");
      setNotice("资料已保存在这个浏览器。现在可以直接提问。");
    } catch {
      setNotice("保存失败，可能是浏览器存储空间不足。");
    } finally {
      setBusy(false);
    }
  }

  async function importFile(file: File) {
    setBusy(true);
    setNotice("");
    try {
      if (file.size > 30 * 1024 * 1024) throw new Error("单个文件暂时限制 30MB。");
      let parsedText = "";
      let locators: KnowledgeSource["locators"] | undefined;
      let kind: KnowledgeSource["kind"] = "text";

      if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
        kind = "pdf";
        const parsed = await pdfToSource(file);
        parsedText = parsed.text;
        locators = parsed.locators;
        if (parsedText.replace(/第 \d+ 页/g, "").trim().length < 80) {
          throw new Error("这个 PDF 几乎没有可提取文字，可能是扫描版。请先使用【PDF OCR】或上传页面图片。");
        }
      } else if (file.type.startsWith("image/")) {
        kind = "image";
        parsedText = await imageToText(file);
        if (!parsedText.trim()) throw new Error("没有从图片中识别出文字。");
      } else if (/\.(txt|md)$/i.test(file.name) || /text\//.test(file.type)) {
        parsedText = await file.text();
      } else {
        throw new Error("目前支持 PDF、TXT、Markdown 和图片。");
      }

      const source: KnowledgeSource = {
        id: crypto.randomUUID(),
        title: file.name.slice(0, 200),
        text: parsedText.slice(0, 1_500_000),
        createdAt: new Date().toISOString(),
        kind,
        locators,
      };
      await saveSource(source);
      setSources((previous) => [...previous, source]);
      setNotice(`已加入「${source.title}」。${kind === "pdf" ? "PDF 页码定位已保留。" : ""}`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "文件读取失败。");
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    const q = question.trim();
    if (!q) return;
    if (!results.length) {
      setNotice("本地没有找到足够相关的原文。换一个更接近资料原词的问题，或继续加入资料。");
      return;
    }
    setAskBusy(true);
    setAnswer("");
    setNotice("正在基于原文回答；这一步会把当前命中的证据片段发送给 AI。");
    try {
      const response = await fetch("/api/knowledge/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          mode,
          intelligence,
          evidence: results.map((r, i) => ({
            index: i + 1,
            title: r.title,
            locator: r.locator,
            text: r.text,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI 回答失败。");
      setAnswer(data.answer || "");
      const charged = Number(data.chargedRmb);
      setNotice(
        Number.isFinite(charged)
          ? `回答完成 · 本次实际消耗 ¥${charged.toFixed(2)}。编号 [1]、[2] 对应下方真实原文证据。`
          : "回答完成。编号 [1]、[2] 对应下方真实原文证据。"
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "AI 回答失败。");
    } finally {
      setAskBusy(false);
    }
  }

  async function remove(source: KnowledgeSource) {
    if (!window.confirm(`删除本机资料「${source.title}」？原文件不会受影响。`)) return;
    await saveSource(source.id);
    setSources((rows) => rows.filter((row) => row.id !== source.id));
  }

  function exportSources() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 2, sources }, null, 2)], { type: "application/json" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "lingxifield-knowledge-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const heading =
    mode === "research" ? "研究资料" : mode === "learning" ? "教材与笔记" : "书本与资料";

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
        <b className="text-slate-900">现在是真实接口：</b>
        资料默认保存在本机浏览器；本地先检索原文。只有你点“基于原文回答”时，
        当前命中的证据片段才会发送给 AI。PDF、TXT、Markdown 与图片 OCR 已可直接加入。
      </div>

      <div className="grid gap-5 xl:grid-cols-[.88fr_1.12fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">加入{heading}</h2>
          <label className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,image/*,application/pdf,text/plain,text/markdown"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importFile(file);
                e.currentTarget.value = "";
              }}
            />
            <span className="font-medium text-slate-900">{busy ? "正在读取…" : "上传 PDF / TXT / Markdown / 图片"}</span>
            <span className="mt-1 block text-sm text-slate-500">PDF 会保留页码定位；图片会先在浏览器 OCR。</span>
          </label>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />或粘贴正文<span className="h-px flex-1 bg-slate-200" />
          </div>

          <input
            className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-400"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="资料名称"
          />
          <textarea
            className="mt-3 min-h-44 w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-400"
            value={text}
            maxLength={1_500_001}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴书本、论文、笔记或资料正文…"
          />
          <button
            className="mt-3 rounded-full bg-slate-950 px-5 py-2.5 text-sm text-white disabled:opacity-40"
            disabled={!ready || busy}
            onClick={saveCurrent}
          >
            加入我的资料库
          </button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">询问资料</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">直接问这批资料</h2>
          <textarea
            value={question}
            onChange={(e) => { setQuestion(e.target.value); setQuery(e.target.value); }}
            rows={3}
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-400"
            placeholder={
              mode === "research"
                ? "例如：这几篇论文的方法差异在哪里？哪条结论证据更强？"
                : mode === "learning"
                  ? "例如：这一章最难理解的概念是什么？用原文解释给我。"
                  : "例如：作者为什么在第三章改变了这个观点？请用原文说明。"
            }
          />
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-800">智能模式</span>
              <span className="text-xs text-slate-400">实际按本次模型用量结算</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["light", "轻量", "1×"],
                ["standard", "标准", "2×"],
                ["high", "高智能", "5×"],
              ] as const).map(([value, label, factor]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIntelligence(value)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    intelligence === value
                      ? "border-blue-400 bg-blue-50 text-blue-950"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-1 block text-xs opacity-70">{factor} 消耗</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              轻量适合快速摘要与简单问答；标准为默认推荐；高智能适合复杂研究、多步骤推理和更长回答。
            </p>
          </div>

          <button
            onClick={ask}
            disabled={askBusy || !question.trim() || !sources.length}
            className="mt-3 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {askBusy ? "正在阅读原文…" : "基于原文回答"}
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            AI 不会读取你的整个浏览器资料库，只发送本次问题命中的原文片段。
          </p>

          {answer && (
            <article className="mt-6 whitespace-pre-wrap rounded-2xl bg-blue-50 p-5 leading-8 text-slate-800">
              {answer}
            </article>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">本次原文证据</h3>
            <div className="mt-3 max-h-[420px] space-y-3 overflow-auto">
              {results.map((r, i) => (
                <article key={`${r.sourceId}:${r.paragraph}:${i}`} className="rounded-xl border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">[{i + 1}] {r.title} · {r.locator}</h4>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{r.text}</p>
                </article>
              ))}
              {activeQuery && !results.length && <p className="text-sm text-slate-500">没有找到相关原文。</p>}
            </div>
          </div>
        </section>
      </div>

      <p role="status" className="text-sm text-slate-600">{notice}</p>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">我的本机资料 · {sources.length}</h2>
          <button disabled={!sources.length} onClick={exportSources} className="text-sm text-blue-600 disabled:opacity-30">
            导出备份 ↓
          </button>
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {sources.map((source) => (
            <li className="flex items-center justify-between gap-4 py-3" key={source.id}>
              <span className="min-w-0 truncate text-sm text-slate-700">{source.title}</span>
              <button className="shrink-0 text-sm text-rose-600" onClick={() => void remove(source)}>删除</button>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
