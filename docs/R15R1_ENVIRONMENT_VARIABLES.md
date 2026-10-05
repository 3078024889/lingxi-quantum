# R15/R15R1 环境变量

## 新增且在启用 Detached Worker 前必须配置

### SASI_WORKER_SECRET
用途：保护 `/api/internal/sasi/worker/tick`。
要求：至少 24 字符；建议 48~64 字节随机值。
Production / Preview 都应各自配置不同 secret。

PowerShell 生成示例：

```powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

注意：不要提交到 Git。

## 可选

### SASI_WORKER_BUILD
用途：为 worker build/version observability 提供自定义标签。
不配置时会回退到 `VERCEL_GIT_COMMIT_SHA`，再回退到 `r15-local`。

## 平台自动提供，无需手动添加
- VERCEL_GIT_COMMIT_SHA
- VERCEL_REGION

## 暂时没有新增
R15R1 region 修复和 Simple Surface contract 不新增其它环境变量。
