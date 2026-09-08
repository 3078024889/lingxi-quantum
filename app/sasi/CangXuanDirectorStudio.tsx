"use client";

import { useEffect, useState } from "react";
import { buildDirectorBlueprint, DIRECTOR_MODES, type DirectorBlueprint, type DirectorBrief, type DirectorMode } from "@/lib/sasi/cangxuan-director";

type Props = { lang: "zh" | "en"; dark: boolean; onEnterProduction: (story: string) => void };

const initialBrief: DirectorBrief = { title: "", premise: "", protagonist: "", mode: "motion-comic", genre: "古装复仇", episodes: 24, secondsPerEpisode: 60 };

export default function CangXuanDirectorStudio({ lang, dark, onEnterProduction }: Props) {
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
    <div className="sasi-director-hero rounded-[28px] border border-current/10 p-7 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#7657ff]">LINGXI FIELD · CANGXUAN DIRECTOR</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{t("苍玄 AI 导演", "CangXuan AI Director")}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 opacity-65">{t("先建立世界规则、人物圣经、分集节奏、镜头方案与连续性锁，再进入视频生产。这里生成的是可编辑导演基线，不会调用付费视频模型。", "Establish world rules, character bibles, episode rhythm, shots and continuity locks before production. This creates an editable directing baseline without calling a paid video model.")}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-current/15 px-3 py-2">0 Token Director Core</span><span className="rounded-full border border-current/15 px-3 py-2">Local Draft</span><span className="rounded-full border border-current/15 px-3 py-2">No Video Charge</span></div>
    </div>

    <div className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#7657ff]">DIRECTOR SERIES</p><h2 className="mt-2 text-xl font-semibold">{t("选择你的专业导演", "Choose your specialist director")}</h2></div><span className="hidden text-xs opacity-45 sm:block">{t("入口位于创作输入之前", "Choose before writing the brief")}</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" data-testid="director-mode-grid">{DIRECTOR_MODES.map((item)=><button key={item.id} type="button" aria-pressed={brief.mode===item.id} onClick={()=>selectMode(item.id)} className={`group rounded-2xl border p-4 text-left transition ${brief.mode===item.id?"border-[#7657ff] bg-[#7657ff]/10 shadow-[0_12px_30px_rgba(118,87,255,.12)]":"border-current/10 hover:border-[#7657ff]/60"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-semibold ${brief.mode===item.id?"bg-[#7657ff] text-white":"bg-current/[.06] text-[#7657ff]"}`}>{item.glyph}</span><strong className="mt-4 block text-sm">{t(item.zh,item.en)}</strong><span className="mt-1 block text-[11px] leading-5 opacity-50">{t(item.noteZh,item.noteEn)}</span></button>)}</div>
    </div>

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
  </section>;
}

function BlueprintList({ title, items, panel }: { title: string; items: string[]; panel: string }) {
  return <section className={`rounded-3xl border p-6 ${panel}`}><h2 className="text-xl font-semibold">{title}</h2><ul className="mt-4 space-y-3 text-sm leading-7 opacity-70">{items.map((item,i)=><li key={item} className="flex gap-3"><span className="text-[#7657ff]">0{i+1}</span><span>{item}</span></li>)}</ul></section>;
}
