import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [sandboxRoot, outPath] = process.argv.slice(2);
if (!sandboxRoot || !outPath) throw new Error("usage");

const target = "lib/sasi/self/__sandbox_probe__.ts";
const absolute = path.join(sandboxRoot, ...target.split("/"));
const before = fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
const proposedContent = [
  "/**",
  " * V10.22 isolated self-coding probe.",
  " * This file exists only inside the temporary worktree and is removed with it.",
  " */",
  'export const SASI_SANDBOX_PROBE = "sandbox-only" as const;',
  "",
].join("\n");

const sha = (v) => crypto.createHash("sha256").update(v, "utf8").digest("hex");
const proposal = {
  id: crypto.randomUUID(),
  strategyId: "v1022-sandbox-self-test",
  reason: "Verify isolated code materialization without touching the main working tree.",
  failureIds: [],
  files: [{
    path: target,
    beforeSha256: sha(before),
    proposedContent,
    proposedSha256: sha(proposedContent),
  }],
};

fs.writeFileSync(outPath, JSON.stringify(proposal, null, 2));
console.log(`PROPOSAL ${outPath}`);
