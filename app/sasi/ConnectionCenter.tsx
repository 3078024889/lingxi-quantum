"use client";

import { useEffect, useMemo, useState } from "react";
import { BUILD_CONNECTORS, SASI_INTEGRATIONS, TRAINING_SOURCES, type SasiIntegration } from "@/lib/sasi/integration-catalog";

type Props = { lang: "zh" | "en"; dark: boolean; accountEmail: string | null };
type Tab = "models" | "media" | "build" | "security" | "billing" | "training";
type Connection = { provider: string; keyHint: string; healthStatus: "stored" | "checking" | "healthy" | "unhealthy"; lastCheckedAt: string | null; lastErrorCode: string | null };

const MODEL_IDS = new Set(["openai", "xai", "anthropic", "gemini"]);
const MEDIA_IDS = new Set(["openai", "xai", "luma", "volcengine", "aliyun", "tencent"]);

export default function ConnectionCenter({ lang, dark, accountEmail }: Props) {
  const [tab, setTab] = useState<Tab>("models");
  const [selected, setSelected] = useState<SasiIntegration>(SASI_INTEGRATIONS[0]);
  const [cost, setCost] = useState(10);
  const [apiKey, setApiKey] = useState("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [vaultState, setVaultState] = useState<"loading" | "ready" | "login" | "unavailable">("loading");
  const [busy, setBusy] = useState<"save" | "test" | "delete" | null>(null);
  const [message, setMessage] = useState("");
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const managed = useMemo(() => Math.max(1, Math.round(cost * 2 * 100) / 100), [cost]);
  const orchestration = useMemo(() => Math.max(.5, Math.round(cost * .2 * 100) / 100), [cost]);
  const connection = connections.find((item) => item.provider === selected.id);
  const vaultSupported = selected.id !== "tencent";
  const visibleProviders = SASI_INTEGRATIONS.filter((item) => tab === "models" ? MODEL_IDS.has(item.id) : MEDIA_IDS.has(item.id));
  const tabs: Array<[Tab, string, string, string]> = [
    ["models", "模型与 API", "Models & API", "文"],
    ["media", "图像与视频", "Image & Video", "影"],
    ["build", "开发与部署", "Build & Deploy", "构"],
    ["security", "安全与密钥", "Security & Keys", "钥"],
    ["billing", "计费边界", "Cost Boundary", "费"],
    ["training", "训练资料库", "Training Data", "数"],
  ];

  useEffect(() => {
    if (!accountEmail) { setVaultState("login"); return; }
    let alive = true;
    fetch("/api/sasi/connections", { cache: "no-store" })
      .then(async (response) => ({ response, body: await response.json().catch(() => ({})) }))
      .then(({ response, body }) => {
        if (!alive) return;
        if (response.ok) { setConnections(body.connections ?? []); setVaultState("ready"); }
        else setVaultState(response.status === 401 ? "login" : "unavailable");
      })
      .catch(() => alive && setVaultState("unavailable"));
    return () => { alive = false; };
  }, [accountEmail]);

  function statusFor(provider: string) {
    const item = connections.find((entry) => entry.provider === provider);
    if (!item) return { label: t("未连接", "Not connected"), tone: "idle" };
    if (item.healthStatus === "healthy") return { label: t("验证成功", "Verified"), tone: "healthy" };
    if (item.healthStatus === "checking") return { label: t("正在验证", "Checking"), tone: "checking" };
    if (item.healthStatus === "unhealthy") return { label: t("验证失败", "Failed"), tone: "failed" };
    return { label: t("已安全保存 · 待验证", "Stored · verify next"), tone: "stored" };
  }

  function selectProvider(item: SasiIntegration, targetTab?: "models" | "media") {
    setSelected(item);
    setMessage("");
    if (targetTab) setTab(targetTab);
  }

  async function saveConnection() {
    if (!apiKey.trim() || busy) return;
    setBusy("save"); setMessage("");
    const response = await fetch("/api/sasi/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: selected.id, apiKey }) });
    const body = await response.json().catch(() => ({}));
    if (response.ok) {
      setConnections((items) => [...items.filter((item) => item.provider !== selected.id), { provider: selected.id, keyHint: body.keyHint, healthStatus: "stored", lastCheckedAt: null, lastErrorCode: null }]);
      setApiKey(""); setMessage(t("已加密保存。下一步请执行连接验证，验证通过后才可用于生产。", "Encrypted and stored. Test the connection before using it for production."));
    } else setMessage(`${t("保存失败", "Save failed")}: ${body.error ?? response.status}`);
    setBusy(null);
  }

  async function testConnection() {
    if (!connection || busy) return;
    setBusy("test"); setMessage("");
    const response = await fetch("/api/sasi/connections/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: selected.id }) });
    const body = await response.json().catch(() => ({}));
    setConnections((items) => items.map((item) => item.provider === selected.id ? { ...item, healthStatus: body.healthStatus ?? "unhealthy", lastCheckedAt: new Date().toISOString(), lastErrorCode: body.errorCode ?? body.error ?? null } : item));
    setMessage(response.ok ? t("连接验证通过。供应商账户仍需保持余额、模型权限和地区可用性。", "Connection verified. Provider balance, model access and regional availability are still required.") : `${t("验证未通过", "Verification failed")}: ${body.errorCode ?? body.error ?? response.status}`);
    setBusy(null);
  }

  async function deleteConnection() {
    if (!connection || busy || !window.confirm(t("确认撤销并永久删除这项加密凭证？", "Revoke and permanently delete this encrypted credential?"))) return;
    setBusy("delete"); setMessage("");
    const response = await fetch(`/api/sasi/connections?provider=${encodeURIComponent(selected.id)}`, { method: "DELETE" });
    if (response.ok) { setConnections((items) => items.filter((item) => item.provider !== selected.id)); setMessage(t("凭证已删除。", "Credential deleted.")); }
    else { const body = await response.json().catch(() => ({})); setMessage(`${t("删除失败", "Delete failed")}: ${body.error ?? response.status}`); }
    setBusy(null);
  }

  const providerGrid = (items: SasiIntegration[]) => <div className="sasi-connect-provider-grid">{items.map((item) => {
    const state = statusFor(item.id);
    return <article key={item.id} className={selected.id === item.id ? "selected" : ""}>
      <button type="button" className="sasi-connect-provider-main" onClick={() => selectProvider(item)}>
        <span className="sasi-connect-provider-logo" style={{ background: item.color }}>{item.name.slice(0, 2)}</span>
        <span className="sasi-connect-provider-copy"><b>{item.name}</b><small>{item.product}</small></span>
        <em className={`status-${state.tone}`}>{state.label}</em>
      </button>
      <p>{t(item.noteZh, item.noteEn)}</p>
      <div className="sasi-connect-tags">{item.supports.map((value) => <span key={value}>{value}</span>)}</div>
      <footer><a href={item.keyUrl} target="_blank" rel="noreferrer">{t("官方入口", "Official setup")} ↗</a><a href={item.docsUrl} target="_blank" rel="noreferrer">{t("官方文档", "Official docs")} ↗</a><button type="button" onClick={() => selectProvider(item)}>{connection?.provider === item.id ? t("管理连接", "Manage") : t("接入指引", "Setup guide")} →</button></footer>
    </article>;
  })}</div>;

  const setupPanel = <aside className="sasi-connect-setup" data-testid="api-walkthrough">
    <header><span className="sasi-connect-provider-logo" style={{ background: selected.color }}>{selected.name.slice(0, 2)}</span><div><small>OFFICIAL SETUP</small><h2>{selected.name}</h2><p>{selected.product}</p></div><em className={`status-${statusFor(selected.id).tone}`}>{statusFor(selected.id).label}</em></header>
    <div className="sasi-connect-env"><span>{t("服务端环境变量", "Server environment variable")}</span><code>{selected.env}</code></div>
    <ol>{(lang === "zh" ? selected.stepsZh : selected.stepsEn).map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></li>)}</ol>
    <div className="sasi-connect-official"><a href={selected.keyUrl} target="_blank" rel="noreferrer">{t("打开官方创建页", "Open official setup")} ↗</a><a href={selected.docsUrl} target="_blank" rel="noreferrer">{t("阅读官方文档", "Read official docs")} ↗</a></div>
    <div className="sasi-connect-vault" data-testid="byok-vault">
      <div><h3>{t("我的加密连接", "My encrypted connection")}</h3>{connection && <span>{connection.keyHint}</span>}</div>
      {!vaultSupported ? <p>{t("腾讯云需要 SecretId、SecretKey 与 TC3 签名。当前仅保留官方指引，双凭证适配完成前不能保存。", "Tencent Cloud requires SecretId, SecretKey and TC3 signing. Saving remains unavailable until dual-secret support is complete.")}</p> : vaultState === "ready" && !connection ? <><input type="password" autoComplete="off" spellCheck={false} value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={t("粘贴 API Key；不会写入浏览器或 Git", "Paste API key; never stored in browser or Git")} /><button type="button" disabled={busy !== null || apiKey.trim().length < 12} onClick={saveConnection}>{busy === "save" ? t("正在加密保存…", "Encrypting…") : t("加密保存凭证", "Encrypt & save")}</button></> : connection ? <div className="sasi-connect-actions"><button type="button" disabled={busy !== null} onClick={testConnection}>{busy === "test" ? t("正在验证…", "Testing…") : t("验证连接", "Test connection")}</button><button type="button" disabled={busy !== null} onClick={deleteConnection}>{busy === "delete" ? t("正在删除…", "Deleting…") : t("撤销并删除", "Revoke & delete")}</button></div> : <p>{vaultState === "login" ? t("请先登录场域账户，再建立归属于你的加密连接。", "Sign in to create an encrypted connection owned by your account.") : vaultState === "loading" ? t("正在读取保险箱状态…", "Loading vault status…") : t("保险箱当前不可用。请核对数据库迁移与服务端加密主密钥。", "The vault is unavailable. Check database migrations and the server encryption key.")}</p>}
      {connection?.lastCheckedAt && <small>{t("最近验证", "Last verified")}: {new Date(connection.lastCheckedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}{connection.lastErrorCode ? ` · ${connection.lastErrorCode}` : ""}</small>}
      {message && <p className="sasi-connect-message">{message}</p>}
    </div>
    <p className="sasi-connect-key-note">{t("凭证只通过登录后的表单发送到 SASI 服务端加密保险箱，不写入浏览器存储、页面日志或代码仓库。", "Credentials are sent only to the signed-in server vault, never browser storage, page logs or source control.")}</p>
  </aside>;

  return <section className={`sasi-connection-center ${dark ? "is-dark" : "is-light"}`}>
    <header className="sasi-connect-hero"><div><p>SASI · CAPABILITY CONNECTION</p><h1>{t("模型与 API", "Models & API")}</h1><strong>{t("连接能力，不交出创作主权。", "Connect capability without giving up creative control.")}</strong><span>{t("用你自己的官方账户连接文字、图片、视频与开发服务。供应商直接向你计费，SASI 只负责安全保存、状态验证和创作调度。", "Connect text, image, video and development services through your own official accounts. Providers bill you directly; SASI handles secure storage, verification and orchestration.")}</span></div><div className="sasi-connect-proof"><b>{connections.filter((item) => item.healthStatus === "healthy").length}</b><span>{t("项连接已验证", "verified connections")}</span><small>{t("保存凭证不等于验证成功", "Stored does not mean verified")}</small></div></header>
    <nav className="sasi-connect-tabs" aria-label={t("能力连接分类", "Connection categories")}>{tabs.map(([id, zh, en, glyph]) => <button type="button" key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}><span>{glyph}</span>{t(zh, en)}</button>)}</nav>

    {(tab === "models" || tab === "media") && <div className="sasi-connect-main"><main><div className="sasi-connect-section-title"><div><small>{tab === "models" ? "INTELLIGENCE PROVIDERS" : "VISUAL PRODUCTION PROVIDERS"}</small><h2>{tab === "models" ? t("选择理解、编剧与编程能力", "Choose reasoning, writing and coding capability") : t("选择图片与视频生产能力", "Choose image and video production capability")}</h2></div><p>{t("点击供应商后，右侧会切换为对应官方步骤与真实连接状态。", "Select a provider to show its official setup and real connection status.")}</p></div>{providerGrid(visibleProviders)}</main>{setupPanel}</div>}

    {tab === "build" && <div><div className="sasi-connect-section-title"><div><small>DEVELOPMENT CONNECTIONS</small><h2>{t("从仓库到公网，每个连接各司其职", "A separate connection for every step from repository to public web")}</h2></div><p>{t("这里负责授权与状态读取，真正执行仍回到编程构建部署工作流。", "This area manages authorization and status; execution remains in Build & Deploy.")}</p></div><div className="sasi-connect-build-grid">{BUILD_CONNECTORS.map((item) => <article key={item.id}><header><span>{item.name.slice(0, 2)}</span><div><small>{t(item.roleZh, item.roleEn)}</small><h3>{item.name}</h3></div><em>{item.status === "oauth-required" ? t("OAuth 尚未接入", "OAuth pending") : t("需要人工配置", "Manual setup")}</em></header><ol>{(lang === "zh" ? item.stepsZh : item.stepsEn).map((step, index) => <li key={step}><b>0{index + 1}</b><span>{step}</span></li>)}</ol><footer><a href={item.url} target="_blank" rel="noreferrer">{t("打开官方入口", "Official entry")} ↗</a><a href={item.docs} target="_blank" rel="noreferrer">{t("权限说明", "Permissions")} ↗</a></footer></article>)}</div></div>}

    {tab === "security" && <div className="sasi-connect-security"><section><small>CONNECTION LEDGER</small><h2>{t("所有密钥与连接状态，一处看清", "Every credential and connection status in one place")}</h2><p>{t("只有供应商真实响应通过后才显示“验证成功”。你可以随时验证、轮换或永久删除自己的凭证。", "A connection is verified only after the provider responds successfully. Test, rotate or permanently remove your credentials at any time.")}</p><div>{SASI_INTEGRATIONS.map((item) => { const state = statusFor(item.id); const saved = connections.find((entry) => entry.provider === item.id); return <button type="button" key={item.id} onClick={() => selectProvider(item, MODEL_IDS.has(item.id) ? "models" : "media")}><span style={{ background: item.color }}>{item.name.slice(0, 2)}</span><div><b>{item.name}</b><small>{saved?.keyHint ?? t("尚未保存凭证", "No credential stored")}</small></div><em className={`status-${state.tone}`}>{state.label}</em><i>→</i></button>; })}</div></section><aside><small>SECURITY BOUNDARY</small><h2>{t("密钥属于你，权限必须最小化", "Your keys, with least privilege")}</h2><ul><li><b>01</b><span>{t("浏览器不持久保存明文密钥", "No plaintext keys persisted in browser")}</span></li><li><b>02</b><span>{t("服务端按账户加密与隔离", "Server encryption scoped to each account")}</span></li><li><b>03</b><span>{t("测试连接受到频率限制", "Connection tests are rate limited")}</span></li><li><b>04</b><span>{t("日志、页面和 Git 不回显密钥", "Keys never appear in logs, UI or Git")}</span></li></ul><p>{t("当前自定义 OpenAI-Compatible API 和腾讯云双密钥签名尚未开放。完成 endpoint 白名单、SSRF 防护与双凭证签名后再启用。", "Custom OpenAI-compatible endpoints and Tencent dual-secret signing are not yet open. Endpoint allowlisting, SSRF protection and dual-secret signing come first.")}</p></aside></div>}

    {tab === "billing" && <div className="sasi-connect-billing"><section><small>RMB COST STUDY</small><h2>{t("先看清一次创作会花多少钱", "See the cost before creating")}</h2><label>{t("供应商预计成本（人民币）", "Estimated provider cost (RMB)")}<input type="number" min="0" step="0.1" value={cost} onChange={(event) => setCost(Math.max(0, Number(event.target.value) || 0))} /></label><p>{t("这是政策计算器，不是付款页面，也不会调用模型。真实订单必须重新读取供应商报价。", "This is a policy calculator, not checkout, and does not call a model. Real orders require a fresh provider quote.")}</p></section><article><span>{t("平台代理", "Managed")}</span><b>¥{managed.toFixed(2)}</b><p>{t(`供应商 ¥${cost.toFixed(2)} × 2.0，覆盖调度、存储、重试、支付与退款风险。`, `Provider ¥${cost.toFixed(2)} × 2.0 for orchestration, storage, retries and payment risk.`)}</p></article><article><span>BYOK {t("推荐", "Recommended")}</span><b>¥{orchestration.toFixed(2)}</b><p>{t(`供应商 ¥${cost.toFixed(2)} 由用户直接支付；SASI 仅计算约 0.2×、最低 ¥0.50 的编排服务。`, `You pay provider ¥${cost.toFixed(2)} directly; SASI estimates about 0.2×, minimum ¥0.50, for orchestration.`)}</p></article></div>}

    {tab === "training" && <div><section className="sasi-connect-training-head"><small>CANGXUAN DATA PATH</small><h2>{t("只使用来源清楚、许可明确的数据", "Use only data with clear provenance and permission")}</h2><p>{t("不获取厂商私有训练集，不默认拿用户作品训练。先建立导演知识、许可样本和明确同意的反馈，再讨论专项微调。", "No vendor-private training sets and no default training on user work. Start with directing knowledge, licensed samples and explicit opt-in feedback before fine-tuning.")}</p></section><div className="sasi-connect-training-grid">{TRAINING_SOURCES.map((source) => <article key={source.name}><header><h3>{source.name}</h3><span>{source.state === "preferred" ? t("优先", "Preferred") : source.state === "research" ? t("研究限定", "Research only") : t("逐项核验", "Verify")}</span></header><small>{source.license}</small><p>{t(source.useZh, source.useEn)}</p><a href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noreferrer" : undefined}>{t("查看来源与许可", "Source & license")} ↗</a></article>)}</div><p className="sasi-connect-training-warning">{t("禁止：抓取或购买来源不明的厂商训练数据、默认把用户作品用于训练、把“可下载”等同于“可商用”。", "Prohibited: opaque vendor training data, default training on user work, or treating downloadable as commercially licensed.")}</p></div>}
  </section>;
}
