"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Task = { id: string; state: string; estimated_fen: number; expires_at: string; price_source: string;
  provider_task_id: string | null; request: { model: string; prompt: string; duration: number; ratio: string; resolution: string };
  output: { videoUrl?: string }; created_at: string };
type Status = { enabled: boolean; connected: boolean; reason?: string; profile?: { model: string; maxDuration: number; imageMode?: string } | null; tasks: Task[]; assets?: { id: string; original_name: string }[] };
const errorMessage: Record<string, string> = {
  AUTH_REQUIRED: "请先登录，再连接自己的火山账户。", CURRENT_PRICE_UNVERIFIED: "当前模型价格尚未核验，暂不提交付费生成。",
  ACCEPTANCE_PENDING: "Seedance 通道正在完成真实生成验收。", BYOK_FOUNDATION_UNAVAILABLE: "视频任务记录暂时不可用，请稍后重试。",
  SEEDANCE_CONNECTION_REQUIRED: "请到「连接与 API」保存并验证火山引擎密钥。", REQUOTE_REQUIRED: "预算已过期或项目内容已更新，请重新估算。",
  SUBMISSION_UNCERTAIN_CHECK_ARK: "提交结果尚不确定，请先在火山控制台核对任务，避免重复付费。",
  SUBMITTED_RECONCILIATION_REQUIRED: "火山已收到任务，但本地记录未完成，请保留任务编号并核对。",
  ORIGINAL_CONNECTION_REQUIRED: "此任务属于此前的火山连接，请使用原账户核对。",
  SUPPLIER_QUERY_UNAVAILABLE: "暂时无法查询火山任务；已有任务不会重新提交。",
};
const stateLabel: Record<string, string> = { quoted: "待确认预算", submitting: "提交中 · 勿重复生成", uncertain: "待核对火山任务", queued: "排队中", running: "生成中", succeeded: "已生成", failed: "生成未完成" };

export default function SeedanceStudio({ projectId, dark }: { projectId: string; dark: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(8);
  const [ratio, setRatio] = useState("9:16");
  const [rights, setRights] = useState(false);
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [quote, setQuote] = useState<Task | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const guard = useRef(false);
  const load = useCallback(async () => {
    const response = await fetch(`/api/sasi/byok/video?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "任务暂时无法读取，请重试。");
    setStatus(data);
  }, [projectId]);
  useEffect(() => { void load().catch(e => setNotice(errorMessage[e.message] ?? e.message)); }, [load]);
  useEffect(() => { setQuote(null); }, [prompt, duration, ratio, rights, projectId, assetIds]);
  useEffect(() => {
    const pending = status?.tasks.filter(task => ["queued", "running"].includes(task.state)).slice(0, 3) ?? [];
    if (!pending.length) return;
    const timer = setTimeout(async () => {
      if (document.visibilityState !== "visible" || guard.current) return;
      try {
        // Read-only supplier polling; no automatic new generation or paid retry.
        for (const task of pending) await fetch("/api/sasi/byok/video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "refresh", taskId: task.id }) });
        await load();
      } catch { setNotice("任务仍保留在项目中。网络恢复后可点击刷新结果。"); }
    }, 60000);
    return () => clearTimeout(timer);
  }, [status, load]);

  async function action(kind: "quote" | "confirm" | "refresh", task?: Task) {
    if (guard.current) return;
    guard.current = true; setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/sasi/byok/video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        action: kind, projectId, prompt, duration, ratio, assetIds, rightsConfirmed: rights, aiLabelAcknowledged: rights,
        taskId: task?.id, acceptSupplierBilling: kind === "confirm",
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(`${errorMessage[data.error] ?? data.error ?? "请求未完成，请重试。"}${data.providerTaskId ? ` 火山任务：${data.providerTaskId}` : ""}`);
      if (kind === "quote") setQuote(data.task);
      else if (kind === "confirm") setQuote(null);
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "网络暂时不可用。"); }
    finally { guard.current = false; setBusy(false); }
  }

  return <section className={`mt-8 rounded-3xl border p-6 ${dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white"}`} aria-label="Seedance 视频生成">
    <p className="text-sm text-[#7c3aed]">SASI × Seedance · 你的火山账户</p>
    <h2 className="mt-2 text-2xl font-semibold">先看预算，再让这一幕动起来</h2>
    <p className="mt-3 text-base leading-7 opacity-70">描述这一幕，由你的火山引擎 API 生成视频。费用由火山账户结算，不扣 SASI 余额。</p>
    <p className="mt-2 text-sm leading-6 opacity-60">每个镜头沿用项目文字记忆；开通图片参考的模型可使用下方素材。自动分镜和跨镜头视觉审校仍需验收。</p>
    <a className="mt-3 inline-block text-[#7c3aed] underline" href="/sasi/assemble">已有镜头？按顺序合成 MP4 →</a>
    {!status?.enabled && <p role="status" className="mt-4 rounded-xl bg-[#fffbeb]0/10 p-3">{errorMessage[status?.reason ?? ""] ?? "正在核对视频通道状态。"}</p>}
    {!status?.connected && <a className="mt-4 inline-block text-[#7c3aed] underline" href="/?view=connections">连接火山引擎 API →</a>}
    <label className="mt-5 block">这一幕发生什么？<textarea className="mt-2 min-h-32 w-full rounded-xl border border-current/20 bg-transparent p-4 text-base" value={prompt} maxLength={3000} onChange={e => setPrompt(e.target.value)} placeholder="例如：女主推开旧书店的门，雨水顺着伞沿落下。她看见柜台上，那本十年前丢失的日记。" /></label>
    <div className="mt-3 flex flex-wrap gap-4">
      <label>时长<select className="ml-2 rounded-lg border border-current/20 bg-transparent p-2" value={duration} onChange={e => setDuration(Number(e.target.value))}>{[4, 5, 8, 10, 12].filter(n => n <= (status?.profile?.maxDuration ?? 12)).map(n => <option key={n} value={n}>{n} 秒</option>)}</select></label>
      <label>画幅<select className="ml-2 rounded-lg border border-current/20 bg-transparent p-2" value={ratio} onChange={e => setRatio(e.target.value)}><option>9:16</option><option>16:9</option><option>1:1</option></select></label>
    </div>
    <fieldset className="mt-4 rounded-xl border border-current/15 p-4"><legend>角色与场景参考</legend>
      <p className="text-sm leading-6 opacity-70">从本项目已上传的 JPG、PNG、WebP 中选择。参考图单张最多 10MB；原文件保留，发送经过校验的图片副本。真人素材仍须满足火山的授权要求。</p>
      {!status?.profile?.imageMode || status.profile.imageMode === "none" ? <p className="mt-2 text-sm">当前模型的图片参考权限尚未核验。</p> : <>
        <p className="mt-2 text-sm">{status.profile.imageMode === "first_frame" ? "首帧引导：选择 1 张画面" : "角色/场景参考：最多 9 张，按选择顺序发送"}</p>
        {(status.assets ?? []).map(asset => <label className="mt-2 flex gap-2 break-all text-sm" key={asset.id}><input type="checkbox" checked={assetIds.includes(asset.id)} disabled={busy || (!assetIds.includes(asset.id) && assetIds.length >= (status.profile?.imageMode === "first_frame" ? 1 : 9))} onChange={e => setAssetIds(ids => e.target.checked ? [...ids, asset.id] : ids.filter(id => id !== asset.id))} />{asset.original_name}</label>)}
        {!status.assets?.length && <p className="mt-2 text-sm">先在项目素材区上传角色或场景图。</p>}
      </>}
    </fieldset>
    <label className="mt-4 flex gap-2 text-sm leading-6"><input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)} />我有权使用这些内容，同意将选中的参考图发送到火山引擎，并保留作品的 AI 生成标识。</label>
    <button className="mt-4 rounded-xl bg-[#6d28d9] px-5 py-3 text-base text-white disabled:opacity-40" disabled={busy || !status?.enabled || !status.connected || !rights || prompt.trim().length < 8} onClick={() => void action("quote")}>{busy ? "正在处理…" : "查看本次预算"}</button>
    {quote && <div className="mt-4 rounded-2xl border border-violet-400/40 p-4">
      <b className="text-lg">预估 ¥{(quote.estimated_fen / 100).toFixed(2)}</b>
      <p className="mt-2 break-all text-sm">{quote.request.model} · {quote.request.duration} 秒 · {quote.request.ratio} · {quote.request.resolution}</p>
      <p className="mt-2 text-sm leading-6">这是费用估算，并非火山端扣费上限；最终以火山账单为准。预算有效至 {new Date(quote.expires_at).toLocaleTimeString()}。确认后立即提交一次。</p>
      <details className="mt-2 text-sm"><summary>查看实际发送内容</summary><p className="mt-2 whitespace-pre-wrap break-words">{quote.request.prompt}</p></details>
      <a href={quote.price_source} target="_blank" rel="noreferrer" className="mt-2 inline-block underline">查看计费依据 ↗</a>
      <button className="ml-4 mt-3 rounded-xl bg-[#6d28d9] px-5 py-3 text-white disabled:opacity-40" disabled={busy} onClick={() => void action("confirm", quote)}>同意预估费用，开始生成</button>
    </div>}
    {notice && <p role="status" className="mt-4 break-words rounded-xl bg-[#fffbeb]0/10 p-3">{notice}</p>}
    {!!status?.tasks.filter(task => task.state !== "quoted").length && <div className="mt-6 space-y-3"><h3 className="text-lg font-semibold">这个项目的视频</h3>{status.tasks.filter(task => task.state !== "quoted").map(task => <article key={task.id} className="rounded-xl border border-current/15 p-4">
      <b>{stateLabel[task.state] ?? task.state}</b><p className="mt-2 text-sm">{task.request.duration} 秒 · {task.request.ratio} · {new Date(task.created_at).toLocaleString()}</p>
      {task.provider_task_id && <p className="mt-2 break-all text-sm opacity-60">火山任务：{task.provider_task_id}</p>}
      {["queued", "running"].includes(task.state) && <button className="mt-3 underline" disabled={busy} onClick={() => void action("refresh", task)}>刷新结果</button>}
      {["submitting", "uncertain"].includes(task.state) && <p className="mt-2 text-sm">请先到火山控制台核对，本任务不会自动重复提交。</p>}
      {task.output.videoUrl && <><a className="mt-3 inline-block underline" href={task.output.videoUrl} target="_blank" rel="noreferrer">打开生成视频 ↗</a><p className="mt-2 text-sm opacity-60">AI 生成。供应商链接可能过期，请及时下载；尚未复制到长期作品库。</p></>}
    </article>)}</div>}
  </section>;
}
