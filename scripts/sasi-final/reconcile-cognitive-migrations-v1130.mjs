import fs from "node:fs";
import path from "node:path";

const repoRoot = process.argv[2] || process.cwd();

const ordered = [
  "20260923174500_sasi_general_intelligence_seed_v01.sql",
  "20260923190000_sasi_knowledge_ingestion_teacher_mesh_v01.sql",
  "20260923203000_sasi_learning_runtime_stage2.sql",
  "20260923220000_sasi_self_evolution_stage3.sql",
  "20260923233000_sasi_model_authored_code_stage4.sql",
  "20260924003000_sasi_user_triggered_intelligence_control.sql",
  "20260924020000_sasi_measured_benchmark_stage7.sql",
  "20260924033000_sasi_promotion_rollback_stage8.sql",
  "20260924050000_sasi_completion_runtime_learning.sql",
];

const dir = path.join(repoRoot, "supabase", "migrations");
const failures = [];
const rows = [];

for (let index = 0; index < ordered.length; index += 1) {
  const name = ordered[index];
  const full = path.join(dir, name);
  const exists = fs.existsSync(full);
  let text = "";
  if (exists) text = fs.readFileSync(full, "utf8");

  const row = {
    order: index + 1,
    name,
    exists,
    hasBeginCommit: /\bbegin\s*;/i.test(text) && /\bcommit\s*;/i.test(text),
    enablesRls: /enable row level security/i.test(text),
    referencesSasiProjects: /references\s+public\.sasi_projects/i.test(text),
    creates: [...text.matchAll(/create table if not exists\s+public\.([a-z0-9_]+)/gi)].map(
      (m) => m[1],
    ),
  };

  if (!exists) failures.push(`MISSING:${name}`);
  rows.push(row);
}

console.log(JSON.stringify({
  version:"v11.30",
  orderedMigrations:rows,
  failures,
  productionMutation:false,
  note:"Static local reconciliation only. This does not prove production application."
}, null, 2));

if (failures.length) process.exitCode = 2;
