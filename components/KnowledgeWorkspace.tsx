"use client";
import { useEffect, useMemo, useState } from "react";
import { KnowledgeSource, readSources, saveSource, searchKnowledge } from "@/lib/ai-knowledge/local-index";

export default function KnowledgeWorkspace({ mode }: { mode: "learning" | "research" }) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { readSources().then(rows => { setSources(rows); setReady(true); }).catch(() => setNotice("浏览器资料库暂时无法打开，请检查浏览器存储权限。")); }, []);
  const results = useMemo(() => searchKnowledge(sources, query), [sources, query]);
  async function add() {
    if (!title.trim() || !text.trim()) { setNotice("请填写资料名称与正文。"); return; }
    if (text.length > 500000 || sources.length >= 30) { setNotice("当前本地版最多保存30份资料，每份50万字符。请拆分资料或导出后整理。"); return; }
    setBusy(true);
    try {
      const source = { id: crypto.randomUUID(), title: title.trim().slice(0, 200), text: text.trim(), createdAt: new Date().toISOString() };
      await saveSource(source); setSources(previous => [...previous, source]); setTitle(""); setText(""); setNotice("资料已保存在此浏览器，可以开始检索。");
    } catch { setNotice("保存失败，可能是浏览器存储空间不足。正文仍保留在输入框中。"); }
    finally { setBusy(false); }
  }
  async function remove(source: KnowledgeSource) {
    if (!window.confirm(`删除本机资料「${source.title}」？此操作不会删除你原来的文件。`)) return;
    try { await saveSource(source.id); setSources(rows => rows.filter(row => row.id !== source.id)); setNotice("已删除此浏览器中的资料。"); }
    catch { setNotice("删除失败，请重试。"); }
  }
  function exportSources() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, sources }, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "lingxifield-knowledge-backup.json"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="mt-9 space-y-6">
    <div className="rounded-2xl border p-5 text-sm leading-7">当前开放：本机资料保存、多资料原文检索与出处定位。资料留在此浏览器，两个助手共用此资料库；清理浏览器数据会删除它，请保留原文件或导出备份。云端 Agent 问答、PDF/OCR解析与研究代码执行尚未开放。</div>
    <div className="grid gap-6 xl:grid-cols-2"><section className="rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">带来你的{mode === "learning" ? "教材与笔记" : "论文与研究资料"}</h2>
      <label className="mt-5 block">资料名称<input className="mt-2 w-full rounded-lg border bg-transparent p-3" value={title} maxLength={200} onChange={event => setTitle(event.target.value)} /></label>
      <label className="mt-4 block">粘贴正文<textarea className="mt-2 min-h-52 w-full rounded-lg border bg-transparent p-3" value={text} maxLength={500001} onChange={event => setText(event.target.value)} /></label>
      <label className="mt-3 block text-sm">或读取 TXT / Markdown 文件（最多2MB）<input className="mt-2 block max-w-full" type="file" accept=".txt,.md,text/plain,text/markdown" onChange={async event => {
        const file = event.target.files?.[0]; if (!file) return;
        if (file.size > 2 * 1024 * 1024 || !/\.(txt|md)$/i.test(file.name)) { setNotice("请选择2MB以内的 TXT 或 Markdown 文件。"); return; }
        try { const body = await file.text(); if (body.includes("\0")) throw new Error("binary"); setTitle(file.name); setText(body); setNotice("已读取，请确认正文后保存。"); } catch { setNotice("无法读取此文件，请改为粘贴正文。"); }
      }} /></label>
      <button className="mt-5 rounded-xl border px-5 py-3 disabled:opacity-40" disabled={!ready || busy} onClick={add}>{busy ? "保存中…" : "加入我的资料库"}</button>
    </section><section className="rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">从问题找到原文</h2>
      <label className="mt-5 block">输入关键词或问题<input className="mt-2 w-full rounded-lg border bg-transparent p-3" value={query} maxLength={300} onChange={event => setQuery(event.target.value)} placeholder={mode === "learning" ? "例如：光合作用的条件" : "例如：实验方法与样本量"} /></label>
      <p className="mt-3 text-sm leading-6">以下为关键词匹配的原文证据，不是 AI生成的答案。引文中的指令不会被执行。</p>
      <div className="mt-5 max-h-[600px] space-y-4 overflow-auto" aria-live="polite">{results.map((result, index) => <article className="rounded-xl border p-4" key={`${result.sourceId}:${result.paragraph}:${index}`}><h3 className="font-semibold">{result.title} · 第{result.paragraph}段</h3><p className="mt-3 whitespace-pre-wrap break-words leading-7">{result.text}</p></article>)}{query && !results.length && <p>没有找到相关原文。试试资料中的术语，或补充资料。</p>}</div>
    </section></div>
    <p role="status">{notice}</p>
    <section className="rounded-2xl border p-6"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-semibold">我的本机资料 · {sources.length}</h2><button disabled={!sources.length} onClick={exportSources}>导出备份 ↓</button></div><ul className="mt-4 space-y-3">{sources.map(source => <li className="flex items-center justify-between gap-4 border-t pt-3" key={source.id}><span className="break-all">{source.title}</span><button className="shrink-0 rounded-lg border px-3 py-2" onClick={() => remove(source)}>删除</button></li>)}</ul></section>
  </section>;
}
