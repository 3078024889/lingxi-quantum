import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const miniSource = read("miniapp/components/field-structure-9d/index.wxml");
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
  "app/archetype/page.tsx": "/archetype",
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
if (!opening.includes('isDesktop === true ? "object-contain" : "object-cover"')) fail("desktop entrance video can be cropped again");
if (!opening.includes("useState<boolean | null>(null)")) fail("entrance viewport selection can hydrate with the wrong video again");
if (!opening.includes("VIDEO_SRC && videoAvailable")) fail("entrance can render a video before the viewport is resolved");
if (!opening.includes('ASSET_VERSION = "20260827-v313"')) fail("entrance asset cache key was not advanced");
if (!opening.includes("/images/entrance/lingxi-opening-desktop-v310.mp4")) fail("desktop entrance does not reference the new 30-second file");
if (opening.includes("/images/entrance/lingxi-opening-desktop.mp4")) fail("desktop entrance still references the cached 38-second URL");
if (opening.includes("/images/entrance/lingxi-opening-poster-desktop.jpg")) fail("desktop entrance still references the deleted old poster");
if (!fs.existsSync(path.join(root, "public/images/entrance/lingxi-opening-desktop-v310.mp4"))) fail("new 30-second desktop file is missing");
if (fs.existsSync(path.join(root, "public/images/entrance/lingxi-opening-desktop.mp4"))) fail("old 38-second desktop file still exists");

const layout = read("app/layout.tsx");
const fieldStructure = read("components/FieldStructure9D.tsx");
const footer = read("components/Footer.tsx");
if (!layout.includes("/og-v316.png") || !fs.existsSync(path.join(root, "public/og-v316.png"))) fail("new social sharing image is not active");
if (fs.existsSync(path.join(root, "public/og.jpg"))) fail("old social sharing image still exists");
if (!layout.includes("<FieldStructure9D />") || !fieldStructure.includes("lingxifield-9d-field-structure-v317-h264.mp4")) fail("global 9D Field Structure is not mounted");
if (!fs.existsSync(path.join(root, "public/media/lingxifield-9d-field-structure-v317-h264.mp4"))) fail("H.264 9D Field Structure film is missing");
if (!/muted=\{muted\} autoPlay loop playsInline/.test(fieldStructure)) fail("9D film does not preserve muted autoplay looping with user-controlled sound");
if (/9d-field-structure-poster-v316/.test(`${fieldStructure}\n${miniSource}`) || fs.existsSync(path.join(root, "public/images/9d-field-structure-poster-v316.png"))) fail("obsolete 9D poster still covers the film");
if (!/lg:grid-cols-\[\.8fr_1\.15fr_1\.55fr\]/.test(footer)) fail("footer has not been compacted into the balanced grid");
if (/联锁/.test(`${publicSource}\n${fieldStructure}`)) fail("legacy linking term remains in current public website copy");

if (!process.exitCode) {
  console.log("PASS field insights: all nine product pages share the bilingual editorial source");
  console.log("PASS naming: stale public product names are absent");
  console.log("PASS entrance film: desktop preserves the complete frame and only references the uniquely named 30-second asset");
  console.log("PASS 9D field structure: global responsive film, fresh OG image, and compact footer are active");
}
