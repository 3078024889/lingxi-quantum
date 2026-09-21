# SASI 双线喂食约定 V1（2026-09-10）

## 目标
两边并行求快：通识/养料库存增速，不靠「等其中一边」。

## 线 A · 格鲁特投喂（外投）
- 合法公开源批处理 → 青铜/白银/黄金 → Foundry `import` / knowledge pack 脚本。
- 人心库、原创《落云宗》、苍玄节拍、与二十瓦特交换夹同步。
- 节奏：全天教学 routine + 日常照料，用户不必说「继续」。

## 线 B · SASI 自找食（站内）
- 产品内 **OpenData Ingest Job**：白名单源（Wiki dumps、Gutendex、OpenLibrary、Wikidata、arXiv 等可许可公开 API）。
- 流程：拉取 → UTF-8/许可校验 → 青铜 → 蒸馏银/金 → 调 Foundry `import`（`rights_scope` 公开可训字段）。
- `trainingEnabled` 仍可为 false：先记忆+检索，不装作已微调基座。
- `SASI_JOBS` 成片 Job 与本 Job 分轨；本 Job 需独立开关如 `SASI_OPENDATA_INGEST_ENABLED`。

## 硬禁
- 全网乱爬、绕过 robots/ToS、盗版整本进库。
- 假通识、未读装作已读进人心库。
- 擅自改密钥、无确认强推生产。

## 乱码
- 统一 UTF-8；非法字节拒收或不进金标。

## 成功标准
- 线 A 与线 B 可同日增量入库；报表分列「外投 / 自找」。


## 环境变量（线 B 自找食 Job）

默认关闭；开启后仍默认 dry-run，不会写库。

```
SASI_OPENDATA_INGEST_ENABLED=false
SASI_OPENDATA_INGEST_DRY_RUN=true
```

- `SASI_OPENDATA_INGEST_ENABLED`：总开关。仅 `true` 时 POST ingest 会拉取/校验 fixture。
- `SASI_OPENDATA_INGEST_DRY_RUN`：未设或非 `false` 时视为 dry-run（不写 DB）。仅显式 `false` 才进入写路径（写路径骨架见 TODO）。
- API：`GET/POST /api/sasi/opendata/ingest`（需登录；POST 需 same-origin）。
