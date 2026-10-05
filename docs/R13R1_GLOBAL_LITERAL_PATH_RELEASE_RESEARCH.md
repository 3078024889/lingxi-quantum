# R13R1 — Dynamic Route Literal Copy / 发布输入完整性

## 当前失败的根因

R13 的两个新文件路径包含 Next.js 动态路由目录：

- `app/api/sasi/runs/[runId]/events/route.ts`
- `app/api/sasi/runs/[runId]/snapshot/route.ts`

PowerShell 的 `[]` 是 wildcard 语法。Microsoft 官方文档明确说明：
使用 `-Path` 时方括号会被解释为通配符；需要精确路径时必须使用 `-LiteralPath`。

R13 安装器虽然 `Need()` 已使用 `Test-Path -LiteralPath` 验证 payload 文件存在，
但实际复制仍是：

`Copy-Item $src $dst -Force`

这会重新落回 wildcard 语义。
因此安装器没有把 `[runId]` 两个 route 可靠复制到 repo，随后 preflight 正确地报告：
`MISSING_CHANGED_FILE`.

## R13R1 的修复不只是一处参数

改成统一的 `Copy-VerifiedLiteralFile`：

1. source 用 `Test-Path -LiteralPath`
2. 目标目录用 .NET `Directory.CreateDirectory`
3. 文件复制用 .NET `File.Copy`
4. destination 再用 `Test-Path -LiteralPath`
5. source / destination SHA256 必须一致
6. 任一步不满足立即 fail-closed

这避免所有 `[]`、`?`、`*` 等 PowerShell wildcard 路径语义。

## 从成熟平台继续提取的优势

### PowerShell 官方 LiteralPath
精确文件发布不应该依赖 wildcard Path 解析。
动态路由、版本文件、用户生成路径都属于 literal path。

### Nx affected / project graph
Nx 会用 Git 变更和项目依赖图判断真正受影响的任务，而不是盲扫或漏扫。
SASI 后续可以做：
- payload changed-files manifest
- affected surface audit
- 全局关键门

### Hermetic / content-addressed 发布思想
成熟构建系统强调“声明输入 + 可验证输出”。
R13R1 开始把每个 payload copy 都做 source/destination hash verification。
未来可以继续升级到：
- package manifest SHA256
- installer version / schema version
- copied-file receipt
- release capsule manifest

## 新门禁

动态路由这类路径必须有安装器回归测试：
- `[runId]`
- `[slug]`
- `[...path]`
- `[[...optional]]`

以后不再允许：
“payload 里有文件 ≠ repo 里一定复制成功”。
必须以目标文件存在 + hash 相同为准。
