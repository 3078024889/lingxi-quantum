const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
const checks=[
 ["app/layout.tsx",s=>!s.includes('languages:{"zh-CN":"/"'),"root metadata must not publish fake same-URL hreflang"],
 ["lib/lingxi-i18n.ts",s=>s.includes('document.documentElement.dir=lang==="ar"?"rtl":"ltr"'),"Arabic must switch document dir"],
 ["lib/lingxi-i18n.ts",s=>s.includes('document.documentElement.lang=lang==="zh"?"zh-CN":lang'),"html lang must follow UI language"],
 ["components/tools/ToolWorkbench.tsx",s=>s.includes("toolRuntimeText"),"ToolWorkbench runtime i18n"],
 ["components/tools/FileDropzone.tsx",s=>s.includes("toolRuntimeText"),"FileDropzone runtime i18n"],
 ["components/tools/ResultPanel.tsx",s=>s.includes("toolRuntimeText"),"ResultPanel runtime i18n"],
 ["components/tools/ToolShell.tsx",s=>s.includes("toolShellText"),"ToolShell i18n"],
 ["components/FaqSection.tsx",s=>s.includes("toolShellText"),"FAQ visible/schema language alignment"],
 ["app/mini-report/MiniDendriteReport.tsx",s=>s.includes("localizeReportItemsChunked")&&s.includes("disabled={downloading||!ready}"),"mini dendrite report/PDF language lock"],
 ["app/mini-report/MiniLifeArchetypeReport.tsx",s=>s.includes("localizeReportItemsChunked")&&s.includes("disabled={downloading||!ready}"),"life archetype report/PDF language lock"],
 ["app/api/i18n/report/route.ts",s=>s.includes("MINI_REPORT_NOT_OWNED"),"mini-report translation ownership guard"],
];
let failed=0;
for(const [rel,fn,label] of checks){const file=path.join(root,rel);const ok=fs.existsSync(file)&&fn(fs.readFileSync(file,"utf8"));console.log(ok?"PASS":"FAIL",rel,"—",label);if(!ok)failed++;}
console.log("\nFinal architecture audit:",checks.length-failed,"passed,",failed,"failed");
if(failed)process.exitCode=2;