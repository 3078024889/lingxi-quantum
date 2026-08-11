#!/usr/bin/env node
// 知识库写作纪律检查器
//
// 为什么需要这个：docs/KNOWLEDGE-BASE-DESIGN.md 里那八条写作纪律，
// 如果只靠自觉，写到第三百条节点的时候一定会松——不是因为不认同，
// 是因为累。所以把纪律做成可执行的检查，接进 CI，不通过不许合。
//
// 用法：node scripts/lint-knowledge.mjs
// 退出码非 0 表示有违规，CI 会因此失败。

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "knowledge";
const productArgIndex = process.argv.indexOf("--product");
const selectedProduct = productArgIndex >= 0 ? process.argv[productArgIndex + 1] : null;

if (productArgIndex >= 0 && (!selectedProduct || !/^[a-z0-9-]+$/.test(selectedProduct))) {
  console.error("用法：node scripts/lint-knowledge.mjs [--product resilience]");
  process.exit(2);
}
if (selectedProduct && !existsSync(join(ROOT, selectedProduct))) {
  console.error(`未知知识产品：${selectedProduct}`);
  process.exit(2);
}

// ── 一、玄词黑名单 ──
// 判定标准只有一个：这句话写完之后，能不能回答"所以具体是什么"。
// 回答不了的，就是扭曲——看起来神秘，实际什么也没说。
const MYSTIC = [
  "能量场很乱", "能量很乱", "频率偏低", "频率很低", "提升频率",
  "磁场受阻", "气场很强", "负能量", "正能量满满", "宇宙会安排",
  "小宇宙", "高维存在会", "开启第三眼", "业力清算",
];

// ── 二、宿命句式 ──
// 违反第八条（把自主权留给用户），同时也是合规红线。
const FATALISM = [
  "注定", "命中注定", "天生就是", "决定了你", "改变不了",
  "逃不过", "必然会", "一定会遇到", "早已写定", "命该",
];

// ── 三、判词与奉承 ──
// 奉承和打击是同一种扭曲，都在替用户定性（违反第一、第三条）。
const VERDICT = [
  "很强大", "非常强大", "极其优秀", "罕见的天赋", "天赋异禀",
  "明显偏弱", "能力不足", "性格缺陷", "你就是这样的人",
  "你是一个很", "你属于那种",
];

// ── 四、空泛建议 ──（违反第七条）
const VAGUE_ADVICE = [
  "多注意休息", "保持平和", "放松心情", "顺其自然就好",
  "相信自己就好", "多爱自己",
];

const GROUPS = [
  { name: "玄词（写完无法回答'所以具体是什么'）", list: MYSTIC },
  { name: "宿命句式（违反第八条·自主权）", list: FATALISM },
  { name: "判词/奉承（违反第一、三条）", list: VERDICT },
  { name: "空泛建议（违反第七条）", list: VAGUE_ADVICE },
];

let violations = 0;
let checked = 0;

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".json") ? [p] : [];
  });
}

// 把不同版本知识节点中所有面向用户的文字抽出来一起检查。
function collectText(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectText);
  return [];
}

function userFacingText(node) {
  const fields = [
    "fieldText", "textZh", "textEn", "full_narrative",
    "core_dendrite", "shadow_dendrite", "growthDirection",
  ];
  return fields.flatMap((field) => collectText(node[field])).filter(Boolean).join("\n");
}

function report(file, id, msg) {
  violations++;
  console.error(`✗ ${file}${id ? ` [${id}]` : ""}\n  ${msg}`);
}

const scanRoots = selectedProduct
  ? [join(ROOT, "_shared"), join(ROOT, selectedProduct)]
  : [ROOT];
const files = [...new Set(scanRoots.flatMap(walk))];

for (const file of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    report(file, "", `JSON 解析失败：${e.message}`);
    continue;
  }

  // 全局黑名单可以在 knowledge/_shared/avoid-words.json 里持续追加
  const extra =
    file.endsWith("avoid-words.json") ? [] :
    (() => {
      const p = join(ROOT, "_shared", "avoid-words.json");
      if (!existsSync(p)) return [];
      try { return JSON.parse(readFileSync(p, "utf8")).words ?? []; }
      catch { return []; }
    })();

  // 梦境库结构跟节点库不同：symbols.json 里是 symbols[].readings[]，
  // themes.json 里是 themes[]。同样要过写作纪律检查——扭曲的词不分
  // 出现在哪个库里。
  const nodes = Array.isArray(data)
    ? data
    : data.nodes ?? data.combos ?? data.themes ??
      (data.symbols ? data.symbols.flatMap((s) =>
        (s.readings ?? []).map((r, i) => ({ id: `${s.id}#${r.emotion ?? i}`, fieldText: r.fieldText }))
      ) : []);
  if (!Array.isArray(nodes)) continue;

  for (const node of nodes) {
    checked++;
    const text = userFacingText(node);
    const id = node.id ?? "(无id)";

    // 结构完整性：三个脚手架字段缺任何一个就报错。
    // 这一条是防止跳过思考直接写"一句好听的话"——真正有质量的段落
    // 必须同时讲清机制、代价、方向。组合节点不强制要求。
    if (node.band && !node.when) {
      for (const f of ["corePattern", "shadowSide", "growthDirection"]) {
        if (!node[f] || !String(node[f]).trim()) {
          report(file, id, `缺少必填脚手架字段 ${f}（先想清楚机制/代价/方向，再写正文）`);
        }
      }
    }

    if (!text.trim()) {
      report(file, id, "没有面向用户的正文（支持 fieldText / textZh / full_narrative 等字段）");
      continue;
    }
    if (/\[cite(?:\s*:\s*|\s+)\d+\]/i.test(text)) {
      report(file, id, "存在未解析的 [cite] 引用标记；出版前必须替换为真实来源或删除。");
    }

    for (const g of GROUPS) {
      for (const w of g.list) {
        if (text.includes(w)) report(file, id, `${g.name}：命中「${w}」`);
      }
    }
    for (const w of [...extra, ...(node.avoidWords ?? [])]) {
      if (w && text.includes(w)) report(file, id, `黑名单：命中「${w}」`);
    }
  }
}

console.log(`\n检查了 ${checked} 个节点。`);

// ── 覆盖率检查 ──
// 真实事故：情绪稳定力那一章写了 vhigh 和 low，漏了 mid，而用户分数
// 恰好是 50 → 落在 mid → 没有任何节点命中 → 章节整个是空的。
// 用户付了钱翻到第二章什么都没有。这种洞必须在构建期堵死，不能靠
// 人记得。规则：每个章节的主维度，五个分数带必须都至少有一个节点。
const BANDS = ["vlow", "low", "mid", "high", "vhigh"];
const coverageDirs = readdirSync(ROOT).filter(
  (dir) => dir !== "_shared" && (!selectedProduct || dir === selectedProduct)
);
for (const dir of coverageDirs) {
  const enginePath = join(ROOT, dir, "engine.json");
  if (existsSync(enginePath)) {
    const manifest = JSON.parse(readFileSync(enginePath, "utf8"));
    if (!existsSync(manifest.engine) || !existsSync(manifest.audit)) {
      report(enginePath, dir, "代码型知识引擎缺少有效的 engine 或 audit 文件。");
    }
    continue;
  }
  const chPath = join(ROOT, dir, "chapters.json");
  const nodePath = join(ROOT, dir, "nodes.json");
  const comboPath = join(ROOT, dir, "combos.json");
  if (!existsSync(chPath) || !existsSync(nodePath)) continue;
  let chapters, nodes, combos;
  try {
    chapters = JSON.parse(readFileSync(chPath, "utf8")).chapters ?? [];
    nodes = JSON.parse(readFileSync(nodePath, "utf8")).nodes ?? [];
    combos = existsSync(comboPath)
      ? JSON.parse(readFileSync(comboPath, "utf8")).combos ?? []
      : [];
  } catch { continue; }

  for (const ch of chapters) {
    // dim 为 null 的总览章必须有无条件组合兜底，否则普通分数组合会空白。
    if (!ch.dim) {
      const hasDefault = combos.some(
        (combo) => combo.chapter === ch.key && Object.keys(combo.when ?? {}).length === 0
      );
      if (!hasDefault) {
        report(
          `${dir}/combos.json`,
          ch.key,
          "覆盖缺口：总览章缺少无条件默认组合，部分用户会得到空白开篇。"
        );
      }
      continue;
    }
    for (const band of BANDS) {
      const has = nodes.some(
        (n) => n.chapter === ch.key && n.dim === ch.dim && n.band === band
      );
      if (!has) {
        report(
          `${dir}/nodes.json`,
          `${ch.key}·${ch.dim}·${band}`,
          `覆盖缺口：这一带没有任何节点。分数落在这一带的用户，这一章会是空白。`
        );
      }
    }
  }
}

if (violations > 0) {
  console.error(`发现 ${violations} 处违反写作纪律。修掉之后再合。`);
  console.error(`纪律全文见 docs/KNOWLEDGE-BASE-DESIGN.md 第二节。`);
  process.exit(1);
}
console.log("全部通过 —— 没有扭曲的词。");
