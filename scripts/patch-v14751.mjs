import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function need(ok,n){if(!ok){console.error(`MISS ${n}`);fail.push(n)}else console.log(`PASS ${n}`)}

{
 const p="components/Nav.tsx";let s=read(p);
 if(!s.includes('LingxiMiniIcon')){
   s=s.replace('import NotificationBell from "@/components/NotificationBell";','import NotificationBell from "@/components/NotificationBell";\nimport LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";');
 }
 s=s.replace('const groups: { href: string; key: K; icon: string }[][] = [','const groups: { href: string; key: K; icon: LingxiIconName }[][] = [');
 const swaps={
  '{ href: "/", key: "home", icon: "⌂" }':'{ href: "/", key: "home", icon: "home" }',
  '{ href: "/products", key: "products", icon: "◈" }':'{ href: "/products", key: "products", icon: "products" }',
  '{ href: "/tools", key: "tools", icon: "✦" }':'{ href: "/tools", key: "tools", icon: "tools" }',
  '{ href: "/explore", key: "explore", icon: "⌁" }':'{ href: "/explore", key: "explore", icon: "explore" }',
  '{ href: "/sasi", key: "studio", icon: "◆" }':'{ href: "/sasi", key: "studio", icon: "sasi" }',
  '{ href: "/ai-knowledge", key: "books", icon: "▣" }':'{ href: "/ai-knowledge", key: "books", icon: "book" }',
  '{ href: "/ai-learning", key: "learning", icon: "◫" }':'{ href: "/ai-learning", key: "learning", icon: "learning" }',
  '{ href: "/ai-research", key: "research", icon: "⌕" }':'{ href: "/ai-research", key: "research", icon: "research" }',
  '{ href: "/ai-wallet", key: "wallet", icon: "◇" }':'{ href: "/ai-wallet", key: "wallet", icon: "wallet" }',
  '{ href: "/account", key: "myField", icon: "●" }':'{ href: "/account", key: "myField", icon: "account" }'
 };
 for(const [a,b] of Object.entries(swaps))s=s.replace(a,b);
 s=s.replace('<Link className="lx11-new-task" href="/sasi">✦ ＋ {t("newTask")}</Link>','<Link className="lx11-new-task" href="/sasi"><LingxiMiniIcon name="new" size="nav"/> <span>{t("newTask")}</span></Link>');
 s=s.replace('<span aria-hidden="true" className={`lx11-nav-icon lx11-nav-tone-${item.key}`}>{item.icon}</span>','<LingxiMiniIcon name={item.icon} size="nav" className="lx11-nav-icon"/>');
 save(p,s);
 need(s.includes('name={item.icon} size="nav"')&&s.includes('name="new" size="nav"'),"navigation mini icons");
}

{
 const p="components/HomeProblemHub.tsx";let s=read(p);
 if(!s.includes('LingxiMiniIcon')){
   s=s.replace('import {useLingxiLang} from "@/lib/lingxi-i18n";','import {useLingxiLang} from "@/lib/lingxi-i18n";\nimport LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";');
 }
 s=s.replace('{href:"/tools",icon:"🛠️",','{href:"/tools",icon:"tools" as LingxiIconName,');
 s=s.replace('{href:"/sasi",icon:"✦",','{href:"/sasi",icon:"sasi" as LingxiIconName,');
 s=s.replace('{href:"/ai-knowledge",icon:"📚",','{href:"/ai-knowledge",icon:"book" as LingxiIconName,');
 s=s.replace('{href:"/ai-learning",icon:"🧠",','{href:"/ai-learning",icon:"learning" as LingxiIconName,');
 s=s.replace('{href:"/ai-research",icon:"🔬",','{href:"/ai-research",icon:"research" as LingxiIconName,');
 s=s.replace('{href:"/products",icon:"◈",','{href:"/products",icon:"products" as LingxiIconName,');
 s=s.replace('<span className="lx-v143-icon" aria-hidden="true">{item.icon}</span>','<LingxiMiniIcon name={item.icon} size="card" className="lx-v143-icon"/>');
 save(p,s);
 need(s.includes('LingxiMiniIcon name={item.icon}'),"home icon system");
}

{
 const p="components/SasiCommandCenter.tsx";let s=read(p);
 if(!s.includes('LingxiMiniIcon')){
   s=s.replace('import {useLingxiLang} from "@/lib/lingxi-i18n";','import {useLingxiLang} from "@/lib/lingxi-i18n";\nimport LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";');
 }
 s=s.replace('mark:"🎬"','mark:"drama" as LingxiIconName')
    .replace('mark:"▣"','mark:"book" as LingxiIconName')
    .replace('mark:"⌕"','mark:"research" as LingxiIconName')
    .replace('mark:"⌁"','mark:"connections" as LingxiIconName')
    .replace('mark:"◎"','mark:"wallet" as LingxiIconName');
 s=s.replace('<span className="text-xl">{card.mark}</span>','<LingxiMiniIcon name={card.mark} size="card"/>');
 save(p,s);
 need(s.includes('LingxiMiniIcon name={card.mark}'),"SASI card icon system");
}

{
 const p="app/account/page.tsx";let s=read(p);
 if(!s.includes('LingxiMiniIcon')){
   s=s.replace('import Bi from "@/components/Bi";','import Bi from "@/components/Bi";\nimport LingxiMiniIcon from "@/components/LingxiMiniIcon";');
 }
 s=s.replace('<span className="lx-v143-icon">◈</span><b><Bi zh="产品中心" en="Product Center"/></b>','<LingxiMiniIcon name="products" size="card"/><b><Bi zh="产品中心" en="Product Center"/></b>');
 s=s.replace('<span className="lx-v143-icon">▤</span><b><Bi zh="订单与使用记录" en="Paid Tasks"/></b>','<LingxiMiniIcon name="orders" size="card"/><b><Bi zh="订单与使用记录" en="Paid Tasks"/></b>');
 s=s.replace('<span className="lx-v143-icon">💠</span><b>AI Balance</b>','<LingxiMiniIcon name="wallet" size="card"/><b>AI Balance</b>');
 s=s.replace('<span className="lx-v143-icon">✦</span><b>SASI</b>','<LingxiMiniIcon name="sasi" size="card"/><b>SASI</b>');
 s=s.replace('<span className="lx-v143-icon">↩</span><b><Bi zh="余额退款" en="Balance refund"/></b>','<LingxiMiniIcon name="refund" size="card"/><b><Bi zh="余额退款" en="Balance refund"/></b>');
 save(p,s);
 need(s.includes('name="products"')&&s.includes('name="refund"'),"account card icon system");
}

for(const [p,anchor,icon] of [
 ["app/ai-knowledge/page.tsx",'<p className="lx10-kicker">',"book"],
 ["app/ai-learning/page.tsx",'<p className="lx10-kicker">',"learning"],
 ["app/ai-research/page.tsx",'<p className="lx10-kicker">',"research"]
]){
 let s=read(p);
 if(!s.includes('LingxiMiniIcon'))s=s.replace('import LxText from "@/components/LxText";','import LxText from "@/components/LxText";\nimport LingxiMiniIcon from "@/components/LingxiMiniIcon";');
 if(s.includes(anchor)&&!s.includes('lx-page-title-icon'))s=s.replace(anchor,`<div className="lx-page-title-line"><LingxiMiniIcon name="${icon}" size="title" className="lx-page-title-icon"/>${anchor}`);
 const close='</p>';
 const idx=s.indexOf(close,s.indexOf('lx-page-title-line'));
 if(idx>=0&&!s.slice(idx,idx+20).includes('</div>'))s=s.slice(0,idx+close.length)+'</div>'+s.slice(idx+close.length);
 save(p,s);
 need(s.includes('lx-page-title-line'),`${p} title icon`);
}

{
 const p="app/sasi/connections/page.tsx";let s=read(p);
 if(!s.includes('LingxiMiniIcon'))s=s.replace('import SasiConnectionsClient from "@/components/SasiConnectionsClient";','import SasiConnectionsClient from "@/components/SasiConnectionsClient";\nimport LingxiMiniIcon from "@/components/LingxiMiniIcon";');
 const old='<p className="text-sm text-[var(--lx-faint)]">SASI · 你的 AI 能力</p>';
 const neu='<div className="lx-page-title-line"><LingxiMiniIcon name="connections" size="title"/><p className="text-sm text-[var(--lx-faint)]">SASI · 你的 AI 能力</p></div>';
 if(s.includes(old))s=s.replace(old,neu);
 save(p,s);need(s.includes('name="connections" size="title"'),"connections page title icon");
}

{
 const p="app/sasi/ConnectionCenter.tsx";let s=read(p);
 const swaps={
  '["models", "模型与 API", "Models & API", "文"]':'["models", "模型与 API", "Models & API", "🤖"]',
  '["media", "图像与视频", "Image & Video", "影"]':'["media", "图像与视频", "Image & Video", "🎬"]',
  '["orchestration", "SASI 编排", "SASI Orchestration", "协"]':'["orchestration", "SASI 编排", "SASI Orchestration", "🪄"]',
  '["build", "开发与部署", "Build & Deploy", "构"]':'["build", "开发与部署", "Build & Deploy", "🌐"]',
  '["security", "安全与密钥", "Security & Keys", "钥"]':'["security", "安全与密钥", "Security & Keys", "🔐"]',
  '["training", "训练资料库", "Training Data", "数"]':'["training", "训练资料库", "Training Data", "📚"]'
 };
 for(const [a,b] of Object.entries(swaps))s=s.replace(a,b);
 save(p,s);need(s.includes('"🤖"')&&s.includes('"🔐"'),"connection tabs vivid icons");
}

{
 const p="app/globals.css";let s=read(p);
 const marker="/* V14.75 Lingxi mini app icon system */";
 if(!s.includes(marker))s+=`

${marker}
.lx-mini-icon{
  flex:0 0 auto;
  display:inline-grid;
  place-items:center;
  border:1px solid rgba(50,64,100,.06);
  color:#25324a;
  font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui,sans-serif;
  line-height:1;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 6px 16px rgba(52,67,102,.09);
  overflow:hidden;
  vertical-align:middle;
}
.lx-mini-icon>span{display:block;transform:translateY(.5px);filter:saturate(1.12)}
.lx-mini-icon-nav{width:30px;height:30px;border-radius:10px;font-size:17px}
.lx-mini-icon-title{width:38px;height:38px;border-radius:12px;font-size:22px}
.lx-mini-icon-card{width:50px;height:50px;border-radius:14px;font-size:28px}
.lx-mini-icon-tiny{width:24px;height:24px;border-radius:8px;font-size:14px}
.lx-mini-tone-gold{background:linear-gradient(145deg,#fff8cf,#ffe8ad)}
.lx-mini-tone-sky{background:linear-gradient(145deg,#eff8ff,#dceeff)}
.lx-mini-tone-violet,.lx-mini-tone-sasi{background:linear-gradient(145deg,#f3eaff,#e2d3ff)}
.lx-mini-tone-sasi{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 20px rgba(119,85,220,.16)}
.lx-mini-tone-amber{background:linear-gradient(145deg,#fff6dd,#ffe6b9)}
.lx-mini-tone-indigo{background:linear-gradient(145deg,#eef0ff,#dfe4ff)}
.lx-mini-tone-book{background:linear-gradient(145deg,#eef8ff,#ffe9bd)}
.lx-mini-tone-research{background:linear-gradient(145deg,#e8f7ff,#e7ddff)}
.lx-mini-tone-cyan{background:linear-gradient(145deg,#e8fbff,#d9f2ff)}
.lx-mini-tone-slate{background:linear-gradient(145deg,#f2f6fa,#e7edf4)}
.lx-mini-tone-rose,.lx-mini-tone-pdf{background:linear-gradient(145deg,#fff0f4,#ffdce5)}
.lx-mini-tone-blue{background:linear-gradient(145deg,#edf5ff,#dceaff)}
.lx-mini-tone-fire{background:linear-gradient(145deg,#fff0df,#ffd7dc)}
.lx-mini-tone-image{background:linear-gradient(145deg,#fff0de,#e7f4ff)}
.lx-mini-tone-green{background:linear-gradient(145deg,#efffe9,#dff8dd)}
.lx-mini-tone-paper{background:linear-gradient(145deg,#f7f7fb,#ececfa)}

.lx11-link{min-height:44px!important;font-size:15px!important;font-weight:600!important}
.lx11-link .lx-mini-icon{margin-right:1px}
.lx11-link.is-active .lx-mini-icon{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 18px rgba(72,92,142,.13)}
.lx11-new-task{display:flex!important;align-items:center!important;gap:9px!important;font-size:15px!important;font-weight:700!important}
.lx11-group-title{font-size:12.5px!important;font-weight:650!important}
.lx11-search input{font-size:15px!important}

.lx-v143-icon{display:inline-grid!important}
.lx-home-v143-grid .lx-mini-icon-card{margin-bottom:14px}
.lx-home-v143-grid h3{font-size:19px!important;font-weight:750!important}
.lx-home-v143-grid p{font-size:14.5px!important;line-height:1.75!important}

.lx-page-title-line{display:flex;align-items:center;gap:12px}
.lx-page-title-line .lx10-kicker{margin:0!important}
.lx10-title{font-size:clamp(2rem,3.1vw,2.75rem)!important;font-weight:700!important;line-height:1.22!important}
.lx10-lead{font-size:15.5px!important;line-height:1.9!important}

.sasi-connect-tabs{gap:8px!important}
.sasi-connect-tabs button{min-height:44px!important;padding:9px 13px!important;border-radius:13px!important;font-size:14px!important;font-weight:650!important}
.sasi-connect-tabs button>span{display:inline-grid!important;place-items:center!important;width:26px!important;height:26px!important;border-radius:8px!important;background:rgba(255,255,255,.72)!important;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif!important;font-size:15px!important}
.sasi-connect-provider-grid{gap:14px!important}
.sasi-connect-provider-grid>article{border-radius:18px!important;padding:16px!important;box-shadow:0 6px 18px rgba(48,62,88,.035)!important}
.sasi-connect-provider-copy b{font-size:15.5px!important}
.sasi-connect-provider-copy small{font-size:12.5px!important}
.sasi-connect-provider-grid>article>p{font-size:13.5px!important;line-height:1.65!important}
.sasi-connect-setup{border-radius:20px!important}
.sasi-connect-section-title h2{font-size:23px!important;line-height:1.35!important}

.lx-tool-emoji{display:none!important}
.lx-tools-v124-card .lx-mini-icon-card{width:50px!important;height:50px!important;font-size:28px!important}
`;
 save(p,s);console.log("PASS icon system CSS");
}

if(fail.length){console.error(`V14.75.1_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.75.1_PATCH=PASS");
