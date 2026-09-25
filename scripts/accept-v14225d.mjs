import fs from "node:fs";
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};

const idx=fs.readFileSync("lib/ai-knowledge/local-index.ts","utf8");
const ws=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");
const intake=fs.readFileSync("lib/files/document-intake.ts","utf8");

assert(idx.includes("export const KNOWLEDGE_SOURCE_MAX = 60"),"central 60-source cap");
assert(idx.includes("count.result >= KNOWLEDGE_SOURCE_MAX"),"IndexedDB hard cap");
assert(idx.includes("KNOWLEDGE_SOURCE_LIMIT"),"source cap error");
assert(intake.includes("DOCUMENT_BATCH_MAX_BYTES = 300 * 1024 * 1024"),"300MB batch cap");
assert(ws.includes("KNOWLEDGE_SOURCE_MAX-sources.length"),"remaining source slots");
assert(ws.includes("DOCUMENT_BATCH_MAX_BYTES"),"workspace byte budget");
assert(ws.includes("candidates=candidates.slice(0,freeSlots)"),"workspace cap enforcement");
assert(ws.includes("正在读取"),"import progress");
assert(ws.includes("本地资料库已达到"),"capacity message");

console.log("V14.22.5D KNOWLEDGE GUARDRAILS=PASS");
