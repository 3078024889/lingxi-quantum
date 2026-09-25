import fs from "node:fs";
const fail=[];
const read=p=>fs.readFileSync(p,"utf8"),save=(p,s)=>fs.writeFileSync(p,s,"utf8");

{
 const p="components/tools/ToolsHubV11.tsx";let s=read(p);
 const old=`                  {summary?<p className="lx-tools-v124-desc">{summary}</p>:null}
                  <span className="lx-tool-card-arrow" aria-hidden="true">→</span>`;
 const neu=`                  {summary?<p className="lx-tools-v124-desc">{summary}</p>:null}
                  <span className={\`lx-tool-kind lx-tool-kind-\${displayCategory(item)}\`}>{toolCategoryLabel(lang,displayCategory(item))}</span>
                  <span className="lx-tool-card-arrow" aria-hidden="true">→</span>`;
 if(s.includes(old))s=s.replace(old,neu);
 else if(!s.includes("lx-tool-kind-")){console.error("MISS tool category tag anchor");fail.push("tool category tag anchor")}
 save(p,s);console.log("PASS visual category tag");
}

{
 const p="lib/tools/hub-copy-v1470.ts";let s=read(p);
 s=s.replace('.replace(/s{2,}/g," ")','.replace(/\\s{2,}/g," ")');
 save(p,s);console.log("PASS summary whitespace cleanup");
}

{
 const p="components/tools/ToolShell.tsx";let s=read(p);
 if(!s.includes('import Link from "next/link";'))s=s.replace('"use client";','"use client";\nimport Link from "next/link";');
 const old=` return <main className="pt-16 lg:pt-8"><section className="px-6 py-12 sm:py-16"><div className="mx-auto max-w-3xl">
  <p className="font-display text-sm uppercase tracking-widest2 text-lattice">{t("灵犀场 · 在线工具","LINGXIFIELD · Tools")}</p>`;
 const neu=` return <main className="pt-16 lg:pt-8"><section className="px-6 py-12 sm:py-16"><div className="mx-auto max-w-3xl">
  <Link href="/tools" className="lx-tool-back">← {t("返回实用工具","Back to tools")}</Link>
  <p className="mt-6 font-display text-sm uppercase tracking-widest2 text-lattice">{t("灵犀场 · 在线工具","LINGXIFIELD · Tools")}</p>`;
 if(s.includes(old))s=s.replace(old,neu);
 else if(!s.includes('className="lx-tool-back"')){console.error("MISS ToolShell back anchor");fail.push("ToolShell back anchor")}
 save(p,s);console.log("PASS tool back button");
}

{
 const p="lib/tool-shell-i18n.ts";let s=read(p);
 if(!s.includes('"返回实用工具":')){
   const anchor='const COPY:Record<string,Record<LingxiLang,string>>={';
   const item='\n  "返回实用工具":{"zh":"返回实用工具","en":"Back to tools","ja":"ツール一覧へ戻る","ko":"도구로 돌아가기","fr":"Retour aux outils","de":"Zurück zu den Werkzeugen","es":"Volver a herramientas","pt":"Voltar às ferramentas","ar":"العودة إلى الأدوات"},';
   if(s.includes(anchor))s=s.replace(anchor,anchor+item);
   else{console.error("MISS shell copy anchor");fail.push("shell copy anchor")}
 }
 save(p,s);console.log("PASS 9-language back label");
}

{
 const p="app/globals.css";let s=read(p);
 const marker="/* V14.74 tools visual reference + typography */";
 if(!s.includes(marker))s+=`

${marker}
body{font-size:16px;font-weight:500}
.lx-side-nav,.lx-main-content,.lx11-page{font-size:15px}
.lx-tools-v124 .lx11-wrap{max-width:1240px!important}
.lx-tools-v124 .lx11-tools-hero{padding:28px 0 20px!important}
.lx-tools-v124 .lx11-tools-hero h1{font-size:clamp(2rem,2.7vw,2.6rem)!important;font-weight:700!important;letter-spacing:-.025em!important}
.lx-tools-v124 .lx11-tools-hero p{max-width:880px!important;margin-top:10px!important;font-size:15px!important;line-height:1.75!important;font-weight:500!important}
.lx-tools-v124-search{margin-top:2px!important}
.lx-tools-v124 .lx11-tool-group{margin-top:22px!important}
.lx-tools-v124-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-auto-rows:auto!important;align-items:stretch!important;gap:14px!important}
.lx-tools-v124-card{position:relative!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;gap:0!important;width:auto!important;min-width:0!important;height:auto!important;max-height:none!important;min-height:158px!important;padding:18px 44px 16px 18px!important;overflow:hidden!important;border:1px solid rgba(38,55,80,.10)!important;border-radius:18px!important;background:rgba(255,255,255,.86)!important;box-shadow:0 6px 20px rgba(42,58,82,.04)!important}
.lx-tools-v124-card:hover{transform:translateY(-2px)!important;border-color:rgba(104,112,220,.22)!important;box-shadow:0 13px 30px rgba(52,69,100,.09)!important}
.lx-tools-v124-card .lx11-tool-cover{width:52px!important;min-width:52px!important;max-width:52px!important;height:52px!important;min-height:52px!important;max-height:52px!important;margin:0 0 13px 0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
.lx-tool-emoji{width:52px;height:52px;display:grid;place-items:center;border-radius:15px;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;font-size:31px;line-height:1;background:linear-gradient(145deg,#fff7ef,#f1efff);box-shadow:inset 0 0 0 1px rgba(64,70,110,.055),0 7px 18px rgba(66,72,120,.08)}
.lx-tools-v124-card:nth-child(6n+2) .lx-tool-emoji{background:linear-gradient(145deg,#f1eeff,#eadfff)}
.lx-tools-v124-card:nth-child(6n+3) .lx-tool-emoji{background:linear-gradient(145deg,#eaf4ff,#dcecff)}
.lx-tools-v124-card:nth-child(6n+4) .lx-tool-emoji{background:linear-gradient(145deg,#efffed,#dbf8dc)}
.lx-tools-v124-card:nth-child(6n+5) .lx-tool-emoji{background:linear-gradient(145deg,#fff0f4,#ffe0e8)}
.lx-tools-v124-card:nth-child(6n) .lx-tool-emoji{background:linear-gradient(145deg,#fff8de,#ffebbf)}
.lx-tools-v124-card .lx11-tool-copy{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;padding:0!important;margin:0!important;background:transparent!important}
.lx-tools-v124-card .lx11-tool-title-row{padding:0!important;margin:0!important}
.lx-tools-v124-card .lx11-tool-title-row h3{margin:0!important;padding:0!important;color:var(--lx-ink)!important;font-size:17px!important;font-weight:750!important;line-height:1.42!important;letter-spacing:-.01em!important;overflow-wrap:anywhere!important}
.lx-tools-v124-card .lx-tools-v124-desc{margin:7px 0 13px!important;color:var(--lx-muted)!important;font-size:14px!important;font-weight:500!important;line-height:1.62!important;display:block!important;overflow:visible!important;-webkit-line-clamp:unset!important;-webkit-box-orient:initial!important;white-space:normal!important;overflow-wrap:anywhere!important}
.lx-tool-kind{display:inline-flex!important;align-items:center!important;align-self:flex-start!important;margin-top:auto!important;padding:4px 10px!important;border-radius:999px!important;background:#f4f6ff!important;color:#6671ca!important;font-size:11.5px!important;font-weight:700!important;line-height:1.2!important}
.lx-tool-kind-image{background:#fff0f4!important;color:#d54e78!important}.lx-tool-kind-pdf{background:#fff0f3!important;color:#df426a!important}.lx-tool-kind-media,.lx-tool-kind-subtitle{background:#edf4ff!important;color:#3471cf!important}.lx-tool-kind-table{background:#fff5df!important;color:#bd761f!important}.lx-tool-kind-privacy{background:#edf8ff!important;color:#3482bd!important}.lx-tool-kind-recognition{background:#effbea!important;color:#4b9b49!important}.lx-tool-kind-file{background:#f3efff!important;color:#765ac5!important}
.lx-tools-v124-card .lx-tool-card-arrow{position:absolute!important;right:18px!important;top:20px!important;display:grid!important;place-items:center!important;width:34px!important;height:34px!important;border-radius:50%!important;background:#f4f5ff!important;color:#6570d6!important;font-size:18px!important;font-weight:700!important}
.lx-tool-back{display:inline-flex;align-items:center;min-height:38px;padding:0 14px;border:1px solid rgba(100,110,150,.16);border-radius:999px;background:rgba(255,255,255,.76);color:var(--lx-ink);font-size:14px;font-weight:650;transition:transform .15s ease,border-color .15s ease}
.lx-tool-back:hover{transform:translateX(-2px);border-color:rgba(100,110,180,.32)}
@media(max-width:1180px){.lx-tools-v124-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:840px){.lx-tools-v124-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.lx-tools-v124-card{min-height:154px!important}}
@media(max-width:560px){.lx-tools-v124-grid{grid-template-columns:1fr!important}.lx-tools-v124-card{min-height:138px!important;padding:16px 42px 14px 16px!important}.lx-tools-v124-card .lx11-tool-title-row h3{font-size:16px!important}.lx-tools-v124-card .lx-tools-v124-desc{font-size:13.5px!important}}
`;
 save(p,s);console.log("PASS visual reference layer");
}

if(fail.length){console.error(`V14.74_PATCH_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.74_PATCH=PASS");
