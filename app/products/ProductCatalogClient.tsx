"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type L = Record<LingxiLang,string>;
const l=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):L=>({zh,en,ja,ko,fr,de,es,pt,ar});

const copy={
  kicker:l("灵犀场 · 产品中心","LINGXIFIELD · Product Center","LINGXIFIELD · プロダクトセンター","LINGXIFIELD · 제품 센터","LINGXIFIELD · Centre produits","LINGXIFIELD · Produktzentrum","LINGXIFIELD · Centro de productos","LINGXIFIELD · Central de produtos","LINGXIFIELD · مركز المنتجات"),
  title:l("从一个任务开始，直接进入可用的产品。","Start with a task and enter a product you can use now.","やりたいことから、すぐ使えるプロダクトへ。","할 일에서 시작해 바로 사용할 수 있는 제품으로 이동하세요.","Partez d’une tâche et ouvrez directement le produit utile.","Starten Sie mit einer Aufgabe und öffnen Sie direkt das passende Produkt.","Empieza por una tarea y entra directamente al producto adecuado.","Comece por uma tarefa e entre diretamente no produto certo.","ابدأ بمهمة وانتقل مباشرة إلى المنتج المناسب."),
  lead:l("当前产品聚焦 AI 工作区、SASI 创作、实用工具与清晰的账户余额。旧版个人探索、显化与修炼类产品已停止提供。","Current products focus on AI workspaces, SASI creation, practical tools and clear account balances. Legacy personal-exploration, manifestation and practice products are no longer offered.","現在はAIワークスペース、SASI制作、実用ツール、明確な残高管理に集中しています。旧来の個人探索・顕現・実践系製品は提供を終了しました。","현재는 AI 작업공간, SASI 제작, 실용 도구, 명확한 잔액 관리에 집중합니다. 기존 개인 탐색·현현·수련 제품은 제공을 종료했습니다.","Les produits actuels se concentrent sur les espaces IA, la création SASI, les outils pratiques et les soldes de compte. Les anciens produits d’exploration personnelle et de pratique ne sont plus proposés.","Der Fokus liegt auf KI-Arbeitsbereichen, SASI-Erstellung, praktischen Tools und klaren Guthaben. Frühere Selbstexplorations- und Praxisprodukte werden nicht mehr angeboten.","Los productos actuales se centran en espacios de IA, creación SASI, herramientas prácticas y saldos claros. Los productos antiguos de exploración personal y práctica ya no se ofrecen.","Os produtos atuais focam espaços de IA, criação SASI, ferramentas práticas e saldos claros. Produtos antigos de exploração pessoal e prática não são mais oferecidos.","تركز المنتجات الحالية على مساحات عمل الذكاء الاصطناعي وإنشاء SASI والأدوات العملية والأرصدة الواضحة. لم تعد المنتجات القديمة للاستكشاف الشخصي والممارسات متاحة."),
  ai:l("AI 工作区","AI Workspaces","AIワークスペース","AI 작업공간","Espaces IA","KI-Arbeitsbereiche","Espacios IA","Espaços de IA","مساحات عمل الذكاء الاصطناعي"),
  create:l("SASI 创作","SASI Creation","SASI制作","SASI 제작","Création SASI","SASI-Erstellung","Creación SASI","Criação SASI","إنشاء SASI"),
  utility:l("实用工具","Practical Tools","実用ツール","실용 도구","Outils pratiques","Praktische Tools","Herramientas prácticas","Ferramentas práticas","أدوات عملية"),
  balance:l("余额与充值","Balances & Top-ups","残高とチャージ","잔액 및 충전","Soldes et recharges","Guthaben & Aufladen","Saldos y recargas","Saldos e recargas","الأرصدة والشحن"),
  open:l("进入","Open","開く","열기","Ouvrir","Öffnen","Abrir","Abrir","فتح"),
};

const cards=[
  ["/ai-knowledge","BK","书本 SASI","Book SASI","上传书本、论文和资料，把内容变成可继续追问的知识工作区。","Upload books, papers and sources into an askable knowledge workspace."],
  ["/ai-learning","ST","学习 SASI","Learning SASI","围绕资料学习、拆解概念、建立可复习的结构。","Study around your sources, break down concepts and build reviewable structure."],
  ["/ai-research","RS","科研 SASI","Research SASI","把问题、证据、推理和结论留在同一个研究工作区。","Keep questions, evidence, reasoning and conclusions in one research workspace."],
] as const;

export default function ProductCatalogClient(){
  const {lang}=useLingxiLang();
  const [ready,setReady]=useState<boolean|null>(null);

  useEffect(()=>{
    let alive=true;
    fetch("/api/sasi/readiness",{cache:"no-store"})
      .then(r=>r.ok?r.json():null)
      .then(data=>{if(alive)setReady(Boolean(data?.productionReady))})
      .catch(()=>{if(alive)setReady(false)});
    return()=>{alive=false};
  },[]);

  return <main className="lx11-page">
    <div className="lx11-wrap py-16 sm:py-20">
      <section className="max-w-3xl">
        <p className="lx11-kicker">{copy.kicker[lang]}</p>
        <h1 className="mt-4 font-display text-4xl font-light text-[var(--lx-ink)] sm:text-5xl">{copy.title[lang]}</h1>
        <p className="mt-6 text-base leading-8 text-[var(--lx-muted)]">{copy.lead[lang]}</p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl text-[var(--lx-ink)]">{copy.ai[lang]}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {cards.map(([href,code,zh,en,descZh,descEn])=><Link key={href} href={href} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
            <span className="text-xs tracking-[.2em] text-[var(--lx-faint)]">{code}</span>
            <h3 className="mt-4 text-xl text-[var(--lx-ink)]">{lang==="zh"?zh:en}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">{lang==="zh"?descZh:descEn}</p>
            <b className="mt-5 inline-block text-sm text-[var(--lx-ink)]">{copy.open[lang]} →</b>
          </Link>)}
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <Link href="/sasi" className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7">
          <p className="text-xs tracking-[.2em] text-[var(--lx-faint)]">SASI</p>
          <h2 className="mt-3 font-display text-2xl text-[var(--lx-ink)]">{copy.create[lang]}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{lang==="zh"?"AI短剧、广告、MV、电影、游戏CG等创作任务从 SASI 工作台进入。":"Enter SASI for AI short drama, ads, MV, film, game CG and other creation workflows."}</p>
          <p className="mt-4 text-xs text-[var(--lx-faint)]">{ready===true?(lang==="zh"?"生产能力已开放":"Production ready"):ready===false?(lang==="zh"?"可先准备项目，付费生产按实时状态开放":"Prepare projects now; paid production follows live readiness"):"…"}</p>
        </Link>
        <Link href="/tools" className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7">
          <p className="text-xs tracking-[.2em] text-[var(--lx-faint)]">TOOLS</p>
          <h2 className="mt-3 font-display text-2xl text-[var(--lx-ink)]">{copy.utility[lang]}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{lang==="zh"?"PDF、图片、视频、OCR、字幕、格式转换与隐私处理。":"PDF, image, video, OCR, subtitles, format conversion and privacy tools."}</p>
        </Link>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl text-[var(--lx-ink)]">{copy.balance[lang]}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Link href="/ai-wallet" className="rounded-2xl border border-[var(--lx-line)] p-6"><b>AI Balance</b><p className="mt-2 text-sm text-[var(--lx-muted)]">{lang==="zh"?"用于托管 AI 服务，按实际使用扣费。":"For hosted AI services, charged by actual usage."}</p></Link>
          <Link href="/sasi/pricing" className="rounded-2xl border border-[var(--lx-line)] p-6"><b>SASI Creation Balance</b><p className="mt-2 text-sm text-[var(--lx-muted)]">{lang==="zh"?"用于明确确认后的 SASI 创作与生产任务。":"For SASI creation and production tasks you explicitly approve."}</p></Link>
        </div>
      </section>
    </div>
  </main>;
}
