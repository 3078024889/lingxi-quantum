import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const payloadRoot = path.resolve(process.argv[2] || ".");
const repoRoot = path.resolve(process.argv[3] || ".");
const repoPackage = path.join(repoRoot, "package.json");

if (!fs.existsSync(repoPackage)) {
  console.error(`V74_TYPESCRIPT_RESOLUTION_FAILED:missing_repo_package:${repoPackage}`);
  process.exit(1);
}

let ts;
try {
  // Resolve TypeScript from the TARGET repository, not from this detached release package.
  // This keeps the preflight aligned with the exact compiler/types used by the real app.
  const repoRequire = createRequire(repoPackage);
  ts = repoRequire("typescript");
  const resolved = repoRequire.resolve("typescript");
  console.log(`V74_TYPESCRIPT_RESOLUTION=PASS:${resolved}`);
  console.log(`V74_TYPESCRIPT_VERSION=${ts.version}`);
} catch (error) {
  console.error(`V74_TYPESCRIPT_RESOLUTION_FAILED:${error?.message || error}`);
  process.exit(1);
}

const files = [
  "lib/seo/site-domains.ts",
  "scripts/patch/v74-app-sitemap.ts",
  "scripts/patch/v74-app-robots.ts",
];

let bad = 0;
for (const rel of files) {
  const file = path.join(payloadRoot, rel);
  if (!fs.existsSync(file)) {
    console.error(`V74_PAYLOAD_MISSING=${rel}`);
    bad++;
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  const parsed = ts.createSourceFile(rel, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (parsed.parseDiagnostics.length) {
    bad++;
    for (const diagnostic of parsed.parseDiagnostics) {
      const pos = diagnostic.start == null
        ? null
        : parsed.getLineAndCharacterOfPosition(diagnostic.start);
      const where = pos ? `:${pos.line + 1}:${pos.character + 1}` : "";
      console.error(`${rel}${where}:${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
    }
  }
}

if (bad) process.exit(1);
console.log(`V74_PAYLOAD_PARSE=PASS (${files.length})`);
