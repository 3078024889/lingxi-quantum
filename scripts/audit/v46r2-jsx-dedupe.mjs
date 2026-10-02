import fs from 'node:fs';
const p='components/tools/PdfEditorWorkbench.tsx';
const s=fs.readFileSync(p,'utf8');
const must=(v,m)=>{if(!v)throw new Error(m)};
const pageCount=(s.match(/data-testid=["']pdf-source-page-count["']/g)||[]).length;
must(pageCount===1,`V46R2_PAGECOUNT_TESTID_COUNT:${pageCount}`);
const tags=[...s.matchAll(/<PaidExportButton\b[\s\S]*?\/>/g)].map(m=>m[0]);
must(tags.length>0,'V46R2_PAID_EXPORT_TAG_MISSING');
for(const tag of tags){
 if(/\bonUnlocked\s*=\s*\{exportNow\}/.test(tag)){
  const n=(tag.match(/\bonCompleted\s*=\s*\{resetPaidTask\}/g)||[]).length;
  must(n===1,`V46R2_ONCOMPLETED_COUNT:${n}`);
 }
}
console.log('V46R2_PDF_SOURCE_PAGECOUNT=PASS');
console.log('V46R2_PAID_EXPORT_PROP_DEDUPE=PASS');
console.log('LINGXIFIELD_V46R2_AUDIT=PASS');
