import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function ensureImport(p,anchor,line){
  let s=read(p);
  if(s.includes(line)){console.log(`ALREADY import ${p}`);return}
  if(!s.includes(anchor)){console.error(`MISS import ${p}`);fail.push(`import ${p}`);return}
  s=s.replace(anchor,`${anchor}\n${line}`);save(p,s);console.log(`PASS import ${p}`);
}
function rep(p,a,b,n){
  let s=read(p);
  if(s.includes(b)){console.log(`ALREADY ${n}`);return}
  if(!s.includes(a)){console.error(`MISS ${n} :: ${p}`);fail.push(n);return}
  s=s.replace(a,b);save(p,s);console.log(`PASS ${n}`);
}

// Knowledge workspace: keep product meaning, remove browser/local implementation prose from visible UI.
ensureImport("components/KnowledgeWorkspace.tsx",
'import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";',
'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');

{
 const p="components/KnowledgeWorkspace.tsx";let s=read(p);
 const replacements=[
  [
   'privacy:c("资料默认保存在本机浏览器；本地先检索原文。只有你点“基于原文回答”时，当前命中的证据片段才会发送给 AI。PDF、TXT、Markdown 与图片 OCR 已可直接加入。","Sources stay in this browser by default and are searched locally first. Only when you choose “Answer from source text” are matched evidence snippets sent to AI. PDF, TXT, Markdown and image OCR can be added directly."',
   'privacy:c("资料按原文建立可追溯的私人资料库。提问时只使用与当前问题相关的内容，并保留出处。","Your sources become a private, traceable library. Questions use only content relevant to the current request, with source references preserved."'
  ],
  [
   'myLocal:c("我的本机资料","My local sources","ローカル資料","내 로컬 자료","Mes sources locales","Meine lokalen Quellen","Mis fuentes locales","Minhas fontes locais","مصادري المحلية")',
   'myLocal:c("我的资料","My sources","マイ資料","내 자료","Mes sources","Meine Quellen","Mis fuentes","Minhas fontes","مصادري")'
  ],
  [
   'saved:c("资料已保存在这个浏览器。现在可以直接提问。","Saved in this browser. You can ask questions now."',
   'saved:c("资料已加入。现在可以直接提问。","Source added. You can ask questions now."'
  ],
  [
   'pdfNote:c("PDF 会保留页码定位；图片会先在浏览器 OCR。","PDF page references are preserved; images are OCRed in the browser first."',
   'pdfNote:c("支持 PDF、EPUB、Word、PPTX、Excel、TXT、代码与图片；PDF 保留页码，图片可识别文字。","Supports PDF, EPUB, Word, PPTX, Excel, TXT, code and images; PDF page references are preserved and image text can be recognized."'
  ],
  [
   'aiPrivacy:c("AI 不会读取你的整个浏览器资料库，只发送本次问题命中的原文片段。","AI does not read your entire browser library; only source snippets matched to this question are sent."',
   'aiPrivacy:c("回答只使用与本次问题相关的资料内容，并保留原文证据。","Answers use only source content relevant to this question and preserve source evidence."'
  ],
  [
   'noEvidence:c("本地没有找到足够相关的原文。换一个更接近资料原词的问题，或继续加入资料。","Not enough relevant source text was found locally. Try wording the question closer to the source, or add more material."',
   'noEvidence:c("没有找到足够相关的原文。换一个更接近资料原词的问题，或继续加入资料。","Not enough relevant source text was found. Try wording the question closer to the source, or add more material."'
  ]
 ];
 for(const [a,b] of replacements){
   if(s.includes(a))s=s.replace(a,b);
   else if(!s.includes(b)){console.error(`MISS knowledge copy ${a.slice(0,50)}`);fail.push("knowledge copy")}
 }

 s=s.replace('return <section className="mt-8 space-y-6">','return <section className="mt-8 space-y-6 lx-knowledge-workspace">');
 s=s.replace('<div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">','<div className="lx-knowledge-privacy rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">');
 s=s.replace('<section className="rounded-3xl border border-slate-200 bg-white p-6">\n        <h2 className="text-xl font-semibold text-slate-950">{tr(lang,"add")}{heading}</h2>',
   '<section className="lx-knowledge-panel rounded-3xl border border-slate-200 bg-white p-6">\n        <div className="lx-knowledge-panel-title"><LingxiMiniIcon name={mode==="research"?"research":mode==="learning"?"learning":"book"} size="title"/><h2 className="text-xl font-semibold text-slate-950">{tr(lang,"add")}{heading}</h2></div>');
 s=s.replace('<section className="rounded-3xl border border-slate-200 bg-white p-6">\n        <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">{tr(lang,"askSource")}</p>',
   '<section className="lx-knowledge-panel rounded-3xl border border-slate-200 bg-white p-6">\n        <div className="lx-knowledge-panel-title"><LingxiMiniIcon name="sparkles" size="title"/><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-600">{tr(lang,"askSource")}</p>');
 s=s.replace('<h2 className="mt-2 text-2xl font-semibold text-slate-950">{tr(lang,"askBatch")}</h2>\n        <textarea value={question}',
   '<h2 className="mt-1 text-2xl font-semibold text-slate-950">{tr(lang,"askBatch")}</h2></div></div>\n        <textarea value={question}');
 s=s.replace('<section className="rounded-3xl border border-slate-200 bg-white p-6">\n      <div className="flex flex-wrap items-center justify-between gap-3">',
   '<section className="lx-knowledge-panel rounded-3xl border border-slate-200 bg-white p-6">\n      <div className="flex flex-wrap items-center justify-between gap-3">');
 save(p,s);console.log("PASS knowledge workspace copy + visual");
}

// Research page: remove implementation-level "local/snippets sent" wording.
{
 const p="app/ai-research/page.tsx";let s=read(p);
 s=s.replace(
  'zh="把论文、研究笔记和原始资料放在同一处。先在本地命中证据，再把相关片段交给 AI，而不是把整份资料无差别发送。"',
  'zh="把论文、研究笔记和原始资料放在同一处。提问时围绕相关原文证据展开，比较观点、追溯出处并继续研究。"'
 );
 s=s.replace(
  'en="Keep papers, notes and primary sources together. Relevant evidence is matched locally before selected snippets are sent to AI."',
  'en="Keep papers, notes and primary sources together. Questions stay anchored to relevant source evidence for comparison, traceability and continued research."'
 );
 save(p,s);console.log("PASS research user-facing lead");
}

// Wallet: add explicit visual anchors, preserve payment and pricing truth.
ensureImport("components/AiWalletPanel.tsx",
'import {useLingxiLang} from "@/lib/lingxi-i18n";',
'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');
{
 const p="components/AiWalletPanel.tsx";let s=read(p);
 s=s.replace('<div className="lx11-wallet-overview"><div className="lx11-wallet-balance"><span>{zh?"人民币余额":"CNY balance"}</span>',
   '<div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"人民币余额":"CNY balance"}</span>');
 s=s.replace('</strong><p>{zh?"微信、支付宝充值的余额。":"Balance funded through WeChat Pay or Alipay."}</p></div></div>',
   '</strong><p>{zh?"微信、支付宝充值的余额。":"Balance funded through WeChat Pay or Alipay."}</p></div></div>');
 s=s.replace('<div className="lx11-wallet-overview"><div className="lx11-wallet-balance"><span>{zh?"美元余额":"USD balance"}</span>',
   '<div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"美元余额":"USD balance"}</span>');
 s=s.replace('<section className="lx11-wallet-section">\n      <div className="lx11-wallet-heading">',
   '<section className="lx11-wallet-section lx-wallet-topup-panel">\n      <div className="lx11-wallet-heading">');
 save(p,s);console.log("PASS wallet visual anchors");
}

// Notification: colored visual status, no behavior changes.
ensureImport("components/NotificationBell.tsx",
'import {releaseText} from "@/lib/release-notifications-i18n";',
'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');
{
 const p="components/NotificationBell.tsx";let s=read(p);
 s=s.replace('<button className="lx11-icon-btn lx11-bell" aria-label={t("notifications")} aria-expanded={open} onClick={toggle}><span aria-hidden="true">🔔</span>',
   '<button className="lx11-icon-btn lx11-bell" aria-label={t("notifications")} aria-expanded={open} onClick={toggle}><LingxiMiniIcon name="sparkles" size="tiny"/>');
 s=s.replace('{items.length===0?<p className="lx11-notification-empty">{t("allCaughtUp")}</p>',
   '{items.length===0?<p className="lx11-notification-empty"><span aria-hidden="true">✓</span>{t("allCaughtUp")}</p>');
 save(p,s);console.log("PASS notification visual");
}

// Withdrawal states: visual classes only, keep financial logic untouched.
{
 const p="components/BalanceWithdrawalPanel.tsx";let s=read(p);
 s=s.replace('if(!data)return <div className="rounded-2xl border p-6">{msg||"正在读取可退款余额…"}</div>;',
   'if(!data)return <div className="lx-state-card is-loading rounded-2xl border p-6"><span className="lx-state-dot"/> {msg||"正在读取可退款余额…"}</div>;');
 s=s.replace('{msg&&<p role="status" className="rounded-2xl border p-4 text-sm">{msg}</p>}',
   '{msg&&<p role="status" className="lx-state-card rounded-2xl border p-4 text-sm">{msg}</p>}');
 s=s.replace('{data.orders.length===0&&<p className="rounded-2xl border p-5 text-sm">当前没有可申请提现的已支付余额充值订单。</p>}',
   '{data.orders.length===0&&<p className="lx-state-card is-empty rounded-2xl border p-5 text-sm"><span aria-hidden="true">📂</span> 当前没有可申请提现的已支付余额充值订单。</p>}');
 s=s.replace('{data.withdrawals.length===0&&<p className="rounded-2xl border p-5 text-sm">还没有退款记录。</p>}',
   '{data.withdrawals.length===0&&<p className="lx-state-card is-empty rounded-2xl border p-5 text-sm"><span aria-hidden="true">📂</span> 还没有退款记录。</p>}');
 save(p,s);console.log("PASS withdrawal state visuals");
}

// Final shared visual layer.
{
 const p="app/globals.css";let s=read(p);
 const marker="/* V14.80 knowledge wallet state visual */";
 if(!s.includes(marker))s+=`

${marker}
.lx-knowledge-workspace{font-size:15px}
.lx-knowledge-privacy{
  border-color:rgba(70,110,170,.10)!important;
  background:linear-gradient(135deg,#fbfdff,#f8f8ff)!important;
  color:#52647d!important;
  box-shadow:0 8px 22px rgba(53,70,98,.035)!important;
}
.lx-knowledge-panel{
  border-radius:22px!important;
  border-color:rgba(67,84,112,.11)!important;
  box-shadow:0 12px 30px rgba(45,63,92,.05)!important;
}
.lx-knowledge-panel-title{display:flex;align-items:center;gap:13px}
.lx-knowledge-panel-title h2{margin:0!important;font-size:20px!important;font-weight:780!important;letter-spacing:-.015em!important}
.lx-knowledge-panel label{border-radius:18px!important;background:linear-gradient(180deg,#fbfdff,#f7f9fc)!important}
.lx-knowledge-panel textarea,.lx-knowledge-panel input{font-size:14.5px!important;line-height:1.65!important}
.lx-knowledge-modebar{gap:8px!important}
.lx-knowledge-modebar button{border-radius:14px!important;padding:10px 12px!important}
.lx-knowledge-modebar button b{font-size:14px!important}
.lx-knowledge-modebar button span{font-size:11.5px!important}
.lx-knowledge-answer{border-radius:20px!important;box-shadow:0 10px 26px rgba(45,63,92,.045)!important}
.lx-knowledge-answer-body{font-size:14.5px!important;line-height:1.8!important}
.lx-knowledge-recharge{font-weight:750!important}

.lx-wallet-currency-card{
  display:grid!important;
  grid-template-columns:40px minmax(0,1fr)!important;
  align-items:center!important;
  gap:14px!important;
}
.lx-wallet-currency-card>.lx-mini-icon{align-self:start!important}
.lx-wallet-topup-panel{box-shadow:0 12px 30px rgba(45,63,92,.05)!important}
.lx11-wallet-heading h2{font-size:23px!important;font-weight:790!important;letter-spacing:-.02em!important}
.lx11-wallet-heading p{font-size:13.5px!important;line-height:1.7!important}
.lx11-topup-grid button{font-weight:700!important}
.lx11-topup-action{border-radius:16px!important}
.lx11-topup-action>a{font-weight:750!important}

.lx11-notification-panel{border-radius:18px!important;box-shadow:0 18px 48px rgba(38,53,78,.14)!important}
.lx11-notification-panel header{font-size:15px!important}
.lx11-notification-list>a,.lx11-notification-list>article{padding:13px 14px!important}
.lx11-notification-list strong{font-size:14px!important}
.lx11-notification-list p{font-size:12.5px!important;line-height:1.55!important}
.lx11-notification-empty{display:flex!important;align-items:center!important;gap:8px!important;font-size:13.5px!important}
.lx11-notification-empty>span{display:grid;width:22px;height:22px;place-items:center;border-radius:50%;background:#e7fbf3;color:#13a46f;font-weight:800}

.lx-state-card{display:flex;align-items:center;gap:9px;border-color:rgba(74,91,120,.12)!important;background:#fff!important}
.lx-state-card.is-loading{color:#53647a!important}
.lx-state-card.is-empty{color:#65758a!important}
.lx-state-dot{width:10px;height:10px;border:2px solid #8ba4d0;border-top-color:#5a70d6;border-radius:50%;animation:lx-spin .8s linear infinite}
@keyframes lx-spin{to{transform:rotate(360deg)}}

@media(max-width:760px){
  .lx-knowledge-workspace>.grid{grid-template-columns:1fr!important}
  .lx-wallet-currency-card{grid-template-columns:36px minmax(0,1fr)!important}
}
`;
 save(p,s);console.log("PASS knowledge/wallet/state CSS");
}

if(fail.length){console.error(`V14.80_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.80_PATCH=PASS");
