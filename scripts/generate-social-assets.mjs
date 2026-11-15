import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const heroPath = path.join(root, "public/images/home-hero-signature-20261115.webp");
const logoPath = path.join(root, "public/images/lingxifield-logo.png");
const ogPath = path.join(root, "public/og-lingxifield-20261115.jpg");
const miniPath = path.join(root, "miniapp/assets/share-lingxifield-20261115.jpg");

for (const required of [heroPath, logoPath]) {
  if (!fs.existsSync(required)) throw new Error("SOCIAL_SOURCE_ASSET_MISSING:" + path.relative(root, required));
}

async function encodeJpeg(width, height, layers, maxBytes) {
  for (const quality of [84, 80, 76, 72, 68, 64]) {
    const bytes = await sharp({
      create: { width, height, channels: 3, background: "#f7faff" }
    })
      .composite(layers)
      .jpeg({ quality, mozjpeg: true, progressive: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
    if (bytes.length < maxBytes) return { bytes, quality };
  }
  throw new Error("SOCIAL_IMAGE_EXCEEDS_SIZE_LIMIT:" + width + "x" + height);
}

const hero1200 = await sharp(heroPath)
  .rotate()
  .resize(1200, 400, { fit: "cover", position: "centre" })
  .png()
  .toBuffer();
const logo78 = await sharp(logoPath).resize(78, 78, { fit: "contain" }).png().toBuffer();

const ogBase = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".62" stop-color="#f6faff"/>
      <stop offset="1" stop-color="#eef4ff"/>
    </linearGradient>
    <radialGradient id="glow" cx="1" cy="0" r="1">
      <stop offset="0" stop-color="#8bb8ff" stop-opacity=".28"/>
      <stop offset="1" stop-color="#8bb8ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#paper)"/>
  <rect width="1200" height="300" fill="url(#glow)"/>
  <circle cx="1080" cy="82" r="190" fill="none" stroke="#9bb8ee" stroke-opacity=".16" stroke-width="1.5"/>
  <circle cx="1080" cy="82" r="145" fill="none" stroke="#a9a0ec" stroke-opacity=".12" stroke-width="1"/>
</svg>`);
const ogOverlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sceneFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".98"/>
      <stop offset=".40" stop-color="#ffffff" stop-opacity=".93"/>
      <stop offset=".70" stop-color="#f8fbff" stop-opacity=".66"/>
      <stop offset="1" stop-color="#f8fbff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3978e8"/>
      <stop offset=".55" stop-color="#7164e8"/>
      <stop offset="1" stop-color="#b38ae9"/>
    </linearGradient>
  </defs>
  <rect x="0" y="230" width="1000" height="400" fill="url(#sceneFade)"/>
  <rect x="64" y="137" width="78" height="4" rx="2" fill="url(#accent)"/>
  <text x="160" y="83" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="30" font-weight="800" fill="#172c50">灵犀场 LINGXIFIELD</text>
  <text x="160" y="116" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="2.2" fill="#617698">GLOBAL SIAI · SASI SOFTWARE · 100+ TOOLS</text>
  <text x="64" y="203" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="54" font-weight="900" fill="#17284b">全球 SIAI 排行榜</text>
  <text x="64" y="258" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="43" font-weight="850" fill="#263b68">SASI 智能软件市场 · 100+ 实用工具</text>
  <text x="66" y="305" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="21" font-weight="650" fill="#425d87">MT5 EA · 量化交易源码 · 成品软件 · 自动发货</text>
  <g font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="16" font-weight="750">
    <rect x="64" y="348" width="168" height="42" rx="21" fill="#ffffff" fill-opacity=".88" stroke="#cbdaf4"/>
    <text x="148" y="375" text-anchor="middle" fill="#315fbd">全球 SIAI 排行</text>
    <rect x="246" y="348" width="178" height="42" rx="21" fill="#ffffff" fill-opacity=".88" stroke="#d8d1f5"/>
    <text x="335" y="375" text-anchor="middle" fill="#6652bd">SASI 软件市场</text>
    <rect x="438" y="348" width="170" height="42" rx="21" fill="#ffffff" fill-opacity=".88" stroke="#cbdaf4"/>
    <text x="523" y="375" text-anchor="middle" fill="#315fbd">100+ 在线工具</text>
  </g>
</svg>`);
const og = await encodeJpeg(1200, 630, [
  { input: ogBase, left: 0, top: 0 },
  { input: hero1200, left: 0, top: 230 },
  { input: ogOverlay, left: 0, top: 0 },
  { input: logo78, left: 64, top: 44 }
], 150 * 1024);

const hero600 = await sharp(heroPath)
  .rotate()
  .resize(600, 200, { fit: "cover", position: "centre" })
  .png()
  .toBuffer();
const logo50 = await sharp(logoPath).resize(50, 50, { fit: "contain" }).png().toBuffer();
const miniBase = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="480" viewBox="0 0 600 480">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#eef4ff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3978e8"/>
      <stop offset=".55" stop-color="#7164e8"/>
      <stop offset="1" stop-color="#b38ae9"/>
    </linearGradient>
  </defs>
  <rect width="600" height="480" fill="url(#paper)"/>
  <rect x="34" y="105" width="72" height="4" rx="2" fill="url(#accent)"/>
</svg>`);
const miniOverlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="480" viewBox="0 0 600 480">
  <text x="100" y="57" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="23" font-weight="800" fill="#172c50">灵犀场 LINGXIFIELD</text>
  <text x="100" y="82" font-family="Arial, sans-serif" font-size="9.5" font-weight="700" letter-spacing="1.2" fill="#617698">GLOBAL SIAI · SASI SOFTWARE · 100+ TOOLS</text>
  <text x="34" y="157" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="34" font-weight="900" fill="#17284b">全球 SIAI 排行榜</text>
  <text x="34" y="201" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="30" font-weight="850" fill="#263b68">SASI 智能软件市场</text>
  <text x="34" y="242" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="28" font-weight="850" fill="#315fbd">100+ 在线实用工具</text>
  <text x="35" y="270" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif" font-size="14" font-weight="650" fill="#425d87">MT5 EA · 量化交易源码 · 成品软件 · 自动发货</text>
</svg>`);
const mini = await encodeJpeg(600, 480, [
  { input: miniBase, left: 0, top: 0 },
  { input: hero600, left: 0, top: 280 },
  { input: miniOverlay, left: 0, top: 0 },
  { input: logo50, left: 34, top: 24 }
], 300 * 1024);

const ogMeta = await sharp(og.bytes).metadata();
const miniMeta = await sharp(mini.bytes).metadata();
if (ogMeta.format !== "jpeg" || ogMeta.width !== 1200 || ogMeta.height !== 630) throw new Error("WEBSITE_OG_DIMENSIONS_INVALID");
if (miniMeta.format !== "jpeg" || miniMeta.width !== 600 || miniMeta.height !== 480) throw new Error("MINIAPP_SHARE_DIMENSIONS_INVALID");

fs.mkdirSync(path.dirname(ogPath), { recursive: true });
fs.mkdirSync(path.dirname(miniPath), { recursive: true });
fs.writeFileSync(ogPath, og.bytes);
fs.writeFileSync(miniPath, mini.bytes);
console.log("SOCIAL_ASSETS_GENERATED", JSON.stringify({
  website: { path: path.relative(root, ogPath), width: 1200, height: 630, bytes: og.bytes.length, quality: og.quality },
  miniapp: { path: path.relative(root, miniPath), width: 600, height: 480, bytes: mini.bytes.length, quality: mini.quality }
}));
