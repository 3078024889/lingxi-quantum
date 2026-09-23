import fs from "node:fs";
import path from "node:path";

const repoRoot = process.argv[2] || process.cwd();
const migrationDir = path.join(repoRoot, "supabase", "migrations");
const manifestPath = path.join(
  repoRoot,
  "docs",
  "SASI-PRODUCTION-MIGRATION-MANIFEST-V1110.json",
);

if (!fs.existsSync(migrationDir)) throw new Error("MIGRATION_DIR_MISSING");
if (!fs.existsSync(manifestPath)) throw new Error("SASI_MIGRATION_MANIFEST_MISSING");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const all = fs
  .readdirSync(migrationDir)
  .filter((name) => /\.sql$/i.test(name))
  .sort();

const known = manifest.known_order.map((name) => ({
  name,
  exists: all.includes(name),
}));

const sasiFiles = all.filter((name) => /sasi/i.test(name));
const unknownSasi = sasiFiles.filter(
  (name) => !manifest.known_order.includes(name),
);

const report = {
  version: manifest.version,
  known,
  unknownSasi,
  allSasiMigrationCount: sasiFiles.length,
  knownPresent: known.filter((item) => item.exists).length,
  missingKnown: known.filter((item) => !item.exists).map((item) => item.name),
  note:
    "This is a local-file audit only. It does not assert that production Supabase has applied these migrations.",
};

console.log(JSON.stringify(report, null, 2));

if (report.missingKnown.length) {
  process.exitCode = 2;
}
