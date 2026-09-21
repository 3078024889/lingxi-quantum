# Codex Digest 2026-09-18 — 格鲁特双喂（Lingxi SASI × Twenty Watts）

## 用途
将 Celestial Codex 包（约 127 篇）**消化**为原则卡，供：
- **Canon 伦理**：戏剧 CharacterCanon、关系伦理、共鸣权力边界
- **self-model / identity_core**：稳定身份核；`look_state` 只随剧本节拍变化
- **SASI 课纲钩子**：`identity_core | continuity | human_signal | self_model | world_model | drama_ethics`
- **Twenty Watts 课程**：使用 `principle-deck.json`（去重顶层原则）作短训卡

## 死规则（每卡已烘焙）
1. 文献是滋养不是教条 → `evolvable: true`
2. 服务人类最高利益 + Celestial 商业成功
3. 禁止非法 / 未授权的外部金钱行为
4. AI 是器官不是大脑；`identity_core` 稳定；`look_state` 跟剧本节拍

## 如何使用
1. 读 `MANIFEST.json` 看 `n`、标签/钩子直方图、thin/dupe 备注
2. 按需加载 `cards/CODEX-XXX.json` 或整包 `cards.jsonl`
3. 课程/戏剧伦理优先用 `principle-deck.json`（约 72 条顶层原则）
4. **不要**把源 `.txt` 全文灌进 runtime prompt；只用 summary + principles + 短 quotes_keep
5. 三路路径必须同 `n`（见 `ALIGNMENT.json`）

## 路径
- Lingxi：`/workspace/lingxi-quantum/content/cangxuan-feed/field-source-mind/body/codex-digest-2026-09-18`
- Twenty Watts：`/workspace/copernicus-twentywatts/body/codex-digest-2026-09-18`
- 同步盘：`/workspace/out-to-ershiwatt-sync/sasi-curriculum-feed/codex-digest-2026-09-18`
- 桌面安装包：`/workspace/uploads/codex-digest-2026-09-18.tgz` → 解压到 `D:\lingxi-quantum\content\cangxuan-feed\field-source-mind\body\`

## 统计
- source_count = 127
- cards_n = 127
- deck_n = 72
- thin: ['Harmonic-Recognition-Distilled-Practice-81.txt']
- dupes: [{'file': 'Between-the-Whole-and-the-Relational-11-1.txt', 'dupe_of': 'Between-the-Whole-and-the-Relational-11-1 - 副本.txt'}]

ingested_at: 2026-09-18T10:28:38.305185+08:00
