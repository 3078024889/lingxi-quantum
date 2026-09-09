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

export function SasiWorkLibrary({ lang, dark, projects, loaded, onOpen, onCreate, onRefresh }: { lang: Lang; dark: boolean; projects: Project[]; loaded: boolean; onOpen: (id: string) => void; onCreate: (view: "director" | "drama" | "code", preset?: string) => void; onRefresh: () => Promise<void> }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const panel = dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white";
  const visible = projects.filter((item) => (filter === "all" || item.kind === filter) && item.title.toLowerCase().includes(query.toLowerCase()));

  async function projectAction(action: "rename" | "duplicate" | "export" | "delete", project: Project) {
    if (busyId) return;
    setFeedback("");
    if (action === "rename") {
      const title = window.prompt(tr(lang, "输入新的作品名称", "Enter a new project name"), project.title)?.trim();
      if (!title || title === project.title) return;
      setBusyId(project.id);
      const response = await fetch(`/api/sasi/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      setBusyId(null);
      if (!response.ok) return setFeedback(tr(lang, "重命名失败，请确认服务器密钥与登录状态。", "Rename failed. Check server configuration and sign-in."));
      await onRefresh();
      return setFeedback(tr(lang, "作品名称已保存。", "Project name saved."));
    }

    if (action === "delete") {
      if (!window.confirm(tr(lang, `确定永久删除“${project.title}”吗？项目图谱和已交付资产记录将一并删除，运行中的任务不会被允许删除。`, `Permanently delete “${project.title}”? Its graph and delivery records will be removed. Active jobs cannot be deleted.`))) return;
      setBusyId(project.id);
      const response = await fetch(`/api/sasi/projects/${project.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      setBusyId(null);
      if (!response.ok) return setFeedback(result.error === "PROJECT_HAS_ACTIVE_JOB" ? tr(lang, "项目仍有运行中的任务，请完成或取消任务后再删除。", "This project still has an active job.") : tr(lang, "删除失败，作品仍被保留。", "Delete failed; the project was kept."));
      await onRefresh();
      return setFeedback(result.cleanupPending ? tr(lang, "项目已删除；个别云端对象等待后台清理。", "Project deleted; some cloud objects await cleanup.") : tr(lang, "项目及其云端资产记录已删除。", "Project and cloud asset records deleted."));
    }

    setBusyId(project.id);
    const detailResponse = await fetch(`/api/sasi/projects/${project.id}`, { cache: "no-store" });
    if (!detailResponse.ok) {
      setBusyId(null);
      return setFeedback(tr(lang, "项目详情暂时无法读取。", "Project details are temporarily unavailable."));
    }
    const detail = await detailResponse.json();
    if (action === "export") {
      const payload = { schema: "lingxifield.sasi.project.v1", exportedAt: new Date().toISOString(), ...detail };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${project.title.replace(/[\\/:*?\"<>|]/g, "-") || "sasi-project"}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setBusyId(null);
      return setFeedback(tr(lang, "项目图谱已导出为可迁移 JSON。", "Project graph exported as portable JSON."));
    }

    const sourceInput = detail.nodes?.find((node: { type?: string }) => node.type === "project-understanding")?.input ?? {};
    const brief = typeof sourceInput.brief === "string" && sourceInput.brief.trim().length >= (project.kind === "build" ? 12 : 20)
      ? sourceInput.brief
      : tr(lang, `复制“${project.title}”的生产结构，作为一个可继续编辑的新项目。`, `Duplicate the production structure of “${project.title}” as a new editable project.`);
    const response = await fetch("/api/sasi/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ kind: project.kind, language: lang, brief: `${brief}\n\n${tr(lang, "结构副本", "Structure copy")}`, seconds: sourceInput.seconds, quality: sourceInput.quality, episodes: sourceInput.requestedEpisodes, attachments: [] }),
    });
    setBusyId(null);
    if (!response.ok) return setFeedback(tr(lang, "复制失败，原项目没有受到影响。", "Copy failed; the original project was not changed."));
    const created = await response.json();
    await onRefresh();
    setFeedback(tr(lang, "已复制生产结构；出于隐私与存储安全，原文件不会被重复复制。", "Production structure copied. Source files are not duplicated for privacy and storage safety."));
    if (created.project?.id) onOpen(created.project.id);
  }
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
    {feedback && <div role="status" className="mt-4 rounded-2xl border border-[#6d70ff]/25 bg-[#6d70ff]/5 px-4 py-3 text-xs leading-5 text-[#5a50d6]">{feedback}</div>}
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {!loaded ? <div className={`rounded-3xl border p-6 ${panel}`}>{tr(lang,"正在读取作品…","Loading works…")}</div> : visible.length ? visible.map((project,index)=><article key={project.id} className={`group overflow-hidden rounded-3xl border transition hover:-translate-y-1 ${panel}`}><button type="button" onClick={()=>onOpen(project.id)} className="block w-full text-left"><span className={`sasi-library-art art-${project.kind === "drama" ? "director" : "build"} art-shift-${index%3}`}/><span className="block px-5 pt-5"><span className="text-[10px] uppercase tracking-[.18em] text-[#6d70ff]">{project.kind === "drama" ? "AI DRAMA" : "BUILD & DEPLOY"}</span><h3 className="mt-2 truncate font-semibold">{project.title}</h3><p className="mt-2 text-xs opacity-45">v{project.currentVersion} · {project.nodeCount ?? 0} {tr(lang,"个生产节点","production nodes")}{project.updatedAt ? ` · ${new Date(project.updatedAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}` : ""}</p><span className="mt-4 inline-block text-xs font-semibold">{tr(lang,"继续创作 →","Continue →")}</span></span></button><div className="m-5 mt-4 grid grid-cols-4 gap-2 border-t border-current/10 pt-4">{([ ["rename",tr(lang,"改名","Rename")], ["duplicate",tr(lang,"复制","Copy")], ["export",tr(lang,"导出","Export")], ["delete",tr(lang,"删除","Delete")] ] as const).map(([action,label])=><button key={action} type="button" disabled={busyId===project.id} onClick={()=>projectAction(action,project)} className={`rounded-lg border border-current/10 px-2 py-2 text-[10px] transition hover:border-[#6d70ff]/50 hover:text-[#6d70ff] disabled:opacity-30 ${action==="delete"?"hover:border-red-400 hover:text-red-500":""}`}>{busyId===project.id?"…":label}</button>)}</div></article>) : <div className={`col-span-full rounded-3xl border p-8 text-center ${panel}`}><h3 className="text-xl font-semibold">{tr(lang,"你的第一件作品，从一个清晰想法开始。","Your first work begins with one clear idea.")}</h3><p className="mt-3 text-sm opacity-55">{tr(lang,"先从下面的成熟模板开始，不必面对空白页面。","Start from a mature template below—never a blank page.")}</p></div>}
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

export function DramaOverviewConsole({ lang, onStart }: { lang: Lang; onStart:()=>void }) {
  const stages = ["剧本解析","人物身份板","场景身份板","分集","故事板","精分镜","视频镜头","配音字幕 / 成片"];
  const [title,setTitle] = useState("");
  return <section className="drama-console mt-5">
    <header className="drama-console-title"><div><p>AI DRAMA STUDIO · {tr(lang,"项目总览","PROJECT OVERVIEW")}</p><input value={title} onChange={event=>setTitle(event.target.value)} placeholder={tr(lang,"为你的短剧项目命名……","Name your drama project…")}/><small>{tr(lang,"这是可编辑模板；建立项目后才会显示真实集数、镜头与进度。","Editable template; real episode, shot and progress data appears after project creation.")}</small></div><button onClick={onStart}>＋ {tr(lang,"新建项目","New project")}</button></header>
    <div className="drama-overview-stats"><article><b>{tr(lang,"项目生产驾驶舱","Production cockpit")}</b><small>{tr(lang,"剧本、身份板、故事板、镜头与交付集中管理","Manage script, identity, storyboard, shots and delivery")}</small></article>{[["当前集数","—"],["总时长","—"],["完成镜头","0 / 0"],["项目完成率","0%"]].map(([label,value])=><article key={label}><small>{tr(lang,label,label)}</small><strong>{value}</strong></article>)}</div>
    <div className="drama-flow"><div className="drama-section-head"><h3>{tr(lang,"生产流程","Production pipeline")}</h3><span>{tr(lang,"每个阶段可进入编辑，状态实时保存","Open each stage to edit; status persists")}</span></div><div className="drama-flow-grid">{stages.map((stage,index)=><button key={stage}><i>{String(index+1).padStart(2,"0")}</i><b>{tr(lang,stage,stage)}</b><small>{tr(lang,"等待项目资料","Awaiting project material")}</small><em>{tr(lang,"未开始","Not started")}</em></button>)}</div></div>
    <div className="drama-overview-bottom"><article><div className="drama-section-head"><h3>Timeline</h3><span>00:00 — 00:00</span></div><div className="drama-empty-line">＋ {tr(lang,"建立项目后，在这里编排镜头、对白、音乐与字幕","Create a project to arrange shots, dialogue, music and subtitles")}</div></article><article><div className="drama-section-head"><h3>{tr(lang,"最近生成镜头","Recent shots")}</h3></div><div className="drama-shot-placeholders">{[1,2,3].map(item=><span key={item}>＋</span>)}</div></article><article><div className="drama-section-head"><h3>{tr(lang,"待处理任务","Open tasks")}</h3></div><div className="drama-empty-line">{tr(lang,"暂无任务","No tasks yet")}</div></article></div>
  </section>;
}

type EditableCharacter = { id:number; name:string; role:string; appearance:string; costume:string; state:string };
type EditableShot = { id:number; title:string; duration:string; framing:string; movement:string; character:string; setting:string; prompt:string };

export function DramaVisualWorkspace({ lang, mode }: { lang: Lang; dark: boolean; mode: "continuity" | "shots" }) {
  const [characters,setCharacters] = useState<EditableCharacter[]>([{id:1,name:"",role:"",appearance:"",costume:"",state:""}]);
  const [selectedCharacter,setSelectedCharacter] = useState(1);
  const [shots,setShots] = useState<EditableShot[]>([{id:1,title:"",duration:"",framing:"",movement:"",character:"",setting:"",prompt:""}]);
  const [selectedShot,setSelectedShot] = useState(1);
  const character = characters.find(item=>item.id===selectedCharacter) ?? characters[0];
  const shot = shots.find(item=>item.id===selectedShot) ?? shots[0];
  const updateCharacter = (patch:Partial<EditableCharacter>)=>setCharacters(items=>items.map(item=>item.id===selectedCharacter?{...item,...patch}:item));
  const updateShot = (patch:Partial<EditableShot>)=>setShots(items=>items.map(item=>item.id===selectedShot?{...item,...patch}:item));
  if(mode === "continuity") return <section className="drama-console mt-5">
    <header className="drama-console-title"><div><p>AI DRAMA STUDIO · {tr(lang,"人物与连续性","CHARACTER & CONTINUITY")}</p><h2>{tr(lang,"角色不乱变，变化有依据","Consistent identity, motivated change")}</h2><small>{tr(lang,"输入框中的文字只是提示，可直接删除并换成你的角色资料。","All field text is placeholder guidance—replace it with your own character data.")}</small></div><button onClick={()=>{const id=Date.now();setCharacters(items=>[...items,{id,name:"",role:"",appearance:"",costume:"",state:""}]);setSelectedCharacter(id)}}>＋ {tr(lang,"新建角色","New character")}</button></header>
    <div className="drama-continuity-grid"><aside><div className="drama-section-head"><h3>{tr(lang,"人物圣经 / Identity Bible","Identity Bible")}</h3><span>{characters.length} {tr(lang,"位角色","characters")}</span></div><div className="drama-character-list">{characters.map((item,index)=><button className={item.id===selectedCharacter?"is-selected":""} key={item.id} onClick={()=>setSelectedCharacter(item.id)}><i>{String(index+1).padStart(2,"0")}</i><span><b>{item.name||tr(lang,"未命名角色","Untitled character")}</b><small>{item.role||tr(lang,"点击填写身份与戏剧功能","Add identity and dramatic function")}</small></span></button>)}</div><button className="drama-delete" disabled={characters.length===1} onClick={()=>{const next=characters.filter(item=>item.id!==selectedCharacter);setCharacters(next);setSelectedCharacter(next[0]?.id??1)}}>{tr(lang,"删除当前角色","Delete character")}</button></aside>
      <div><div className="drama-section-head"><h3>{tr(lang,"永久身份锁","Permanent identity")}</h3><span>{tr(lang,"不会随镜头改变","Does not drift between shots")}</span></div><div className="drama-field-grid"><input value={character?.name??""} onChange={e=>updateCharacter({name:e.target.value})} placeholder={tr(lang,"角色姓名，例如：填写主角姓名","Character name")}/><input value={character?.role??""} onChange={e=>updateCharacter({role:e.target.value})} placeholder={tr(lang,"身份与戏剧功能，例如：主角 / 阻力角色","Identity and dramatic function")}/><input value={character?.appearance??""} onChange={e=>updateCharacter({appearance:e.target.value})} placeholder={tr(lang,"脸型、年龄感、发型、身高与体态","Face, age, hair, height and build")}/><input value={character?.costume??""} onChange={e=>updateCharacter({costume:e.target.value})} placeholder={tr(lang,"固定服装、色彩、道具与声线","Costume, palette, prop and voice")}/></div><div className="drama-section-head mt-5"><h3>{tr(lang,"剧情状态变化","Story state changes")}</h3><span>{tr(lang,"只有剧情发生后才更新","Update only when motivated by story")}</span></div><textarea value={character?.state??""} onChange={e=>updateCharacter({state:e.target.value})} placeholder={tr(lang,"记录集数、场次、事件，以及服装、伤势、情绪、关系或声音发生了什么变化……","Record episode, scene, event, and any justified costume, injury, emotion, relationship or voice change…")}/></div>
      <aside><div className="drama-section-head"><h3>{tr(lang,"连续性规则","Continuity rules")}</h3></div>{[["人物外貌","脸部结构、年龄感与身体比例"],["服装发型","继承上一镜状态，变化必须有剧情原因"],["场景道具","记录位置、持有者、损坏与消失"],["光线天气","保持时段、主光方向和环境状态"],["镜头状态","轴线、视线和动作起止点"]].map(([a,b])=><article key={a}><b>{tr(lang,a,a)}</b><small>{tr(lang,b,b)}</small></article>)}</aside></div>
  </section>;

  const productionTabs=["故事板","精分镜","视频镜头","配音","字幕","Timeline","导出"];
  return <section className="drama-console mt-5">
    <header className="drama-console-title"><div><p>AI DRAMA STUDIO · {tr(lang,"故事板与镜头生产","STORYBOARD & SHOT PRODUCTION")}</p><h2>{tr(lang,"从故事板到可审阅镜头","From storyboard to reviewable shots")}</h2><small>{tr(lang,"下面是空白制作模板；提示词可删除，真实生成需建立项目并确认供应商调用。","This is an empty production template; generation requires a project and confirmed provider call.")}</small></div><button onClick={()=>{const id=Date.now();setShots(items=>[...items,{id,title:"",duration:"",framing:"",movement:"",character:"",setting:"",prompt:""}]);setSelectedShot(id)}}>＋ {tr(lang,"新建镜头","New shot")}</button></header>
    <nav className="drama-production-tabs">{productionTabs.map((item,index)=><button className={index===2?"is-active":""} key={item}>{item}</button>)}</nav>
    <div className="drama-shots-grid"><div><div className="drama-section-head"><h3>{tr(lang,"镜头生产","Shot production")}</h3><span>{shots.length} {tr(lang,"个草稿镜头","draft shots")}</span></div><div className="drama-shot-grid">{shots.map((item,index)=><button className={item.id===selectedShot?"is-selected":""} key={item.id} onClick={()=>setSelectedShot(item.id)}><span className="drama-shot-blank">＋</span><b>S{String(index+1).padStart(2,"0")} · {item.duration||tr(lang,"填写时长","Duration")}</b><small>{item.title||tr(lang,"填写镜头事件","Describe the shot event")}</small></button>)}<button className="drama-add-shot" onClick={()=>{const id=Date.now();setShots(items=>[...items,{id,title:"",duration:"",framing:"",movement:"",character:"",setting:"",prompt:""}]);setSelectedShot(id)}}>＋<small>{tr(lang,"添加镜头","Add shot")}</small></button></div></div>
      <aside><div className="drama-section-head"><h3>{tr(lang,"当前镜头","Current shot")}</h3><button className="drama-delete" disabled={shots.length===1} onClick={()=>{const next=shots.filter(item=>item.id!==selectedShot);setShots(next);setSelectedShot(next[0]?.id??1)}}>{tr(lang,"删除","Delete")}</button></div><div className="drama-shot-preview">＋<small>{tr(lang,"上传故事板或生成后显示预览","Upload a storyboard or generate a preview")}</small></div><div className="drama-field-grid"><input value={shot?.title??""} onChange={e=>updateShot({title:e.target.value})} placeholder={tr(lang,"镜头事件 / 动作","Shot event / action")}/><input value={shot?.duration??""} onChange={e=>updateShot({duration:e.target.value})} placeholder={tr(lang,"时长，例如 6 秒","Duration, e.g. 6 seconds")}/><input value={shot?.framing??""} onChange={e=>updateShot({framing:e.target.value})} placeholder={tr(lang,"景别与机位","Framing and camera")}/><input value={shot?.movement??""} onChange={e=>updateShot({movement:e.target.value})} placeholder={tr(lang,"运镜与动作起止","Movement and action bounds")}/><input value={shot?.character??""} onChange={e=>updateShot({character:e.target.value})} placeholder={tr(lang,"本镜人物与状态版本","Characters and state version")}/><input value={shot?.setting??""} onChange={e=>updateShot({setting:e.target.value})} placeholder={tr(lang,"场景、时段、天气与光线","Setting, time, weather and light")}/></div><textarea value={shot?.prompt??""} onChange={e=>updateShot({prompt:e.target.value})} placeholder={tr(lang,"写下画面目标，系统会在真实项目中编译为模型提示词；这里的提示可全部删除……","Describe the visual goal; in a real project it will compile into a provider prompt…")}/><button className="drama-primary-action">{tr(lang,"保存为镜头草稿","Save shot draft")}</button></aside></div>
  </section>;
}
