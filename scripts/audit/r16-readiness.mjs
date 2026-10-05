import fs from"node:fs";
const ask=fs.readFileSync("app/api/knowledge/ask/route.ts","utf8");
const enqueue=fs.existsSync("lib/sasi/durable/enqueue-knowledge.ts");
const worker=fs.existsSync("app/api/internal/sasi/worker/tick/route.ts");
const env=fs.readFileSync(".env.example","utf8");
console.log("R16_DETACHED_FOUNDATION_PRESENT="+(enqueue&&worker?"YES":"NO"));
console.log("R16_DETACHED_DEFAULT_WIRED="+(ask.includes("enqueueKnowledgeDetached")?"YES":"NO"));
console.log("R16_WORKER_SECRET_DECLARED="+(env.includes("SASI_WORKER_SECRET=")?"YES":"NO"));
console.log("R16_NOTE=Detached worker stays OFF until migrations, worker secret, scheduler, and runId/SSE UX are verified.");
