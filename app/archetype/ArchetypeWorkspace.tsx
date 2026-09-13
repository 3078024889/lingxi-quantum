"use client";
import { useState, type ReactNode } from "react";
import Bi from "@/components/Bi";
import ArchetypeProgress, { type Progress } from "./ArchetypeProgress";
import "./archetype-workspace.css";

const STREAMS = [
  ["生命图谱", "/life-map", "✧"], ["关系共振", "/relationship", "♡"],
  ["生命韧性", "/resilience", "❧"], ["桃花磁场", "/romance", "✿"],
  ["财富创造地图", "/wealth", "◇"], ["今日潮汐", "/daily", "☾"],
  ["生命镜像", "/mirror", "◈"], ["生命灵签", "/qian", "✦"],
];

export default function ArchetypeWorkspace({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const reportId = progress?.ready ? progress.submissionId || progress.archivedSubmissionId : null;
  const [reader, setReader] = useState(false);
  return <div className="archetype-workspace">
    <section className="archetype-workspace-input" id="archetype-progress"><h2><Bi zh="我的八流汇聚" en="My eight streams" /></h2><ArchetypeProgress onState={setProgress} onRead={() => setReader(true)} />
      {!progress?.authenticated && <nav aria-label="八项探索入口">{STREAMS.map(([name, href, glyph]) => <a href={href} key={href}><span>{glyph}</span>{name}<b>→</b></a>)}</nav>}
      <a className="archetype-back" href="/field-tests"><Bi zh="返回场域精测 →" en="Back to Field Insights →" /></a>
    </section>
    <section className="archetype-workspace-preview">
      <div className="archetype-confluence"><span className="archetype-confluence-core">✧</span><h2><Bi zh="八条支流，照见更完整的你" en="Eight streams, a fuller view of you" /></h2><p><Bi zh="每一项探索，都为长期生命地图带来一个视角。" en="Every exploration adds a perspective to your long-term life map." /></p><div>{STREAMS.map(([name, href, glyph]) => <a href={href} key={href}><span>{glyph}</span>{name}</a>)}</div></div>
      {children}
    </section>
    <section className="archetype-workspace-archive" id="archetype-archive"><h2><Bi zh="生命原型 · 完整档案" en="Life Archetype · Complete archive" /></h2>
      {reportId && reader ? <iframe key={reportId} title="生命原型完整报告与 PDF" src={`/mini-report?id=${encodeURIComponent(reportId)}`} /> : <div className="archetype-book"><small>LINGXIFIELD</small><h3><Bi zh="生命原型" en="Life Archetype" /></h3><p><Bi zh="八流汇聚 · 长期生命地图" en="Eight streams · An evolving life map" /></p><span>✧</span></div>}
      <p><Bi zh="原型之核、生命本色、关系与边界、行动与成事方式，在完整档案中共同展开。" en="Core patterns, relationships, boundaries and ways of acting unfold together in the full archive." /></p>
      {reportId ? <><button onClick={() => setReader(value => !value)}>{reader ? "收起档案" : "阅读完整档案与下载 PDF"} →</button><a href={`/mini-report?id=${encodeURIComponent(reportId)}`} target="_blank" rel="noreferrer"><Bi zh="在独立窗口阅读 →" en="Read in a separate window →" /></a></> : <div className="archetype-archive-wait"><Bi zh="完成同一主体的八项有效记录后，这里将开放你的完整档案。" en="Your complete archive becomes available after eight valid records for the same subject." /></div>}
    </section>
  </div>;
}
