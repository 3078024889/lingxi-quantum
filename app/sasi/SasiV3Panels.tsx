"use client";

import Link from "next/link";
import { useState } from "react";

type Lang = "zh" | "en";
type Project = { id: string; kind: "build" | "drama"; title: string; currentVersion: number; nodeCount?: number; updatedAt?: string };

const tr = (lang: Lang, zh: string, en: string) => lang === "zh" ? zh : en;

const templateCards = [
  { title: "品牌官网模板", en: "Brand Website", note: "从品牌定位、页面叙事到上线检查，完成一个可信的数字门面。", prompt: "为我的品牌构建一个高级、可信、可正式上线的官网。先梳理目标用户、核心价值、页面叙事、信任证据与转化路径，再完成响应式界面、内容、测试和部署检查。", art: "build", target: "code" },
  { title: "AI 短剧模板", en: "AI Drama", note: "自带人物圣经、分集钩子、连续性表与镜头生产链。", prompt: "创作一部有强开场钩子和持续反转的 AI 短剧。先建立世界观、人物圣经、关系变化和连续性锁，再形成分集结构、逐镜分镜、声音方案与视频提示词。", art: "director", target: "drama" },
  { title: "产品应用模板", en: "Product App", note: "把需求拆成界面、数据、权限、测试与部署节点。", prompt: "把这个产品想法变成可以真实使用的应用。请先定义用户任务、核心流程、页面、数据、权限和成功标准，再进入构建、测试、安全检查与部署。", art: "capability", target: "code" },
  { title: "宣传视频模板", en: "Campaign Film", note: "从一句卖点形成创意概念、脚本、分镜和成片提示词。", prompt: "为我的产品制作一支 30 秒宣传视频。先提炼唯一核心卖点和目标受众，再形成 3 秒钩子、情绪曲线、旁白、分镜、摄影语言、声音设计与逐镜生成提示词。", art: "orchestration", target: "drama" },
  { title: "故事宇宙模板", en: "Story Universe", note: "建立世界规则、人物关系和可持续扩展的叙事资产。", prompt: "建立一个可以持续生长的故事宇宙：明确世界规则、时代与空间、核心冲突、人物关系、不可改变的角色锚点、第一季主线和后续扩展接口。", art: "field", target: "director" },
] as const;

export function SasiWorkLibrary({ lang, dark, projects, loaded, onOpen, onCreate }: { lang: Lang; dark: boolean; projects: Project[]; loaded: boolean; onOpen: (id: string) => void; onCreate: (view: "director" | "drama" | "code", preset?: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const panel = dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white";
  const visible = projects.filter((item) => (filter === "all" || item.kind === filter) && item.title.toLowerCase().includes(query.toLowerCase()));
  return <section>
    <div className="sasi-v3-page-hero art-works">
      <p className="sasi-v3-kicker">MY CREATIVE ARCHIVE</p>
      <h1>{tr(lang,"我的作品库","My Works")}</h1>
      <p>{tr(lang,"把你做过的每一个网站、应用、短剧、视频与灵感成果，都留在这里；继续编辑、导出、上线，或从模板重新开始。","Keep every website, app, drama, video and spark of inspiration here—continue, export, publish or begin again from a template.")}</p>
      <strong>{tr(lang,"看见你已经创造了什么，也看见你接下来还能创造什么。","See what you have created—and what you can create next.")}</strong>
    </div>

    <div className={`mt-5 grid gap-3 rounded-3xl border p-4 md:grid-cols-[1fr_auto] ${panel}`}>
      <input value={query} onChange={(e)=>setQuery(e.target.value)} className="rounded-2xl border border-current/10 bg-transparent px-4 py-3 text-sm outline-none" placeholder={tr(lang,"搜索作品、类型或项目名称…","Search works, types or projects…")}/>
      <div className="flex flex-wrap gap-2">{[["all","全部"],["drama","短剧与视频"],["build","网站与应用"]].map(([id,label])=><button key={id} onClick={()=>setFilter(id)} className={`rounded-full px-4 py-2 text-xs ${filter===id?"bg-[#6958ff] text-white":"border border-current/15"}`}>{tr(lang,label,id)}</button>)}<button onClick={()=>onCreate("director")} className="rounded-full bg-gradient-to-r from-[#9a5cff] to-[#287cff] px-4 py-2 text-xs font-semibold text-white">＋ {tr(lang,"创造新作品","Create")}</button></div>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[[projects.length,"全部作品"],[projects.filter(p=>p.kind==="drama").length,"影像项目"],[projects.filter(p=>p.kind==="build").length,"数字产品"],["云端同步","保存状态"]].map(([value,label])=><div key={String(label)} className={`rounded-2xl border p-4 ${panel}`}><strong className="text-2xl">{loaded?value:"…"}</strong><p className="mt-1 text-xs opacity-50">{label}</p></div>)}
    </div>

    <div className="mt-8 flex items-end justify-between"><div><p className="sasi-v3-kicker">YOUR WORKS</p><h2 className="mt-2 text-2xl font-semibold">{tr(lang,"持续生长的作品","Works in progress")}</h2></div><span className="text-xs opacity-45">{tr(lang,"真实项目会显示在这里","Saved projects appear here")}</span></div>
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {!loaded ? <div className={`rounded-3xl border p-6 ${panel}`}>{tr(lang,"正在读取作品…","Loading works…")}</div> : visible.length ? visible.map((project,index)=><button key={project.id} onClick={()=>onOpen(project.id)} className={`group overflow-hidden rounded-3xl border text-left transition hover:-translate-y-1 ${panel}`}><span className={`sasi-library-art art-${project.kind === "drama" ? "director" : "build"} art-shift-${index%3}`}/><span className="block p-5"><span className="text-[10px] uppercase tracking-[.18em] text-[#6d70ff]">{project.kind === "drama" ? "AI DRAMA" : "BUILD & DEPLOY"}</span><h3 className="mt-2 truncate font-semibold">{project.title}</h3><p className="mt-2 text-xs opacity-45">v{project.currentVersion} · {project.nodeCount ?? 0} {tr(lang,"个生产节点","production nodes")}</p><span className="mt-5 inline-block text-xs font-semibold">{tr(lang,"继续创作 →","Continue →")}</span></span></button>) : <div className={`col-span-full rounded-3xl border p-8 text-center ${panel}`}><h3 className="text-xl font-semibold">{tr(lang,"你的第一件作品，从一个清晰想法开始。","Your first work begins with one clear idea.")}</h3><p className="mt-3 text-sm opacity-55">{tr(lang,"先从下面的成熟模板开始，不必面对空白页面。","Start from a mature template below—never a blank page.")}</p></div>}
    </div>

    <div className="mt-10"><p className="sasi-v3-kicker">INSPIRATION TEMPLATES</p><h2 className="mt-2 text-3xl font-semibold">{tr(lang,"灵感模板","Inspiration templates")}</h2><p className="mt-3 max-w-3xl text-sm leading-7 opacity-55">{tr(lang,"从一个成熟起点开始，而不是面对空白页面。挑一个模板，替换成你的内容，SASI 会继续帮你推进到真实可用的作品。","Begin from a mature starting point. Choose a template, replace it with your content, and let SASI move it toward a usable work.")}</p></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{templateCards.map(item=><button key={item.title} onClick={()=>onCreate(item.target,item.prompt)} className={`group overflow-hidden rounded-3xl border text-left transition hover:-translate-y-1 ${panel}`}><span className={`sasi-library-art art-${item.art}`}/><span className="block p-4"><h3 className="font-semibold">{tr(lang,item.title,item.en)}</h3><p className="mt-2 text-xs leading-5 opacity-50">{tr(lang,item.note,item.note)}</p><span className="mt-4 inline-block text-xs text-[#6d70ff]">{tr(lang,"使用此模板 →","Use template →")}</span></span></button>)}</div>
  </section>;
}

export function SasiAccountCenter({ lang, dark, accountEmail, onOpenBilling, onOpenModels }: { lang: Lang; dark: boolean; accountEmail: string | null; onOpenBilling: ()=>void; onOpenModels: ()=>void }) {
  const panel = dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white";
  const rows = [
    ["账户与安全","登录方式、会话设备与安全提醒","/account"],
    ["订单与发票","查看订单、支付记录与发票信息","/account"],
    ["文件与数据","管理上传文件、导出与删除申请","/account"],
    ["权限与隐私","查看第三方连接、授权范围与撤销方式","/legal/sasi"],
  ];
  return <section>
    <div className="sasi-v3-page-hero art-account"><p className="sasi-v3-kicker">ACCOUNT & SECURITY</p><h1>{tr(lang,"我的账户","My Account")}</h1><p>{tr(lang,"集中管理登录、安全、订单、付款、API 连接、文件与数据权限。账户负责安全与结算；作品与生命档案分别留在作品库和我的场域。","Manage sign-in, security, orders, payment, API connections, files and permissions in one place.")}</p></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <div className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs uppercase tracking-[.18em] opacity-45">CURRENT IDENTITY</p><div className="mt-4 flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#72d7ff] to-[#7657ff] text-xl text-white">◎</span><div><h2 className="font-semibold">{accountEmail ?? tr(lang,"尚未连接账户","Account not connected")}</h2><p className="mt-1 text-xs opacity-50">{accountEmail?tr(lang,"已连接 · 私有数据隔离已启用","Connected · private data isolation active"):tr(lang,"登录后同步真实项目、订单与连接","Sign in to sync real projects and connections")}</p></div></div><Link href="/account" className="mt-6 inline-flex rounded-xl bg-current px-5 py-3 text-xs font-semibold text-[var(--sasi-button-ink,#fff)]">{accountEmail?tr(lang,"管理登录与个人资料","Manage identity"):tr(lang,"登录或创建账户","Sign in")}</Link></div>
      <div className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs uppercase tracking-[.18em] opacity-45">SECURITY POSTURE</p><h2 className="mt-4 text-xl font-semibold">{tr(lang,"密钥只在服务端加密保存","Keys stay encrypted server-side")}</h2><p className="mt-3 text-sm leading-6 opacity-55">{tr(lang,"浏览器不回显完整密钥。每个连接可独立验证、停用和删除。","Full keys are never echoed to the browser. Each connection can be verified, disabled or deleted.")}</p></div>
    </div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{rows.map(([title,note,href])=><Link key={title} href={href} className={`rounded-3xl border p-6 transition hover:-translate-y-0.5 ${panel}`}><span className="text-[#6d70ff]">◇</span><h2 className="mt-4 text-lg font-semibold">{tr(lang,title,title)}</h2><p className="mt-2 text-sm leading-6 opacity-55">{tr(lang,note,note)}</p><span className="mt-5 inline-block text-xs font-semibold">{tr(lang,"打开管理 →","Open →")}</span></Link>)}</div>
    <div className="mt-5 grid gap-4 md:grid-cols-2"><button onClick={onOpenModels} className="rounded-3xl bg-gradient-to-br from-[#18264b] to-[#33205e] p-6 text-left text-white"><p className="text-xs text-cyan-300">MODEL & API</p><h2 className="mt-3 text-xl font-semibold">{tr(lang,"管理自己的模型连接","Manage your model connections")}</h2><p className="mt-2 text-sm text-white/60">{tr(lang,"用户自带 Key，费用由对应供应商账户承担。","Bring your own key; provider usage stays on that account.")}</p></button><button onClick={onOpenBilling} className="rounded-3xl bg-gradient-to-br from-[#ffca72] to-[#c98437] p-6 text-left text-black"><p className="text-xs">BALANCE & USAGE</p><h2 className="mt-3 text-xl font-semibold">{tr(lang,"查看余额、用量与成本边界","Review balance, usage and cost boundaries")}</h2><p className="mt-2 text-sm text-black/60">{tr(lang,"先显示预计投入，再由你确认真实调用。","See the estimate before authorizing real usage.")}</p></button></div>
  </section>;
}

export function DramaVisualWorkspace({ lang, dark, mode }: { lang: Lang; dark: boolean; mode: "continuity" | "shots" }) {
  const panel = dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white";
  const [selected, setSelected] = useState(0);
  const isContinuity = mode === "continuity";
  const cards = isContinuity ? [
    ["沈晚棠","女主 · 22 岁","正脸、侧脸、全身、表情与服装参考保持同一身份"],
    ["萧凛","男主 · 27 岁","克制冷峻，玄色常服，人物关系随剧情更新"],
    ["沈云薇","关键关系人物","固定五官、声线和人物边界，避免跨镜头漂移"],
  ] : [
    ["01 · 雨夜抵达","6 秒 · 远景建立","缓慢推进，冷雨与府门共同建立压迫感"],
    ["02 · 推门停顿","4 秒 · 中近景","衣袖掠过烛火，动作连续，视线承接下一镜"],
    ["03 · 秘密显现","5 秒 · 85mm 特写","先震惊后收敛，保留角色脸部和服装锚点"],
    ["04 · 众人反应","5 秒 · 反应组接","关系轴不跳线，控制节奏并交付结尾钩子"],
  ];
  return <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
    <div><div className={`overflow-hidden rounded-3xl border ${panel}`}><div className={`sasi-drama-preview ${isContinuity?"art-director":"art-field"}`}><span>{tr(lang,"示例视觉资产 · 可替换为你的角色与镜头","Example visual asset · replace with your own")}</span></div><div className="p-6"><p className="text-xs uppercase tracking-[.18em] text-[#6d70ff]">{isContinuity?"CHARACTER MEMORY":"SHOT TIMELINE"}</p><h2 className="mt-3 text-2xl font-semibold">{tr(lang,isContinuity?"人物与连续性工作台":"分镜与镜头生产台",isContinuity?"Character & Continuity":"Storyboard & Shot Production")}</h2><p className="mt-3 text-sm leading-7 opacity-55">{tr(lang,isContinuity?"把角色 DNA、服装、声线、关系和上一场状态放进同一条可回看的记忆链。":"把剧情变成景别、运镜、动作、时长、声音和模型可执行提示词。","")}</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{cards.map((card,index)=><button key={card[0]} onClick={()=>setSelected(index)} className={`rounded-2xl border p-5 text-left transition ${selected===index?"border-[#6d70ff] ring-2 ring-[#6d70ff]/15":panel}`}><span className="text-[10px] uppercase tracking-[.15em] opacity-40">{isContinuity?`ASSET 0${index+1}`:`SHOT 0${index+1}`}</span><h3 className="mt-2 font-semibold">{card[0]}</h3><p className="mt-1 text-xs text-[#6d70ff]">{card[1]}</p><p className="mt-3 text-xs leading-5 opacity-50">{card[2]}</p></button>)}</div></div>
    <aside className={`h-fit rounded-3xl border p-5 ${panel}`}><p className="text-xs uppercase tracking-[.18em] opacity-45">{isContinuity?"LOCKED ATTRIBUTES":"DIRECTOR CHECK"}</p><h3 className="mt-3 font-semibold">{cards[selected][0]}</h3><ul className="mt-4 space-y-3 text-xs leading-5 opacity-65">{(isContinuity?["脸部与年龄锚点","发型、服装与道具","情绪和人物关系状态","前后镜头变化理由"]:["构图与视觉焦点","动作起止和连续性","声音、对白与环境音","生成提示词与负面约束"]).map(item=><li key={item}>✓ {item}</li>)}</ul><button className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#9a5cff] to-[#287cff] py-3 text-xs font-semibold text-white" onClick={()=>{}}>{tr(lang,isContinuity?"编辑人物圣经":"展开镜头提示词",isContinuity?"Edit character bible":"Open shot prompt")}</button><p className="mt-3 text-[10px] leading-4 opacity-40">{tr(lang,"当前为结构化示例模板；建立真实项目后，修改会写入你的项目图谱。","This is a structured example. Create a real project to persist edits.")}</p></aside>
  </div>;
}
