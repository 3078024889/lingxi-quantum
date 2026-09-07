import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const checks = [];
const expect = (label, condition) => checks.push({ label, condition });
const plans = read("lib/plans.ts");
const membership = read("app/membership/page.tsx");
const home = read("app/page.tsx");
const miniApp = read("miniapp/app.json");

expect("retired all-field and narrative passes are absent from active products", !/id:\s*"everything"/.test(plans) && !/id:\s*"narrative-all"/.test(plans));
expect("all four practices are free", ["breath", "intuition", "heart-reset", "ascending-heart"].every((id) => new RegExp(`id:\\s*"${id}"[^\\n]+priceRmb:\\s*0`).test(plans)));
expect("manifestation day price is 9.9 RMB", /id:\s*"day"[^\n]+priceRmb:\s*9\.9/.test(plans));
expect("manifestation month and year prices remain 168 and 999", /id:\s*"month"[^\n]+priceRmb:\s*168/.test(plans) && /id:\s*"year"[^\n]+priceRmb:\s*999/.test(plans));
expect("membership states dream and practices are free", /梦境探索和四大修炼技术均已免费开放/.test(membership));
expect("public home no longer links the narrative board", !/href="\/narrative"/.test(home));
expect("Mini Program replaces narrative tab with free exploration", /pages\/free\/index/.test(miniApp) && !/pages\/narratives\/index/.test(miniApp));

const failed = checks.filter((check) => !check.condition);
for (const check of checks) console.log(`${check.condition ? "PASS" : "FAIL"} ${check.label}`);
if (failed.length) process.exit(1);
console.log(`Current access contract passed (${checks.length} checks).`);
