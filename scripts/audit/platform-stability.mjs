import fs from "node:fs";
function must(v,m){if(!v)throw new Error(m)}
const css=fs.readFileSync("app/globals.css","utf8");
const i18n=fs.readFileSync("lib/lingxi-i18n.ts","utf8");
const ads=fs.readFileSync("components/AdSenseLoader.tsx","utf8");
must(!css.includes("html.lang-en"),"OLD_LANG_EN_CSS");
must(!/classList\.toggle\(\s*["']lang-en["']/.test(i18n),"OLD_LANG_RUNTIME");
must(css.includes("html[data-lang] { display: block !important; visibility: visible !important; }"),"ROOT_VISIBILITY_GUARD");
must(ads.includes("navigator.webdriver"),"E2E_AD_GUARD");
console.log("PLATFORM_STABILITY_AUDIT=PASS");
