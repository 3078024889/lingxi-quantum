# SASI Compute Worker

独立于 Vercel 的 SASI 计算节点。当前版本已经实现真实 HTTP 服务、HMAC、nonce 防重放、时间窗、健康检查、能力发现和任务协议。默认只启用 `worker.echo` 自检能力；扩散图像与生成视频节点只有在本机模型真正配置后才会报告 ready，避免把“接口存在”误报成“模型可用”。

启动：

```powershell
$env:SASI_COMPUTE_WORKER_SECRET="至少32位随机密钥"
node .\workers\sasi-compute\server.mjs
```
