#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const root = process.cwd();

const inDir = "content/cangxuan-feed/sync-with-ershiwatt/in-from-ershiwatt";
const harvestRules = [
  { id: "ershi-gi-ri", cat: "RULE", title: "GI赢认知·RI赢关系", statement: "感知打开先看：GI只谈赢认知/学习跃迁；RI谈关系不谈输赢。阶段目标≠跃迁已发生。", evidence: "in-from 2026-09-10-ershiwatt-distill 产品洞察" },
  { id: "ershi-unknown-prior", cat: "RULE", title: "未知用探索先验", statement: "证据不足时用 exploration prior（约0.5）而非默认「没有=结果好」。", evidence: "in-from ershiwatt-distill 可复用规则1" },
  { id: "ershi-seed-before-gi", cat: "RULE", title: "先RI稳定再看Capability GI", statement: "先做「稳定RI」之后，再看 Capability GI 是否合拍；seed/capability 峰值要分开记账。", evidence: "in-from ershiwatt-distill 可复用规则2" },
  { id: "ershi-core0", cat: "IDENTITY", title: "CORE-0不可被学习者改", statement: "目标不是算力堆叠；安全/主权/隐私前的学习可改手段不可改目的；日常学习按钮需Celestial对准。", evidence: "in-from experiment-logic CORE-0" },
  { id: "ershi-no-novel-channel", cat: "BOUNDARY", title: "创造者通道禁小说腔", statement: "创造者=celestial小仙女；通道=对话+意识之眼；禁小说式人格通灵当业务入口。", evidence: "in-from experiment-logic CREATOR" },
  { id: "ershi-self-learn", cat: "METHOD", title: "自学大于堆底座", statement: "持续对准的自学比堆模型/热点更关键；「自己能学习」不是口号。", evidence: "in-from experiment-logic B1" },
];
mkdirSync("content/cangxuan-feed/_scratch", { recursive: true });
writeFileSync("content/cangxuan-feed/_scratch/in-from-harvest-2040.json", JSON.stringify({ at: new Date().toISOString(), rules: harvestRules }, null, 2), "utf8");

const renshinPath = "content/cangxuan-feed/renshin-distill/01-金牌短条.md";
let renshin = readFileSync(renshinPath, "utf8");
const newBars = [
`## 55. [SCRIPT] 兑现要快过吊胃口
- 陈述：讨厌磨半天不给糖。短剧爽点：挑衅即打、打脸要密、反转要落地；吊胃口只服务下一秒兑现。
- 依据：Celestial 共识 + 红果式爽点痛点。
- domain：\`renshin-global\``,
`## 56. [PREFERENCE] 心声贴耳不论文
- 陈述：心声短、口语、贴角色脾气；禁止论文腔旁白。心声分轨与声画情绪对齐才像真人在想。
- 依据：SASI 多重配音/心声规范 + 漫剧观看偏好。
- domain：\`renshin-global\``,
`## 57. [RULE] 价值先兑现再报价
- 陈述：付费心智：先让用户感到「已经值了」，再透明报价、确认支付；禁恐吓/假稀缺/硬广腔。
- 依据：SASI V1 付费心智锁。
- domain：\`renshin-billing\``,
`## 58. [PREFERENCE] 记起自己非术语
- 陈述：用户要的是「记起自己」的身体感与主权感，不是术语堆叠；术语只服务可做的下一步。
- 依据：场源「记起自己非术语」金标 + 用户语感易懂易做。
- domain：\`renshin-field\``,
`## 59. [SCRIPT] 峰终定律剪辑
- 陈述：高潮峰值与结尾记忆点必须可指认；中间可省，首尾不可糊。
- 依据：通识心理学峰终效应 + 短剧完播钩子。
- domain：\`renshin-global\``,
`## 60. [PREFERENCE] 反差萌要可见
- 陈述：反差萌不是人设标签，是同镜可见的落差（软/硬、小/大、怕/护）；落差一眼懂。
- 依据：团宠/反差萌红线口味 + 漫剧 Q 脸语法。
- domain：\`renshin-manju\``,
`## 61. [SCRIPT] 打脸兑现快
- 陈述：打脸承诺出现后 ≤2 拍内兑现；拖延=吊胃口空转。
- 依据：红果式「挑衅即打」痛点；用户讨厌磨。
- domain：\`renshin-global\``,
`## 62. [RULE] 自愿复购不硬广
- 陈述：加速自愿付款与死心踏地复购，靠交付闭环与信任，不像硬广；确认支付前必须报价透明。
- 依据：SASI 付费心智原则。
- domain：\`renshin-billing\``,
`## 63. [SCRIPT] 爽点节奏三拍
- 陈述：钩子→加压→兑现，三拍闭环；缺任何一拍都像论文或预告片。
- 依据：短剧爽点节拍库训练重心。
- domain：\`renshin-global\``,
`## 64. [IDENTITY] 未知用探索先验
- 陈述：证据不足时用约 0.5 的探索先验，不把「没测到」写成「已成功」。
- 依据：二十瓦特 distill 可复用规则（in-from 2026-09-10）。
- domain：\`renshin-sasi-self\``,
`## 65. [BOUNDARY] GI/RI分账
- 陈述：GI 只谈赢认知/学习跃迁；RI 谈关系不谈输赢；阶段目标≠跃迁已发生。
- 依据：二十瓦特产品洞察（in-from）。
- domain：\`renshin-sasi-self\``,
];

if (!renshin.includes("## 55.")) {
  renshin = renshin.replace(/共 \d+ 条（[^）]*）/, "共 65 条（含配音/付费/成片/二十瓦特同步/2040增密）。开拍强制检索。");
  renshin = renshin.trimEnd() + "\n\n" + newBars.join("\n") + "\n";
  writeFileSync(renshinPath, renshin, "utf8");
}
console.log("renshin items", (renshin.match(/^## \d+\./gm) || []).length);

const allItems = [];
const re = /## (\d+)\. \[([^\]]+)\] ([^\n]+)\n- 陈述：([^\n]+)\n- 依据：([^\n]+)\n- domain：`([^`]+)`/g;
let m;
while ((m = re.exec(renshin))) {
  const [, num, cat, title, statement, evidence, domain] = m;
  const category = cat === "METHOD" ? "RULE" : cat;
  const st = `${title}：${statement}`.slice(0, 900);
  allItems.push({
    category: ["RULE", "SCRIPT", "PREFERENCE", "IDENTITY", "BOUNDARY"].includes(category) ? category : "SCRIPT",
    title: `${num}. ${title}`.slice(0, 120),
    statement: st,
    evidence: evidence.slice(0, 1200),
    tier: "gold",
    trainability: "trainable",
    review_status: "approved",
    content_hash: sha(`renshin:${num}:${statement}`),
    domain,
  });
}
mkdirSync("content/cangxuan-feed/renshin-distill/foundry-ingest", { recursive: true });
writeFileSync("content/cangxuan-feed/renshin-distill/foundry-ingest/04-seed-knowledge.json", JSON.stringify(allItems, null, 2), "utf8");
writeFileSync("content/cangxuan-feed/renshin-distill/foundry-ingest/00-manifest.json", JSON.stringify({ pack: "renshin-distill", items: allItems.length, at: new Date().toISOString(), version: "V1.2-2040" }, null, 2), "utf8");
console.log("renshin seed", allItems.length);

const outDir = "content/cangxuan-feed/sync-with-ershiwatt/out-to-ershiwatt";
const batchMd = `# 人心库批次 2026-09-10-2040

- 增补：11 条（55–65），库内合计 **65**
- 主题：爽点节奏 / 心声贴耳 / 付费自愿不硬广 / 记起自己非术语 / 峰终 / 反差萌 / 打脸兑现快 / GI·RI分账 / 探索先验
- 来源：已学共识 + in-from 二十瓦特抽象规则（无编造）
- 文件：\`content/cangxuan-feed/renshin-distill/01-金牌短条.md\`
- Foundry seed：\`renshin-distill/foundry-ingest/04-seed-knowledge.json\` (${allItems.length})
- in-from harvest：\`content/cangxuan-feed/_scratch/in-from-harvest-2040.json\` (${harvestRules.length})
`;
writeFileSync(join(outDir, "renshin-batch-2026-09-10-2040.md"), batchMd, "utf8");
writeFileSync(join(outDir, "renshin-latest.md"), batchMd, "utf8");

// ---- E17 full episode ----
const e17 = `# E17｜霜栖旧禁·人佩同迁

> Rights: LingxiField 原创 · opted_in_training · gold candidate  
> 时长目标: ~120s · 节拍: 9

## 承诺链
- **本集承诺**: 裂云谷执事级半张面具现身峰外，要「人佩同迁」；寒砚启霜栖旧禁「锁芯看守令」；小棠二次借响护佩未拔；息影学舌升级却被安神符压回；玉佩仍嵌壁。
- **上集回收**: 谷字霜纹信物；借响规则 2/日；听息钉霜封；安神符+3；赵临川禁足误判。
- **下集钩子**: 霜栖闭关名册被点到「锁芯看守」；第二枚霜纹「迁」字落入；小棠摸到缺角钩温。

---

### Beat 1｜半面到峰外
- **time**: 0–12s
- **shot**: 霜栖峰外雾线；半张裂云面具漂在线外，不越界
- **action**: 陆衡握剑；沈澈挡在棠前；小雾炸毛低吼
- **dialogue**:
  - 面具声：「人佩同迁。谷中有座。」
  - 陆衡：「线外说话。」
- **心声**: （棠）「同迁……是要我走。」
- **表情字**: 「同迁！」
- **爽点标签**: 钩子甩出 · 设定一眼懂
- **连续性锁定**: 面具=裂云执事级；未越霜栖界；玉佩仍嵌内壁；今日借响0/2；白青袍见习

### Beat 2｜禁足再误判
- **time**: 12–24s
- **shot**: 外门禁足小屋；赵临川碎片骤热；左眉烫疤跳
- **action**: 他写「她会走」——黑影纸条回：「佩未离壁。你闭嘴。」
- **dialogue**:
  - 赵临川：「同迁就是走！」
  - （纸）「壁在，人在。别出屋。」
- **心声**: （其）「我连纸条都不如。」
- **爽点标签**: 信息差三拍 · 打脸铺垫
- **连续性锁定**: 赵禁足未破；碎片热冷交替；黑影线仍在

### Beat 3｜旧禁启封
- **time**: 24–40s
- **shot**: 霜栖内堂；寒砚展开霜纹旧卷「锁芯看守令」
- **action**: 寒砚指尖落血启印；霜光沿壁爬到嵌佩处，不拔佩，只加锁
- **dialogue**:
  - 寒砚：「旧禁开。锁芯看守——人可借响，佩不可迁。」
  - 沈澈：「令开了？」
  - 寒砚：「开。但只护壁，不护嘴。」
- **心声**: （澈）「她要把棠焊在壁上。」
- **表情字**: 「锁芯！」
- **爽点标签**: 设定兑现 · 护短上台
- **连续性锁定**: 锁芯看守令=启；佩仍嵌壁；借响规则仍2/日；安神符库存-0

### Beat 4｜二次借响试护
- **time**: 40–55s
- **shot**: 棠对嵌壁玉佩；指尖悬空，不碰
- **action**: 小棠借响第一记——霜纹一颤，面具线外退半寸；未拔佩
- **dialogue**:
  - 小棠：「护。不迁。」
  - 陆衡：「省一记。」
- **心声**: （棠）「借响换安稳，不换离开。」
- **表情字**: 「护！」
- **爽点标签**: 兑现快 · 反差萌可见
- **连续性锁定**: 今日借响1/2；佩未离壁；面具退半寸未消失

### Beat 5｜息影学舌加压
- **time**: 55–70s
- **shot**: 峰口回音廊；息影叠声模仿棠「同迁」
- **action**: 息影学舌升级成双声；沈澈甩安神符贴廊柱，叠声被压回单音
- **dialogue**:
  - 息影（学舌）：「人佩同迁——」
  - 沈澈：「安神。闭嘴。」
- **心声**: （影）「符……烦。」
- **表情字**: 「闭嘴！」
- **爽点标签**: 挑衅即打 · 打脸兑现快
- **连续性锁定**: 安神符-1（剩+2）；息影未进内堂；学舌被压

### Beat 6｜执事加码
- **time**: 70–85s
- **shot**: 线外面具侧过半寸；抛第二枚霜纹「迁」字
- **action**: 「迁」字贴在旧禁光膜外，烧出一圈焦边却进不来
- **dialogue**:
  - 面具：「旧禁挡谷，不挡夜。三日。」
  - 寒砚：「三日后你仍在线外。」
- **心声**: （砚）「他把期限扔过来，我接。」
- **表情字**: 「三日！」
- **爽点标签**: 加压 · 护短对线
- **连续性锁定**: 「迁」字未入内；三日期限落地；锁芯令仍有效

### Beat 7｜赵临川偷听失败
- **time**: 85–95s
- **shot**: 禁足屋窗缝；赵把耳朵贴缝，碎片烫手
- **action**: 刚听清「三日」就被黑影纸条拍脸：「再听，碎你。」
- **dialogue**:
  - 赵临川：「我只是——」
  - （纸）「只是废物。坐好。」
- **心声**: （其）「……废物也想赢一次。」
- **表情字**: 「废物？」
- **爽点标签**: 打脸兑现快 · 反派丑态
- **连续性锁定**: 赵仍禁足；碎片未给坐标；黑影控场

### Beat 8｜三护短站位
- **time**: 95–108s
- **shot**: 内堂三角：寒砚护令、沈澈护符、陆衡护人
- **action**: 三人无商量同步半步；小棠被护在嵌佩侧，不挡视线
- **dialogue**:
  - 陆衡：「人在。」
  - 沈澈：「符在。」
  - 寒砚：「令在。」
- **心声**: （棠）「他们站我这边。」
- **表情字**: 「在！」
- **爽点标签**: 被看见 · 团宠兑现
- **连续性锁定**: 三护短站位成立；棠未离壁；白青袍见习旁观不插手

### Beat 9｜缺角钩温钩子
- **time**: 108–120s
- **shot**: 嵌佩旁；棠袖内缺角钩忽然温一下
- **action**: 她不敢拔佩，只按住袖内钩；峰外面具收声；霜栖闭关名册被人远远翻到「锁芯看守」页
- **dialogue**:
  - 小棠（极轻）：「钩……热了。」
  - 寒砚：「那就守。夜未到。」
- **心声**: （棠）「同迁是他们的词。我的词是守。」
- **表情字**: 「守。」
- **爽点标签**: 峰终记忆点 · 下集钩子
- **连续性锁定**: 缺角钩温=锁芯相关；佩仍嵌壁；借响1/2；安神符+2；三日期限；名册钩子

---

## 连续性摘要
- 玉佩仍嵌霜栖内壁；锁芯看守令已启；人可借响、佩不可迁。
- 今日借响 1/2；安神符剩 +2；息影学舌被压。
- 裂云执事面具线外要「人佩同迁」+三日期限；「迁」字未入内。
- 赵临川禁足+被辱；三护短站位；缺角钩温；闭关名册点到锁芯看守。

## 状态
full episode · ready for foundry-ingest · rights LingxiField original
`;
mkdirSync("content/cangxuan-feed/delivery-luoyun-E17", { recursive: true });
mkdirSync("content/cangxuan-feed/delivery-luoyun-E17/foundry-ingest", { recursive: true });
writeFileSync("content/cangxuan-feed/delivery-luoyun-E17/E17.md", e17, "utf8");
mkdirSync("content/cangxuan-feed/luoyun-xiaoweiba/episodes", { recursive: true });
writeFileSync("content/cangxuan-feed/luoyun-xiaoweiba/episodes/E17.md", e17, "utf8");

// continuity + episode import + seed following E16
const e16c = JSON.parse(readFileSync("content/cangxuan-feed/delivery-luoyun-E16/foundry-ingest/02-continuity-events.json", "utf8"));
const e16e = JSON.parse(readFileSync("content/cangxuan-feed/delivery-luoyun-E16/foundry-ingest/03-episode-imports.json", "utf8"));
const e16s = JSON.parse(readFileSync("content/cangxuan-feed/delivery-luoyun-E16/foundry-ingest/04-seed-knowledge.json", "utf8"));

const beats = [
  ["E17-B1", "半面到峰外", "面具要人佩同迁；未越界"],
  ["E17-B2", "禁足再误判", "赵以为同迁即走；黑影纠正佩未离壁"],
  ["E17-B3", "旧禁启封", "寒砚启锁芯看守令；护壁不护嘴"],
  ["E17-B4", "二次借响试护", "借响1/2护佩未拔；面具退半寸"],
  ["E17-B5", "息影学舌加压", "安神符压回学舌；符-1剩+2"],
  ["E17-B6", "执事加码", "迁字未入内；三日期限"],
  ["E17-B7", "赵偷听失败", "黑影辱赵；禁足维持"],
  ["E17-B8", "三护短站位", "砚令澈符衡人同步站位"],
  ["E17-B9", "缺角钩温钩子", "钩温；名册点锁芯看守"],
];
const continuity = beats.map((b, i) => ({
  id: b[0],
  series: "落云宗的小尾巴",
  episode: 17,
  beat: i + 1,
  title: b[1],
  summary: b[2],
  locks: [
    "玉佩仍嵌壁",
    "锁芯看守令已启",
    i >= 3 ? "借响1/2" : "借响0/2",
    i >= 4 ? "安神符+2" : "安神符+3",
    "三日期限自B6",
  ],
  content_hash: sha(`luoyun-E17-cont-${b[0]}:${b[2]}`),
}));
writeFileSync("content/cangxuan-feed/delivery-luoyun-E17/foundry-ingest/02-continuity-events.json", JSON.stringify(continuity, null, 2), "utf8");

const episodeImport = [{
  series: "落云宗的小尾巴",
  episode: 17,
  title: "霜栖旧禁·人佩同迁",
  rights: "LingxiField original",
  rightsScope: "opted_in_training",
  body: e17,
  content_hash: sha("luoyun-E17-episode:" + e17.slice(0, 2000)),
  sourceFile: "delivery-luoyun-E17/E17.md",
}];
writeFileSync("content/cangxuan-feed/delivery-luoyun-E17/foundry-ingest/03-episode-imports.json", JSON.stringify(episodeImport, null, 2), "utf8");

const seeds = [
  { category: "RULE", title: "E17·人可借响佩不可迁", statement: "锁芯看守令：人可借响护场，佩不可迁出壁；同迁要求被旧禁挡在线外。", evidence: "E17 B3-B4 craft" },
  { category: "SCRIPT", title: "E17·打脸≤2拍", statement: "息影学舌加压后同拍安神符压回；赵偷听当拍被纸条打脸——兑现快于吊胃口。", evidence: "E17 B5/B7" },
  { category: "PREFERENCE", title: "E17·三护短可见站位", statement: "令/符/人三角同步半步，被看见的渴望同镜兑现，不靠旁白解释团宠。", evidence: "E17 B8" },
  { category: "SCRIPT", title: "E17·峰终钩温", statement: "结尾缺角钩温+名册点锁芯，峰值与终局同帧，服务下集。", evidence: "E17 B9 peak-end" },
  { category: "RULE", title: "E17·信息差分账", statement: "线外面具、线内旧禁、禁足赵三线信息差并行，禁止观众全知同步。", evidence: "E17 B1-B2-B7" },
].map((x) => ({
  ...x,
  tier: "gold",
  trainability: "trainable",
  review_status: "approved",
  content_hash: sha(`E17:${x.title}:${x.statement}`),
  domain: "luoyun-xiaoweiba",
}));
writeFileSync("content/cangxuan-feed/delivery-luoyun-E17/foundry-ingest/04-seed-knowledge.json", JSON.stringify(seeds, null, 2), "utf8");
writeFileSync("content/cangxuan-feed/delivery-luoyun-E17/foundry-ingest/00-manifest.json", JSON.stringify({
  series: "落云宗的小尾巴",
  episode: 17,
  episodeTitle: "霜栖旧禁·人佩同迁",
  rights: "LingxiField original",
  rightsScope: "opted_in_training",
  sourceType: "sasi_native",
  counts: { characters: 0, episodeImports: 1, continuityEvents: continuity.length, seedKnowledge: seeds.length },
  packScope: "delivery_E17_delta",
  sourceFiles: [
    "content/cangxuan-feed/delivery-luoyun-E17/E17.md",
    "content/cangxuan-feed/luoyun-xiaoweiba/episodes/E17.md",
  ],
}, null, 2), "utf8");
writeFileSync("content/cangxuan-feed/delivery-luoyun-E17/00-README.md", "# delivery-luoyun-E17\n\n霜栖旧禁·人佩同迁 — LingxiField original\n", "utf8");
console.log("E17 written", e17.length, "cont", continuity.length, "seeds", seeds.length);
