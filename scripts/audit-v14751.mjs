import fs from "node:fs";
const fail=[];const c=(ok,n)=>{console.log(`${ok?"PASS":"FAIL"} ${n}`);if(!ok)fail.push(n)};
const nav=fs.readFileSync("components/Nav.tsx","utf8");
const home=fs.readFileSync("components/HomeProblemHub.tsx","utf8");
const sasi=fs.readFileSync("components/SasiCommandCenter.tsx","utf8");
const account=fs.readFileSync("app/account/page.tsx","utf8");
const shell=fs.readFileSync("components/tools/ToolGlyph.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const cc=fs.readFileSync("app/sasi/ConnectionCenter.tsx","utf8");
c(nav.includes('name={item.icon} size="nav"'),"sidebar uses shared mini icons");
c(nav.includes('name="new" size="nav"'),"new task uses mini icon");
c(!nav.includes('icon: "⌂"')&&!nav.includes('icon: "◆"'),"old abstract nav glyphs removed");
c(home.includes('LingxiMiniIcon name={item.icon}'),"home uses shared icon system");
c(sasi.includes('LingxiMiniIcon name={card.mark}'),"SASI cards use shared icon system");
c(account.includes('name="products"')&&account.includes('name="refund"'),"account cards use shared icon system");
c(shell.includes('LingxiMiniIcon'),"tool cards use shared icon system");
c(css.includes("V14.75 Lingxi mini app icon system"),"icon design system CSS installed");
c(css.includes(".lx-mini-icon-nav")&&css.includes(".lx-mini-icon-title")&&css.includes(".lx-mini-icon-card"),"nav/title/card size system present");
c(cc.includes('"🤖"')&&cc.includes('"🎬"')&&cc.includes('"🔐"'),"connections tabs are visually explicit");
for(const p of ["app/ai-knowledge/page.tsx","app/ai-learning/page.tsx","app/ai-research/page.tsx","app/sasi/connections/page.tsx"]){
 c(fs.readFileSync(p,"utf8").includes("lx-page-title-line"),`${p} has title icon`);
}
if(fail.length){console.error(`V14.75.1_AUDIT_FAILURES=${fail.length}`);fail.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.75.1_ICON_AUDIT=PASS");
