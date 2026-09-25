import fs from "node:fs";
import childProcess from "node:child_process";
import crypto from "node:crypto";

const [sandboxRoot, proposalPath, applyEvidencePath, outputPath] = process.argv.slice(2);
if (!sandboxRoot || !proposalPath || !applyEvidencePath || !outputPath) {
  throw new Error("usage");
}

function run(command, args) {
  try {
    const stdout = childProcess.execFileSync(command, args, {
      cwd: sandboxRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    return { ok: true, stdout: stdout.slice(-20000), stderr: "" };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout ?? "").slice(-20000),
      stderr: String(error.stderr ?? error.message ?? "").slice(-20000),
      exitCode: typeof error.status === "number" ? error.status : null,
    };
  }
}

const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
const applyEvidence = JSON.parse(fs.readFileSync(applyEvidencePath, "utf8"));
const status = run("git", ["status", "--short"]);
const diff = run("git", ["diff", "--", ...proposal.files.map((file) => file.path)]);
const head = run("git", ["rev-parse", "HEAD"]);

const evidence = {
  version: "v10.60",
  proposalId: proposal.id,
  strategyId: proposal.strategyId,
  sandboxRoot,
  headSha: head.ok ? head.stdout.trim() : null,
  applyEvidence,
  gitStatus: status.stdout,
  diff: diff.stdout,
  diffSha256: crypto.createHash("sha256").update(diff.stdout, "utf8").digest("hex"),
  collectedAt: new Date().toISOString(),
};

fs.writeFileSync(outputPath, JSON.stringify(evidence, null, 2));
console.log(`EVIDENCE ${outputPath}`);
