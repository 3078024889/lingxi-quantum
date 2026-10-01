import fs from "node:fs";
import path from "node:path";
const retired=[
 "scripts/audit/platform-stability-v9.mjs",
 "scripts/audit/platform-stability-v10.mjs",
 "scripts/audit/platform-stability-v11.mjs",
 "scripts/audit/platform-stability-v12.mjs",
 "scripts/audit/platform-stability-v13.mjs",
 "scripts/audit/retired-language-cleanup-v10.mjs",
 "scripts/audit/retired-language-cleanup-v11.mjs",
 "scripts/audit/retired-language-cleanup-v12.mjs",
 "scripts/audit/retired-language-cleanup-v13.mjs",
 "tests/final-closure/language-stability.spec.ts",
 "tests/final-closure/language-stability-v10.spec.ts",
 "tests/final-closure/language-stability-v11.spec.ts",
 "tests/final-closure/language-stability-v12.spec.ts",
 "tests/final-closure/language-stability-v13.spec.ts"
];
const remains=retired.filter(p=>fs.existsSync(p));
if(fs.existsSync("lib/tools/platform/platform"))throw new Error("NESTED_PLATFORM_DIRECTORY_REMAINS");
if(remains.length)throw new Error(`RETIRED_PACKAGE_ARTIFACTS_REMAIN:${remains.join(",")}`);

const css=fs.readFileSync("app/globals.css","utf8");
const i18n=fs.readFileSync("lib/lingxi-i18n.ts","utf8");
if(css.includes("html.lang-en"))throw new Error("OLD_LANG_EN_CSS_RETURNED");
if(/(^|\n)\s*\[data-lang\s*=\s*["']en["']\]\s*\{\s*display\s*:\s*none/i.test(css))throw new Error("ROOT_HIDE_RULE_RETURNED");
if(/classList\.toggle\(\s*["']lang-en["']/.test(i18n))throw new Error("OLD_LANG_RUNTIME_RETURNED");

console.log("RETIRED_VERSIONED_STABILITY_FILES=0");
console.log("RETIRED_LANGUAGE_IMPLEMENTATION=0");
console.log("OLD_PACKAGE_ARTIFACTS=0");
console.log("NESTED_PLATFORM_DIRECTORIES=0");
