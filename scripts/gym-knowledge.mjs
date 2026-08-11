#!/usr/bin/env node
// ────────────────────────────────────────────────────────────────
// 知识健身房（Knowledge Gym）· v302 佩德罗测试环境
// ────────────────────────────────────────────────────────────────
// 算法出处：《哥白尼》（詹姆斯·玛呼）。佩德罗的设计有三个要件，
// v302 把它们全部落地（渊源与映射见 docs/lingxi-foundation.md）：
//
//   一、测试环境——"我们创造了超过 7 千种变体，在各式的学习任务中
//       展开测试"。这里的学习任务 = 模拟用户的分数形状。5 维 × 6 探针
//       = 7776 种变体，每一种都跑一遍真实的选择逻辑，统计每个节点
//       实际服务了谁、每条组合赢了多少次。写得好不好是文本关的事，
//       用不用得上只有实战场知道。
//
//   二、关卡与变强——"一些强大的算法顺利穿过了他的系统，当从另一端
//       出来后，它们变得更为强大，然后，我们会将那些最强大的竞争者
//       送往下个层级"。四层关卡：L0 报名 → L1 文本关 → L2 实战关 →
//       L3 登顶。穿过关卡即变强：weight 随层级上升，被选中的概率
//       随之提高。登顶必须赢过真实的竞争者，独苗最高到 L2。
//
//   三、重构——"他会拾起这些代码串，编码重构成……这个"。实战场
//       跑完后，从组合覆盖最薄弱的分数形状里提取联锁骨架，按服务
//       人数排序输出提案。机器只提骨架，文字必须由人写——
//       "运行时无 AI、成文无生成"的铁律在重构环节的形态。
//
// lint 管底线（不许扭曲），gym 管上限（哪段更好、缺什么形状）。
// 评分与实战全部可复算：不依赖时间、不依赖随机数。
//
// 用法：
//   node scripts/gym-knowledge.mjs               层级总览 + 各擂台明细
//   node scripts/gym-knowledge.mjs --top         冠军榜 + 组合战绩 + 总榜
//   node scripts/gym-knowledge.mjs --proposals   哥白尼重构提案（联锁骨架）
//   node scripts/gym-knowledge.mjs --apply       层级weight/冠军榜/提案写回
//
// 全部阈值与词表读 knowledge/_shared/gym.json 和 lexicon.json。

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "knowledge";
const GYM_PATH = join(ROOT, "_shared", "gym.json");
const LEXICON_PATH = join(ROOT, "_shared", "lexicon.json");
const AVOID_PATH = join(ROOT, "_shared", "avoid-words.json");
const BANDS_PATH = join(ROOT, "_shared", "bands.json");

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
const bandsConfig = readJson(BANDS_PATH);

const CFG = gym.scoring;
const W = CFG.weights;

// ── 引擎逻辑镜像 ──
// 与 lib/knowledge-engine.ts 保持一致（bandOf / hash / pickVariant /
// comboMatches / comboSpecificity）。实战场必须跑和线上完全相同的
// 选择逻辑，否则测的就不是真实战场。改引擎时同步改这里。

function bandOf(score) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const hit = bandsConfig.bands.find((b) => s >= b.min && s <= b.max);
  return hit?.key ?? "mid";
}

function hash(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function pickVariant(items, seed) {
  if (items.length === 0) return null;
  const alive = items.filter((it) => (it.weight ?? 1) > 0);
  const pool = alive.length > 0 ? alive : items;
  if (pool.length === 1) return pool[0];
  const total = pool.reduce((sum, it) => sum + (it.weight ?? 1), 0);
  let point = hash(seed) % Math.max(1, total);
  for (const it of pool) {
    point -= it.weight ?? 1;
    if (point < 0) return it;
  }
  return pool[pool.length - 1];
}

function comboMatches(cond, scores) {
  const gapMin = cond.gapMin ?? 40;
  if (cond.contrast) {
    const [hiDim, loDim] = cond.contrast;
    const hi = scores[hiDim];
    const lo = scores[loDim];
    if (hi == null || lo == null) return false;
    if (hi - lo < gapMin) return false;
  }
  if (cond.bothLow) {
    for (const d of cond.bothLow) {
      const b = bandOf(scores[d] ?? 50);
      if (b !== "low" && b !== "vlow") return false;
    }
  }
  if (cond.bothHigh) {
    for (const d of cond.bothHigh) {
      const b = bandOf(scores[d] ?? 50);
      if (b !== "high" && b !== "vhigh") return false;
    }
  }
  if (cond.interlock) {
    for (const slot of cond.interlock) {
      const v = scores[slot.dim];
      if (v == null) return false;
      if (!slot.bands.includes(bandOf(v))) return false;
    }
  }
  return true;
}

function comboSpecificity(cond) {
  let s = 0;
  if (cond.contrast) s += 2;
  if (cond.bothLow) s += cond.bothLow.length;
  if (cond.bothHigh) s += cond.bothHigh.length;
  if (cond.interlock) {
    for (const slot of cond.interlock) {
      const bandCount = Math.min(5, Math.max(1, slot.bands.length));
      s += 1 + (5 - bandCount) / 5;
    }
  }
  return s;
}

// ── L1 文本关：静态评分 ──

function scoreLengthFit(zh) {
  const len = zh.length;
  const { min, max } = CFG.idealLengthZh;
  if (len >= min && len <= max) return 1;
  if (len < min) return Math.max(0, len / min);
  return Math.max(0, 1 - (len - max) / max);
}

function scoreScaffold(node) {
  // 组合节点没有脚手架字段（lint 也不要求），该项视为满分。
  if (node.when) return 1;
  const fields = ["corePattern", "shadowSide", "growthDirection"];
  let ok = 0;
  for (const f of fields) {
    if (node[f] && String(node[f]).trim().length >= CFG.scaffoldMinChars) ok++;
  }
  return ok / fields.length;
}

function scoreBilingual(node) {
  const en = node.fieldText?.en ?? "";
  if (en.length >= CFG.minLengthEn) return 1;
  return en.length / CFG.minLengthEn;
}

function scoreConcrete(zh) {
  let hits = 0;
  for (const m of CFG.concreteMarkers) if (zh.includes(m)) hits++;
  return Math.min(1, hits / CFG.concreteFullScoreHits);
}

function scoreFalsifiable(zh) {
  for (const m of CFG.falsifiableMarkers) if (zh.includes(m)) return 1;
  return 0;
}

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

// ── 收集参赛产品 ──
// 参赛条件：chapters.json + nodes.json 都在。占位产品（romance 等）
// 自动列为空场，等节点进来那天自动开赛。

const products = [];
for (const dir of readdirSync(ROOT).filter((d) => {
  const p = join(ROOT, d);
  return d !== "_shared" && statSync(p).isDirectory();
})) {
  const chapters = readJson(join(ROOT, dir, "chapters.json"))?.chapters;
  const nodesData = readJson(join(ROOT, dir, "nodes.json"));
  if (!chapters || !nodesData) continue;
  const combosData = readJson(join(ROOT, dir, "combos.json"), { combos: [] });
  products.push({
    dir,
    chapters,
    nodesData,
    nodes: nodesData.nodes ?? [],
    combos: combosData.combos ?? [],
  });
}

if (products.length === 0) {
  console.log("没有找到任何参赛产品，健身房空场。");
  process.exit(0);
}

// ── 佩德罗测试环境：生成模拟用户全集并实战 ──

function buildProfiles(dims) {
  const probes = gym.arena.probes;
  let profiles = [{}];
  for (const dim of dims) {
    const next = [];
    for (const p of profiles) for (const v of probes) next.push({ ...p, [dim]: v });
    profiles = next;
    if (profiles.length > gym.arena.maxProfiles) {
      console.error(`✗ ${dims.length} 维 × ${probes.length} 探针超出 maxProfiles 上限，请调整 gym.json`);
      process.exit(1);
    }
  }
  return profiles;
}

for (const prod of products) {
  const dims = [...new Set(prod.chapters.map((c) => c.dim).filter(Boolean))];
  const profiles = dims.length > 0 && prod.nodes.length > 0 ? buildProfiles(dims) : [];
  prod.dims = dims;
  prod.profileCount = profiles.length;

  const served = new Map();   // 结构节点 id -> 实战服务次数（被真实选中）
  const comboWins = new Map(); // 组合 id -> 赢下章节次数
  const comboHits = new Map(); // 组合 id -> 命中次数（含被更具体条件压过）
  const darkShapes = new Map(); // 联锁骨架签名 -> { count, skeleton }

  const sortedCombos = (chKey, scores) =>
    prod.combos
      .filter((c) => c.chapter === chKey && comboMatches(c.when, scores))
      .sort(
        (a, b) =>
          comboSpecificity(b.when) - comboSpecificity(a.when) ||
          b.priority - a.priority ||
          a.id.localeCompare(b.id)
      );

  for (const scores of profiles) {
    // 真实世界里种子是每个用户自己的出生数据，人人不同——变体的
    // 服务量按权重自然分布。所以实战场的种子必须包含模拟用户的
    // 身份（它的分数形状），只用固定种子会让整个擂台的所有用户
    // 挑中同一个变体，文本最好的节点可能实战永远为 0，那是失真。
    const identity = dims.map((d) => scores[d]).join(",");
    let uncoveredChapters = 0;
    for (const ch of prod.chapters) {
      const hit = sortedCombos(ch.key, scores);
      if (hit.length > 0) {
        comboWins.set(hit[0].id, (comboWins.get(hit[0].id) ?? 0) + 1);
        for (const c of hit) comboHits.set(c.id, (comboHits.get(c.id) ?? 0) + 1);
        continue;
      }
      uncoveredChapters++;
      if (!ch.dim) continue;
      const band = bandOf(scores[ch.dim] ?? 50);
      const candidates = prod.nodes.filter(
        (n) => n.chapter === ch.key && n.dim === ch.dim && n.band === band
      );
      for (const seed of gym.arena.seeds) {
        const picked = pickVariant(candidates, `${seed}|${identity}|${ch.key}|${band}`);
        if (picked) served.set(picked.id, (served.get(picked.id) ?? 0) + 1);
      }
    }

    // 哥白尼重构的原料：组合覆盖薄弱的分数形状。
    if (uncoveredChapters >= gym.reconstruction.minUncoveredChapters) {
      const extremity = { vlow: 2, vhigh: 2, low: 1, high: 1, mid: 0 };
      const slots = dims
        .map((d) => ({ dim: d, band: bandOf(scores[d]) }))
        .filter((s) => s.band !== "mid")
        .sort((a, b) => extremity[b.band] - extremity[a.band] || a.dim.localeCompare(b.dim))
        .slice(0, gym.reconstruction.slotCount);
      if (slots.length < 2) continue;
      const sig = slots.map((s) => `${s.dim}:${s.band}`).sort().join("+");
      const rec = darkShapes.get(sig) ?? { count: 0, slots };
      rec.count++;
      darkShapes.set(sig, rec);
    }
  }

  prod.served = served;
  prod.comboWins = comboWins;
  prod.comboHits = comboHits;

  // 已被现有联锁覆盖的形状不再提案：用骨架的代表分数试一遍全部联锁。
  const bandRep = { vlow: 12, low: 35, mid: 55, high: 75, vhigh: 92 };
  const interlockCombos = prod.combos.filter((c) => c.when?.interlock);
  prod.proposals = [...darkShapes.entries()]
    .filter(([, rec]) => {
      const repScores = {};
      for (const d of dims) repScores[d] = 55;
      for (const s of rec.slots) repScores[s.dim] = bandRep[s.band];
      return !interlockCombos.some((c) => comboMatches(c.when, repScores));
    })
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .slice(0, gym.reconstruction.maxProposals)
    .map(([sig, rec]) => ({
      product: prod.dir,
      signature: sig,
      slots: rec.slots.map((s) => ({ dim: s.dim, bands: [s.band] })),
      profilesServed: rec.count,
    }));
}

// ── 擂台分组 + 层级判定 ──

const LEVEL_ORDER = ["L0", "L1", "L2", "L3"];

const rings = new Map(); // ringKey -> { prod, entries }
for (const prod of products) {
  prod.nodes.forEach((node) => {
    if (!node.chapter || !node.dim || !node.band) return;
    const key = `${prod.dir}|${node.chapter}|${node.dim}|${node.band}`;
    if (!rings.has(key)) rings.set(key, { prod, entries: [] });
    rings.get(key).entries.push({ node, score: scoreNode(node), served: prod.served.get(node.id) ?? 0 });
  });
}

const results = [];
for (const [key, ring] of rings) {
  ring.entries.sort((a, b) => b.score.total - a.score.total || a.node.id.localeCompare(b.node.id));
  const champion = ring.entries[0];

  for (const e of ring.entries) {
    let level = "L0";
    if (e.score.total >= gym.levels.textGate.minScore) level = "L1";
    if (level === "L1" && e.served >= gym.levels.arenaGate.minServedStructure) level = "L2";
    if (
      level === "L2" &&
      e === champion &&
      (!gym.levels.summit.requireCompetition || ring.entries.length > 1)
    ) level = "L3";
    e.level = level;
  }

  const retired = [];
  for (const e of ring.entries) {
    if (e.score.total >= gym.elimination.retireBelow) continue;
    const survivors = ring.entries.filter((x) => x !== e && !retired.includes(x));
    if (gym.elimination.keepCoverage && survivors.length === 0) continue;
    retired.push(e);
  }
  results.push({ key, ring, champion, retired });
}
results.sort((a, b) => a.key.localeCompare(b.key));

// 组合战绩（组合不参与 weight，层级只作台账）
const comboBoards = products.map((prod) => ({
  prod,
  rows: prod.combos
    .map((c) => ({
      combo: c,
      score: scoreNode(c),
      wins: prod.comboWins.get(c.id) ?? 0,
      hits: prod.comboHits.get(c.id) ?? 0,
    }))
    .map((r) => {
      let level = "L0";
      if (r.score.total >= gym.levels.textGate.minScore) level = "L1";
      if (level === "L1" && r.wins >= gym.levels.arenaGate.minWinsCombo) level = "L2";
      return { ...r, level };
    })
    .sort((a, b) => b.wins - a.wins || a.combo.id.localeCompare(b.combo.id)),
}));
// 组合登顶：每产品赢面最大且过实战关的那条。
// 具体度为 0 的兜底组合（when 为空）没有登顶资格——它不在竞争，
// 它是地板：谁都不命中时才轮到它，赢的量大不代表说得准。
for (const board of comboBoards) {
  const top = board.rows.find((r) => r.level === "L2" && comboSpecificity(r.combo.when) > 0);
  if (top && board.rows.length > 1) top.level = "L3";
}

// ── 输出 ──

const args = process.argv.slice(2);
const TOP = args.includes("--top");
const PROPOSALS = args.includes("--proposals");
const APPLY = args.includes("--apply");

const allEntries = results.flatMap((r) => r.ring.entries.map((e) => ({ ...e, key: r.key })));
allEntries.sort((a, b) => b.score.total - a.score.total || a.node.id.localeCompare(b.node.id));

function levelCounts(entries) {
  const c = { L0: 0, L1: 0, L2: 0, L3: 0 };
  for (const e of entries) c[e.level]++;
  return `L3登顶 ${c.L3} · L2实战 ${c.L2} · L1文本 ${c.L1} · L0报名 ${c.L0}`;
}

if (PROPOSALS) {
  console.log("═══ 哥白尼重构 · 联锁骨架提案 ═══");
  console.log("（机器只提骨架，文字由人写。写好的节点放进对应产品 combos.json 的 when.interlock。）\n");
  let any = false;
  for (const prod of products) {
    for (const p of prod.proposals) {
      any = true;
      console.log(`▶ ${p.product} · 服务 ${p.profilesServed} 个模拟用户的空白形状`);
      for (const s of p.slots) console.log(`    槽位 ${s.dim} ∈ [${s.bands.join(", ")}]`);
      console.log(`    建议 when: {"interlock": ${JSON.stringify(p.slots)}}\n`);
    }
  }
  if (!any) console.log("当前没有覆盖薄弱的形状——或者参赛节点还太少，实战场打不出暗区。");
} else if (TOP) {
  console.log("═══ 知识健身房 · 冠军榜（v302 佩德罗测试环境） ═══\n");
  for (const prod of products) {
    console.log(`◆ ${prod.dir} —— ${prod.profileCount} 种分数变体入场${prod.nodes.length === 0 ? "（占位产品，空场）" : ""}`);
  }
  console.log("");
  for (const r of results) {
    const c = r.champion;
    console.log(
      `  ${r.key}\n    [${c.level}] ${c.node.id}  文本${c.score.total}分 · 实战服务${c.served}人` +
      (r.ring.entries.length > 1 ? `（组内 ${r.ring.entries.length} 人竞争）` : "（独苗，最高 L2）")
    );
    for (const e of r.retired) console.log(`    ✂ 待淘汰  ${e.node.id}  ${e.score.total}分`);
  }
  console.log("\n═══ 组合战绩（按赢下章节次数） ═══\n");
  for (const board of comboBoards) {
    for (const row of board.rows.slice(0, 8)) {
      console.log(
        `  [${row.level}] ${row.combo.id}  赢${row.wins}次 / 命中${row.hits}次 · ` +
        `具体度${comboSpecificity(row.combo.when).toFixed(1)} · 文本${row.score.total}分`
      );
    }
  }
  console.log("\n═══ 结构节点总榜前 10（文本分） ═══\n");
  for (const e of allEntries.slice(0, 10)) {
    console.log(`  ${String(e.score.total).padStart(3)}分 [${e.level}]  ${e.node.id}  (${e.key})`);
  }
} else {
  console.log("═══ 知识健身房 · 层级总览（v302 佩德罗测试环境） ═══\n");
  for (const prod of products) {
    const prodEntries = allEntries.filter((e) => e.key.startsWith(`${prod.dir}|`));
    console.log(`◆ ${prod.dir} —— ${prod.profileCount} 种分数变体 · ${prodEntries.length} 个节点 · ${prod.combos.length} 条组合`);
    if (prodEntries.length > 0) console.log(`   ${levelCounts(prodEntries)}`);
  }
  console.log("");
  for (const r of results) {
    console.log(`▶ ${r.key}`);
    for (const e of r.ring.entries) {
      const s = e.score.sub;
      const flags = r.retired.includes(e) ? "✂" : "";
      console.log(
        `  [${e.level}] ${String(e.score.total).padStart(3)}分 ${flags.padEnd(1)} ${e.node.id}  实战${e.served}人  ` +
        `篇幅${(s.lengthFit * 100).toFixed(0)} 脚手架${(s.scaffold * 100).toFixed(0)} ` +
        `双语${(s.bilingual * 100).toFixed(0)} 具体${(s.concrete * 100).toFixed(0)} ` +
        `可证伪${(s.falsifiable * 100).toFixed(0)}` +
        (e.score.penalties.p > 0 ? `  扣${e.score.penalties.p}（${e.score.penalties.detail.join("、")}）` : "")
      );
    }
  }
}

const summitCount = allEntries.filter((e) => e.level === "L3").length;
const retiredCount = results.reduce((n, r) => n + r.retired.length, 0);
const proposalCount = products.reduce((n, p) => n + p.proposals.length, 0);
console.log(
  `\n共 ${allEntries.length} 个节点、${results.length} 个擂台、` +
  `${products.reduce((n, p) => n + p.profileCount, 0)} 种分数变体入场；` +
  `${summitCount} 个节点登顶，${retiredCount} 个待淘汰，${proposalCount} 条重构提案。`
);

// ── --apply：把层级写成力量 ──
// 结构节点 weight = 层级对应的 weights 表值；淘汰者 weight=0。
// 冠军榜（含层级与实战数据）与重构提案写进 gym.json。
if (APPLY) {
  const touched = new Set();
  const records = {};
  for (const r of results) {
    for (const e of r.ring.entries) {
      let w = gym.levels.weights[e.level] ?? 1;
      if (r.retired.includes(e)) w = 0;
      if ((e.node.weight ?? 1) !== w) {
        e.node.weight = w;
        touched.add(r.ring.prod);
      }
    }
    records[r.key] = {
      id: r.champion.node.id,
      score: r.champion.score.total,
      level: r.champion.level,
      served: r.champion.served,
    };
  }
  for (const prod of touched) {
    const file = join(ROOT, prod.dir, "nodes.json");
    writeFileSync(file, JSON.stringify(prod.nodesData, null, 2) + "\n", "utf8");
    console.log(`✍ 已写回 ${file}`);
  }
  gym.champions.records = records;
  gym.reconstruction.proposals = products.flatMap((p) => p.proposals);
  writeFileSync(GYM_PATH, JSON.stringify(gym, null, 2) + "\n", "utf8");
  console.log(`✍ 冠军榜与重构提案已写入 ${GYM_PATH}`);
}
