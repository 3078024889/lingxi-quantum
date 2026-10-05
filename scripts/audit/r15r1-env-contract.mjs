import fs from"node:fs";
const endpoint=fs.readFileSync("app/api/internal/sasi/worker/tick/route.ts","utf8");
const version=fs.readFileSync("lib/sasi/durable/worker-version.ts","utf8");

if(!endpoint.includes("process.env.SASI_WORKER_SECRET"))throw new Error("R15R1_WORKER_SECRET_ENV_MISSING");
if(!endpoint.includes("secret.length<24"))throw new Error("R15R1_WORKER_SECRET_LENGTH_GATE_MISSING");
if(!version.includes("process.env.SASI_WORKER_BUILD"))throw new Error("R15R1_WORKER_BUILD_ENV_MISSING");

console.log("R15R1_ENV_REQUIRED_SASI_WORKER_SECRET=PASS");
console.log("R15R1_ENV_OPTIONAL_SASI_WORKER_BUILD=PASS");
console.log("R15R1_WORKER_SECRET_MIN_24=PASS");
