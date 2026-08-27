import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const fail = (message) => {
  console.error(`FAIL field insights: ${message}`);
  process.exitCode = 1;
};

const productPages = {
  "app/life-map/page.tsx": "/life-map",
  "app/relationship/page.tsx": "/relationship",
  "app/resilience/page.tsx": "/resilience",
  "app/romance/page.tsx": "/romance",
  "app/wealth/page.tsx": "/wealth",
  "app/daily/page.tsx": "/daily",
  "app/mirror/page.tsx": "/mirror",
  "app/qian/page.tsx": "/qian",
};

for (const [file, href] of Object.entries(productPages)) {
  const source = read(file);
  if (!source.includes("FieldProductIntroduction")) fail(`${file} does not use the shared editorial introduction`);
  if (!source.includes(`href="${href}"`)) fail(`${file} is connected to the wrong editorial entry`);
  if (!source.includes('id="field-assessment"')) fail(`${file} has no assessment anchor`);
}

const publicFiles = [
  ...Object.keys(productPages),
  "components/Nav.tsx",
  "components/SearchBox.tsx",
  "components/LingxiPortal.tsx",
  "components/FieldInsightsSection.tsx",
  "app/relationship/RelationshipFlow.tsx",
  "app/relationship/full/RelationshipReportView.tsx",
  "app/daily/full/DailyTideReportView.tsx",
  "lib/plans.ts",
  "lib/mini/catalog.ts",
];
const publicSource = publicFiles.map(read).join("\n");

for (const stale of ["今日运势潮汐", "Daily Fortune Tide", "亲密关系共振", "桃花磁场测试"]) {
  if (publicSource.includes(stale)) fail(`stale public name remains: ${stale}`);
}

const opening = read("components/OpeningAtrium.tsx");
if (!opening.includes('isDesktop ? "object-contain" : "object-cover"')) fail("desktop entrance video can be cropped again");
if (!opening.includes('ASSET_VERSION = "20260827-v312"')) fail("entrance asset cache key was not advanced");
if (!opening.includes("/images/entrance/lingxi-opening-desktop-v310.mp4")) fail("desktop entrance does not reference the new 30-second file");
if (opening.includes("/images/entrance/lingxi-opening-desktop.mp4")) fail("desktop entrance still references the cached 38-second URL");
if (opening.includes("/images/entrance/lingxi-opening-poster-desktop.jpg")) fail("desktop entrance still references the deleted old poster");
if (!fs.existsSync(path.join(root, "public/images/entrance/lingxi-opening-desktop-v310.mp4"))) fail("new 30-second desktop file is missing");
if (fs.existsSync(path.join(root, "public/images/entrance/lingxi-opening-desktop.mp4"))) fail("old 38-second desktop file still exists");

if (!process.exitCode) {
  console.log("PASS field insights: all eight product pages share the bilingual editorial source");
  console.log("PASS naming: stale public product names are absent");
  console.log("PASS entrance film: desktop preserves the complete frame and only references the uniquely named 30-second asset");
}
