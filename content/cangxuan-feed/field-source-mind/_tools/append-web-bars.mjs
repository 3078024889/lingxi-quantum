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

const packPath = path.join(WORK, "mind-pack", "field-source-mind-v1.json");
const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const seedPath = path.join(WORK, "foundry-ingest", "04-seed-knowledge.json");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const files = fs.existsSync(WEB) ? fs.readdirSync(WEB).filter((f) => f.endsWith(".txt")) : [];
const newBars = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(WEB, f), "utf8");
  if (text.length < 80) continue;
  const paras = text.split(/\n+/).map((l) => l.trim()).filter((l) => l.length > 40);
  const picks = [];
  for (const p of paras) {
    if (/copyright|版权|备案|ICP|cookie/i.test(p)) continue;
    if (/记起|觉察|意识|心脏|互联|一体|主权|呼吸|练习|爱|信任|感知|存在|原初|积分/.test(p) || p.length > 80) {
      picks.push(p);
    }
    if (picks.length >= 2) break;
  }
  if (!picks.length) picks.push(clip(text, 400));
  picks.forEach((p, i) => {
    const stmt = clip(`记起自己时可用的原则（站点正文要点）：${p}`, 980);
    const title = clip(`记起·web·${f.replace(/\.txt$/, "")}·${i + 1}`, 80);
    const category = /练习|呼吸|感知|静/.test(p) ? "SCRIPT" : /必须|禁止|法则/.test(p) ? "RULE" : "PREFERENCE";
    const bar = {
      id: `fsm-web-${sha(f + i).slice(0, 10)}-${i + 1}`,
      title,
      statement: stmt,
      evidence: `content-only 自 extracts/web/${f}｜记起自己，非术语表`,
      tier: "gold",
      category,
      sourceFile: f,
      bucket: "web",
      rightsScope: "owner_private",
      trainability: "trainable",
      review_status: "approved",
      content_hash: sha(`${category}:${stmt}`),
      domain: "field-source-web",
      pedagogy: "remembrance",
    };
    newBars.push(bar);
  });
}

const seen = new Set(pack.bars.map((b) => b.content_hash));
let added = 0;
for (const b of newBars) {
  if (seen.has(b.content_hash)) continue;
  seen.add(b.content_hash);
  pack.bars.push(b);
  seed.push({
    category: b.category,
    title: b.title,
    statement: b.statement,
    evidence: b.evidence,
    tier: "gold",
    trainability: "trainable",
    review_status: "approved",
    content_hash: b.content_hash,
    domain: b.domain,
    sourceFile: b.sourceFile,
    bucket: b.bucket,
  });
  added++;
}
pack.version = "v1.2-remembrance+web";
pack.generatedAt = new Date().toISOString();
pack.counts = {
  sources: pack.counts.sources,
  digested: pack.counts.digested,
  bars: pack.bars.length,
  webFiles: files.length,
  webBarsAdded: added,
  byBucket: pack.bars.reduce((a, b) => {
    a[b.bucket] = (a[b.bucket] || 0) + 1;
    return a;
  }, {}),
};
fs.writeFileSync(packPath, JSON.stringify(pack, null, 2), "utf8");
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), "utf8");
const man = JSON.parse(fs.readFileSync(path.join(WORK, "foundry-ingest", "00-manifest.json"), "utf8"));
man.version = pack.version;
man.counts = { seedKnowledge: seed.length };
man.web = { files: files.length, barsAdded: added };
fs.writeFileSync(path.join(WORK, "foundry-ingest", "00-manifest.json"), JSON.stringify(man, null, 2), "utf8");
console.log(JSON.stringify(pack.counts, null, 2));