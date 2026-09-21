"use client";

import { type ReactNode } from "react";

export function SasiComposer({ lang, kind, setKind, value, onChange, onPaste, attachments, busy, signedIn, onSubmit, onConnections, onSkills, projects, onOpen }: {
  lang: "zh" | "en";
  kind: "drama" | "code";
  setKind: (kind: "drama" | "code") => void;
  value: string;
  onChange: (value: string) => void;
  onPaste: React.ClipboardEventHandler<HTMLTextAreaElement>;
  attachments: ReactNode;
  busy: boolean;
  signedIn: boolean;
  onSubmit: (kind: "drama" | "code") => void;
  onConnections: () => void;
  onSkills: () => void;
  projects: { id: string; title: string }[];
  onOpen: (id: string) => void;
}) {
  const zh = lang === "zh";
  return <section className="sasi-conversation">
    <div className="sasi-conversation-heading"><span className="sasi-orbit" aria-hidden="true">✦</span><p>SASI · {zh ? "你的创作伙伴" : "Your creative companion"}</p><h1>{zh ? "一念即达" : "From an idea to reality"}</h1><p>{zh ? "让想象力，成为生产力。带来想法、剧本或素材，从这里开始。" : "Bring an idea, a script, or the assets you already have."}</p></div>
    <form className="sasi-composer" onSubmit={event => { event.preventDefault(); onSubmit(kind); }}>
      <fieldset disabled={busy}>
        <div className="sasi-composer-modes" role="group" aria-label={zh ? "创作类型" : "Creation type"}>
          <button type="button" aria-pressed={kind === "drama"} onClick={() => setKind("drama")}>▶ {zh ? "短剧与视频" : "Drama & video"}</button>
          <button type="button" aria-pressed={kind === "code"} onClick={() => setKind("code")}>⌘ {zh ? "网站与应用" : "Websites & apps"}</button>
        </div>
        <textarea aria-label={zh ? "描述你的作品" : "Describe your project"} value={value} maxLength={100000} onChange={event => onChange(event.target.value)} onPaste={onPaste} placeholder={zh ? (kind === "drama" ? "我想把这份剧本拍成短剧。人物、场景和参考图在附件里……" : "帮我做一个网站：它服务谁、解决什么问题、需要哪些功能……") : "Describe what you want to make, who it is for, and what matters most…"} />
        {attachments}
        <div className="sasi-composer-actions"><div><button type="button" onClick={onSkills}>◇ Skills</button><button type="button" onClick={onConnections}>⌁ {zh ? "连接 API" : "Connect API"}</button></div><button className="sasi-send" type="submit">{busy ? (zh ? "正在保存…" : "Saving…") : (zh ? "建立创作项目" : "Create project")} <span aria-hidden="true">↑</span></button></div>
      </fieldset>
    </form>
    <p className="sasi-composer-note">{zh ? "先保存需求与素材，再确认方案和费用。完整成片与网站自动部署尚未开放。" : "Save your brief and assets, then review the plan and cost. Full-film production and automatic deployment are not available yet."}</p>
    {!signedIn && <a className="sasi-composer-signin" href="/account?next=%2F%3Fview%3Dhome">{zh ? "登录后保存项目，回来继续创作" : "Sign in to save and continue your projects"} →</a>}
    <a className="sasi-composer-signin" href="/sasi/chat">{zh ? "先和 SASI 聊聊：知识、创意与代码" : "Talk with SASI: knowledge, ideas & code"} →</a>
    <a className="sasi-composer-signin" href="/sasi/assemble">{zh ? "已有视频镜头？一键合成 MP4" : "Already have your shots? Assemble an MP4"} →</a>
    {projects.length > 0 && <div className="sasi-conversation-recents"><h2>{zh ? "接着上次的想法" : "Pick up where you left off"}</h2>{projects.slice(0, 4).map(project => <button type="button" key={project.id} onClick={() => onOpen(project.id)}><span>↗</span><span>{project.title}</span></button>)}</div>}
  </section>;
}
