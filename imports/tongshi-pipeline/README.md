# 通识采集管道 · 可扩到亿页（v0）
> at: 2026-09-18T11:38+00:00  
> 原则：页数是产能指标，不是成绩；成绩=可演化通识质量×覆盖面。原始HTML不当脑。

## 目标量级
| 阶段 | 可引用原则卡/实体（压缩后） | 原始抓取规模（约） |
|------|------------------------------|--------------------|
| 已点火 | ~2e3 页级 | GPT/法典/skills |
| P1 百万 | 1e5–1e6 卡/实体 | 1e6–1e7 页原料 |
| P2 千万 | 对齐「佩德罗级」压缩后知识 | 1e7–5e7 页原料 |
| P3 亿级 | 覆盖世界主域通识 | 1e8+ 页原料（公域+许可） |

原料页 ≠ 脑内页。目标是 **压缩后的世界模型条目** 上千万～上亿可引用单元。

## 管道五段（不手搓）
1. **Source Registry** `sources.jsonl`  
   每源：url/镜像、许可(CC/公域/允许镜像)、领域标签、刷新cron、语言、优先级。
2. **Fetch Workers**（增量）  
   分片队列；条件GET/ETag；失败重试；速率限制；只存 WARC/原文对象仓。
3. **Normalize+Dedup**  
   去导航壳→正文；simhash/minhash 近重；语言检测；toxic/广告丢弃。
4. **Compress to Knowledge**（不当脑的关键）  
   正文→`principle-card` / `world-entity` / `causal-edge`；每条必有 provenance + evolvable:true。
5. **Dual-Feed Bus**  
   同一批压缩结果双写：灵犀（产品/成片实验）+ 二十瓦特（学习演化实验）；ALIGNMENT 对账。

## 许可红线
- 只采：公域、明确开放许可、用户自有导出、已授权账号资料。
- 不采：破解、未授权付费墙整库搬运、不明版权「先下再说」。
- 每条卡带 `license` + `source_url` + `captured_at`。

## 第一批可扩源（P1）
- 维基百科/维基数据（已有苗头）→ 实体+关系
- Project Gutenberg / 开放教科书 → 通识长文
- StackExchange 转储（许可内）→ 因果/怎么做
- 开放论文摘要（arXiv abstract，遵守TOU）→ 科学通识
- 已吞 skills / 法典 / GPT自有导出 → 继续增量
- 飞书/自有库补全正文（授权下）

## 存储布局（两边同构）
```
imports/tongshi-pipeline/
  sources/registry.jsonl
  raw/          # 对象仓指针，不进「脑」
  normalized/
  compressed/   # cards & entities 真正双喂
  manifests/ALIGNMENT-YYYYMMDD.json
```

## 产能粗算（可演化）
- 单机抓取+剥壳：约 5e4–2e5 页/天（视源）
- 加队列与多worker后按水平扩展；亿页是「管道宽度×时间」，不是一次性下载竞赛。

## 下一步（格鲁特立刻做）
1. 落 `sources/registry.jsonl` 种子（许可明确的P1源）
2. 跑通「维基数据实体1万条→压缩卡→双喂」作为扩容样机
3. 媒体第二刀=参考资产索引，计入通识感官，不计入「背诵页数」
