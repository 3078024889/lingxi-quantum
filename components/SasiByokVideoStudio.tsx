"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Task = { id: string; state: string; estimated_fen: number; expires_at: string; request: { prompt: string; generateAudio: boolean }; output?: { videoUrl?: string } };
type Project = { id: string; title: string; kind: string };
type Status = { enabled: boolean; connected: boolean; reason?: string; profile?: { model: string; maxDuration: number; generateAudio: boolean; resolution: string }; tasks: Task[] };
const errors: Record<string, string> = {
  AUTH_REQUIRED: "请先登录，再连接你自己的火山方舟 API。",
  CURRENT_PRICE_UNVERIFIED: "视频模型价格尚未核验，暂不能提交付费生成。",
  ACCEPTANCE_PENDING: "视频通道尚未完成上线验收，暂不能提交生成。",
  SEEDANCE_CONNECTION_REQUIRED: "请先连接并验证你的火山方舟 API。",
  SUBMISSION_UNCERTAIN_CHECK_ARK: "供应商是否已接收尚不确定，请到方舟核对任务；不要重复提交。",
  REQUOTE_REQUIRED: "预算已过期或项目已变化，请重新获取预算。",
};
async function request(url: string, body?: object, idempotencyKey?: string) {
  const response = await fetch(url, { cache: "no-store", ...(body ? { method: "POST", headers: { "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) }, body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errors[data.error] || `请求未完成（${data.error || response.status}）`);
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
    <h1 className="text-3xl font-semibold">写下镜头，用自己的 API 生成视频</h1>
    <p className="text-[var(--lx-muted)]">连接火山方舟，先看预算，再确认生成。模型费用由供应商向你的账户收取，不扣 SASI 创作余额。</p>
    <Link className="inline-block underline" href="/sasi/connections">连接或管理我的 API →</Link>
    <label className="block">镜头描述<textarea className={input} rows={5} minLength={20} maxLength={3000} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="描述人物、场景、动作、镜头运动与声音，至少 20 字。" /></label>
    <label className="block">保存到项目<select className={input} value={projectId} disabled={busy} onChange={e => { setError(""); setProjectId(e.target.value); }}><option value="">选择项目</option>{projects.map(p => <option value={p.id} key={p.id}>{p.title}</option>)}</select></label>
    <button className={button} disabled={busy || prompt.trim().length < 20} onClick={() => void run(createProject)}>新建视频项目</button>
    <div className="grid gap-4 sm:grid-cols-2"><label>时长（秒）<input className={input} type="number" min={4} max={status?.profile?.maxDuration || 12} value={duration} onChange={e => setDuration(Number(e.target.value))} /></label><label>画幅<select className={input} value={ratio} onChange={e => setRatio(e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option></select></label></div>
    {status?.profile && <p>模型：{status.profile.model} · {status.profile.resolution} · {status.profile.generateAudio ? "请求同步生成声音" : "当前模型配置为无声视频"}</p>}
    {status && (!status.enabled || !status.connected) && <p role="status">{!status.connected ? errors.SEEDANCE_CONNECTION_REQUIRED : errors[status.reason || ""] || "当前视频通道不可用。"}</p>}
    <label className="flex gap-3"><input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)} />我拥有素材使用权，并同意作品标记为 AI 生成。</label>
    <button className={button} disabled={busy || !status?.enabled || !status.connected || !rights || prompt.trim().length < 20 || !Number.isInteger(duration) || duration < 4 || duration > (status?.profile?.maxDuration || 12)} onClick={() => void run(async () => { await request("/api/sasi/byok/video", { action: "quote", projectId, prompt, duration, ratio, rightsConfirmed: true, aiLabelAcknowledged: true }); await reload(); })}>查看本次预算</button>
    {busy && <p role="status">正在请求，请稍候…</p>}
    {error && <p role="alert" className="rounded-xl border border-red-300 p-4">{error}</p>}
    {status?.tasks.map(task => <article key={task.id} className="space-y-3 rounded-2xl border border-[var(--lx-line)] p-5">
      <p className="whitespace-pre-wrap">{task.request.prompt}</p><p>任务状态：{task.state} · 预估供应商费用 ¥{(task.estimated_fen / 100).toFixed(2)}（实际以供应商账单为准）</p>
      {task.state === "quoted" && <button className={button} disabled={busy || Date.parse(task.expires_at) <= Date.now()} onClick={() => void run(async () => { await request("/api/sasi/byok/video", { action: "confirm", taskId: task.id, acceptSupplierBilling: true }); await reload(); })}>同意本次预算，开始生成</button>}
      {["queued", "running"].includes(task.state) && <button className={button} disabled={busy} onClick={() => void run(async () => { await request("/api/sasi/byok/video", { action: "refresh", taskId: task.id }); await reload(); })}>查询生成结果</button>}
      {task.state === "uncertain" && <p>{errors.SUBMISSION_UNCERTAIN_CHECK_ARK}</p>}
      {task.state === "succeeded" && task.output?.videoUrl?.startsWith("https://") && <video controls preload="metadata" className="w-full rounded-xl" src={task.output.videoUrl} />}
    </article>)}
  </section>;
}
