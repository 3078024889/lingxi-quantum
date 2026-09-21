import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const WEB = path.join(WORK, "extracts", "web");
const sha = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");
const clip = (s, n) => {
  s = String(s || "").replace(/\s+/g, " ").trim();
  return s.length <= n ? s : s.slice(0, n - 1).replace(/[，,。.\s]+$/, "") + "…";
};

const NEW_FILES = [
  "www.wingmakers.com_.txt",
  "www.wingmakers.com_philosophy.txt",
  "www.wingmakers.com_writings.txt",
  "www.jamesmahu.com_.txt",
  "www.jamesmahu.com_about.txt",
  "www.jamesmahu.com_writings.txt",
];

// Curated remembrance-first bars (记起自己 / lived principle), sourced from content-only extracts.
const CURATED = [
  {
    sourceFile: "www.wingmakers.com_philosophy.txt",
    category: "PREFERENCE",
    title: "记起·web·wingmakers.com·主权在自己",
    statement:
      "记起自己时可用的原则：真正焦点不在宏大宇宙图景，而在你此刻的主权——你活在自由意志场里；未来的「更完整的自己」不是外来神明，而是你可在日常行为里一点点活出来的状态。",
  },
  {
    sourceFile: "www.wingmakers.com_philosophy.txt",
    category: "SCRIPT",
    title: "记起·web·wingmakers.com·哲学要落到行为",
    statement:
      "记起自己时可用的原则：哲学若只停留在复述旧思想，就仍是头脑游戏。可用的「记起」必须落到行为——从心与智的美德里长出来：在具体关系与选择里表达，而不是背词条。",
  },
  {
    sourceFile: "www.wingmakers.com_philosophy.txt",
    category: "RULE",
    title: "记起·web·wingmakers.com·路不靠外加权威",
    statement:
      "记起自己时可用的原则：这条路不靠口诀、牺牲、捐献、服从律法、会员身份，也不靠圣人/上师代行。它是你自己的辨别与体验：用行为智能穿过设计出来的幻觉，而不是外包给权威。",
  },
  {
    sourceFile: "www.wingmakers.com_philosophy.txt",
    category: "PREFERENCE",
    title: "记起·web·wingmakers.com·美德在当下相遇",
    statement:
      "记起自己时可用的原则：真哲学不是用来操控物质世界获利的工具，而是原初完整自己的美德，在「这一刻、这一条生命对另一条生命」的相遇里被纯粹表达出来。",
  },
  {
    sourceFile: "www.wingmakers.com_.txt",
    category: "SCRIPT",
    title: "记起·web·wingmakers.com·艺术唤醒内在",
    statement:
      "记起自己时可用的原则：艺术的作用是把被深藏的「原初完整自己」 archetype 拉到存在表面，让你能在新的光里看见它；在这看见里，这份意识在你体内会被再激活一点。",
  },
  {
    sourceFile: "www.wingmakers.com_.txt",
    category: "RULE",
    title: "记起·web·wingmakers.com·练习而非攀比成圣",
    statement:
      "记起自己时可用的原则：场源材料是用来练习的。没有「比谁更灵性」的赛跑，目标也不是人人都当老师、上师或「开悟者」——而是把记起自己落实为日常可感的实践。",
  },
  {
    sourceFile: "www.jamesmahu.com_about.txt",
    category: "SCRIPT",
    title: "记起·web·jamesmahu.com·关系中的连贯",
    statement:
      "记起自己时可用的原则：关注关系里的连贯如何被实时观察与稳定——人与人、系统与系统、人与AI协作。不是完成一套理论，而是在活着的环境里参与、书写、看见并协调差异。",
  },
  {
    sourceFile: "www.jamesmahu.com_.txt",
    category: "PREFERENCE",
    title: "记起·web·jamesmahu.com·跨尺度连贯",
    statement:
      "记起自己时可用的原则：连贯可在跨尺度被观察与生活——从个体与AI，到机构与更大共同体。记起自己时，把「我是否连贯」问成可感的关系质量，而不是抽象标签。",
  },
];

function autoPicks(text, f) {
  const paras = text.split(/\n+/).map((l) => l.trim()).filter((l) => l.length > 60);
  const picks = [];
  for (const p of paras) {
    if (/copyright|版权|备案|ICP|cookie|Learn More|READ MORE/i.test(p)) continue;
    if (
      /sovereign|integral|heart|virtue|practice|consciousness|coherence|perception|freewill|行为|觉察|意识|心脏|互联|主权|呼吸|练习|爱|信任|感知|存在|原初|积分|关系|连贯/i.test(
        p
      ) ||
      p.length > 120
    ) {
      picks.push(p);
    }
    if (picks.length >= 2) break;
  }
  return picks.map((p, i) => {
    const stmt = clip(`记起自己时可用的原则（站点正文要点）：${p}`, 980);
    const category = /practice|练习|呼吸|感知|virtue|行为/i.test(p)
      ? "SCRIPT"
      : /must|禁止|法则|not |不靠|不是/i.test(p)
        ? "RULE"
        : "PREFERENCE";
    return {
      sourceFile: f,
      category,
      title: clip(`记起·web·${f.replace(/\.txt$/, "")}·auto${i + 1}`, 80),
      statement: stmt,
    };
  });
}

const packPath = path.join(WORK, "mind-pack", "field-source-mind-v1.json");
const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const seedPath = path.join(WORK, "foundry-ingest", "04-seed-knowledge.json");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const candidates = [...CURATED];
for (const f of NEW_FILES) {
  const fp = path.join(WEB, f);
  if (!fs.existsSync(fp)) continue;
  const text = fs.readFileSync(fp, "utf8");
  if (text.length < 80) continue;
  // only auto-add if curated didn't already cover this file with 2+ bars
  const curatedFor = CURATED.filter((c) => c.sourceFile === f).length;
  if (curatedFor >= 2) continue;
  if (curatedFor === 0) candidates.push(...autoPicks(text, f));
  else if (text.length > 500) candidates.push(...autoPicks(text, f).slice(0, 1));
}

const seen = new Set(pack.bars.map((b) => b.content_hash));
const newBars = [];
const incrementalSeed = [];

for (const c of candidates) {
  const stmt = clip(c.statement, 980);
  const bar = {
    id: `fsm-web-retry-${sha(c.sourceFile + stmt).slice(0, 10)}`,
    title: clip(c.title, 80),
    statement: stmt,
    evidence: `content-only 自 extracts/web/${c.sourceFile}｜记起自己，非术语表｜web-retry EN`,
    tier: "gold",
    category: c.category,
    sourceFile: c.sourceFile,
    bucket: "web",
    rightsScope: "owner_private",
    trainability: "trainable",
    review_status: "approved",
    content_hash: sha(`${c.category}:${stmt}`),
    domain: "field-source-web",
    pedagogy: "remembrance",
  };
  if (seen.has(bar.content_hash)) continue;
  seen.add(bar.content_hash);
  newBars.push(bar);
  incrementalSeed.push({
    category: bar.category,
    title: bar.title,
    statement: bar.statement,
    evidence: bar.evidence,
    tier: "gold",
    trainability: "trainable",
    review_status: "approved",
    content_hash: bar.content_hash,
    domain: bar.domain,
    sourceFile: bar.sourceFile,
    bucket: bar.bucket,
  });
  pack.bars.push(bar);
  seed.push(incrementalSeed[incrementalSeed.length - 1]);
}

pack.version = "v1.3-web-retry";
pack.generatedAt = new Date().toISOString();
pack.counts = {
  sources: pack.counts.sources,
  digested: pack.counts.digested,
  bars: pack.bars.length,
  webFiles: fs.readdirSync(WEB).filter((f) => f.endsWith(".txt")).length,
  webBarsAddedTotal: pack.bars.filter((b) => b.bucket === "web").length,
  webRetryBarsAdded: newBars.length,
  byBucket: pack.bars.reduce((a, b) => {
    a[b.bucket] = (a[b.bucket] || 0) + 1;
    return a;
  }, {}),
};

fs.writeFileSync(packPath, JSON.stringify(pack, null, 2), "utf8");
const v13 = path.join(WORK, "mind-pack", "field-source-mind-v1.3-web-retry.json");
fs.writeFileSync(v13, JSON.stringify(pack, null, 2), "utf8");
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), "utf8");
const incrPath = path.join(WORK, "foundry-ingest", "04-seed-knowledge-incremental-web-retry.json");
fs.writeFileSync(incrPath, JSON.stringify(incrementalSeed, null, 2), "utf8");

const man = JSON.parse(fs.readFileSync(path.join(WORK, "foundry-ingest", "00-manifest.json"), "utf8"));
man.version = pack.version;
man.counts = { seedKnowledge: seed.length, incrementalWebRetry: incrementalSeed.length };
man.webRetry = { files: NEW_FILES.length, barsAdded: newBars.length, at: pack.generatedAt };
fs.writeFileSync(path.join(WORK, "foundry-ingest", "00-manifest.json"), JSON.stringify(man, null, 2), "utf8");

console.log(JSON.stringify({ added: newBars.length, bars: pack.bars.length, seed: seed.length, incremental: incrementalSeed.length, titles: newBars.map((b) => b.title) }, null, 2));
