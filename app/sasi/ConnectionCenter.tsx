"use client";

import { useEffect, useMemo, useState } from "react";
import { BUILD_CONNECTORS, SASI_INTEGRATIONS, TRAINING_SOURCES, type SasiIntegration } from "@/lib/sasi/integration-catalog";

type Props={ lang:"zh"|"en"; dark:boolean; accountEmail:string|null };
type Tab="models"|"build"|"billing"|"training";
type Connection={provider:string;keyHint:string;healthStatus:"stored"|"checking"|"healthy"|"unhealthy";lastCheckedAt:string|null;lastErrorCode:string|null};

export default function ConnectionCenter({ lang,dark,accountEmail }:Props){
  const [tab,setTab]=useState<Tab>("models");
  const [selected,setSelected]=useState<SasiIntegration>(SASI_INTEGRATIONS[0]);
  const [cost,setCost]=useState(10);
  const [apiKey,setApiKey]=useState("");
  const [connections,setConnections]=useState<Connection[]>([]);
  const [vaultState,setVaultState]=useState<"loading"|"ready"|"login"|"unavailable">("loading");
  const [busy,setBusy]=useState<"save"|"test"|"delete"|null>(null);
  const [message,setMessage]=useState("");
  const panel=dark?"border-white/10 bg-white/[.035]":"border-[#e3e9f1] bg-white shadow-[0_14px_36px_rgba(38,57,83,.055)]";
  const t=(zh:string,en:string)=>lang==="zh"?zh:en;
  const managed=useMemo(()=>Math.max(1,Math.round(cost*2*100)/100),[cost]);
  const orchestration=useMemo(()=>Math.max(.5,Math.round(cost*.2*100)/100),[cost]);
  const tabs:Array<[Tab,string,string]>=[["models","模型与 API","Models & API"],["build","构建与部署","Build & Deploy"],["billing","计费边界","Billing"],["training","训练资料库","Training Data"]];
  const connection=connections.find(item=>item.provider===selected.id);
  const vaultSupported=selected.id!=="tencent";

  useEffect(()=>{
    if(!accountEmail){setVaultState("login");return;}
    let alive=true;
    fetch("/api/sasi/connections",{cache:"no-store"}).then(async response=>({response,body:await response.json().catch(()=>({}))})).then(({response,body})=>{
      if(!alive)return;
      if(response.ok){setConnections(body.connections??[]);setVaultState("ready");}
      else setVaultState(response.status===401?"login":"unavailable");
    }).catch(()=>alive&&setVaultState("unavailable"));
    return()=>{alive=false;};
  },[accountEmail]);

  async function saveConnection(){
    if(!apiKey.trim()||busy)return; setBusy("save");setMessage("");
    const response=await fetch("/api/sasi/connections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:selected.id,apiKey})});
    const body=await response.json().catch(()=>({}));
    if(response.ok){setConnections(items=>[...items.filter(item=>item.provider!==selected.id),{provider:selected.id,keyHint:body.keyHint,healthStatus:"stored",lastCheckedAt:null,lastErrorCode:null}]);setApiKey("");setMessage(t("已加密保存；请执行连接验证。","Encrypted and stored. Run connection test next."));}
    else setMessage(`${t("保存失败","Save failed")}: ${body.error??response.status}`);
    setBusy(null);
  }
  async function testConnection(){
    if(!connection||busy)return;setBusy("test");setMessage("");
    const response=await fetch("/api/sasi/connections/test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:selected.id})});
    const body=await response.json().catch(()=>({}));
    setConnections(items=>items.map(item=>item.provider===selected.id?{...item,healthStatus:body.healthStatus??"unhealthy",lastCheckedAt:new Date().toISOString(),lastErrorCode:body.errorCode??body.error??null}:item));
    setMessage(response.ok?t("连接验证通过。供应商账户仍需保持余额和模型权限。","Connection verified. Provider balance and model access are still required."):`${t("验证未通过","Verification failed")}: ${body.errorCode??body.error??response.status}`);setBusy(null);
  }
  async function deleteConnection(){
    if(!connection||busy||!window.confirm(t("确认撤销并永久删除这项加密凭证？","Revoke and permanently delete this encrypted credential?")))return;
    setBusy("delete");setMessage("");
    const response=await fetch(`/api/sasi/connections?provider=${encodeURIComponent(selected.id)}`,{method:"DELETE"});
    if(response.ok){setConnections(items=>items.filter(item=>item.provider!==selected.id));setMessage(t("凭证已删除。","Credential deleted."));}else{const body=await response.json().catch(()=>({}));setMessage(`${t("删除失败","Delete failed")}: ${body.error??response.status}`);}setBusy(null);
  }
  return <section>
    <div className="sasi-director-hero rounded-[28px] border border-current/10 p-7 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#7657ff]">SASI · CAPABILITY CONNECTION</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{t("连接能力，不交出创作主权","Connect capability. Keep creative control.")}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 opacity-65">{t("专业用户可从官方入口创建自己的 API 与云端连接，由供应商直接向用户计费。此处提供真实跳转和安全步骤；在授权回调与服务端密钥保险箱完成前，不显示虚假的“已连接”。","Professional users can create their own API and cloud connections through official entry points, with providers billing them directly. This center offers real links and safe steps; it does not claim a connection before authorization callbacks and a server-side vault exist.")}</p>
    </div>
    <div className="mt-6 flex flex-wrap gap-2" role="tablist">{tabs.map(([id,zh,en])=><button key={id} type="button" role="tab" aria-selected={tab===id} onClick={()=>setTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab===id?"bg-[#7657ff] text-white":"border border-current/15"}`}>{t(zh,en)}</button>)}</div>

    {tab==="models"&&<div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid gap-4 md:grid-cols-2">{SASI_INTEGRATIONS.map((item)=><button key={item.id} type="button" onClick={()=>setSelected(item)} className={`rounded-3xl border p-5 text-left transition ${selected.id===item.id?"border-[#7657ff] bg-[#7657ff]/[.07]":panel}`}><div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-2xl text-sm font-bold text-white" style={{background:item.color}}>{item.name.slice(0,2)}</span><span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] text-amber-600">{t("官方引导 · 待授权","Guide · authorization required")}</span></div><h2 className="mt-4 text-lg font-semibold">{item.name} <span className="font-normal opacity-45">· {item.product}</span></h2><div className="mt-3 flex flex-wrap gap-2">{item.supports.map(v=><span key={v} className="rounded-full border border-current/10 px-2.5 py-1 text-[10px] opacity-60">{v}</span>)}</div><p className="mt-4 text-xs leading-6 opacity-55">{t(item.noteZh,item.noteEn)}</p></button>)}</div>
      <aside className={`h-fit rounded-3xl border p-6 xl:sticky xl:top-6 ${panel}`} data-testid="api-walkthrough"><p className="text-xs uppercase tracking-[.18em] text-[#7657ff]">OFFICIAL SETUP</p><h2 className="mt-3 text-2xl font-semibold">{selected.name} · {selected.product}</h2><p className="mt-2 text-xs opacity-50">{selected.env}</p><div className="my-5 h-28 overflow-hidden rounded-2xl border border-current/10 bg-gradient-to-br from-[#7657ff]/15 via-transparent to-[#2ed3ff]/15 p-4"><div className="flex h-full items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{background:selected.color}}>{selected.name.slice(0,2)}</div><div className="flex-1 space-y-2"><div className="h-2 w-2/3 rounded bg-current/15"/><div className="h-2 w-full rounded bg-current/10"/><div className="h-7 w-1/2 rounded-lg bg-[#7657ff]"/></div></div></div><ol className="space-y-3">{(lang==="zh"?selected.stepsZh:selected.stepsEn).map((step,index)=><li key={step} className="flex gap-3 text-xs leading-6"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7657ff]/12 text-[#7657ff]">{index+1}</span><span className="opacity-65">{step}</span></li>)}</ol><div className="mt-5 grid grid-cols-2 gap-2"><a href={selected.keyUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#7657ff] px-3 py-3 text-center text-xs font-semibold text-white">{t("打开官方创建页 ↗","Open official setup ↗")}</a><a href={selected.docsUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-current/15 px-3 py-3 text-center text-xs">{t("阅读官方文档 ↗","Read official docs ↗")}</a></div><p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-[11px] leading-5 text-amber-700">{t("密钥仅通过登录后的加密连接表单发送到 SASI 服务端；不会写入浏览器存储、日志或 Git。","Keys are sent only through the signed-in encrypted connection form to the SASI server; they are never stored in browser storage, logs or Git.")}</p>
        <div className="mt-5 border-t border-current/10 pt-5" data-testid="byok-vault"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{t("我的加密连接","My encrypted connection")}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] ${connection?.healthStatus==="healthy"?"bg-emerald-500/10 text-emerald-600":connection?"bg-amber-500/10 text-amber-600":"bg-current/[.06]"}`}>{connection?`${connection.keyHint} · ${connection.healthStatus}`:vaultState==="ready"?t("未连接","Not connected"):vaultState==="login"?t("请先登录","Sign in first"):t("保险箱未就绪","Vault unavailable")}</span></div>
          {!vaultSupported?<p className="mt-3 text-xs leading-6 opacity-55">{t("腾讯云需要 SecretId、SecretKey 与 TC3 请求签名，当前保留官方引导，待双凭证签名适配完成后开放保存。","Tencent Cloud requires SecretId, SecretKey and TC3 signing. Official guidance remains available until dual-secret signing is implemented.")}</p>:vaultState==="ready"&&!connection?<><input type="password" autoComplete="off" spellCheck={false} value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder={t("粘贴后只发送到加密保险箱","Sent only to the encrypted vault")} className="mt-3 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none"/><button type="button" disabled={busy!==null||apiKey.trim().length<12} onClick={saveConnection} className="mt-2 w-full rounded-xl bg-[#151515] py-3 text-xs font-semibold text-white disabled:opacity-40">{busy==="save"?t("正在加密保存…","Encrypting…"):t("加密保存凭证","Encrypt & save")}</button></>:connection?<div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={busy!==null} onClick={testConnection} className="rounded-xl bg-emerald-600 px-3 py-3 text-xs font-semibold text-white disabled:opacity-40">{busy==="test"?t("正在验证…","Testing…"):t("验证连接","Test connection")}</button><button type="button" disabled={busy!==null} onClick={deleteConnection} className="rounded-xl border border-rose-500/30 px-3 py-3 text-xs text-rose-600 disabled:opacity-40">{busy==="delete"?t("正在删除…","Deleting…"):t("撤销并删除","Revoke & delete")}</button></div>:<p className="mt-3 text-xs leading-6 opacity-55">{vaultState==="login"?t("登录场域账户后，才可建立归属于你的加密连接。","Sign in to create an encrypted connection owned by your account."):t("请先部署 BYOK 数据库迁移并配置服务端主密钥。","Deploy the BYOK migration and configure the server master key first.")}</p>}
          {message&&<p className="mt-3 rounded-xl border border-current/10 p-3 text-[11px] leading-5">{message}</p>}
        </div>
      </aside>
    </div>}

    {tab==="build"&&<div className="mt-6 grid gap-4 lg:grid-cols-2">{BUILD_CONNECTORS.map(item=><article key={item.id} className={`rounded-3xl border p-6 ${panel}`}><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] opacity-40">{t(item.roleZh,item.roleEn)}</p><h2 className="mt-2 text-2xl font-semibold">{item.name}</h2></div><span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] text-amber-600">{item.status==="oauth-required"?"OAuth 待接入":"人工配置"}</span></div><ol className="mt-5 space-y-3">{item.stepsZh.map((step,index)=><li key={step} className="flex gap-3 text-sm leading-6"><span className="text-[#7657ff]">0{index+1}</span><span className="opacity-65">{step}</span></li>)}</ol><div className="mt-5 flex gap-2"><a href={item.url} target="_blank" rel="noreferrer" className="rounded-xl bg-[#151515] px-4 py-3 text-xs text-white">{t("打开官方入口 ↗","Open official entry ↗")}</a><a href={item.docs} target="_blank" rel="noreferrer" className="rounded-xl border border-current/15 px-4 py-3 text-xs">{t("权限说明 ↗","Permissions ↗")}</a></div></article>)}</div>}

    {tab==="billing"&&<div className="mt-6 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs uppercase tracking-[.18em] text-[#7657ff]">RMB COST STUDY</p><h2 className="mt-3 text-2xl font-semibold">{t("输入供应商预计成本","Enter provider estimate")}</h2><label className="mt-5 block text-xs opacity-60">{t("供应商成本（人民币）","Provider cost (RMB)")}<input type="number" min="0" step="0.1" value={cost} onChange={e=>setCost(Math.max(0,Number(e.target.value)||0))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-4 py-3 text-xl outline-none"/></label><p className="mt-4 text-[11px] leading-5 opacity-45">{t("这是政策计算器，不是付款页面，也不会调用模型。实际订单必须在供应商实时询价后锁定。","This is a policy calculator, not checkout, and it calls no model. Real orders require a fresh provider quote.")}</p></div><div className="grid gap-4 sm:grid-cols-2"><article className={`rounded-3xl border p-6 ${panel}`}><span className="rounded-full bg-[#7657ff]/10 px-3 py-1 text-xs text-[#7657ff]">平台代理</span><p className="mt-5 text-4xl font-semibold">¥{managed.toFixed(2)}</p><p className="mt-3 text-sm leading-6 opacity-60">{t(`供应商 ¥${cost.toFixed(2)} × 2.0。覆盖导演编排、存储、重试、支付退款风险与平台毛利。`,`Provider ¥${cost.toFixed(2)} × 2.0 for orchestration, storage, retries, payment risk and margin.`)}</p></article><article className={`rounded-3xl border p-6 ${panel}`}><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600">BYOK 推荐</span><p className="mt-5 text-4xl font-semibold">¥{orchestration.toFixed(2)}</p><p className="mt-3 text-sm leading-6 opacity-60">{t(`供应商 ¥${cost.toFixed(2)} 由用户直接支付；SASI 仅收约 0.2×（最低 ¥0.50）的导演编排费，订阅套餐可包含。`,`The user pays provider ¥${cost.toFixed(2)} directly; SASI charges about 0.2× (min ¥0.50) orchestration, potentially included in a plan.`)}</p></article></div></div>}

    {tab==="training"&&<div className="mt-6"><div className={`rounded-3xl border p-6 ${panel}`}><p className="text-xs uppercase tracking-[.18em] text-[#7657ff]">CANGXUAN TRAINING PATH</p><h2 className="mt-3 text-2xl font-semibold">{t("不拿厂商私有训练集，训练自己的导演能力","Train proprietary directing intelligence—not on vendors’ private datasets")}</h2><div className="mt-5 grid gap-3 md:grid-cols-4">{[["01","结构化知识","导演规则与可检索知识库"],["02","许可样本","故事→人物→分镜配对"],["03","偏好评分","基于明确同意的反馈"],["04","专项微调","编剧、分镜和评分小模型"]].map(([n,title,note])=><div key={n} className="rounded-2xl border border-current/10 p-4"><span className="text-xs text-[#7657ff]">{n}</span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 opacity-50">{note}</p></div>)}</div></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{TRAINING_SOURCES.map(source=><article key={source.name} className={`rounded-3xl border p-5 ${panel}`}><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{source.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] ${source.state==="preferred"?"bg-emerald-500/10 text-emerald-600":source.state==="research"?"bg-slate-500/10":"bg-amber-500/10 text-amber-600"}`}>{source.state==="preferred"?"优先":source.state==="research"?"研究限定":"逐项核验"}</span></div><p className="mt-2 text-[11px] uppercase tracking-[.12em] opacity-40">{source.license}</p><p className="mt-4 text-xs leading-6 opacity-60">{source.useZh}</p><a href={source.url} target={source.url.startsWith("http")?"_blank":undefined} rel={source.url.startsWith("http")?"noreferrer":undefined} className="mt-4 inline-block text-xs text-[#7657ff]">{t("查看来源与许可 ↗","Review source & license ↗")}</a></article>)}</div><p className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/[.06] p-4 text-xs leading-6 text-rose-700">{t("禁止项：抓取或购买来源不明的厂商训练数据、默认把用户作品用于训练、仅凭“可下载”就判断可商用。每个素材都必须保存来源、许可版本、署名和地域限制。","Prohibited: sourcing opaque vendor training data, training on user work by default, or treating downloadable as commercially licensed. Preserve provenance, license version, attribution and territory for every asset.")}</p></div>}
  </section>;
}
