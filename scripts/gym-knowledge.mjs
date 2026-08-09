#!/usr/bin/env node
// ────────────────────────────────────────────────────────────────
// 知识健身房（Knowledge Gym）
// ────────────────────────────────────────────────────────────────
// lint 管的是底线（不许扭曲），gym 管的是上限（哪段更好）。
//
// 核心想法：同一个 (章节, 维度, 分数带) 里的多个变体，是同一个
// 擂台上的选手。gym 用可复算的启发式给每个节点打 0-100 分，
// 组内排序，然后做两件事：
//   晋级——组内冠军 weight 提为 championWeight，被 hash 选中的
//          概率随之提高（引擎的 pickVariant 按 weight 加权）；
//   淘汰——低于 retireBelow 的节点 weight 降为 0，引擎不再选它，
//          但内容保留在库里等改写，不物理删除。
// 覆盖率红线高于质量红线：keepCoverage 开着时，绝不淘汰组内
// 最后一个存活节点——宁可平庸，不能空白（见 lint 里那次真实事故）。
//
// 评分只依赖节点文本，不依赖时间和随机数：同一份库任何时候
// 跑出的榜单完全一致。这和引擎的确定性承诺是同一条承诺。
//
// 用法：
//   node scripts/gym-knowledge.mjs           全量评分报告
//   node scripts/gym-knowledge.mjs --top     每组冠军榜 + 总榜前10
//   node scripts/gym-knowledge.mjs --apply   把晋级/淘汰写回 nodes.json 与 gym.json
//
// 全部阈值与词表读 knowledge/_shared/gym.json 和 lexicon.json，
// 调标准是改数据，不是改代码。

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "knowledge";
const GYM_PATH = join(ROOT, "_shared", "gym.json");
const LEXICON_PATH = join(ROOT, "_shared", "lexicon.json");
const AVOID_PATH = join(ROOT, "_shared", "avoid-words.json");

function readJson(p, fallback = null) {
  if (!existsSync(p)) return fallback;
  try { return JSON.parse(readFileSync(p, "utf8")); }
  catch (e) {
    console.error(`✗ ${p} JSON 解析失败：${e.message}`);
    process.exit(1);
  }
}

const gym = readJson(GYM_PATH);
if (!gym) {
  console.error(`✗ 缺少 ${GYM_PATH}，健身房没有规则不开门。`);
  process.exit(1);
}
const lexicon = readJson(LEXICON_PATH, { terms: [] });
const avoidWords = readJson(AVOID_PATH, { words: [] }).words ?? [];

const CFG = gym.scoring;
const W = CFG.weights;

// ── 单项评分（每项 0..1，乘各自权重后求和） ──

// 篇幅：太短说不清机制，太长会稀释判断。区间来自 gym.json。
function scoreLengthFit(zh) {
  const len = zh.length;
  const { min, max } = CFG.idealLengthZh;
  if (len >= min && len <= max) return 1;
  if (len < min) return Math.max(0, len / min);
  return Math.max(0, 1 - (len - max) / max);
}

// 脚手架：corePattern / shadowSide / growthDirection 三个字段
// 不只是"填了"，还得有实质长度——一个字的敷衍不算想清楚了。
function scoreScaffold(node) {
  const fields = ["corePattern", "shadowSide", "growthDirection"];
  let ok = 0;
  for (const f of fields) {
    if (node[f] && String(node[f]).trim().length >= CFG.scaffoldMinChars) ok++;
  }
  return ok / fields.length;
}

// 双语：英文不是摆设，长度不够就是没认真翻。
function scoreBilingual(node) {
  const en = node.fieldText?.en ?? "";
  if (en.length >= CFG.minLengthEn) return 1;
  return en.length / CFG.minLengthEn;
}

// 具体度：温度来自具体，不来自形容词。数具体性标记的命中种类数。
function scoreConcrete(zh) {
  let hits = 0;
  for (const m of CFG.concreteMarkers) if (zh.includes(m)) hits++;
  return Math.min(1, hits / CFG.concreteFullScoreHits);
}

// 可证伪度：有没有一句用户能对照自己记忆当场确认或否认的话。
// 这是对抗 Barnum 效应的核心手段（见 knowledge-engine.ts 的 TailNode 注释）。
function scoreFalsifiable(zh) {
  for (const m of CFG.falsifiableMarkers) if (zh.includes(m)) return 1;
  return 0;
}

// 扣分：全局黑名单命中重罚，词表 avoid 命中轻罚。
function penalties(text) {
  let p = 0;
  const detail = [];
  for (const w of avoidWords) {
    if (w && text.includes(w)) { p += CFG.penaltyPerAvoidWord; detail.push(`黑名单「${w}」`); }
  }
  for (const term of lexicon.terms ?? []) {
    for (const w of term.avoid ?? []) {
      if (w && text.includes(w)) { p += CFG.penaltyPerLexiconHit; detail.push(`词表·${term.key}「${w}」`); }
    }
  }
  return { p, detail };
}

function scoreNode(node) {
  const zh = node.fieldText?.zh ?? "";
  const en = node.fieldText?.en ?? "";
  const sub = {
    lengthFit: scoreLengthFit(zh),
    scaffold: scoreScaffold(node),
    bilingual: scoreBilingual(node),
    concrete: scoreConcrete(zh),
    falsifiable: scoreFalsifiable(zh),
  };
  let total = 0;
  for (const k of Object.keys(W)) total += W[k] * (sub[k] ?? 0);
  const pen = penalties(`${zh}\n${en}`);
  total = Math.max(0, Math.min(100, Math.round(total - pen.p)));
  return { total, sub, penalties: pen };
}

// ── 收集全部结构节点，按擂台分组 ──
// 擂台 = 产品|章节|维度|分数带。tails/states/combos 不参赛：
// 它们没有组内变体竞争，质量由 lint 和人工把关。

const groups = new Map(); // groupKey -> { file, entries: [{node, score, idx}] }

for (const dir of readdirSync(ROOT).filter((d) => {
  const p = join(ROOT, d);
  return d !== "_shared" && statSync(p).isDirectory();
})) {
  const nodePath = join(ROOT, dir, "nodes.json");
  const data = readJson(nodePath);
  if (!data?.nodes) continue;
  data.nodes.forEach((node, idx) => {
    if (!node.chapter || !node.dim || !node.band) return;
    const key = `${dir}|${node.chapter}|${node.dim}|${node.band}`;
    if (!groups.has(key)) groups.set(key, { file: nodePath, data, entries: [] });
    groups.get(key).entries.push({ node, idx, score: scoreNode(node) });
  });
}

if (groups.size === 0) {
  console.log("没有找到任何结构节点，健身房空场。");
  process.exit(0);
}

// ── 组内权重排序 + 晋级/淘汰判定 ──
// 排序确定性：同分时按 id 字典序，绝不依赖遍历顺序。

const results = [];
for (const [key, g] of groups) {
  g.entries.sort((a, b) => b.score.total - a.score.total || a.node.id.localeCompare(b.node.id));
  const champion = g.entries[0];
  const promoted =
    g.entries.length > 1 && champion.score.total >= gym.promotion.minScoreToPromote;

  const retired = [];
  for (const e of g.entries) {
    if (e.score.total >= gym.elimination.retireBelow) continue;
    // 覆盖率红线：不能把一个组淘汰空。
    const survivors = g.entries.filter((x) => x !== e && !retired.includes(x));
    if (gym.elimination.keepCoverage && survivors.length === 0) continue;
    retired.push(e);
  }
  results.push({ key, group: g, champion, promoted, retired });
}
results.sort((a, b) => a.key.localeCompare(b.key));

// ── 输出 ──

const args = process.argv.slice(2);
const TOP = args.includes("--top");
const APPLY = args.includes("--apply");

const allEntries = results.flatMap((r) => r.group.entries.map((e) => ({ ...e, key: r.key })));
allEntries.sort((a, b) => b.score.total - a.score.total || a.node.id.localeCompare(b.node.id));

if (TOP) {
  console.log("═══ 知识健身房 · 冠军榜 ═══\n");
  for (const r of results) {
    const c = r.champion;
    const tag = r.promoted ? "🏆晋级" : r.group.entries.length === 1 ? "独苗" : "领先";
    console.log(
      `  ${r.key}\n    ${tag}  ${c.node.id}  ${c.score.total}分` +
      (r.group.entries.length > 1
        ? `（组内 ${r.group.entries.length} 人，第2名 ${r.group.entries[1].score.total}分）`
        : "")
    );
    for (const e of r.retired) console.log(`    ✂ 待淘汰  ${e.node.id}  ${e.score.total}分`);
  }
  console.log("\n═══ 总榜前 10 ═══\n");
  for (const e of allEntries.slice(0, 10)) {
    console.log(`  ${String(e.score.total).padStart(3)}分  ${e.node.id}  (${e.key})`);
  }
} else {
  console.log("═══ 知识健身房 · 全量评分 ═══\n");
  for (const r of results) {
    console.log(`▶ ${r.key}`);
    for (const e of r.group.entries) {
      const s = e.score.sub;
      const flags = [
        e === r.champion && r.promoted ? "🏆" : "",
        r.retired.includes(e) ? "✂" : "",
      ].filter(Boolean).join("");
      console.log(
        `  ${String(e.score.total).padStart(3)}分 ${flags.padEnd(2)} ${e.node.id}  ` +
        `篇幅${(s.lengthFit * 100).toFixed(0)} 脚手架${(s.scaffold * 100).toFixed(0)} ` +
        `双语${(s.bilingual * 100).toFixed(0)} 具体${(s.concrete * 100).toFixed(0)} ` +
        `可证伪${(s.falsifiable * 100).toFixed(0)}` +
        (e.score.penalties.p > 0 ? `  扣${e.score.penalties.p}（${e.score.penalties.detail.join("、")}）` : "")
      );
    }
  }
}

const promotedCount = results.filter((r) => r.promoted).length;
const retiredCount = results.reduce((n, r) => n + r.retired.length, 0);
console.log(
  `\n共 ${allEntries.length} 个节点、${results.length} 个擂台；` +
  `${promotedCount} 个冠军达到晋级线，${retiredCount} 个节点待淘汰。`
);

// ── --apply：把决定写回库 ──
// weight 是引擎 pickVariant 的加权依据：冠军 weight=championWeight，
// 淘汰者 weight=0（引擎会跳过），其余回到 1。champions 榜写进 gym.json。
if (APPLY) {
  const touched = new Set();
  const records = {};
  for (const r of results) {
    for (const e of r.group.entries) {
      let w = 1;
      if (r.promoted && e === r.champion) w = gym.promotion.championWeight;
      if (r.retired.includes(e)) w = 0;
      if ((e.node.weight ?? 1) !== w) {
        e.node.weight = w;
        touched.add(r.group.file);
      }
    }
    records[r.key] = { id: r.champion.node.id, score: r.champion.score.total };
  }
  for (const file of touched) {
    const g = [...groups.values()].find((x) => x.file === file);
    writeFileSync(file, JSON.stringify(g.data, null, 2) + "\n", "utf8");
    console.log(`✍ 已写回 ${file}`);
  }
  gym.champions.records = records;
  writeFileSync(GYM_PATH, JSON.stringify(gym, null, 2) + "\n", "utf8");
  console.log(`✍ 冠军榜已写入 ${GYM_PATH}`);
}
