import fs from"node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const req=(p,checks)=>{const s=read(p);for(const [name,test] of checks)if(!test(s))throw new Error(`V56_CAPABILITY_AUDIT_FAILED:${p}:${name}`);return s};
const cont=req("components/tools/ContinueProcessing.tsx",[
 ["I18N",s=>s.includes("continuationText(lang")],
 ["HANDOFF",s=>s.includes("createToolHandoff")],
 ["RESULT_CONTINUATION_SURFACE",s=>s.includes('data-testid="continue-processing"')],
 ["NO_ZH_ONLY_BRANCH",s=>!/lang===\"zh\"/.test(s)],
]);
const i18n=req("lib/tools/platform/continuation-i18n.ts",[
 ["NINE_LANGUAGE_ROW",s=>s.includes("zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string")],
 ["PDF_CONTINUATION",s=>s.includes("pdfCompress")&&s.includes("pdfSplit")&&s.includes("pdfImages")],
 ["IMAGE_CONTINUATION",s=>s.includes("imageCompress")&&s.includes("imageResize")&&s.includes("imagePrivacy")&&s.includes("imagePdf")],
 ["TABLE_CONTINUATION",s=>s.includes("xlsxCsv")&&s.includes("csvXlsx")],
]);
for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])if(!i18n.includes(lang))throw new Error(`V56_I18N_MISSING:${lang}`);
req("components/tools/RecentTools.tsx",[
 ["READ_RECENT",s=>s.includes("readRecentToolActivity")],
 ["NINE_LANGUAGE_TIME",s=>s.includes("Intl.RelativeTimeFormat")],
 ["RECENT_TITLE",s=>s.includes("Recently finished")&&s.includes("最近完成")],
 ["TOOL_REOPEN",s=>s.includes("/tools/${item.slug}")],
]);
req("lib/tools/workspace/recent-tools.ts",[
 ["LOCAL_METADATA_ONLY",s=>s.includes("localStorage")&&!s.includes("Blob")&&!s.includes("File(")],
 ["BOUNDED_HISTORY",s=>s.includes("const MAX=6")],
 ["EXPIRY_POLICY",s=>s.includes("TTL_MS=14*24*60*60*1000")&&s.includes("purgeExpiredRecentToolActivity")],
 ["EVENT_SYNC",s=>s.includes("lingxifield:recent-tools")&&s.includes('addEventListener("storage"')],
]);
req("components/tools/ResultPanel.tsx",[["RECORD_RESULT",s=>s.includes("recordRecentToolResult(sourceSlug,files||[])")]]);
req("components/tools/ToolsHubV11.tsx",[["RECENT_SURFACE",s=>s.includes("<RecentTools/>")]]);
req("components/tools/ToolShell.tsx",[["PRACTICAL_TOOL_LABEL",s=>s.includes("灵犀场 · 实用工具")]]);
req("lib/tools/platform/continuation.ts",[["COPY_KEYS",s=>s.includes("copyKey")&&!s.includes("reasonZh")&&!s.includes("reasonEn")]]);
console.log("V56_TOOL_CONTINUITY=PASS");
