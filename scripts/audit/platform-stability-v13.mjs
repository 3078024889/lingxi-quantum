import fs from "node:fs";
import path from "node:path";
function must(v,m){if(!v)throw new Error(m)}
function read(p){return fs.readFileSync(p,"utf8").replace(/\r\n/g,"\n")}

const css=read("app/globals.css");
const i18n=read("lib/lingxi-i18n.ts");
const ads=read("components/AdSenseLoader.tsx");
const nav=read("components/Nav.tsx");

must(!css.includes("html.lang-en"),"OLD_LANG_EN_CSS_NOT_DELETED");
must(!/(^|\n)\s*\[data-lang\s*=\s*["']en["']\]\s*\{\s*display\s*:\s*none/i.test(css),"DANGEROUS_UNSCOPED_DATA_LANG_RULE_REMAINS");
must(!/classList\.toggle\(\s*["']lang-en["']/.test(i18n),"OLD_LANG_EN_RUNTIME_REMAINS");
must(i18n.includes('root.classList.remove("lang-en")'),"LANG_EN_CLEANUP_MISSING");
must(css.includes("html[data-lang] { display: block !important; visibility: visible !important; }"),"ROOT_VISIBILITY_FAILSAFE_MISSING");
must(ads.includes("navigator.webdriver"),"AUTOMATED_AD_TRAFFIC_GUARD_MISSING");
must(nav.includes("lx11-mobile-account"),"MOBILE_ACCOUNT_TRIGGER_MISSING");
must(nav.includes("setOpen(true)"),"MOBILE_NAV_DRAWER_TRIGGER_MISSING");
must(nav.includes("lx11-lang-select"),"LANGUAGE_SELECTOR_MISSING");

const bad=[];
for(const root of ["app","components","lib"]){
 const walk=d=>{
  for(const ent of fs.readdirSync(d,{withFileTypes:true})){
   const p=path.join(d,ent.name);
   if(ent.isDirectory())walk(p);
   else if(/\.(css|ts|tsx|js|jsx)$/.test(ent.name)){
    const s=read(p);
    if(s.includes("html.lang-en"))bad.push(`${p}:html.lang-en`);
    if(/classList\.toggle\(\s*["']lang-en["']/.test(s))bad.push(`${p}:lang-en-toggle`);
   }
  }
 };
 walk(root);
}
must(bad.length===0,`RETIRED_LANGUAGE_SOURCE_REMAINS:${bad.join(",")}`);

console.log("OLD_LANG_EN_CSS=0");
console.log("OLD_LANG_EN_RUNTIME=0");
console.log("DANGEROUS_ROOT_LANGUAGE_HIDE=0");
console.log("MOBILE_LANGUAGE_DRAWER_SOURCE=PASS");
console.log("ADSENSE_AUTOMATION_TRAFFIC=DISABLED");
console.log("PLATFORM_STABILITY_V13_AUDIT=PASS");
