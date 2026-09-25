import fs from "node:fs";
import path from "node:path";
const root=path.resolve(process.argv[2]||process.cwd()),read=p=>fs.readFileSync(path.join(root,p),"utf8"),exists=p=>fs.existsSync(path.join(root,p));
const registry=read("lib/tools/registry.ts"),workbench=read("components/tools/ToolWorkbench.tsx");
const expected=["text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode","png-to-jpg","jpg-to-png","webp-to-jpg","compress-image","compress-image-to-100kb","compress-image-to-20kb","compress-image-to-50kb","compress-image-to-200kb","compress-image-to-500kb","resize-image","remove-exif","file-type-detector","md5-sha256","file-compare","xlsx-to-csv","csv-to-xlsx","docx-to-txt","pptx-to-txt","json-formatter","timestamp-converter","qr-code-generator","heic-to-jpg","qr-code-reader","merge-pdf","split-pdf","compress-pdf","image-to-pdf","pdf-to-jpg"];
const registrySlugs=[...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(m=>m[1]);
const mapped=[...registry.matchAll(/\[\s*"([^"]+)"\s*,\s*"[^"]+"\s*,\s*"[^"]+"/g)].map(m=>m[1]);
const all=[...new Set([...registrySlugs,...mapped])];
const missingRegistry=expected.filter(x=>!all.includes(x));
const handler=slug=>["text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode"].includes(slug)?workbench.includes(`"${slug}"`):slug.startsWith("compress-image-to-")?workbench.includes('tool.slug.startsWith("compress-image-to-")'):workbench.includes(`tool.slug === "${slug}"`);
const missingHandler=expected.filter(x=>!handler(x));
const dedicated=["audio-transcription","avif-to-jpg","batch-image-watermark-remover","batch-image","burn-after-read","document-copy-layout","e-sign-pdf","food-calorie","heic-local","id-photo-ai","image-to-pdf-pro","image-watermark-remover","jpg-to-png","long-image","ocr","pdf-compress","pdf-editor","pdf-merge-split","pdf-ocr","pdf-pages","pdf-redact","pdf-to-jpg","png-to-jpg","privacy-cleaner","qr-safe-reader","screenshot-redact","subtitle-tools","subtitle-translate","svg-to-png","temp-mail","video-dubbing","video-toolkit","video-transcription","video-watermark-remover","webp-to-jpg"];
const missingPages=dedicated.filter(x=>!exists(`app/tools/${x}/page.tsx`));
const consume=read("app/api/tools/burn-after-read/consume/route.ts"),ack=read("app/api/tools/burn-after-read/ack/route.ts"),reveal=read("components/tools/BurnAfterReadReveal.tsx");
const checks=[
 ["registry expected live tools present",missingRegistry.length===0,missingRegistry],
 ["live registry tools have runtime handlers",missingHandler.length===0,missingHandler],
 ["dedicated tool pages present",missingPages.length===0,missingPages],
 ["burn preview is non-destructive",consume.includes('preview_burn_note')&&!consume.includes('consume_burn_note'),[]],
 ["burn view commit exists",ack.includes('commit_burn_note_view'),[]],
 ["burn client decrypts before commit",reveal.indexOf("crypto.subtle.decrypt")<reveal.indexOf("/api/tools/burn-after-read/ack"),[]],
 ["retired number-energy excluded from registry",!all.includes("number-energy"),[]],
];
let fail=0;for(const[n,ok,d]of checks){console.log(`${ok?"PASS":"FAIL"} ${n}${d.length?` :: ${d.join(",")}`:""}`);if(!ok)fail++}
if(fail)process.exit(1);
console.log(`TOOLS_RUNTIME_AUDIT=PASS (${expected.length} registry tools + ${dedicated.length} dedicated routes)`);
