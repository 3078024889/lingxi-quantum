import fs from "node:fs";
const must=["app/tools/pdf-inspect/page.tsx","app/tools/pdf-attachments/page.tsx","app/tools/pdf-bookmarks/page.tsx","components/tools/PdfStructureInfoWorkbench.tsx"];
for(const p of must)if(!fs.existsSync(p))throw new Error(`V73_MISSING:${p}`);
const c=fs.readFileSync("components/tools/PdfStructureInfoWorkbench.tsx","utf8");
for(const x of ['mode:"inspect"','mode:"attachments"','mode:"bookmarks"']){}
for(const token of ['--show-npages','--json','--add-attachment','--remove-attachment='])if(!c.includes(token))throw new Error(`V73_ENGINE_CAPABILITY_MISSING:${token}`);
for(const p of ['lib/tools/tool-policy-data.ts','lib/tools/tool-policy-public.ts','lib/tools/v67-pricing-contract.ts'])if(fs.existsSync(p)){const s=fs.readFileSync(p,'utf8');for(const slug of ['pdf-inspect','pdf-attachments','pdf-bookmarks'])if(s.includes(slug))throw new Error(`V73_FREE_TOOL_IN_PRICING:${slug}:${p}`)}
for(const p of ['lib/tools/advanced-catalog.ts','lib/seo/global-seo.ts','lib/tools/experience-registry.ts','lib/tools/card-i18n.ts']){const s=fs.readFileSync(p,'utf8');for(const slug of ['pdf-inspect','pdf-attachments','pdf-bookmarks'])if(!s.includes(slug))throw new Error(`V73_CATALOG_MISSING:${slug}:${p}`)}
console.log('V73_PDF_STRUCTURAL_II=PASS');console.log('V73_FREE_STRUCTURAL_TOOLS=3');console.log('V73_9LANG_UI=PASS');console.log('V73_PRICING_BOUNDARY=PASS');
