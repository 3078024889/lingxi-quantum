import fs from "node:fs";

const assert=(ok,label)=>{
  if(!ok)throw new Error("FAIL "+label);
  console.log("PASS "+label);
};

const idx=fs.readFileSync("lib/ai-knowledge/local-index.ts","utf8");
const intake=fs.readFileSync("lib/files/document-intake.ts","utf8");
const ws=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");

assert(idx.includes("export const KNOWLEDGE_SOURCE_MAX = 60"),"60-source constant");
assert(idx.includes("count.result >= KNOWLEDGE_SOURCE_MAX"),"IndexedDB hard cap");
assert(idx.includes("KNOWLEDGE_SOURCE_LIMIT"),"source limit error");
assert(!idx.includes("export export"),"no duplicate export");

assert(intake.includes("DOCUMENT_BATCH_MAX_BYTES = 300 * 1024 * 1024"),"300MB batch budget");
assert(intake.includes("documentBatchWithinBudget"),"shared batch helper");

assert(ws.includes('import { DOCUMENT_BATCH_MAX_BYTES } from "@/lib/files/document-intake";'),"standalone batch-budget import");
assert(ws.includes('import { KNOWLEDGE_SOURCE_MAX } from "@/lib/ai-knowledge/local-index";'),"standalone source-limit import");
assert(!/import\s*\{[^}]*DOCUMENT_BATCH_MAX_BYTES[^}]*\}\s*from\s*["']react["']/.test(ws),"batch constant never imported from React");
assert(!/import\s*\{[^}]*KNOWLEDGE_SOURCE_MAX[^}]*\}\s*from\s*["']react["']/.test(ws),"source constant never imported from React");

console.log("V14.30.1 BIGPACK1 KNOWLEDGE FILE RUNTIME CLOSURE=PASS");
