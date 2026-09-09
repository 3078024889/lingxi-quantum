"use client";

import { useEffect, useState } from "react";
import { BUILD_CONNECTORS, SASI_INTEGRATIONS, TRAINING_SOURCES, type SasiIntegration } from "@/lib/sasi/integration-catalog";

type Props = { lang: "zh" | "en"; dark: boolean; accountEmail: string | null };
type Tab = "models" | "media" | "orchestration" | "build" | "security" | "training";
type Connection = { provider: string; keyHint: string; healthStatus: "stored" | "checking" | "healthy" | "unhealthy"; lastCheckedAt: string | null; lastErrorCode: string | null };

const MODEL_IDS = new Set(["openai", "xai", "anthropic", "gemini"]);
const MEDIA_IDS = new Set(["openai", "xai", "luma", "volcengine", "aliyun", "tencent"]);
const PROVIDER_LOGOS:Record<string,string> = {
  openai:"https://openai.com/favicon.ico", xai:"https://x.ai/favicon.ico", anthropic:"https://www.anthropic.com/favicon.ico",
  luma:"https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=128", volcengine:"https://www.google.com/s2/favicons?domain=volcengine.com&sz=128", aliyun:"https://www.aliyun.com/favicon.ico",
  tencent:"https://cloud.tencent.com/favicon.ico", gemini:"https://www.google.com/favicon.ico",
};

export default function ConnectionCenter({ lang, dark, accountEmail }: Props) {
  const [tab, setTab] = useState<Tab>("models");
  const [selected, setSelected] = useState<SasiIntegration>(SASI_INTEGRATIONS[0]);
  const [apiKey, setApiKey] = useState("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [vaultState, setVaultState] = useState<"loading" | "ready" | "login" | "unavailable">("loading");
  const [busy, setBusy] = useState<"save" | "test" | "delete" | null>(null);
  const [message, setMessage] = useState("");
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const connection = connections.find((item) => item.provider === selected.id);
  const vaultSupported = selected.id !== "tencent";
  const visibleProviders = SASI_INTEGRATIONS.filter((item) => tab === "models" ? MODEL_IDS.has(item.id) : MEDIA_IDS.has(item.id));
  const tabs: Array<[Tab, string, string, string]> = [
    ["models", "模型与 API", "Models & API", "文"],
    ["media", "图像与视频", "Image & Video", "影"],
    ["orchestration", "SASI 编排", "SASI Orchestration", "协"],
    ["build", "开发与部署", "Build & Deploy", "构"],
    ["security", "安全与密钥", "Security & Keys", "钥"],
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
        <span className="sasi-connect-provider-logo" style={{ background: item.color }}><img src={PROVIDER_LOGOS[item.id]} alt={`${item.name} logo`} /></span>
        <span className="sasi-connect-provider-copy"><b>{item.name}</b><small>{item.product}</small></span>
        <em className={`status-${state.tone}`}>{state.label}</em>
      </button>
      <p>{t(item.noteZh, item.noteEn)}</p>
      <div className="sasi-connect-tags">{item.supports.map((value) => <span key={value}>{value}</span>)}</div>
      <footer><a href={item.keyUrl} target="_blank" rel="noreferrer">{t("官方入口", "Official setup")} ↗</a><a href={item.docsUrl} target="_blank" rel="noreferrer">{t("官方文档", "Official docs")} ↗</a><button type="button" onClick={() => selectProvider(item)}>{connection?.provider === item.id ? t("管理连接", "Manage") : t("接入指引", "Setup guide")} →</button></footer>
    </article>;
  })}</div>;

  const setupPanel = <aside className="sasi-connect-setup" data-testid="api-walkthrough">
    <header><span className="sasi-connect-provider-logo" style={{ background: selected.color }}><img src={PROVIDER_LOGOS[selected.id]} alt={`${selected.name} logo`} /></span><div><small>OFFICIAL SETUP</small><h2>{selected.name}</h2><p>{selected.product}</p></div><em className={`status-${statusFor(selected.id).tone}`}>{statusFor(selected.id).label}</em></header>
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
    <header className="sasi-connect-hero"><div><p>SASI · CREATIVE ORCHESTRATION</p><h1>{t("模型与 API", "Models & API")}</h1><strong>{t("连接世界级能力，让它们共同完成一件作品。", "Connect world-class capabilities into one creative system.")}</strong><span>{t("模型负责生成，SASI 负责理解目标、拆解任务、选择能力、维持人物与世界连续性、审校结果并交付。你管理的是完整作品，不是散落在不同平台的一堆生成记录。", "Models generate. SASI understands the goal, plans the work, routes capabilities, protects continuity, reviews results and delivers a coherent work—not a pile of disconnected generations.")}</span></div><div className="sasi-connect-proof"><b>{connections.filter((item) => item.healthStatus === "healthy").length}</b><span>{t("项连接已验证", "verified connections")}</span><small>{t("未验证的连接不会标记为可生产", "Unverified connections stay out of production")}</small></div></header>
    <nav className="sasi-connect-tabs" aria-label={t("能力连接分类", "Connection categories")}>{tabs.map(([id, zh, en, glyph]) => <button type="button" key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}><span>{glyph}</span>{t(zh, en)}</button>)}</nav>

    {(tab === "models" || tab === "media") && <div className="sasi-connect-main"><main><div className="sasi-connect-section-title"><div><small>{tab === "models" ? "INTELLIGENCE PROVIDERS" : "VISUAL PRODUCTION PROVIDERS"}</small><h2>{tab === "models" ? t("选择理解、编剧与编程能力", "Choose reasoning, writing and coding capability") : t("选择图片与视频生产能力", "Choose image and video production capability")}</h2></div><p>{t("点击供应商后，右侧会切换为对应官方步骤与真实连接状态。", "Select a provider to show its official setup and real connection status.")}</p></div>{providerGrid(visibleProviders)}</main>{setupPanel}</div>}

    {tab === "orchestration" && <div className="sasi-orchestration"><header><small>WHY SASI</small><h2>{t("从一个目标，到可以继续推进的完整作品", "From one goal to a coherent work you can keep building")}</h2><p>{t("SASI 不替代模型，而是解决多模型创作最难的部分：上下文断裂、人物漂移、版本混乱、结果不可追踪。", "SASI does not replace models. It solves the hard parts of multi-model creation: broken context, character drift, version chaos and untraceable results.")}</p></header><div>{[
      ["01", "理解创作目标", "把受众、成果、限制和验收标准整理成可执行 brief。", "Understand the goal", "Turn audience, outcome, constraints and acceptance criteria into an executable brief."],
      ["02", "规划并选择能力", "按任务选择推理、编剧、图像、视频或代码能力，不让用户逐站重讲需求。", "Plan and route", "Choose reasoning, writing, image, video or coding capabilities without repeating the brief everywhere."],
      ["03", "守住连续性", "人物、场景、品牌和世界规则进入同一份项目记忆，变更有依据、有版本。", "Protect continuity", "Keep characters, scenes, brand and world rules in one versioned project memory."],
      ["04", "审校与交付", "把生成结果带回项目检查、筛选、修订、导出与继续生产，而不是停在一次生成。", "Review and deliver", "Bring outputs back for review, selection, revision, export and continued production."],
    ].map(([number,zhTitle,zhNote,enTitle,enNote]) => <article key={number}><b>{number}</b><h3>{t(zhTitle,enTitle)}</h3><p>{t(zhNote,enNote)}</p></article>)}</div><footer><strong>{t("当前边界", "Current boundary")}</strong><span>{t("连接、加密保存与健康验证已接入；具体模型执行仍以各产品工作流显示的真实状态为准。", "Connection, encrypted storage and health checks are available. Model execution remains governed by the verified state shown in each product workflow.")}</span></footer></div>}

    {tab === "build" && <div><div className="sasi-connect-section-title"><div><small>DEVELOPMENT CONNECTIONS</small><h2>{t("从仓库到公网，每个连接各司其职", "A separate connection for every step from repository to public web")}</h2></div><p>{t("这里负责授权与状态读取，真正执行仍回到编程构建部署工作流。", "This area manages authorization and status; execution remains in Build & Deploy.")}</p></div><div className="sasi-connect-build-grid">{BUILD_CONNECTORS.map((item) => <article key={item.id}><header><span>{item.name.slice(0, 2)}</span><div><small>{t(item.roleZh, item.roleEn)}</small><h3>{item.name}</h3></div><em>{item.status === "oauth-required" ? t("OAuth 尚未接入", "OAuth pending") : t("需要人工配置", "Manual setup")}</em></header><ol>{(lang === "zh" ? item.stepsZh : item.stepsEn).map((step, index) => <li key={step}><b>0{index + 1}</b><span>{step}</span></li>)}</ol><footer><a href={item.url} target="_blank" rel="noreferrer">{t("打开官方入口", "Official entry")} ↗</a><a href={item.docs} target="_blank" rel="noreferrer">{t("权限说明", "Permissions")} ↗</a></footer></article>)}</div></div>}

    {tab === "security" && <div className="sasi-connect-security"><section><small>CONNECTION LEDGER</small><h2>{t("所有密钥与连接状态，一处看清", "Every credential and connection status in one place")}</h2><p>{t("只有供应商真实响应通过后才显示“验证成功”。你可以随时验证、轮换或永久删除自己的凭证。", "A connection is verified only after the provider responds successfully. Test, rotate or permanently remove your credentials at any time.")}</p><div>{SASI_INTEGRATIONS.map((item) => { const state = statusFor(item.id); const saved = connections.find((entry) => entry.provider === item.id); return <button type="button" key={item.id} onClick={() => selectProvider(item, MODEL_IDS.has(item.id) ? "models" : "media")}><span style={{ background: item.color }}>{item.name.slice(0, 2)}</span><div><b>{item.name}</b><small>{saved?.keyHint ?? t("尚未保存凭证", "No credential stored")}</small></div><em className={`status-${state.tone}`}>{state.label}</em><i>→</i></button>; })}</div></section><aside><small>SECURITY BOUNDARY</small><h2>{t("密钥属于你，权限必须最小化", "Your keys, with least privilege")}</h2><ul><li><b>01</b><span>{t("浏览器不持久保存明文密钥", "No plaintext keys persisted in browser")}</span></li><li><b>02</b><span>{t("服务端按账户加密与隔离", "Server encryption scoped to each account")}</span></li><li><b>03</b><span>{t("测试连接受到频率限制", "Connection tests are rate limited")}</span></li><li><b>04</b><span>{t("日志、页面和 Git 不回显密钥", "Keys never appear in logs, UI or Git")}</span></li></ul><p>{t("当前自定义 OpenAI-Compatible API 和腾讯云双密钥签名尚未开放。完成 endpoint 白名单、SSRF 防护与双凭证签名后再启用。", "Custom OpenAI-compatible endpoints and Tencent dual-secret signing are not yet open. Endpoint allowlisting, SSRF protection and dual-secret signing come first.")}</p></aside></div>}

    {tab === "training" && <div><section className="sasi-connect-training-head"><small>CANGXUAN DATA PATH</small><h2>{t("只使用来源清楚、许可明确的数据", "Use only data with clear provenance and permission")}</h2><p>{t("不获取厂商私有训练集，不默认拿用户作品训练。先建立导演知识、许可样本和明确同意的反馈，再讨论专项微调。", "No vendor-private training sets and no default training on user work. Start with directing knowledge, licensed samples and explicit opt-in feedback before fine-tuning.")}</p></section><div className="sasi-connect-training-grid">{TRAINING_SOURCES.map((source) => <article key={source.name}><header><h3>{source.name}</h3><span>{source.state === "preferred" ? t("优先", "Preferred") : source.state === "research" ? t("研究限定", "Research only") : t("逐项核验", "Verify")}</span></header><small>{source.license}</small><p>{t(source.useZh, source.useEn)}</p><a href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noreferrer" : undefined}>{t("查看来源与许可", "Source & license")} ↗</a></article>)}</div><p className="sasi-connect-training-warning">{t("禁止：抓取或购买来源不明的厂商训练数据、默认把用户作品用于训练、把“可下载”等同于“可商用”。", "Prohibited: opaque vendor training data, default training on user work, or treating downloadable as commercially licensed.")}</p></div>}
  </section>;
}
