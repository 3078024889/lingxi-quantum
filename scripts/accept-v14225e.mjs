import fs from "node:fs";
const assert=(ok,label)=>{if(!ok)throw new Error("FAIL "+label);console.log("PASS "+label)};

const idx=fs.readFileSync("lib/ai-knowledge/local-index.ts","utf8");
const ws=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");
const intake=fs.readFileSync("lib/files/document-intake.ts","utf8");

assert(idx.includes("export const KNOWLEDGE_SOURCE_MAX = 60"),"central 60-source cap");
assert(idx.includes("count.result >= KNOWLEDGE_SOURCE_MAX"),"IndexedDB hard cap");
assert(idx.includes("KNOWLEDGE_SOURCE_LIMIT"),"source cap error");
assert(!idx.includes("export export"),"duplicate export removed");
assert(intake.includes("DOCUMENT_BATCH_MAX_BYTES = 300 * 1024 * 1024"),"300MB budget constant");
assert(!ws.includes("isKnowledgeZip(item)") || /import[\s\S]*isKnowledgeZip/.test(ws) || /function\s+isKnowledgeZip/.test(ws),"no orphan isKnowledgeZip reference");
assert(!ws.includes("expandKnowledgeZip(item)") || /import[\s\S]*expandKnowledgeZip/.test(ws) || /function\s+expandKnowledgeZip/.test(ws),"no orphan expandKnowledgeZip reference");

console.log("V14.22.5E KNOWLEDGE COMPILE RECOVERY=PASS");
