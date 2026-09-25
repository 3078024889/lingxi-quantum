import fs from "node:fs";
import childProcess from "node:child_process";

const [sandboxRoot, applyEvidencePath, outPath] = process.argv.slice(2);
if (!sandboxRoot || !applyEvidencePath || !outPath) throw new Error("usage");

function run(command, args) {
  try {
    const stdout = childProcess.execFileSync(command, args, {
      cwd: sandboxRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    return { ok: true, stdout: stdout.slice(-12000), stderr: "" };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout ?? "").slice(-12000),
      stderr: String(error.stderr ?? error.message ?? "").slice(-12000),
      exitCode: typeof error.status === "number" ? error.status : null,
    };
  }
}

const applyEvidence = JSON.parse(fs.readFileSync(applyEvidencePath, "utf8"));
const diff = run("git", ["diff", "--", "lib/sasi"]);
const status = run("git", ["status", "--short", "--", "lib/sasi"]);
const head = run("git", ["rev-parse", "HEAD"]);

const result = {
  version: "v10.22",
  finishedAt: new Date().toISOString(),
  sandboxRoot,
  headSha: head.ok ? head.stdout.trim() : null,
  applyEvidence,
  diff: diff.stdout,
  status: status.stdout,
  pass: Boolean(applyEvidence.passed),
};

fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`EVIDENCE ${outPath}`);
