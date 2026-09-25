"use client";

import {type FormEvent,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

type Mode="drama"|"knowledge"|"research";

const cards=[
  {href:"/sasi/drama",zh:"AI短剧生成",en:"AI Drama",noteZh:"从创意、剧本、人物、分镜到成片制作。",noteEn:"From idea and script to characters, shots and delivery.",mark:"🎬"},
  {href:"/ai-knowledge",zh:"书本 / 资料智能体",en:"Book & Document Agent",noteZh:"把书本、论文和资料变成可检索、可追溯的活智能体。",noteEn:"Turn books, papers and files into traceable agents.",mark:"▣"},
  {href:"/ai-research",zh:"科研 SASI",en:"Research SASI",noteZh:"整理资料、追踪来源、形成研究任务与结果。",noteEn:"Organize sources into research tasks and outputs.",mark:"⌕"},
  {href:"/sasi/connections",zh:"模型与 API",en:"Models & APIs",noteZh:"连接你自己的模型能力，密钥只在服务端加密保存。",noteEn:"Connect your own model providers with encrypted credentials.",mark:"⌁"},
  {href:"/sasi/pricing",zh:"创作余额",en:"Creation Balance",noteZh:"查看人民币余额，并选择国内支付或 PayPal 美元支付。",noteEn:"View balance and choose domestic or PayPal USD payment.",mark:"◎"},
] as const;

export default function SasiCommandCenter(){
  const{lang}=useLingxiLang();
  const zh=lang==="zh";
  const[mode,setMode]=useState<Mode>("drama");
  const[prompt,setPrompt]=useState("");

  function submit(e:FormEvent){
    e.preventDefault();
    const value=prompt.trim();
    if(value)sessionStorage.setItem("sasi-intent",value);
    const target=mode==="drama"?"/sasi/drama":mode==="knowledge"?"/ai-knowledge":"/ai-research";
    window.location.assign(target);
  }

  return <main className="lx11-page">
    <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-medium text-[var(--lx-faint)]">{zh?"SASI · AI 创作入口":"SASI · AI Creation"}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--lx-ink)] sm:text-4xl">
          {zh?"把一个想法，直接推进成可以制作的任务。":"Turn one idea into work that can actually be produced."}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--lx-muted)]">
          {zh
            ?"不把所有能力塞进一块旧式控制台。先告诉 SASI 你要做什么，再进入对应的短剧、资料智能体、科研或模型连接工作区。"
            :"Start with what you want to make, then enter the matching drama, document-agent, research or model workspace."}
        </p>
      </section>

      <section className="mt-10 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-7">
        <form onSubmit={submit}>
          <textarea
            value={prompt}
            onChange={e=>setPrompt(e.target.value)}
            rows={5}
            placeholder={zh?"例如：把这份小说做成 20 集竖屏 AI 短剧；或把这篇论文变成可追问的研究智能体。":"Example: turn this novel into a 20-episode AI drama, or turn this paper into a research agent."}
            className="w-full resize-none bg-transparent text-sm leading-7 text-[var(--lx-ink)] outline-none placeholder:text-[var(--lx-faint)]"
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--lx-line)] pt-5">
            <div className="flex flex-wrap gap-2">
              {([
                ["drama",zh?"AI短剧":"AI Drama"],
                ["knowledge",zh?"资料智能体":"Document Agent"],
                ["research",zh?"科研":"Research"],
              ] as const).map(([id,label])=><button
                type="button"
                key={id}
                onClick={()=>setMode(id)}
                className={`rounded-full border px-4 py-2 text-sm ${mode===id?"border-[var(--lx-line-strong)] bg-[var(--lx-soft)] text-[var(--lx-ink)]":"border-[var(--lx-line)] text-[var(--lx-muted)]"}`}
              >{label}</button>)}
            </div>
            <button className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-semibold text-[var(--lx-bg)]">
              {zh?"进入工作区 →":"Open workspace →"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm text-[var(--lx-faint)]">{zh?"当前入口":"Current workspaces"}</p><h2 className="mt-2 text-2xl font-semibold text-[var(--lx-ink)]">{zh?"按任务进入，不按功能堆页面。":"Enter by task, not by feature clutter."}</h2></div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(card=><Link key={card.href} href={card.href} className="group rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 transition hover:border-[var(--lx-line-strong)]">
            <div className="flex items-center justify-between"><span className="text-xl">{card.mark}</span><span className="text-sm text-[var(--lx-faint)]">→</span></div>
            <h3 className="mt-5 text-base font-semibold text-[var(--lx-ink)]">{zh?card.zh:card.en}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{zh?card.noteZh:card.noteEn}</p>
          </Link>)}
          <div className="rounded-2xl border border-dashed border-[var(--lx-line)] p-5">
            <div className="flex items-center justify-between"><span className="text-xl">⌘</span><span className="text-xs text-[var(--lx-faint)]">{zh?"继续构建":"In progress"}</span></div>
            <h3 className="mt-5 text-base font-semibold text-[var(--lx-ink)]">{zh?"AI 网站构建":"AI Website Builder"}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{zh?"当前正在拆出独立工作区；在没有完整代码、预览与部署闭环前，不把旧控制台继续冒充正式产品。":"A dedicated workspace is being separated from the legacy shell; it stays hidden until code, preview and deployment are real."}</p>
          </div>
        </div>
      </section>
    </div>
  </main>;
}
