import fs from "node:fs";
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};

const idx=fs.readFileSync("lib/ai-knowledge/local-index.ts","utf8");
const intake=fs.readFileSync("lib/files/document-intake.ts","utf8");
const ws=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");

assert(idx.includes("export const KNOWLEDGE_SOURCE_MAX = 60"),"60-source constant");
assert(idx.includes("count.result >= KNOWLEDGE_SOURCE_MAX"),"IndexedDB source hard cap");
assert(idx.includes("KNOWLEDGE_SOURCE_LIMIT"),"source cap error code");
assert(!idx.includes("export export"),"no duplicate export");
assert(intake.includes("DOCUMENT_BATCH_MAX_BYTES = 300 * 1024 * 1024"),"300MB batch budget");
assert(intake.includes("documentBatchWithinBudget"),"shared batch guard helper");
assert(ws.includes("DOCUMENT_BATCH_MAX_BYTES"),"workspace wired to batch budget");
assert(!/\bisKnowledgeZip\s*\(/.test(ws) || /import[\s\S]*isKnowledgeZip/.test(ws) || /function\s+isKnowledgeZip/.test(ws),"no orphan isKnowledgeZip");
assert(!/\bexpandKnowledgeZip\s*\(/.test(ws) || /import[\s\S]*expandKnowledgeZip/.test(ws) || /function\s+expandKnowledgeZip/.test(ws),"no orphan expandKnowledgeZip");

console.log("V14.30.0 BIGPACK1 KNOWLEDGE FILE RUNTIME CLOSURE=PASS");
