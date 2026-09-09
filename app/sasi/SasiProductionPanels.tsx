"use client";

import { useCallback, useEffect, useState } from "react";
import { CREDIT_PACKS, SASI_QUALITY_TIERS, productionQuote, routeForQuality, type SasiQuality } from "@/lib/sasi/catalog";

type Lang = "zh" | "en";
type Readiness = {
  productionReady: boolean;
  productionAccountReady: boolean;
  executionReady: boolean;
  contentLabelingReady: boolean;
  videoRoutes: { seedance: boolean; xai: boolean; openai: boolean; wan: boolean };
  paymentChannels: { alipay: boolean; wechat: boolean; paypal: boolean };
};
type Account = {
  wallet: { availablePoints: number; reservedPoints: number; updatedAt: string | null };
  ledger: { id: string; kind: string; deltaAvailable: number; deltaReserved: number; availableAfter: number; reservedAfter: number; referenceId: string | null; createdAt: string }[];
  jobs: { id: string; status: string; settledPoints: number; output: Record<string, unknown>; createdAt: string; updatedAt: string }[];
  jobsTruncated: boolean;
  deliveries: { id: string; createdAt: string }[];
  readiness: Readiness;
};
type ProjectProduction = {
  project: { id: string; kind: "build" | "drama"; title: string };
  nodes: { id: string; type: string; status: string }[];
  jobs: { id: string; status: string; canCancel: boolean; quotedPoints: number; reservedPoints: number; settledPoints: number; errorCode: string | null; input: Record<string, unknown>; createdAt: string }[];
  deliveries: { id: string; jobId: string; mimeType: string; byteSize: number; aiGenerated: boolean; createdAt: string }[];
};

const t = (lang: Lang, zh: string, en: string) => lang === "zh" ? zh : en;
const tone = (dark: boolean) => dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white";

function dateLabel(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function ledgerLabel(kind: string, lang: Lang) {
  const labels: Record<string, [string, string]> = {
    topup: ["制作储备到账", "Allocation received"], reserve: ["项目额度锁定", "Project allocation secured"],
    settle: ["制作任务结算", "Production settled"], release: ["未用额度归还", "Unused allocation returned"],
    refund: ["订单退款", "Order refunded"], adjustment: ["账户校正", "Account adjustment"],
  };
  const value = labels[kind] ?? [kind, kind];
  return t(lang, value[0], value[1]);
}

function chartPath(values: number[], max: number) {
  return values.map((value, index) => `${index ? "L" : "M"} ${(index / Math.max(1, values.length - 1) * 720).toFixed(1)} ${(190 - value / Math.max(1, max) * 150).toFixed(1)}`).join(" ");
}

export function SasiProductionAccount({ lang, dark, accountEmail, onNotice }: {
  lang: Lang;
  dark: boolean;
  accountEmail: string | null;
  onNotice: (message: string) => void;
}) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accountEmail) return;
    setLoading(true);
    try {
      const response = await fetch("/api/sasi/account", { cache: "no-store" });
      if (!response.ok) throw new Error("ACCOUNT_UNAVAILABLE");
      setAccount(await response.json());
    } catch { onNotice(t(lang, "制作账户暂时无法读取。", "The production account is temporarily unavailable.")); }
    finally { setLoading(false); }
  }, [accountEmail, lang, onNotice]);

  useEffect(() => { void load(); }, [load]);

  const now = Date.now();
  const recentJobs = (account?.jobs ?? []).filter((job) => now - new Date(job.updatedAt ?? job.createdAt).getTime() <= 30 * 86400000);
  const settledUsage = recentJobs.filter((job) => job.status === "succeeded").reduce((sum, job) => sum + job.settledPoints, 0);
  const successfulJobs = recentJobs.filter((job) => job.status === "succeeded").length;
  const successRate = recentJobs.length ? Math.round(successfulJobs / recentJobs.length * 100) : null;
  const supplierCosts = recentJobs.flatMap((job) => {
    const cost = job.output?.supplierCost;
    if (!cost || typeof cost !== "object") return [];
    const value = cost as { minor?: unknown; currency?: unknown };
    return typeof value.minor === "number" && value.currency === "CNY" ? [value.minor / 100] : [];
  });
  const supplierCost = supplierCosts.reduce((sum, value) => sum + value, 0);
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now - (29 - index) * 86400000);
    return date.toISOString().slice(0, 10);
  });
  const usageTrend = days.map((day) => recentJobs.filter((job) => job.status === "succeeded" && (job.updatedAt ?? job.createdAt).slice(0, 10) === day).reduce((sum, job) => sum + job.settledPoints, 0));
  const costTrend = days.map((day) => recentJobs.filter((job) => (job.updatedAt ?? job.createdAt).slice(0, 10) === day).reduce((sum, job) => {
    const cost = job.output?.supplierCost;
    if (!cost || typeof cost !== "object") return sum;
    const value = cost as { minor?: unknown; currency?: unknown };
    return typeof value.minor === "number" && value.currency === "CNY" ? sum + value.minor / 100 : sum;
  }, 0));
  const usageMax = Math.max(...usageTrend, 1);
  const costMax = Math.max(...costTrend, 1);
  const hasTrend = usageTrend.some(Boolean) || costTrend.some(Boolean);

  async function topUp(packId: string) {
    if (!accountEmail) { onNotice(t(lang, "请先连接场域账户。", "Connect your field account first.")); return; }
    const channels = account?.readiness.paymentChannels;
    const channel = channels?.alipay ? "alipay" : channels?.wechat ? "wechat" : channels?.paypal ? "paypal" : null;
    if (!channel || !account?.readiness.productionAccountReady) {
      onNotice(t(lang, "制作账户尚未开放收款；账本已就绪，但正式商户通道仍保持关闭。", "The production account is not accepting funds yet; the ledger is ready, while live merchant channels remain closed."));
      return;
    }
    setPaying(packId);
    try {
      const endpoint = channel === "alipay" ? "/api/pay/alipay/create" : channel === "wechat" ? "/api/pay/wechat/create" : "/api/pay/create";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: packId, returnPath: "/?view=billing" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "PAYMENT_CREATE_FAILED");
      if (typeof result.url === "string") { window.location.assign(result.url); return; }
      if (typeof result.codeUrl === "string") {
        const QRCode = (await import("qrcode")).default;
        setQr(await QRCode.toDataURL(result.codeUrl, { width: 280, margin: 1 }));
        return;
      }
      throw new Error("PAYMENT_ROUTE_UNAVAILABLE");
    } catch (error) {
      onNotice(error instanceof Error ? error.message : t(lang, "收银台建立失败。", "Checkout could not be created."));
    } finally { setPaying(null); }
  }

  const readiness = account?.readiness;
  const paymentOpen = Boolean(readiness?.productionAccountReady && Object.values(readiness.paymentChannels).some(Boolean));
  return <section className={`sasi-balance ${dark ? "is-dark" : "is-light"}`}>
    <header className="sasi-balance-hero"><div><p>PRODUCTION ACCOUNT · VERIFIED LEDGER</p><h1>{t(lang, "余额与用量", "Balance & Usage")}</h1><strong>{t(lang, "每一笔投入，都知道去了哪里。", "Know where every production credit goes.")}</strong><span>{t(lang, "生成前看见预计成本，执行时只锁定已授权额度，完成后按真实结果结算；未使用的部分自动归还。", "See estimated cost before generation, secure only authorized credits, settle against real results, and return anything unused.")}</span></div><div className="sasi-balance-state"><i className={readiness?.productionReady ? "ready" : "guarded"}/><b>{readiness?.productionReady ? t(lang, "制作账户可用", "Production enabled") : t(lang, "制作保护中", "Production guarded")}</b><small>{account?.wallet.updatedAt ? `${t(lang, "账本更新", "Ledger updated")} · ${dateLabel(account.wallet.updatedAt, lang)}` : t(lang, "等待真实账户数据", "Waiting for verified account data")}</small></div></header>

    {!accountEmail ? <section className="sasi-balance-signin"><small>ACCOUNT REQUIRED</small><h2>{t(lang, "先连接你的场域账户", "Connect your field account")}</h2><p>{t(lang, "余额、额度锁定、供应商成本和制作流水均按账户隔离；登录后才会读取属于你的真实账本。", "Balances, reservations, supplier costs and production ledger are isolated by account and load only after sign-in.")}</p><button type="button" onClick={() => onNotice(t(lang, "请使用右上角账户入口登录。", "Use the account entry in the upper-right to sign in."))}>{t(lang, "前往账户入口", "Open account entry")} →</button></section> : <>
      <div className="sasi-balance-kpis">
        <article><span>{t(lang, "当前可用", "Available")}</span><b>{loading ? "—" : (account?.wallet.availablePoints ?? 0).toLocaleString()}</b><small>{t(lang, "可调度制作额度", "Production credits ready to use")}</small><i className="violet"/></article>
        <article><span>{t(lang, "制作中锁定", "Reserved")}</span><b>{loading ? "—" : (account?.wallet.reservedPoints ?? 0).toLocaleString()}</b><small>{t(lang, "只属于已授权任务", "Only for authorized jobs")}</small><i className="cyan"/></article>
        <article><span>{t(lang, "近 30 天实际结算", "30-day settled usage")}</span><b>{loading ? "—" : settledUsage.toLocaleString()}</b><small>{account?.jobsTruncated ? t(lang, "任务超过 1,000 条，当前为可核验下限", "Over 1,000 jobs; verified lower bound shown") : t(lang, "按成功任务的真实结算额度", "Verified successful-job settlement")}</small><i className="amber"/></article>
        <article><span>{t(lang, "近 30 天制作任务", "30-day production jobs")}</span><b>{loading ? "—" : recentJobs.length.toLocaleString()}</b><small>{successRate == null ? t(lang, "暂无任务", "No jobs yet") : `${t(lang, "成功率", "Success rate")} ${successRate}%`}</small><i className="green"/></article>
      </div>

      <div className="sasi-balance-middle">
        <section className="sasi-balance-trend"><header><div><small>30-DAY VERIFIED USAGE</small><h2>{t(lang, "近 30 天用量趋势", "30-day usage trend")}</h2></div><div><span className="usage">{t(lang, "平台结算额度", "Settled credits")}</span><span className="cost">{t(lang, "人民币供应商成本", "CNY supplier cost")}</span></div></header><div className={`sasi-balance-chart ${hasTrend ? "has-data" : "is-empty"}`}><svg viewBox="0 0 720 220" role="img" aria-label={t(lang, "近三十天实际用量趋势", "Verified usage across the last 30 days")}><line x1="0" y1="40" x2="720" y2="40"/><line x1="0" y1="90" x2="720" y2="90"/><line x1="0" y1="140" x2="720" y2="140"/><line x1="0" y1="190" x2="720" y2="190"/><path className="usage" d={chartPath(usageTrend, usageMax)}/><path className="cost" d={chartPath(costTrend, costMax)}/></svg>{!hasTrend && <p>{t(lang, "产生真实制作结算后，这里会形成趋势；当前不使用演示数据。", "A trend appears after verified settlement. No demonstration data is used here.")}</p>}<footer><span>{dateLabel(`${days[0]}T00:00:00Z`, lang)}</span><em>{t(lang, "双线使用独立尺度，只比较走势", "Independent scales; compare trends only")}</em><span>{dateLabel(`${days[days.length - 1]}T00:00:00Z`, lang)}</span></footer></div><div className="sasi-balance-cost-proof"><span>{t(lang, "人民币供应商成本记录", "CNY supplier cost records")}</span><b>{supplierCosts.length ? `¥${supplierCost.toFixed(2)}` : "—"}</b><small>{supplierCosts.length ? t(lang, `来自 ${supplierCosts.length} 条带来源标记的回传或估算记录`, `${supplierCosts.length} returned or estimated records with source labels`) : t(lang, "暂无可核验成本，不以估算冒充真实消耗", "No verifiable cost yet; estimates are not shown as actual spend")}</small></div></section>

        <aside className="sasi-balance-reserve"><small>PRODUCTION RESERVE</small><h2>{t(lang, "建立制作储备", "Establish production allocation")}</h2><p>{t(lang, "储备只进入 SASI 制作账户；外部 API 仍由对应供应商直接计费。支付接入前，所有金额仅作方案展示。", "Allocation funds only the SASI production account; external APIs remain provider-billed. Amounts are informational until checkout is connected.")}</p><div>{CREDIT_PACKS.map((pack, index) => <button key={pack.id} type="button" disabled={!paymentOpen || Boolean(paying)} onClick={() => void topUp(pack.id)} className={index === 1 ? "featured" : ""}><b>{pack.points.toLocaleString()}</b><span>{t(lang, "制作额度", "credits")}</span><small>{t(lang, `¥${pack.priceRmb} · ${pack.zh}`, `${pack.priceUsd} USD · ${pack.en}`)}</small></button>)}</div><button type="button" className="sasi-balance-checkout" disabled={!paymentOpen || Boolean(paying)} onClick={() => paymentOpen && void topUp(CREDIT_PACKS[1]?.id ?? CREDIT_PACKS[0].id)}>{paymentOpen ? t(lang, "进入安全收银台", "Open secure checkout") : t(lang, "支付接入后开放", "Available after payment integration")}</button><p className="boundary">{t(lang, "充值成功必须经过商户回调、订单校验和服务端入账，前端按钮不会直接增加额度。", "Credits are added only after merchant callback, order verification and server-side settlement; a button can never alter the balance directly.")}</p></aside>
      </div>

      {qr && <div className="sasi-balance-qr"><img src={qr} alt={t(lang, "微信支付二维码", "WeChat payment QR code")}/><p>{t(lang, "请使用微信完成确认，到账后刷新制作账户。", "Complete confirmation in WeChat, then refresh the production account.")}</p></div>}

      <section className="sasi-balance-ledger"><header><div><small>ACCOUNT LEDGER</small><h2>{t(lang, "消费与额度明细", "Usage and allocation ledger")}</h2></div><button type="button" onClick={() => void load()} disabled={loading}>{loading ? t(lang, "正在刷新…", "Refreshing…") : t(lang, "刷新真实账本", "Refresh ledger")}</button></header>{!account?.ledger.length ? <div className="sasi-balance-empty"><b>{t(lang, "尚无制作流水", "No ledger entries yet")}</b><p>{t(lang, "首笔制作储备到账、任务锁定、结算、归还或退款后，都会在这里留下不可由前端伪造的记录。", "Top-ups, reservations, settlements, releases and refunds will appear here as server-owned records.")}</p></div> : <div className="sasi-balance-table"><div className="head"><span>{t(lang, "时间", "Time")}</span><span>{t(lang, "事项", "Event")}</span><span>{t(lang, "可用变动", "Available change")}</span><span>{t(lang, "锁定变动", "Reserved change")}</span><span>{t(lang, "变动后余额", "Balance after")}</span><span>{t(lang, "凭证", "Reference")}</span></div>{account.ledger.slice(0, 12).map((entry) => <div className="row" key={entry.id}><span>{new Date(entry.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span><b>{ledgerLabel(entry.kind, lang)}</b><span className={entry.deltaAvailable < 0 ? "negative" : entry.deltaAvailable > 0 ? "positive" : ""}>{entry.deltaAvailable > 0 ? "+" : ""}{entry.deltaAvailable.toLocaleString()}</span><span className={entry.deltaReserved < 0 ? "negative" : entry.deltaReserved > 0 ? "positive" : ""}>{entry.deltaReserved > 0 ? "+" : ""}{entry.deltaReserved.toLocaleString()}</span><span>{entry.availableAfter.toLocaleString()} / {entry.reservedAfter.toLocaleString()}</span><code>{entry.referenceId ? `${entry.referenceId.slice(0, 8)}…` : "—"}</code></div>)}</div>}</section>

      <div className={`sasi-balance-guard ${readiness?.productionReady ? "ready" : "guarded"}`}><b>{readiness?.productionReady ? t(lang, "制作内核已通过三重门控", "Production kernel passed all three gates") : t(lang, "制作保护仍在生效", "Production safeguards remain active")}</b><span>{readiness?.productionReady ? t(lang, "账户、执行与内容标识均已就绪。", "Account, execution and content labeling are ready.") : t(lang, "商户通道、影像执行与内容标识全部就绪前，系统不会接受真实制作授权。", "No live production authorization is accepted until merchant, video execution and content labeling are ready.")}</span></div>
    </>}
  </section>;
}

export function SasiProjectProduction({ detail, lang, dark, onReload, onNotice }: {
  detail: ProjectProduction;
  lang: Lang;
  dark: boolean;
  onReload: () => Promise<void>;
  onNotice: (message: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<8 | 12>(8);
  const [quality, setQuality] = useState<SasiQuality>("fast");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [routingMode, setRoutingMode] = useState<"auto" | "professional">("auto");
  const [providerPreference, setProviderPreference] = useState<"seedance" | "xai" | "openai" | "wan">("seedance");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [aiLabelAcknowledged, setAiLabelAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const quote = productionQuote(routeForQuality(quality), duration);
  useEffect(() => { fetch("/api/sasi/status", { cache: "no-store" }).then((r) => r.json()).then(setReadiness).catch(() => setReadiness(null)); }, []);
  if (detail.project.kind !== "drama") return null;
  const shotNode = detail.nodes.find((node) => node.type === "shot-generation") ?? null;

  async function createJob() {
    if (!readiness?.productionReady) { onNotice(t(lang, "制作内核仍受安全门控保护，请先完成商户、供应能力与内容标识配置。", "The production kernel remains safely gated until merchant, provider and content-labeling configuration is complete.")); return; }
    if (prompt.trim().length < 8) { onNotice(t(lang, "请先写下这个镜头的画面、动作与镜头语言。", "Describe the shot, action and camera language first.")); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/sasi/jobs", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ projectId: detail.project.id, nodeId: shotNode?.id, prompt, duration, quality, aspectRatio, providerPreference: routingMode === "professional" ? providerPreference : null, rightsConfirmed, aiLabelAcknowledged }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "PRODUCTION_START_FAILED");
      onNotice(t(lang, "镜头已进入制作序列，额度已安全锁定。", "The shot has entered production and its allocation is secured."));
      await onReload();
    } catch (error) { onNotice(error instanceof Error ? error.message : "PRODUCTION_START_FAILED"); }
    finally { setBusy(false); }
  }

  async function refresh(jobId: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/sasi/jobs/${jobId}/refresh`, { method: "POST" });
      const result = await response.json();
      if (!response.ok && result.error !== "JOB_REFRESH_PENDING") throw new Error(result.error ?? "JOB_REFRESH_FAILED");
      await onReload();
    } catch (error) { onNotice(error instanceof Error ? error.message : "JOB_REFRESH_FAILED"); }
    finally { setBusy(false); }
  }

  async function cancel(jobId: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/sasi/jobs/${jobId}/cancel`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "JOB_CANCEL_FAILED");
      onNotice(t(lang, "任务已取消，尚未结算的制作额度已归还。", "The job was cancelled and unsettled allocation was returned."));
      await onReload();
    } catch (error) { onNotice(error instanceof Error ? error.message : "JOB_CANCEL_FAILED"); }
    finally { setBusy(false); }
  }

  async function download(deliveryId: string) {
    const response = await fetch(`/api/sasi/deliveries/${deliveryId}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) { onNotice(result.error ?? "DELIVERY_LINK_FAILED"); return; }
    window.location.assign(result.url);
  }

  return <section className={`mt-8 rounded-3xl border p-6 ${tone(dark)}`}>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[.18em] text-[#e04d70]">LIVE SHOT PRODUCTION</p><h2 className="mt-2 text-2xl font-semibold">{t(lang, "生成并交付一个真实镜头", "Produce and deliver a live shot")}</h2></div><span className={`rounded-full px-3 py-1 text-[10px] ${readiness?.productionReady ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>{readiness?.productionReady ? t(lang, "可授权", "Ready") : t(lang, "安全门控中", "Gated")}</span></div>
    <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={t(lang, "描述人物、场景、动作、情绪、机位与光线……", "Describe character, setting, action, emotion, camera and light…")} className="mt-5 min-h-28 w-full rounded-2xl border border-current/15 bg-transparent p-4 text-sm leading-7 outline-none"/>
    <div className="mt-4 grid gap-3 sm:grid-cols-3"><select value={duration} onChange={(e) => setDuration(Number(e.target.value) as 8 | 12)} className="rounded-xl border border-current/15 bg-transparent p-3 text-sm"><option value={8}>8s</option><option value={12}>12s</option></select><select value={quality} onChange={(e) => setQuality(e.target.value as SasiQuality)} className="rounded-xl border border-current/15 bg-transparent p-3 text-sm">{SASI_QUALITY_TIERS.map((tier) => <option key={tier.id} value={tier.id}>{t(lang, tier.zh, tier.en)}</option>)}</select><select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)} className="rounded-xl border border-current/15 bg-transparent p-3 text-sm"><option>16:9</option><option>9:16</option><option>1:1</option></select></div>
    <div className="mt-4 rounded-2xl border border-current/10 p-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setRoutingMode("auto")} className={`rounded-full px-4 py-2 text-xs ${routingMode === "auto" ? "bg-[#7657ff] text-white" : "border border-current/15"}`}>{t(lang, "智能统筹", "SASI Auto")}</button><button type="button" onClick={() => setRoutingMode("professional")} className={`rounded-full px-4 py-2 text-xs ${routingMode === "professional" ? "bg-[#7657ff] text-white" : "border border-current/15"}`}>{t(lang, "专业指定", "Professional")}</button></div>{routingMode === "professional" && <div className="mt-3"><select value={providerPreference} onChange={(event) => setProviderPreference(event.target.value as typeof providerPreference)} className="w-full rounded-xl border border-current/15 bg-transparent p-3 text-sm"><option value="seedance">ByteDance Seedance{readiness?.videoRoutes?.seedance ? " · Ready" : " · Unverified"}</option><option value="wan">Alibaba Wan 2.7{readiness?.videoRoutes?.wan ? " · Ready" : " · Unverified"}</option><option value="xai">Grok Imagine 1.5{readiness?.videoRoutes?.xai ? " · Ready" : " · Unverified"}</option><option value="openai">OpenAI {quality === "cinema" ? "Sora 2 Pro" : "Sora 2"}{readiness?.videoRoutes?.openai ? " · Ready" : " · Unverified"}</option></select><p className="mt-2 text-[11px] leading-5 opacity-45">{t(lang, "专业指定不会自动改用其他线路；当前线路与规格不兼容时，任务不会扣款或提交。", "Professional selection never switches providers silently. An incompatible route is rejected before reservation or submission.")}</p></div>}</div>
    <div className="mt-4 space-y-2 text-xs leading-5 opacity-65"><label className="flex items-start gap-2"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1"/><span>{t(lang, "我确认拥有素材、人物肖像与声音的必要使用授权。", "I confirm the necessary rights to all materials, likenesses and voices.")}</span></label><label className="flex items-start gap-2"><input type="checkbox" checked={aiLabelAcknowledged} onChange={(event) => setAiLabelAcknowledged(event.target.checked)} className="mt-1"/><span>{t(lang, "我申请洁净画面导出：作品不叠加持续可见水印，但文件保留 AIGC 元数据；对外发布时，我会主动使用发布平台的 AI 生成标识功能，不删除、篡改或伪造标识。", "I request a clean visual export: no persistent visible watermark, while AIGC file metadata remains. When publishing, I will use the platform's AI-content disclosure and will not delete, alter or falsify labels.")}</span></label></div>
    <div className="mt-4 flex items-center justify-between gap-4"><p className="text-xs opacity-50">{quote.points.toLocaleString()} {t(lang, "制作额度 · 授权后锁定", "credits · secured after authorization")}</p><button disabled={busy || !readiness?.productionReady || !rightsConfirmed || !aiLabelAcknowledged} onClick={() => void createJob()} className="rounded-xl bg-[#e04d70] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35">{busy ? t(lang, "正在同步…", "Synchronizing…") : t(lang, "确认并开始制作", "Confirm production")}</button></div>
    <div className="mt-7 space-y-3">{detail.jobs.length === 0 ? <p className="text-sm opacity-45">{t(lang, "尚无镜头任务。", "No shot jobs yet.")}</p> : detail.jobs.map((job) => <article key={job.id} className="rounded-2xl border border-current/10 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium">{String(job.input.prompt ?? t(lang, "影像镜头", "Video shot")).slice(0, 72)}</p><p className="mt-1 text-[10px] uppercase tracking-[.14em] opacity-40">{job.status} · {job.quotedPoints.toLocaleString()} credits</p></div>{(new Set(["queued", "running"]).has(job.status) || job.canCancel) && <div className="flex gap-2">{new Set(["queued", "running"]).has(job.status) && <button disabled={busy} onClick={() => void refresh(job.id)} className="rounded-lg border border-current/15 px-3 py-2 text-xs">{t(lang, "同步进度", "Refresh")}</button>}{job.canCancel && <button disabled={busy} onClick={() => void cancel(job.id)} className="rounded-lg border border-current/15 px-3 py-2 text-xs opacity-65">{t(lang, "取消", "Cancel")}</button>}</div>}</div>{job.errorCode && <p className="mt-3 text-xs text-amber-500">{job.errorCode}</p>}</article>)}</div>
    {detail.deliveries.length > 0 && <div className="mt-7"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{t(lang, "交付作品", "Deliveries")}</h3><span className="rounded-full border border-current/15 px-3 py-1 text-[10px]">AI {t(lang,"生成合成","generated")}</span></div><p className="mt-2 text-xs leading-5 opacity-50">{t(lang,"交付页持续显示来源提示；下载文件含标准 AIGC 元数据，不叠加持续画面水印。","The delivery surface retains a clear disclosure. Downloads contain standard AIGC metadata without a persistent visual watermark.")}</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{detail.deliveries.map((delivery) => <button key={delivery.id} onClick={() => void download(delivery.id)} className="rounded-2xl border border-current/10 p-4 text-left"><p className="text-sm font-medium">{t(lang, "AI 生成影像 · 洁净画面", "AI-generated video · clean visual")}</p><p className="mt-2 text-xs opacity-45">{(delivery.byteSize / 1024 / 1024).toFixed(1)} MB · {t(lang, "含 AIGC 元数据 · 限时安全下载", "AIGC metadata · secure timed download")}</p></button>)}</div></div>}
  </section>;
}
