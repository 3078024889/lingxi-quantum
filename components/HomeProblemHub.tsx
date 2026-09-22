"use client";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

const intents = [
  { words:["pdf","合并","压缩","拆分","签名","盖章","脱敏","ocr"], href:"/tools", label:"PDF 与文档" },
  { words:["图片","照片","kb","jpg","png","webp","证件照","打码","水印"], href:"/tools", label:"图片处理" },
  { words:["视频","字幕","音频","配音","转文字","srt"], href:"/tools", label:"视频 / 音频" },
  { words:["书","教材","论文","笔记","学习","科研","资料"], href:"/ai-knowledge", label:"书本智能体" },
  { words:["网站","dns","ssl","seo","打不开"], href:"/tools", label:"网站诊断" },
];

function bestIntent(q:string) {
  const lower=q.toLowerCase();
  return intents.map(x=>({...x,score:x.words.filter(w=>lower.includes(w)).length})).sort((a,b)=>b.score-a.score)[0];
}

const cards = [
  ["文件传不上去","查真实格式、压缩、转换、隐私清理","/tools"],
  ["PDF 要合并、签字、盖章","编辑、拆分、压缩、OCR、脱敏","/tools/pdf-editor"],
  ["图片必须压到指定 KB","按目标体积处理，不靠反复试","/tools/compress-image-to-100kb"],
  ["视频没有字幕","转文字并生成 SRT / VTT","/tools/video-transcription"],
  ["把一本书变成可对话资料","PDF / 图片 / 笔记 → 原文检索 → AI问答","/ai-knowledge"],
  ["论文太多，找不到证据","按原文比较方法、结论与出处","/ai-research"],
];

export default function HomeProblemHub(){
  const [query,setQuery]=useState("");
  const suggestion=useMemo(()=>bestIntent(query),[query]);
  function submit(e:FormEvent){
    e.preventDefault();
    const q=query.trim();
    if(!q)return;
    const hit=bestIntent(q);
    if(hit?.score>0){
      window.location.href=hit.href;
    }else{
      window.sessionStorage.setItem("lx-home-intent",q);
      window.location.href="/tools";
    }
  }

  return <div className="min-h-screen bg-[#fbfcfe] text-slate-950 lg:ml-[260px]">
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8 lg:pt-20">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold tracking-[.16em] text-blue-600">LINGXIFIELD · 一念即达</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-6xl">想做什么？直接说。</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          不需要先知道该用哪个工具。告诉灵犀场你卡在哪里：文件、PDF、图片、视频、一本书，或一个需要查清的问题。
        </p>
        <form onSubmit={submit} className="mx-auto mt-9 flex max-w-3xl items-end gap-3 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_16px_50px_rgba(15,23,42,.08)]">
          <textarea value={query} onChange={e=>setQuery(e.target.value)} rows={2} placeholder="例如：我的 PDF 80MB，网站只允许上传 10MB；或者：把这本书变成可以问问题的智能体…" className="min-h-[72px] flex-1 resize-none bg-transparent px-3 py-2 text-base leading-7 outline-none placeholder:text-slate-400"/>
          <button className="mb-1 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white">去解决 →</button>
        </form>
        {query.trim()&&suggestion?.score>0&&<p className="mt-3 text-sm text-slate-500">最可能需要：<Link href={suggestion.href} className="font-medium text-blue-600">{suggestion.label}</Link></p>}
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-[-.02em]">常见问题，直接进结果</h2><p className="mt-2 text-sm text-slate-500">能在浏览器本地完成的，优先本地完成；需要 AI 的步骤会在发送前明确告诉你。</p></div><Link href="/tools" className="hidden text-sm font-medium text-blue-600 sm:block">全部工具 →</Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([title,desc,href])=><Link key={title} href={href} className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
            <h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p><span className="mt-6 block text-sm font-medium text-blue-600">打开 →</span>
          </Link>)}
        </div>
      </section>

      <section className="mt-16 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Link href="/ai-knowledge" className="rounded-[30px] bg-slate-950 p-8 text-white sm:p-10">
          <p className="text-xs font-semibold tracking-[.16em] text-blue-300">NEW · BOOK AGENT</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.03em]">让一本书真正“活”起来。</h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">上传 PDF、教材、笔记或图片。灵犀场本地保存与检索资料，AI只读取当前问题命中的原文证据，并保留出处。</p>
          <span className="mt-7 block font-medium">进入书本智能体 →</span>
        </Link>
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 sm:p-10">
          <p className="text-xs font-semibold tracking-[.16em] text-slate-400">PRIVACY FIRST</p>
          <h2 className="mt-4 text-2xl font-semibold">不是所有问题都应该上传服务器。</h2>
          <p className="mt-4 leading-7 text-slate-600">图片压缩、PDF 合并、格式转换、哈希、隐私清理等大量功能尽量留在你的浏览器本地完成。只有真正需要 AI 或云端能力时，页面才会明确提示。</p>
        </div>
      </section>
    </main>
  </div>;
}
