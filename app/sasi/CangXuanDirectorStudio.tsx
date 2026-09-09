"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { buildDirectorBlueprint, DIRECTOR_MODES, type DirectorBlueprint, type DirectorBrief, type DirectorMode } from "@/lib/sasi/cangxuan-director";
import CangXuanDataFoundry from "@/app/sasi/CangXuanDataFoundry";

type Props = { lang: "zh" | "en"; dark: boolean; accountEmail: string | null; onEnterProduction: (story: string) => void };

const initialBrief: DirectorBrief = { title: "", premise: "", protagonist: "", mode: "motion-comic", genre: "古装复仇", episodes: 24, secondsPerEpisode: 60 };
const directorModeArt: Record<DirectorMode,string> = {
  "motion-comic":"/images/sasi/cards/cangxuan-director-v1.png",
  "short-drama":"/images/sasi/cards/ai-drama-studio-v1.png",
  film:"/images/sasi/director/modes/film-director-v1.png",
  advertising:"/images/sasi/director/modes/advertising-director-v1.png",
  "music-video":"/images/sasi/director/modes/music-video-director-v1.png",
  "game-cg":"/images/sasi/director/modes/game-cg-director-v1.png",
};

export default function CangXuanDirectorStudio({ lang, dark, accountEmail, onEnterProduction }: Props) {
  const [brief, setBrief] = useState(initialBrief);
  const [blueprint, setBlueprint] = useState<DirectorBlueprint | null>(null);
  const panel = dark ? "border-white/10 bg-white/[.035]" : "border-[#e3e9f1] bg-white shadow-[0_14px_36px_rgba(38,57,83,.065)]";
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;

  useEffect(() => {
    const raw = window.localStorage.getItem("cangxuan-director-draft-v1");
    if (!raw) return;
    try { setBrief({ ...initialBrief, ...JSON.parse(raw) }); } catch { /* ignore invalid local draft */ }
  }, []);

  function createBlueprint() {
    window.localStorage.setItem("cangxuan-director-draft-v1", JSON.stringify(brief));
    setBlueprint(buildDirectorBlueprint(brief));
  }

  function selectMode(mode: DirectorMode) {
    const preset = DIRECTOR_MODES.find((item) => item.id === mode)!;
    setBrief((current) => ({ ...current, mode, genre: preset.defaultGenre, episodes: preset.defaultEpisodes, secondsPerEpisode: preset.defaultSeconds }));
    setBlueprint(null);
  }

  return <section>
    <div className="sasi-director-hero sasi-cangxuan-hero rounded-[28px] border border-current/10 p-7 sm:p-10">
      <p className="sasi-cangxuan-kicker">LINGXI FIELD · CANGXUAN DIRECTOR</p>
      <h1>{t("苍玄 AI 导演", "CangXuan AI Director")}</h1>
      <h2>{t("先建立世界规则，再进入视频生产。", "Build the world before producing the video.")}</h2>
      <p className="sasi-cangxuan-lead">{t("理解故事、角色、场景与节奏，生成可执行的导演方案。让一致性的锁定，远离付费模型的反复试错。", "Understand story, character, setting and rhythm, then create an executable directing plan—locking continuity before costly model retries.")}</p>
      <div className="sasi-cangxuan-features"><span>◎ {t("角色连续性控制","Character continuity")}</span><span>◇ {t("场景世界观设定","World design")}</span><span>▣ {t("镜头语言设计","Shot language")}</span><span>✦ {t("提示词智能编译","Prompt compilation")}</span></div>
    </div>

    <nav className={`mt-5 flex flex-wrap gap-2 rounded-2xl border p-2 ${panel}`} aria-label={t("苍玄工作区","CangXuan workspace")}><button type="button" onClick={()=>document.getElementById("cangxuan-director-room")?.scrollIntoView({behavior:"smooth"})} className="rounded-xl bg-[#7657ff] px-4 py-2.5 text-xs font-semibold text-white">{t("导演室","Director room")}</button><button type="button" onClick={()=>document.getElementById("cangxuan-data-foundry")?.scrollIntoView({behavior:"smooth"})} className="rounded-xl border border-current/15 px-4 py-2.5 text-xs font-semibold">{t("数据工厂与世界记忆","Data Foundry & World Memory")}</button><span className="self-center px-2 text-[11px] opacity-45">{t("不训练视频像素模型，先沉淀导演决策。","Directing intelligence first; no video-model training.")}</span></nav>

    <div id="cangxuan-director-room" className="mt-6 scroll-mt-8">
      <div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7657ff]">DIRECTOR SERIES</p><h2 className="mt-2 text-xl font-semibold">{t("选择你的专业导演", "Choose your specialist director")}</h2></div><span className="hidden text-xs opacity-45 sm:block">{t("入口位于创作输入之前", "Choose before writing the brief")}</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" data-testid="director-mode-grid">{DIRECTOR_MODES.map((item)=><button key={item.id} type="button" aria-pressed={brief.mode===item.id} onClick={()=>selectMode(item.id)} className={`cangxuan-mode-card group ${brief.mode===item.id?"is-selected":""}`}><span className="cangxuan-mode-art"><Image src={directorModeArt[item.id]} alt="" width={1254} height={1254} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"/></span><span className="cangxuan-mode-copy"><strong>{t(item.zh,item.en)}</strong><small>{item.en} Director</small><span>{t(item.noteZh,item.noteEn)}</span><i>{brief.mode===item.id?t("已选择","Selected"):t("选择","Select")}</i></span></button>)}</div>
    </div>

    <div className="cangxuan-step-heading"><span>2</span><div><h2>{t("建立导演方案","Build the directing blueprint")}</h2><p>{t("系统根据你选择的导演类型，生成专属叙事规则、角色锁、镜头语言与连续性方案。","Generate mode-specific story rules, character locks, shot language and continuity guidance.")}</p></div></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div className={`rounded-3xl border p-6 ${panel}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs opacity-65">{t("作品名", "Title")}<input value={brief.title} onChange={e=>setBrief({...brief,title:e.target.value})} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none" placeholder={t("例如：听见全家心声后", "e.g. The Voices Within")}/></label>
          <label className="text-xs opacity-65">{t("主角", "Protagonist")}<input value={brief.protagonist} onChange={e=>setBrief({...brief,protagonist:e.target.value})} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none" placeholder={t("角色姓名", "Character name")}/></label>
          <label className="text-xs opacity-65">{t("当前导演", "Director mode")}<div className="mt-2 rounded-xl border border-current/15 px-4 py-3 text-sm">{t(DIRECTOR_MODES.find((item)=>item.id===brief.mode)?.zh||"漫剧导演",DIRECTOR_MODES.find((item)=>item.id===brief.mode)?.en||"Motion Comic")}</div></label>
          <label className="text-xs opacity-65">{t("类型", "Genre")}<select value={brief.genre} onChange={e=>setBrief({...brief,genre:e.target.value})} className={`mt-2 w-full rounded-xl border border-current/15 px-4 py-3 text-sm outline-none ${dark?"bg-[#11151b]":"bg-white"}`}>{["古装复仇","都市情感","仙侠成长","悬疑反转","品牌广告","音乐叙事","游戏幻想"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-xs opacity-65">{t("集数", "Episodes")}<input type="number" min={1} max={200} value={brief.episodes} onChange={e=>setBrief({...brief,episodes:Number(e.target.value)})} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none"/></label>
          <label className="text-xs opacity-65">{t("每集秒数", "Seconds per episode")}<input type="number" min={15} max={600} value={brief.secondsPerEpisode} onChange={e=>setBrief({...brief,secondsPerEpisode:Number(e.target.value)})} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none"/></label>
        </div>
        <label className="mt-4 block text-xs opacity-65">{t("一句话故事", "Story premise")}<textarea value={brief.premise} onChange={e=>setBrief({...brief,premise:e.target.value})} className="mt-2 min-h-32 w-full resize-y rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm leading-7 outline-none" placeholder={t("写清人物、处境、欲望与最大阻力。", "Name the character, situation, desire and central obstacle.")}/></label>
        <button type="button" onClick={createBlueprint} className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8f5cff] to-[#3979ff] py-3.5 text-sm font-semibold text-white">✦ {t("形成导演方案", "Create directing blueprint")}</button>
      </div>
      <aside className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs uppercase tracking-[.18em] text-[#7657ff]">DIRECTOR PIPELINE</p><ol className="mt-5 space-y-4 text-sm">{[t("项目理解与叙事约束","Brief & constraints"),t("人物圣经与视觉锁","Character bible"),t("分集结构与情绪曲线","Episode architecture"),t("分镜与摄影语言","Shots & cinematography"),t("连续性审校","Continuity audit"),t("进入可选视频生产","Optional production")].map((v,i)=><li key={v} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7657ff]/12 text-xs text-[#7657ff]">{i+1}</span><span className="pt-1 opacity-70">{v}</span></li>)}</ol></aside>
    </div>

    {blueprint && <div className="mt-7 space-y-5">
      <section className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs uppercase tracking-[.18em] text-[#7657ff]">DIRECTOR STATEMENT</p><h2 className="mt-3 text-2xl font-semibold">{brief.title || t("未命名作品","Untitled")}</h2><p className="mt-3 leading-8 opacity-70">{blueprint.projectLine}</p></section>
      <div className="grid gap-5 lg:grid-cols-3"><BlueprintList title={t("导演任务","Directing mandate")} items={blueprint.modeMandate} panel={panel}/><BlueprintList title={t("世界规则","World rules")} items={blueprint.worldRules} panel={panel}/><BlueprintList title={t("连续性锁","Continuity locks")} items={blueprint.continuityLocks} panel={panel}/></div>
      <section className={`rounded-3xl border p-6 ${panel}`}><h2 className="text-xl font-semibold">{t("人物圣经","Character bible")}</h2><div className="mt-4 grid gap-3 lg:grid-cols-3">{blueprint.characterBible.map(c=><article key={c.role} className="rounded-2xl border border-current/10 p-4"><p className="text-xs text-[#7657ff]">{c.role}</p><h3 className="mt-2 font-semibold">{c.identity}</h3><p className="mt-3 text-xs leading-6 opacity-60">{c.visualLock}</p><p className="mt-3 text-xs leading-6 opacity-60">{c.dramaticFunction}</p></article>)}</div></section>
      <section className={`rounded-3xl border p-6 ${panel}`}><h2 className="text-xl font-semibold">{t("第一集镜头基线","Episode-one shot baseline")}</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="opacity-45"><tr><th className="pb-3">#</th><th>{t("时长","Duration")}</th><th>{t("景别与机位","Framing")}</th><th>{t("动作","Action")}</th><th>{t("声音","Sound")}</th></tr></thead><tbody>{blueprint.shots.map((s,i)=><tr key={i} className="border-t border-current/10"><td className="py-4 pr-4">{String(i+1).padStart(2,"0")}</td><td className="pr-4">{s.seconds}s</td><td className="pr-4">{s.framing}</td><td className="pr-4 opacity-65">{s.action}</td><td className="opacity-65">{s.sound}</td></tr>)}</tbody></table></div></section>
      <section className={`rounded-3xl border p-6 ${panel}`}><h2 className="text-xl font-semibold">{t("视频提示词编译稿","Provider prompt draft")}</h2><p className="mt-4 rounded-2xl border border-current/10 p-4 text-sm leading-7 opacity-70">{blueprint.providerPrompt}</p><div className="mt-4 flex flex-wrap justify-end gap-3"><button type="button" onClick={()=>navigator.clipboard?.writeText(blueprint.providerPrompt)} className="rounded-xl border border-current/15 px-5 py-3 text-sm">{t("复制提示词","Copy prompt")}</button><button type="button" onClick={()=>onEnterProduction(`${brief.title}\n${brief.premise}\n\n${blueprint.projectLine}\n\n${blueprint.providerPrompt}`)} className="rounded-xl bg-[#151515] px-5 py-3 text-sm font-semibold text-white">{t("进入影像生产 →","Enter production →")}</button></div></section>
    </div>}
    <div id="cangxuan-data-foundry" className="scroll-mt-8"><CangXuanDataFoundry lang={lang} dark={dark} accountEmail={accountEmail}/></div>
  </section>;
}

function BlueprintList({ title, items, panel }: { title: string; items: string[]; panel: string }) {
  return <section className={`rounded-3xl border p-6 ${panel}`}><h2 className="text-xl font-semibold">{title}</h2><ul className="mt-4 space-y-3 text-sm leading-7 opacity-70">{items.map((item,i)=><li key={item} className="flex gap-3"><span className="text-[#7657ff]">0{i+1}</span><span>{item}</span></li>)}</ul></section>;
}
