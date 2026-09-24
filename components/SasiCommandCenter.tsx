"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { publicHubText } from "@/lib/public-hub-i18n";
import { DOCUMENT_ACCEPT } from "@/lib/files/document-intake";

type Mode = "auto" | "drama" | "build" | "research";
type Picked = { id: string; file: File };

const capabilityCards = [
  { icon: "🎬", title: "AI Drama", noteZh: "漫剧、短剧与分镜创作", noteEn: "Drama, storyboards and visual production" },
  { icon: "🎥", title: "CangXuan", noteZh: "AI 导演与镜头编排", noteEn: "AI directing and shot orchestration" },
  { icon: "💻", title: "网站 / 应用", noteZh: "需求、代码与部署", noteEn: "Product, code and deployment" },
  { icon: "✨", title: "AI Video", noteZh: "一键视频生成", noteEn: "One-click AI video" },
] as const;

export default function SasiCommandCenter() {
  const { lang, t } = useLingxiLang();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [files, setFiles] = useState<Picked[]>([]);
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const zh = lang === "zh";
  const native = (zhText: string, enText: string) => publicHubText(lang, zhText, enText);

  function addFiles(incoming:File[]) {
    setFiles((current)=>{
      const seen=new Set(current.map(({file})=>`${file.name}:${file.size}:${file.lastModified}`));
      const merged=[...current];
      for(const file of incoming){
        const key=`${file.name}:${file.size}:${file.lastModified}`;
        if(!seen.has(key)){
          seen.add(key);
          merged.push({id:crypto.randomUUID(),file});
        }
        if(merged.length>=50)break;
      }
      return merged;
    });
  }

  function change(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = prompt.trim();

    if (!value && !files.length) {
      setNotice(native("先写下一个念头，或带来一份资料。","Add a thought or an attachment first."));
      return;
    }

    if (mode === "research") {
      sessionStorage.setItem("sasi-intent", value);
      window.location.href = "/ai-research";
      return;
    }

    setNotice(native("SASI 创作生产能力正在接入中，当前不会跳回旧版工作台。研究资料入口已经可用；模型/API 可从「连接」进入。","SASI production is still being integrated. This entry will not send you back to the old workspace. Research is available now; model/API setup is under Connections."));
  }

  return (
    <main className="lx11-page lx11-sasi-page">
      <div className="lx11-sasi-wrap">
        <section className="lx11-sasi-intro">
          <span>{t("sasiKicker")}</span>
          <h1>{t("sasiTitle")}</h1>
          <p>{t("sasiLead")}</p>
          <div style={{ marginTop: 14 }}>
            <span style={{
              display:"inline-flex",alignItems:"center",gap:7,padding:"7px 12px",
              borderRadius:999,background:"#fff4df",color:"#9a5b00",fontSize:12,fontWeight:700
            }}>
              🟡 {native("SASI 创作能力 · 待上线","SASI creation · Coming soon")}
            </span>
          </div>
        </section>

        <section className="lx11-sasi-compose">
          <form onSubmit={submit} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();addFiles(Array.from(event.dataTransfer.files||[]))}}>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={t("sasiPlaceholder")}
              rows={5}
            />

            {files.length > 0 && (
              <div className="lx11-sasi-files">
                {files.map(({ id, file }) => (
                  <div key={id}>
                    <span>📎</span>
                    <div>
                      <b>{file.name}</b>
                      <small>{Math.max(1, Math.round(file.size / 1024))} KB</small>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="lx11-sasi-compose-bottom">
              <div className="lx11-sasi-compose-tools">
                <input ref={inputRef} type="file" multiple accept={`${DOCUMENT_ACCEPT},audio/*,video/*,.json,.jsonl,.yaml,.yml,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.hpp,.go,.rs,.zip`} className="hidden" onChange={change} />
                <button type="button" onClick={() => inputRef.current?.click()}>📎 {t("attachment")}</button>
                <Link href="/sasi/connections">🔌 {t("connections")}</Link>
                <Link href="/ai-wallet">💎 {t("recharge")}</Link>
              </div>
              <button className="lx11-sasi-send">{t("begin")}</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {native(
                "支持一次拖入最多 50 份资料：PDF、DOC/DOCX、XLS/XLSX、CSV/TSV、ODS、RTF、TXT/Markdown、图片、音视频、代码与压缩包。进入具体工作区后，会按该能力真正可解析的格式处理。",
                "Drop up to 50 files at once: PDF, DOC/DOCX, XLS/XLSX, CSV/TSV, ODS, RTF, TXT/Markdown, images, media, code and archives. Each workspace processes only formats it can actually read."
              )}
            </p>
          </form>

          <div className="lx11-sasi-modes">
            {([
              ["auto", t("auto")],
              ["drama", t("visual")],
              ["build", t("webapp")],
              ["research", t("researchMode")],
            ] as const).map(([value, label]) => (
              <button key={value} onClick={() => setMode(value)} className={mode === value ? "is-active" : ""}>
                {label}
              </button>
            ))}
          </div>

          {notice && <p className="lx11-sasi-notice">{notice}</p>}
        </section>

        <section className="lx11-sasi-section">
          <div className="lx11-sasi-section-head">
            <div>
              <span>{t("creationEntry")}</span>
              <h2>{t("wantResult")}</h2>
            </div>
            <p>{native("只保留一个公开创作台。未接好的生产能力全部收回后台。","One public creation desk only. Unfinished production flows stay backstage.")}</p>
          </div>

          <div className="lx11-sasi-ability-grid">
            {capabilityCards.map((card) => (
              <div className={`lx11-sasi-ability ${card.title === "AI Drama" ? "" : "is-soon"}`} key={card.title}>
                <div>
                  <span style={{fontSize:26}}>{card.icon}</span>
                  <em>{card.title === "AI Drama" ? native("工作台","Workspace") : t("coming")}</em>
                </div>
                <h3>{card.title}</h3>
                <p style={{fontSize:13,opacity:.62,marginTop:8}}>{native(card.noteZh,card.noteEn)}</p>
                {card.title === "AI Drama" ? <Link href="/sasi/drama">{native("进入 AI短剧工作台 →","Open AI Drama workspace →")}</Link> : <b>{native("待上线","Coming soon")}</b>}
              </div>
            ))}
          </div>
        </section>

        <section className="lx11-sasi-lower">
          <div className="lx11-sasi-skills">
            <div className="lx11-sasi-section-head compact">
              <div>
                <span>🔬 {t("research")}</span>
                <h2>{native("科研资料已经可以直接进入。","Research workspace is available now.")}</h2>
              </div>
            </div>
            <Link href="/ai-research">{t("open")}</Link>
          </div>

          <div className="lx11-sasi-connect">
            <span>🔌 {t("connections")}</span>
            <h2>{t("connectTitle")}</h2>
            <p>{native("只有真正要接模型或外部服务时才打开连接页，不再把复杂配置塞进创作主界面。","Open setup only when you actually need an external model or service.")}</p>
            <Link href="/sasi/connections">{t("openConnect")}</Link>
          </div>
        </section>

        <section className="lx11-sasi-balance">
          <div>
            <span>💎 {t("wallet")}</span>
            <h2>{t("balanceTitle")}</h2>
            <p>{t("balanceLead")}</p>
          </div>
          <Link href="/ai-wallet">{t("viewBalance")}</Link>
        </section>
      </div>
    </main>
  );
}
