import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const checks = [];
const expect = (label, condition) => checks.push({ label, condition });

const plans = read("lib/plans.ts");
const access = read("lib/access.ts");
const membership = read("app/membership/page.tsx");
const checkout = read("app/checkout/page.tsx");

expect("Sovereign product keeps the stable everything id", /id:\s*"everything"/.test(plans));
expect("Sovereign product is a 365-day subscription", /id:\s*"everything"[\s\S]{0,500}type:\s*"subscription"[\s\S]{0,200}days:\s*365/.test(plans));
expect("Sovereign copy promises all paid content and future releases", /全部付费内容/.test(plans) && /未来发布/.test(plans));
expect("Generic entitlement grants every product to everything", /if \(unlocks\.includes\("everything"\)\) return true/.test(access));
expect("Sovereign activates manifestation access", /manifestActive[\s\S]{0,240}unlocks\.includes\("everything"\)/.test(access));
expect("Checkout recognizes Sovereign before creating an order", /\.in\("product_id", \[productId, "everything"\]\)/.test(checkout));

const sovereignIndex = membership.indexOf('zh="一 · 神尊全域解锁"');
const practicesIndex = membership.indexOf('zh="二 · 核心修炼技术"');
const manifestationIndex = membership.indexOf('zh="三 · 显化与梦境解读"');
const narrativesIndex = membership.indexOf('zh="四 · 多维叙事"');
expect(
  "Energy Exchange renders Sovereign first in source and visual order",
  sovereignIndex >= 0 && sovereignIndex < practicesIndex && practicesIndex < manifestationIndex && manifestationIndex < narrativesIndex,
);

for (const [label, file] of [
  ["Life Map", "app/api/lifemap/generate-full/route.ts"],
  ["Relationship Resonance", "app/api/relationship/generate-full/route.ts"],
  ["Life Resilience", "app/api/resilience/generate-full/route.ts"],
  ["Romance Field", "app/api/romance/generate-full/route.ts"],
  ["Wealth Creation", "app/api/wealth/generate-full/route.ts"],
  ["Daily Tide", "app/api/daily-tide/generate-full/route.ts"],
  ["Life Oracle", "app/api/qian/generate-full/route.ts"],
  ["Quantum Life Mirror", "app/api/tarot/reading/generate-full/route.ts"],
]) {
  expect(`${label} generation accepts Sovereign`, read(file).includes('"everything"'));
}

const failed = checks.filter((check) => !check.condition);
for (const check of checks) console.log(`${check.condition ? "PASS" : "FAIL"} ${check.label}`);
if (failed.length) process.exit(1);
console.log(`Sovereign access contract passed (${checks.length} checks).`);
