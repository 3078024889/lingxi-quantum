"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type L=Record<LingxiLang,string>;
const l=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):L=>({zh,en,ja,ko,fr,de,es,pt,ar});

const C={
  kicker:l("灵犀场 · 探索","LINGXIFIELD · Explore","LINGXIFIELD · 探索","LINGXIFIELD · 탐색","LINGXIFIELD · Explorer","LINGXIFIELD · Entdecken","LINGXIFIELD · Explorar","LINGXIFIELD · Explorar","LINGXIFIELD · استكشاف"),
  title:l("从要完成的事出发。","Start with what you need to accomplish.","やるべきことから始める。","해야 할 일에서 시작하세요.","Partez de ce que vous devez accomplir.","Beginnen Sie mit dem, was erledigt werden soll.","Empieza por lo que necesitas hacer.","Comece pelo que precisa realizar.","ابدأ بما تحتاج إلى إنجازه."),
  lead:l("探索页现在只保留真实可用的 AI、SASI 与工具入口。选择任务，不需要先理解系统。","Explore now contains only active AI, SASI and practical-tool entrances. Choose the task first; you do not need to learn the system beforehand.","探索ページは実際に利用できるAI、SASI、ツール入口だけを残しています。まずタスクを選んでください。","탐색 페이지에는 실제 사용 가능한 AI, SASI, 도구 입구만 남겼습니다. 먼저 작업을 고르세요.","La page Explorer ne conserve que les accès réellement disponibles à l’IA, SASI et aux outils pratiques.","Explore enthält nur noch tatsächlich nutzbare KI-, SASI- und Tool-Einstiege.","Explorar conserva solo accesos realmente disponibles a IA, SASI y herramientas prácticas.","Explorar mantém apenas entradas realmente disponíveis de IA, SASI e ferramentas práticas.","تحتوي صفحة الاستكشاف الآن فقط على مداخل الذكاء الاصطناعي وSASI والأدوات المتاحة فعليًا."),
};

const items=[
  ["/tools","TL","处理文件与日常任务","Practical tools","PDF、图片、视频、OCR、字幕、格式转换、隐私处理。","PDF, image, video, OCR, subtitles, conversion and privacy."],
  ["/sasi","SA","把想法做成作品","Create with SASI","从故事、剧本或目标开始，进入 AI短剧与多种创作工作流。","Start with a story, script or goal and enter SASI creation workflows."],
  ["/ai-knowledge","BK","把资料变成可追问的知识工作区","Book SASI","上传书本、论文和资料，继续追问并保留依据。","Upload books, papers and sources; keep asking with evidence."],
  ["/ai-learning","ST","围绕资料学习","Learning SASI","拆解概念、整理结构、持续复习。","Break down concepts, organize structure and review."],
  ["/ai-research","RS","围绕资料做研究","Research SASI","把问题、证据、推理和结论放在同一个工作区。","Keep questions, evidence, reasoning and conclusions together."],
  ["/products","PD","查看当前产品","Product Center","查看 AI、SASI、工具与余额入口。","Browse current AI, SASI, tools and balances."],
] as const;

export default function ExplorePage(){
  const {lang}=useLingxiLang();
  return <>
    <Nav/>
    <main className="lx11-page">
      <div className="lx11-wrap py-16 sm:py-20">
        <section className="max-w-3xl">
          <p className="lx11-kicker">{C.kicker[lang]}</p>
          <h1 className="mt-4 font-display text-4xl font-light text-[var(--lx-ink)] sm:text-5xl">{C.title[lang]}</h1>
          <p className="mt-6 text-base leading-8 text-[var(--lx-muted)]">{C.lead[lang]}</p>
        </section>
        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([href,code,zh,en,dzh,den])=><Link href={href} key={href} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 transition hover:border-[var(--lx-line-strong)]">
            <span className="text-xs tracking-[.2em] text-[var(--lx-faint)]">{code}</span>
            <h2 className="mt-4 font-display text-xl text-[var(--lx-ink)]">{lang==="zh"?zh:en}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">{lang==="zh"?dzh:den}</p>
            <b className="mt-5 inline-block text-sm text-[var(--lx-ink)]">→</b>
          </Link>)}
        </section>
      </div>
    </main>
    <Footer/>
  </>;
}
