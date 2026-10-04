# 仓库清理记录 · 2026-10-04

范围：仅 D:\lingxi-quantum。

已删除 26 个无运行时入口的旧源文件，以及历史构建副本、旧依赖缓存、预览产物和 627 个与 Git 历史内容一致的备份文件。删除文件共 61835 个，文件长度合计 6.979 GB。这里统计的是逻辑文件大小，不保证等于 Windows 可用空间的增量。

| 已删除目录 | 原文件大小 | 文件数 |
| --- | ---: | ---: |
| `_local/build-cache-before-clean-20260929` | 732.1 MB | 136 |
| `tmp/npm-cache` | 243.9 MB | 801 |
| `tmp/v322-pdf-pages` | 0.0 MB | 0 |
| `tmp/v323-pdf-pages` | 0.0 MB | 0 |
| `tmp/v324-pdf-pages` | 0.0 MB | 0 |
| `tmp/v325-pdf-pages` | 0.0 MB | 0 |
| `tmp/v326-pdf-pages` | 0.0 MB | 0 |
| `tmp/balance-preview` | 2.6 MB | 14 |
| `test-results` | 2.0 MB | 9 |
| `output` | 0.0 MB | 0 |
| `2026-10-02` | 0.0 MB | 0 |
| `payload` | 0.0 MB | 0 |
| `reports` | 0.0 MB | 0 |
| `release` | 0.0 MB | 0 |
| `tmp/money-audit-worktree` | 1998.5 MB | 8567 |
| `tmp/seo-build-repair` | 2025.1 MB | 8662 |
| `_local/recovery-20260930/node_modules` | 903.9 MB | 40449 |
| `_local/recovery-20260930/.next` | 30.0 MB | 75 |
| `_local/worktrees/sasi-planet-review-target-20260926/.next` | 497.0 MB | 1226 |
| `_local/worktrees/sasi-self-hosted-20260926/.next` | 536.2 MB | 1243 |

两个已完成任务的旧工作区有 82 个未提交文件，其中 59 个与主仓库一致；其余 23 个按 SHA-256 校验，保存在 `_local/cleanup-preserved-20261004/`。先校验内容，再移除依赖目录联接，最后移除工作区，主仓库依赖保持可用。

未删除现用代码、Git、数据库迁移、原始内容和知识资料、当前任务工作区、本机模型运行目录，以及未能证明重复的恢复资料。它们不因日期早就被认定为废弃。

源文件逐项列表、Git 内容指纹与删除目录统计见同目录 JSON。

同时删除币种选择器与账户设置里的定价流程说明，补齐九语言的币种名称和无障碍标签。账务逻辑未改动。

验证：现行源码检查通过；Next.js 生产构建通过，803 个页面生成成功；桌面和手机共 18 次九语言币种选择、标签、页面宽度和运行错误检查全部通过。
