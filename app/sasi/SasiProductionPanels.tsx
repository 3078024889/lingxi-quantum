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
  ledger: { id: string; kind: string; deltaAvailable: number; deltaReserved: number; createdAt: string }[];
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
  return <section>
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">PRODUCTION ACCOUNT</p>
    <h1 className="mt-3 text-4xl font-semibold">{t(lang, "让每一次制作，在启动前拥有清晰边界", "Give every production a clear boundary before it begins")}</h1>
    <p className="mt-4 max-w-3xl leading-8 opacity-60">{t(lang, "制作账户承接已经确认的项目投入。到账后形成制作额度；只有在项目授权完成时才锁定，未进入实际制作的部分自动归还。", "The production account holds confirmed project allocation. Settled funds become production credits, secured only after project authorization, with unused allocation returned automatically.")}</p>
    {!accountEmail ? <div className={`mt-8 rounded-3xl border p-6 ${tone(dark)}`}>{t(lang, "连接场域账户后查看制作储备与完整流水。", "Connect your field account to view allocation and ledger history.")}</div> : <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className={`rounded-3xl border p-6 ${tone(dark)}`}><p className="text-xs uppercase tracking-[.16em] opacity-45">AVAILABLE</p><p className="mt-3 text-4xl font-semibold">{loading ? "—" : (account?.wallet.availablePoints ?? 0).toLocaleString()}</p><p className="mt-2 text-xs opacity-50">{t(lang, "可调度制作额度", "Available production credits")}</p></article>
        <article className={`rounded-3xl border p-6 ${tone(dark)}`}><p className="text-xs uppercase tracking-[.16em] opacity-45">RESERVED</p><p className="mt-3 text-4xl font-semibold">{loading ? "—" : (account?.wallet.reservedPoints ?? 0).toLocaleString()}</p><p className="mt-2 text-xs opacity-50">{t(lang, "正在制作中锁定", "Secured by active production")}</p></article>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{CREDIT_PACKS.map((pack) => <article key={pack.id} className={`rounded-3xl border p-7 ${tone(dark)}`}><p className="text-xs uppercase tracking-[.18em] opacity-45">{t(lang, pack.zh, pack.en)}</p><p className="mt-3 text-3xl font-semibold">{pack.points.toLocaleString()} <span className="text-sm font-normal opacity-45">{t(lang, "制作额度", "credits")}</span></p><p className="mt-2 text-xs opacity-45">{t(lang, `结算金额 ¥${pack.priceRmb}`, `Settlement ${pack.priceUsd} USD`)}</p><button disabled={Boolean(paying)} onClick={() => void topUp(pack.id)} className="mt-7 w-full rounded-xl border border-current/20 py-3 text-sm disabled:opacity-40">{paying === pack.id ? t(lang, "正在进入收银台…", "Opening checkout…") : t(lang, "建立制作储备", "Establish allocation")}</button></article>)}</div>
      {qr && <div className={`mt-6 flex flex-col items-center rounded-3xl border p-6 ${tone(dark)}`}><img src={qr} alt={t(lang, "微信支付二维码", "WeChat payment QR code")} className="h-56 w-56 rounded-xl bg-white p-2"/><p className="mt-3 text-sm opacity-60">{t(lang, "请使用微信完成确认，到账后刷新制作账户。", "Complete confirmation in WeChat, then refresh the production account.")}</p></div>}
      <div className={`mt-6 rounded-2xl border p-5 text-sm leading-7 ${readiness?.productionReady ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
        {readiness?.productionReady
          ? t(lang, "制作内核已通过账户、执行与内容标识三重门控。", "The production kernel has passed account, execution and content-labeling gates.")
          : t(lang, "制作保护仍在生效：商户通道、影像执行与内容标识全部就绪前，系统不会接受真实制作授权。", "Production safeguards remain active: no live production authorization is accepted until merchant, video execution and content-labeling gates are all ready.")}
      </div>
      <div className={`mt-6 rounded-3xl border p-6 ${tone(dark)}`}><div className="flex items-center justify-between"><h2 className="font-semibold">{t(lang, "制作流水", "Production ledger")}</h2><button onClick={() => void load()} className="text-xs opacity-55">{t(lang, "刷新", "Refresh")}</button></div>{!account?.ledger.length ? <p className="mt-4 text-sm opacity-45">{t(lang, "尚无制作流水。", "No production ledger entries yet.")}</p> : <div className="mt-4 space-y-3">{account.ledger.slice(0, 10).map((entry) => <div key={entry.id} className="flex items-center justify-between border-t border-current/10 pt-3 text-xs"><span className="uppercase opacity-55">{entry.kind}</span><span>{entry.deltaAvailable > 0 ? "+" : ""}{entry.deltaAvailable.toLocaleString()}</span></div>)}</div>}</div>
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
