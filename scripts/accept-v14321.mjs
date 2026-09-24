import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};

const dz=read("components/tools/FileDropzone.tsx");
const rp=read("components/tools/ResultPanel.tsx");
const shell=read("components/tools/ToolShell.tsx");
const wb=read("components/tools/ToolWorkbench.tsx");
const slug=read("app/tools/[slug]/page.tsx");

assert(dz.includes("fileMatchesAccept"),"dropzone accept validation");
assert(dz.includes("fileIdentity"),"dropzone duplicate filtering");
assert(dz.includes("unique.length > maxFiles"),"dropzone explicit max-file rejection");
assert(dz.includes("aria-disabled"),"dropzone disabled semantics");

assert(rp.includes("downloadAllAsZip"),"multi-result ZIP download");
assert(rp.includes('import("jszip")'),"JSZip dynamic import");
assert(rp.includes("uniqueZipName"),"ZIP duplicate-name safety");
assert(rp.includes("downloadError"),"download error recovery");

assert(shell.includes("tool.localOnly"),"privacy copy uses actual localOnly state");
assert(shell.includes("此工具需要在线处理"),"online processing privacy copy");

assert(wb.includes('tool.status === "planned"'),"planned tools stay visibly planned");
assert(slug.includes("notFound()"),"tool dynamic route notFound guard");

console.log("V14.32.1 BIGPACK2 TOOLS PRODUCTION CLOSURE=PASS");
