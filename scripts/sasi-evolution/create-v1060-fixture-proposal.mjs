import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [repoRoot, outPath] = process.argv.slice(2);
if (!repoRoot || !outPath) throw new Error("usage");

const target = "lib/sasi/self/__v1060_model_authored_probe__.ts";
const absolute = path.join(repoRoot, ...target.split("/"));
const currentContent = fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
const proposedContent = [
  "/**",
  " * V10.60 deterministic model-authored proposal fixture.",
  " * This file must exist only in the temporary sandbox.",
  " */",
  'export const SASI_MODEL_AUTHORED_PROBE = "candidate-only" as const;',
  "",
].join("\n");

const sha = (value) =>
  crypto.createHash("sha256").update(value, "utf8").digest("hex");

const proposal = {
  id: crypto.randomUUID(),
  strategyId: "v1060-fixture-strategy",
  reason: "Deterministic fixture for the model-authored code sandbox.",
  failureIds: ["v1060-fixture-failure"],
  files: [
    {
      path: target,
      beforeSha256: sha(currentContent),
      proposedContent,
      proposedSha256: sha(proposedContent),
    },
  ],
  createdAt: new Date().toISOString(),
};

fs.writeFileSync(outPath, JSON.stringify(proposal, null, 2));
console.log(`PROPOSAL ${outPath}`);
