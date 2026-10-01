import fs from "node:fs";
const css=fs.readFileSync("app/globals.css","utf8");
const i18n=fs.readFileSync("lib/lingxi-i18n.ts","utf8");
if(css.includes("html.lang-en"))throw new Error("OLD_LANG_EN_CSS_NOT_DELETED");
if(/(^|\n)\s*\[data-lang\s*=\s*["']en["']\]\s*\{\s*display\s*:\s*none/i.test(css))throw new Error("OLD_ROOT_HIDE_NOT_DELETED");
if(/classList\.toggle\(\s*["']lang-en["']/.test(i18n))throw new Error("OLD_LANG_EN_RUNTIME_NOT_DELETED");
console.log("RETIRED_LANGUAGE_IMPLEMENTATION=0");
console.log("OLD_LANGUAGE_REFERENCES=0");
