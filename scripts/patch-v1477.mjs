import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function ensureImport(path,anchor,line){
  let s=read(path);
  if(s.includes(line)){console.log(`ALREADY import ${path}`);return}
  if(!s.includes(anchor)){console.error(`MISS import anchor :: ${path}`);fail.push(`import ${path}`);return}
  s=s.replace(anchor,`${anchor}\n${line}`);
  save(path,s);console.log(`PASS import ${path}`);
}
function replaceOnce(path,before,after,name){
  let s=read(path);
  if(s.includes(after)){console.log(`ALREADY ${name}`);return}
  if(!s.includes(before)){console.error(`MISS ${name} :: ${path}`);fail.push(name);return}
  s=s.replace(before,after); save(path,s); console.log(`PASS ${name}`);
}
function appendCss(path,marker,css){
  let s=read(path);
  if(s.includes(marker)){console.log(`ALREADY ${marker}`);return}
  save(path,`${s}\n\n${marker}\n${css}\n`);console.log(`PASS ${marker}`);
}

// universal tool back button
ensureImport("components/tools/ToolShell.tsx", '"use client";', 'import Link from "next/link";');
replaceOnce(
  "components/tools/ToolShell.tsx",
  ' return <main className="pt-16 lg:pt-8"><section className="px-6 py-12 sm:py-16"><div className="mx-auto max-w-3xl">\n  <p className="font-display text-sm uppercase tracking-widest2 text-lattice">{t("灵犀场 · 在线工具","LINGXIFIELD · Tools")}</p>',
  ' return <main className="pt-16 lg:pt-8"><section className="px-6 py-12 sm:py-16"><div className="mx-auto max-w-3xl">\n  <Link href="/tools" className="lx-tool-back">← {t("返回实用工具","Back to tools")}</Link>\n  <p className="mt-6 font-display text-sm uppercase tracking-widest2 text-lattice">{t("灵犀场 · 在线工具","LINGXIFIELD · Tools")}</p>',
  'ToolShell back button'
);
ensureImport("lib/tool-shell-i18n.ts", 'const COPY:Record<string,Record<LingxiLang,string>>={', '');
{
 let s=read("lib/tool-shell-i18n.ts");
 const needle='const COPY:Record<string,Record<LingxiLang,string>>={';
 const add='\n  "返回实用工具":{"zh":"返回实用工具","en":"Back to tools","ja":"ツール一覧へ戻る","ko":"도구로 돌아가기","fr":"Retour aux outils","de":"Zurück zu den Werkzeugen","es":"Volver a herramientas","pt":"Voltar às ferramentas","ar":"العودة إلى الأدوات"},';
 if(!s.includes('"返回实用工具":')){
   if(!s.includes(needle)){console.error('MISS tool shell i18n anchor');fail.push('tool shell i18n anchor')}
   else { s=s.replace(needle,needle+add); save("lib/tool-shell-i18n.ts",s); console.log("PASS tool shell i18n") }
 }
}

// product center icon unification
ensureImport("app/products/ProductCatalogClient.tsx", 'import {useLingxiLang} from "@/lib/lingxi-i18n";', 'import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";');
{
 const p="app/products/ProductCatalogClient.tsx"; let s=read(p);
 s=s.replace('{href:"/sasi",icon:"✦",','{href:"/sasi",icon:"sasi" as LingxiIconName,')
    .replace('{href:"/tools",icon:"🛠️",','{href:"/tools",icon:"tools" as LingxiIconName,')
    .replace('{href:"/ai-knowledge",icon:"📚",','{href:"/ai-knowledge",icon:"book" as LingxiIconName,')
    .replace('{href:"/ai-learning",icon:"🧠",','{href:"/ai-learning",icon:"learning" as LingxiIconName,')
    .replace('{href:"/ai-research",icon:"🔬",','{href:"/ai-research",icon:"research" as LingxiIconName,');
 s=s.replace('<span className="lx-v143-icon">{item.icon}</span>','<LingxiMiniIcon name={item.icon} size="card" className="lx-v143-icon"/>');
 s=s.replace('<span className="lx-v143-orbit">◌</span>','<LingxiMiniIcon name="products" size="title" className="lx-v143-orbit"/>');
 s=s.replace('<Link href="/ai-wallet"><span className="lx-v143-icon">💠</span>','<Link href="/ai-wallet"><LingxiMiniIcon name="wallet" size="card" className="lx-v143-icon"/>');
 s=s.replace('<Link href="/account/withdrawals"><span className="lx-v143-icon">↩</span>','<Link href="/account/withdrawals"><LingxiMiniIcon name="refund" size="card" className="lx-v143-icon"/>');
 save(p,s); console.log('PASS product center shared icons');
}

// wallet + account subpages
ensureImport("components/WalletHeroCopy.tsx", 'import LxText from "@/components/LxText";', 'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');
replaceOnce("components/WalletHeroCopy.tsx", '    <p className="lx11-kicker"><LxText zh="AI 余额"', '    <div className="lx-page-title-line"><LingxiMiniIcon name="wallet" size="title"/><p className="lx11-kicker"><LxText zh="AI 余额"', 'wallet title line start');
replaceOnce("components/WalletHeroCopy.tsx", ' ar="رصيد الذكاء الاصطناعي"/></p>\n    <h1 className="lx11-title">', ' ar="رصيد الذكاء الاصطناعي"/></p></div>\n    <h1 className="lx11-title">', 'wallet title line end');

ensureImport("app/account/orders/page.tsx", 'import ToolOrderRecoveryButton from "@/components/tools/ToolOrderRecoveryButton";', 'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');
replaceOnce("app/account/orders/page.tsx",
  '<div><p className="lx11-kicker"><Bi zh="账户" en="Account"/></p><h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]"><Bi zh="订单与使用记录" en="Paid Tasks"/></h1></div>',
  '<div><div className="lx-page-title-line"><LingxiMiniIcon name="orders" size="title"/><p className="lx11-kicker"><Bi zh="账户" en="Account"/></p></div><h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]"><Bi zh="订单与使用记录" en="Paid Tasks"/></h1></div>',
  'orders title icon'
);

ensureImport("app/account/withdrawals/page.tsx", 'import BalanceWithdrawalPanel from "@/components/BalanceWithdrawalPanel";', 'import Link from "next/link";\nimport LingxiMiniIcon from "@/components/LingxiMiniIcon";');
replaceOnce("app/account/withdrawals/page.tsx",
  '  return <><Nav/><main className="mx-auto max-w-3xl px-6 py-20">\n    <p className="text-sm tracking-[.18em] opacity-60">灵犀场 · 我的账户</p>\n    <h1 className="mt-3 text-3xl font-semibold">余额提现</h1>',
  '  return <><Nav/><main className="mx-auto max-w-3xl px-6 py-20">\n    <div className="flex items-start justify-between gap-4 lx-header-inline-stack"><div><div className="lx-page-title-line"><LingxiMiniIcon name="refund" size="title"/><p className="text-sm tracking-[.18em] opacity-60">灵犀场 · 我的账户</p></div>\n    <h1 className="mt-3 text-3xl font-semibold">余额提现</h1></div><Link href="/account" className="lx-tool-back">← 返回账户</Link></div>',
  'withdrawals heading'
);

ensureImport("app/refunds/page.tsx", 'import Bi from "@/components/Bi";', 'import LingxiMiniIcon from "@/components/LingxiMiniIcon";');
replaceOnce("app/refunds/page.tsx",
  '<h1 className="font-display text-4xl font-light text-[var(--lx-ink)]"><Bi zh="退款与结算" en="Refunds & Settlement"/></h1>',
  '<div className="lx-page-title-line"><LingxiMiniIcon name="refund" size="title"/><h1 className="font-display text-4xl font-light text-[var(--lx-ink)]"><Bi zh="退款与结算" en="Refunds & Settlement"/></h1></div>',
  'refunds title icon'
);

// special tools
ensureImport("components/tools/TempMailWorkbench.tsx", 'import {privacyText} from "@/lib/privacy-tools-i18n";', 'import Link from "next/link";\nimport LingxiMiniIcon from "@/components/LingxiMiniIcon";');
replaceOnce("components/tools/TempMailWorkbench.tsx",
  ' return <div className="mx-auto max-w-3xl space-y-5">\n  <section className="rounded-3xl border border-slate-200 bg-white p-6">\n   <h1 className="text-3xl font-semibold text-slate-950">{t("tempTitle")}</h1>',
  ' return <div className="mx-auto max-w-3xl space-y-5">\n  <Link href="/tools" className="lx-tool-back">← {lang==="zh"?"返回实用工具":"Back to tools"}</Link>\n  <section className="rounded-3xl border border-slate-200 bg-white p-6 lx-tool-panel-shell">\n   <div className="lx-special-tool-title"><LingxiMiniIcon name="mail" size="title"/><h1 className="text-3xl font-semibold text-slate-950">{t("tempTitle")}</h1></div>',
  'temp mail icon and back'
);

ensureImport("components/tools/BurnAfterReadWorkbench.tsx", 'import {privacyText} from "@/lib/privacy-tools-i18n";', 'import Link from "next/link";\nimport LingxiMiniIcon from "@/components/LingxiMiniIcon";');
replaceOnce("components/tools/BurnAfterReadWorkbench.tsx",
  ' return <div className="mx-auto max-w-3xl space-y-5">\n  <section className="rounded-3xl border border-slate-200 bg-white p-6"><h1 className="text-3xl font-semibold text-slate-950">{t("burnTitle")}</h1>',
  ' return <div className="mx-auto max-w-3xl space-y-5">\n  <Link href="/tools" className="lx-tool-back">← {lang==="zh"?"返回实用工具":"Back to tools"}</Link>\n  <section className="rounded-3xl border border-slate-200 bg-white p-6 lx-tool-panel-shell"><div className="lx-special-tool-title"><LingxiMiniIcon name="burn" size="title"/><h1 className="text-3xl font-semibold text-slate-950">{t("burnTitle")}</h1></div>',
  'burn icon and back'
);

appendCss("app/globals.css","/* V14.77 full visual rebuild */",`
body{font-size:16px;font-weight:500}
.lx-mini-icon{position:relative;display:inline-grid;place-items:center;flex:0 0 auto;border-radius:15px;border:1px solid rgba(73,91,124,.08);box-shadow:0 12px 26px rgba(77,92,125,.10),inset 0 1px 0 rgba(255,255,255,.88);font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui,sans-serif;line-height:1;overflow:hidden;vertical-align:middle}
.lx-mini-icon:after{content:"";position:absolute;inset:1px 1px auto auto;width:54%;height:46%;border-radius:0 14px 0 18px;background:linear-gradient(180deg,rgba(255,255,255,.58),rgba(255,255,255,0));pointer-events:none}
.lx-mini-icon.is-text .lx-mini-glyph{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-weight:800;letter-spacing:-.02em}
.lx-mini-glyph{display:block;transform:translateY(.5px);filter:saturate(1.12)}
.lx-mini-badge{position:absolute;right:3px;bottom:3px;display:grid;place-items:center;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#ff5f7d;color:#fff;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:10px;font-weight:800;box-shadow:0 4px 10px rgba(255,87,122,.28)}
.lx-mini-icon-nav{width:30px;height:30px;border-radius:10px;font-size:15px}
.lx-mini-icon-title{width:40px;height:40px;border-radius:13px;font-size:22px}
.lx-mini-icon-card{width:52px;height:52px;border-radius:16px;font-size:28px}
.lx-mini-icon-tiny{width:24px;height:24px;border-radius:8px;font-size:13px}
.lx-mini-tone-gold{background:linear-gradient(160deg,#fff4b8 0%,#ffd77a 100%)}
.lx-mini-tone-sky{background:linear-gradient(160deg,#dff3ff 0%,#8fd4ff 100%)}
.lx-mini-tone-violet{background:linear-gradient(160deg,#f1e0ff 0%,#c79cff 100%)}
.lx-mini-tone-sasi{background:linear-gradient(160deg,#f0dbff 0%,#9a72ff 100%)}
.lx-mini-tone-amber{background:linear-gradient(160deg,#ffeabf 0%,#ffbf5d 100%)}
.lx-mini-tone-indigo{background:linear-gradient(160deg,#e5e6ff 0%,#aab2ff 100%)}
.lx-mini-tone-book{background:linear-gradient(160deg,#e8f5ff 0%,#ffd98c 100%)}
.lx-mini-tone-research{background:linear-gradient(160deg,#daf8ff 0%,#aab8ff 100%)}
.lx-mini-tone-cyan{background:linear-gradient(160deg,#dbfbff 0%,#8ee8ff 100%)}
.lx-mini-tone-slate{background:linear-gradient(160deg,#f6f7fb 0%,#dce1ee 100%)}
.lx-mini-tone-rose{background:linear-gradient(160deg,#ffe6ef 0%,#ff9dc2 100%)}
.lx-mini-tone-fire{background:linear-gradient(160deg,#ffe4c5 0%,#ff9aa3 100%)}
.lx-mini-tone-image{background:linear-gradient(160deg,#ffe8c8 0%,#a7d7ff 100%)}
.lx-mini-tone-green{background:linear-gradient(160deg,#e7ffd8 0%,#9fe28b 100%)}
.lx-mini-tone-paper{background:linear-gradient(160deg,#f9f6ff 0%,#e3dbff 100%)}
.lx-mini-tone-pdf{background:linear-gradient(160deg,#ffe0e4 0%,#ff8096 100%)}
.lx-mini-tone-blue{background:linear-gradient(160deg,#e7f0ff 0%,#99bcff 100%)}
.lx-mini-tone-ocr{background:linear-gradient(160deg,#ffe8ef 0%,#ff9cae 100%)}

.lx11-link{min-height:44px!important;padding:0 12px!important;border-radius:14px!important;font-size:15px!important;font-weight:650!important}
.lx11-link.is-active{background:linear-gradient(180deg,#eff4ff 0%,#e8f0ff 100%)!important;box-shadow:inset 0 0 0 1px rgba(118,146,255,.14)}
.lx11-link .lx-mini-icon{margin-right:2px}
.lx11-new-task{display:flex!important;align-items:center!important;gap:9px!important;min-height:48px!important;font-size:15px!important;font-weight:750!important;border-radius:14px!important}
.lx11-group-title{font-size:12.5px!important;font-weight:700!important;letter-spacing:.02em!important}
.lx11-search input,.lx-top-search input{font-size:15px!important}

.lx-home-v143-grid .lx-mini-icon-card,.lx-v143-product-grid .lx-mini-icon-card,.lx-tools-v124-card .lx-mini-icon-card{margin-bottom:14px}
.lx-home-v143-grid h3,.lx-v143-product-card h3{font-size:19px!important;font-weight:780!important;letter-spacing:-.02em!important}
.lx-home-v143-grid p,.lx-v143-product-card p{font-size:14.5px!important;line-height:1.75!important;color:var(--lx-muted)!important}
.lx-v143-product-hero,.lx-home-v143-hero{position:relative;overflow:hidden;border-radius:26px;padding:34px 38px!important;background:linear-gradient(135deg,rgba(249,251,255,.97),rgba(252,247,255,.95))!important;box-shadow:0 12px 28px rgba(56,70,100,.06)!important}
.lx-v143-product-hero h1,.lx-home-v143-hero h1{font-size:clamp(2.05rem,3.2vw,2.82rem)!important;font-weight:790!important;line-height:1.14!important;letter-spacing:-.04em!important}
.lx-v143-product-hero>div>p:last-child,.lx-home-v143-hero>div>p:last-child{font-size:15px!important;line-height:1.85!important;max-width:760px!important}
.lx-v143-orbit{position:absolute!important;right:30px!important;top:28px!important;width:42px!important;height:42px!important}
.lx-v143-product-grid{gap:16px!important}.lx-v143-product-card{min-height:208px!important;border-radius:22px!important;padding:22px!important;box-shadow:0 9px 26px rgba(56,70,100,.05)!important}
.lx-v143-wallet-grid>a{border-radius:18px!important;padding:18px!important}.lx-v143-wallet-grid>a b{font-size:16px!important}.lx-v143-wallet-grid>a p{font-size:13.5px!important;line-height:1.68!important}

.lx-tools-v124 .lx11-wrap{max-width:1240px!important}
.lx-tools-v124 .lx11-tools-hero{padding:28px 0 20px!important}
.lx-tools-v124 .lx11-tools-hero h1{font-size:clamp(2.25rem,3vw,3rem)!important;font-weight:800!important;letter-spacing:-.04em!important;line-height:1.08!important}
.lx-tools-v124 .lx11-tools-hero p{max-width:900px!important;margin-top:12px!important;font-size:15.5px!important;line-height:1.82!important;font-weight:550!important}
.lx-tools-v124-search{margin-top:6px!important}
.lx-tools-v124 .lx11-tool-group{margin-top:22px!important}
.lx-tools-v124-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-auto-rows:auto!important;align-items:stretch!important;gap:16px!important}
.lx-tools-v124-card{position:relative!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;width:auto!important;min-width:0!important;height:auto!important;min-height:170px!important;padding:18px 18px 16px!important;overflow:hidden!important;border:1px solid rgba(38,55,80,.10)!important;border-radius:20px!important;background:rgba(255,255,255,.94)!important;box-shadow:0 10px 26px rgba(42,58,82,.05)!important}
.lx-tools-v124-card:hover{transform:translateY(-2px)!important;border-color:rgba(104,112,220,.22)!important;box-shadow:0 16px 32px rgba(52,69,100,.10)!important}
.lx-tools-v124-card .lx11-tool-cover{width:52px!important;min-width:52px!important;max-width:52px!important;height:52px!important;min-height:52px!important;max-height:52px!important;margin:0 0 14px 0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
.lx-tools-v124-card .lx11-tool-copy{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;width:100%!important;min-width:0!important;padding:0!important;margin:0!important;background:transparent!important}
.lx-tools-v124-card .lx11-tool-title-row{display:block!important;padding:0!important;margin:0 0 4px!important}
.lx-tools-v124-card .lx11-tool-title-row h3{margin:0!important;padding:0!important;color:var(--lx-ink)!important;font-size:17.5px!important;font-weight:800!important;line-height:1.38!important;letter-spacing:-.015em!important;overflow-wrap:anywhere!important}
.lx-tools-v124-card .lx-tools-v124-desc{margin:7px 0 13px!important;color:var(--lx-muted)!important;font-size:14px!important;font-weight:540!important;line-height:1.66!important;display:block!important;white-space:normal!important;overflow-wrap:anywhere!important}
.lx-tool-kind{display:inline-flex!important;align-items:center!important;align-self:flex-start!important;margin-top:auto!important;padding:5px 11px!important;border-radius:999px!important;font-size:11.5px!important;font-weight:800!important;line-height:1.2!important}
.lx-tool-kind-image{background:#fff0f4!important;color:#d54e78!important}.lx-tool-kind-pdf{background:#fff0f3!important;color:#df426a!important}.lx-tool-kind-media,.lx-tool-kind-subtitle{background:#edf4ff!important;color:#3471cf!important}.lx-tool-kind-table{background:#eafbe4!important;color:#4d9d3f!important}.lx-tool-kind-privacy{background:#eef8ff!important;color:#3482bd!important}.lx-tool-kind-recognition{background:#effbea!important;color:#4b9b49!important}.lx-tool-kind-file{background:#f3efff!important;color:#765ac5!important}
.lx-tools-v124-card .lx-tool-card-arrow{position:absolute!important;right:16px!important;top:18px!important;display:grid!important;place-items:center!important;width:32px!important;height:32px!important;border-radius:50%!important;background:#f1f3ff!important;color:#6471d8!important;font-size:18px!important;font-weight:800!important}

.lx-page-title-line{display:flex;align-items:center;gap:12px;margin-bottom:4px}
.lx-page-title-line h1,.lx-page-title-line p{margin:0!important}
.lx11-wallet-page .lx11-title{font-size:clamp(2rem,3vw,2.7rem)!important;font-weight:790!important;line-height:1.16!important}
.lx11-wallet-page .lx11-lead{font-size:15px!important;line-height:1.85!important}
.lx11-wallet-overview,.lx11-wallet-section,.lx-tool-panel-shell{border-radius:22px!important;box-shadow:0 10px 28px rgba(56,70,100,.05)!important}
.lx11-wallet-balance strong{font-size:2.25rem!important}
.lx11-topup-grid button{min-height:70px!important;border-radius:16px!important;font-size:15px!important}
.lx-special-tool-title{display:flex;align-items:center;gap:13px;margin-bottom:8px}
.lx-special-tool-title h1{margin:0!important;font-size:clamp(1.85rem,2.8vw,2.45rem)!important;line-height:1.14!important;font-weight:790!important}
.lx-tool-back{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 15px;border:1px solid rgba(100,110,150,.16);border-radius:999px;background:rgba(255,255,255,.86);color:var(--lx-ink);font-size:14px;font-weight:700;transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease;box-shadow:0 8px 18px rgba(54,67,90,.05)}
.lx-tool-back:hover{transform:translateX(-2px);border-color:rgba(100,110,180,.32);box-shadow:0 10px 20px rgba(54,67,90,.08)}
.lx-header-inline-stack{align-items:flex-start!important}

.sasi-connect-tabs{gap:8px!important}.sasi-connect-tabs button{min-height:44px!important;padding:9px 13px!important;border-radius:13px!important;font-size:14px!important;font-weight:700!important}
.sasi-connect-tabs button>span{display:inline-grid!important;place-items:center!important;width:26px!important;height:26px!important;border-radius:8px!important;background:rgba(255,255,255,.72)!important;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif!important;font-size:15px!important}
.sasi-connect-provider-grid{gap:14px!important}.sasi-connect-provider-grid>article{border-radius:18px!important;padding:16px!important;box-shadow:0 6px 18px rgba(48,62,88,.035)!important}.sasi-connect-provider-copy b{font-size:15.5px!important}.sasi-connect-provider-grid>article>p{font-size:13.5px!important;line-height:1.65!important}

@media(max-width:1180px){.lx-tools-v124-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:840px){.lx-tools-v124-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.lx-tools-v124-card{min-height:158px!important}.lx-header-inline-stack{flex-direction:column!important}.lx-v143-product-hero,.lx-home-v143-hero{padding:26px 22px!important}}
@media(max-width:560px){.lx-tools-v124-grid{grid-template-columns:1fr!important}.lx-tools-v124-card{min-height:144px!important;padding:16px!important}.lx-tools-v124-card .lx11-tool-title-row h3{font-size:16.5px!important}.lx-tools-v124-card .lx-tools-v124-desc{font-size:13.5px!important}.lx-v143-orbit{right:18px!important;top:18px!important;width:36px!important;height:36px!important}}
`);

if(fail.length){console.error(`V14.77_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.77_PATCH=PASS");
