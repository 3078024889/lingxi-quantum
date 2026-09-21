"use client";
import { useEffect, useState } from "react";
type Task = { id: string; state: string; estimated_fen?: number; question?: string; output?: { answer?: string; truncated?: boolean; error?: string } };
const errors: Record<string, string> = { AUTH_REQUIRED: "请先登录，再继续对话。", CONNECTION_REQUIRED: "请先连接并验证火山 API。", MODEL_NOT_OPEN: "密钥有效，但火山尚未开通 Doubao-Seed-Evolving。请在火山方舟开通管理中开通后重新发起。", CONTEXT_LIMIT_START_NEW: "这次对话已达到上下文上限，请开始新对话。历史仍保留在这里。", PRICE_REVIEW_REQUIRED: "模型价格需要重新核验，暂不发起付费请求。", RESULT_UNCERTAIN_DO_NOT_RETRY_AUTOMATICALLY: "请求结果暂时无法确认，请先检查火山用量记录，避免重复付费。" };
export default function SasiChat() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"chat" | "director">("chat");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [previousId, setPreviousId] = useState("");
  const [quote, setQuote] = useState<Task | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { let alive = true; fetch("/api/sasi/byok/text", { cache: "no-store" }).then(async r => ({ ok: r.ok, body: await r.json() })).then(({ ok, body }) => { if (alive) { if (ok) setTasks(body.tasks); else setNotice(errors[body.error] ?? "历史暂时无法读取。"); } }).catch(() => alive && setNotice("连接暂时不可用，请稍后重试。")); return () => { alive = false; }; }, []);
  async function send(action: "quote" | "confirm") {
    if (busy) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/sasi/byok/text", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "quote" ? { action, question, mode, previousId: previousId || undefined } : { action, taskId: quote?.id, acceptSupplierBilling: true }) });
      const body = await response.json();
      if (!response.ok) throw new Error(errors[body.error] ?? `本次请求未完成（${body.error ?? response.status}）。`);
      if (action === "quote") setQuote(body.task);
      else { const task = { ...body.task, question }; setTasks(rows => [task, ...rows.filter(row => row.id !== task.id)]); setQuote(null);
        if (task.state === "succeeded") { setPreviousId(task.id); setQuestion(""); if (body.historySaved === false) setNotice("回答已完成，但历史保存失败，请先复制保存这段回答。"); }
        else setNotice("任务已提交，请刷新历史查看结果；不要重复提交。"); }
    } catch (error) { setNotice(error instanceof Error ? error.message : "请求未完成，请检查网络。"); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-3xl">
    <p className="text-sm text-[#6d28d9]">SASI · 通用对话</p><h1 className="mt-3 text-3xl font-semibold">从一个问题，到一个好想法。</h1>
    <p className="mt-4 leading-7 text-slate-600">解释知识、写剧本、讨论方案或编写代码。由你连接的豆包模型回答，费用直接计入你的火山账户。</p>
    <div className="mt-6 rounded-3xl border border-[#ddd6fe] bg-white p-5">
      <div className="mb-3 flex gap-2" role="group" aria-label="对话用途">{([ ["chat", "聊知识与创意"], ["director", "把故事变成分镜"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={mode === value} disabled={busy} className={`rounded-full px-4 py-2 text-sm ${mode === value ? "bg-[#6d28d9] text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => { setMode(value); setQuote(null); setPreviousId(""); }}>{label}</button>)}</div>
      <textarea aria-label="向 SASI 提问" className="min-h-36 w-full resize-y rounded-xl p-3 text-base outline-[#a78bfa]" maxLength={12000} disabled={busy} value={question} onChange={e => { setQuestion(e.target.value); setQuote(null); }} placeholder="例如：把我的故事改成有冲突、有转折、能拍出来的短剧……" />
      <div className="flex flex-wrap items-center justify-between gap-3"><button disabled={busy} className="text-sm text-slate-500" onClick={() => { setPreviousId(""); setQuote(null); setQuestion(""); }}>{previousId ? "正在续聊 · 开始新对话" : "新对话"}</button><button disabled={busy || !question.trim()} className="rounded-xl bg-[#6d28d9] px-5 py-3 text-white disabled:opacity-40" onClick={() => void send("quote")}>{busy ? "处理中…" : "查看本次费用 →"}</button></div>
      {quote && <div className="mt-4 rounded-xl bg-[#f5f3ff] p-4"><p>本次预估 ¥{((quote.estimated_fen ?? 0) / 100).toFixed(2)}，按实际 token 用量结算。</p><p className="mt-2 text-sm text-slate-600">包含当前对话上下文；最多输出 2048 token。预估不是固定账单。</p><button disabled={busy} className="mt-3 rounded-xl bg-[#6d28d9] px-5 py-3 text-white" onClick={() => void send("confirm")}>同意费用，发送</button></div>}
    </div>
    {notice && <p role="status" className="mt-4 rounded-xl bg-[#fffbeb] p-4 text-[#78350f]">{notice}</p>}
    <p className="mt-4 text-sm leading-6 text-slate-500">当前支持文本对话与连续追问，尚未连接实时搜索或自动执行工具。模型可能出错，重要信息请核实。<a className="ml-2 underline" href="/?view=connections">管理 API 连接</a></p>
    <div className="mt-8 space-y-5">{tasks.map(task => <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="whitespace-pre-wrap font-medium">{task.question}</h2><p className="mt-4 whitespace-pre-wrap break-words leading-8">{task.output?.answer ?? (task.state === "quoted" ? "等待费用确认" : task.output?.error ? (errors[task.output.error] ?? "请求未完成") : "结果待确认")}</p>{task.output?.truncated && <p className="mt-2 text-sm text-[#b45309]">本次输出已达到长度限制，可继续追问。</p>}{task.state === "succeeded" && <button className="mt-3 text-sm text-[#6d28d9]" disabled={busy} onClick={() => { setPreviousId(task.id); setQuote(null); }}>接着这段聊 →</button>}</article>)}</div>
  </section>;
}
