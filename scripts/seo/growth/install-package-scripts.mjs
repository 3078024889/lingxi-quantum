import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.scripts ??= {};
const additions = {
  "seo:growth:audit": "node scripts/seo/growth/audit-seo-growth.mjs",
  "seo:growth:generate": "node scripts/seo/growth/generate-llms-full.mjs",
  "seo:growth:indexnow": "node scripts/seo/growth/indexnow-submit.mjs"
};

let changed = false;
for (const [key, value] of Object.entries(additions)) {
  if (pkg.scripts[key] !== value) {
    pkg.scripts[key] = value;
    changed = true;
  }
}

if (changed) {
  const body = JSON.stringify(pkg, null, 2) + "\n";
  fs.writeFileSync(pkgPath, body, "utf8");
  console.log("[WRITE] package.json SEO growth scripts");
} else {
  console.log("[PASS] package.json SEO growth scripts already present");
}
