"use client";
import {byokError,taskLabel} from "@/lib/sasi/byok-copy";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SasiSeriesStudio from "./SasiSeriesStudio";

type Task = { id: string; state: string; estimated_fen: number; expires_at: string; request: { prompt: string; generateAudio: boolean; duration: number; batchId?: string; episode?: number; shotIndex?: number }; output?: { videoUrl?: string } };
type Project = { id: string; title: string; kind: string };
type Status = { enabled: boolean; connected: boolean; reason?: string; profile?: { model: string; maxDuration: number; generateAudio: boolean; resolution: string }; tasks: Task[]; profiles?: { id: string; model: string; resolution: string; maxDuration: number; imageMode?: string }[]; assets?: { id: string; original_name: string }[] };
const errors: Record<string, string> = {
  AUTH_REQUIRED: "请先登录，再继续创作。",
  CURRENT_PRICE_UNVERIFIED: "还没有可用的生成方式，请稍后再试。",
  ACCEPTANCE_PENDING: "还没有可用的生成方式，请稍后再试。",
  SEEDANCE_CONNECTION_REQUIRED: "还没有可用的生成方式。",
  SUBMISSION_UNCERTAIN_CHECK_ARK: "这次生成的结果还需核对，请先查看账户记录，不要重复生成。",
  REQUOTE_REQUIRED: "预算已过期或项目已变化，请重新获取预算。",
};
async function request(url: string, body?: object, idempotencyKey?: string) {
  const response = await fetch(url, { cache: "no-store", ...(body ? { method: "POST", headers: { "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) }, body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errors[data.error] || byokError(data.error));
  return data;
}

export default function SasiByokVideoStudio({ initialProjectId = "" }: { initialProjectId?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [ratio, setRatio] = useState("16:9");
  const [status, setStatus] = useState<Status | null>(null);
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const projectAttempt = useRef<{ brief: string; key: string } | null>(null);
  useEffect(() => { let active = true; request("/api/sasi/projects").then(d => { if (active) setProjects(d.projects.filter((p: Project) => p.kind === "drama")); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  useEffect(() => {
    setStatus(null); if (!projectId) return;
    let active = true;
    request(`/api/sasi/byok/video?projectId=${encodeURIComponent(projectId)}`).then(d => { if (active) setStatus(d); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [projectId]);
  async function run(action: () => Promise<void>) { if (busy) return; setBusy(true); setError(""); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "请求未完成"); } finally { setBusy(false); } }
  async function reload() { setStatus(await request(`/api/sasi/byok/video?projectId=${encodeURIComponent(projectId)}`)); }
  async function createProject() {
    const brief = prompt.trim();
    if (projectAttempt.current?.brief !== brief) projectAttempt.current = { brief, key: crypto.randomUUID() };
    const d = await request("/api/sasi/projects", { kind: "drama", brief, language: "zh" }, projectAttempt.current.key);
    if (!d.project?.id) throw new Error("项目保存结果无效，请刷新项目列表后重试。");
    setProjects(p => [{ id: d.project.id, title: prompt.slice(0, 40), kind: "drama" }, ...p]); setProjectId(d.project.id);
  }
  const input = "w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3";
  const button = "rounded-xl border border-[var(--lx-line)] px-4 py-3 disabled:opacity-40";
  return <section className="mx-auto max-w-4xl space-y-5 px-5 py-10">
    <h1 className="text-3xl font-semibold">描述一个镜头，生成一段视频</h1>
    <p className="text-[var(--lx-muted)]">写下人物、动作、场景和镜头变化，调整时长与画幅后即可生成。</p>
    <Link className="inline-block underline" href="/sasi/connections">创作设置</Link>
    <label className="block">描述你想看到的画面<textarea className={input} rows={5} minLength={20} maxLength={3000} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="例如：雨夜街头，一名女孩撑伞停下脚步，镜头缓慢推进，霓虹倒映在积水中。" /></label>
    <label className="block">保存到项目<select className={input} value={projectId} disabled={busy} onChange={e => { setError(""); setProjectId(e.target.value); }}><option value="">选择项目</option>{projects.map(p => <option value={p.id} key={p.id}>{p.title}</option>)}</select></label>
    <button className={button} disabled={busy || prompt.trim().length < 20} onClick={() => void run(createProject)}>保存为新项目</button>
    <div className="grid gap-4 sm:grid-cols-2"><label>时长<input aria-label="时长（秒）" className={input} type="number" min={4} max={status?.profile?.maxDuration || 12} value={duration} onChange={e => setDuration(Number(e.target.value))} /></label><label>画幅<select className={input} value={ratio} onChange={e => setRatio(e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option></select></label></div>
    {status?.profile && <details className="text-sm"><summary>生成设置</summary><p>生成方式：{status.profile.model}</p><p>清晰度：{status.profile.resolution}</p><p>声音：{status.profile.generateAudio ? "生成声音" : "无声"}</p><Link href="/sasi/connections">使用我的服务</Link></details>}
    {status && (!status.enabled || !status.connected) && <p role="status">还没有可用的生成方式 <Link className="underline" href="/sasi/connections">去设置</Link></p>}
    <label className="flex gap-3"><input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)} />我拥有相关素材的使用权，并同意按平台要求标注生成内容。</label>
    <button className={button} disabled={busy || !status?.enabled || !status.connected || !rights || prompt.trim().length < 20 || !Number.isInteger(duration) || duration < 4 || duration > (status?.profile?.maxDuration || 12)} onClick={() => void run(async () => { await request("/api/sasi/byok/video", { action: "quote", projectId, prompt, duration, ratio, rightsConfirmed: true, aiLabelAcknowledged: true }); await reload(); })}>生成视频</button>
    <p className="text-sm text-[var(--lx-muted)]">生成前会显示预计费用。</p>
    {prompt.trim().length > 0 && prompt.trim().length < 20 && <p className="text-sm">再补充一些画面细节，效果会更完整。</p>}
    {busy && <p role="status">正在请求，请稍候…</p>}
    {error && <p role="alert" className="rounded-xl border border-red-300 p-4">{error}</p>}
    {status && <SasiSeriesStudio projectId={projectId} profiles={status.profiles??[]} tasks={status.tasks} assets={status.assets??[]} reload={reload}/> }
    {status?.tasks.filter(t=>!t.request.batchId).map(task => <article key={task.id} className="space-y-3 rounded-2xl border border-[var(--lx-line)] p-5">
      <p className="whitespace-pre-wrap">{task.request.prompt}</p><p>{taskLabel(task.state)} · 预估生成费用 ¥{(task.estimated_fen / 100).toFixed(2)}（实际以对应 AI 服务账单为准）</p>
      {task.state === "quoted" && <p className="text-sm">费用由你已连接的 AI 服务账户支付，不扣 SASI 余额。</p>}
      {task.state === "quoted" && <button className={button} disabled={busy || Date.parse(task.expires_at) <= Date.now()} onClick={() => void run(async () => { await request("/api/sasi/byok/video", { action: "confirm", taskId: task.id, acceptSupplierBilling: true }); await reload(); })}>确认费用，开始生成</button>}
      {["queued", "running"].includes(task.state) && <button className={button} disabled={busy} onClick={() => void run(async () => { await request("/api/sasi/byok/video", { action: "refresh", taskId: task.id }); await reload(); })}>查询生成结果</button>}
      {task.state === "uncertain" && <p>{errors.SUBMISSION_UNCERTAIN_CHECK_ARK}</p>}
      {task.state === "succeeded" && task.output?.videoUrl?.startsWith("https://") && <video controls preload="metadata" className="w-full rounded-xl" src={task.output.videoUrl} />}
    </article>)}
  </section>;
}
