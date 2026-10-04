# 灵犀场文档转换网关 — 生产部署

## 1. DNS

准备一个子域名，例如：

`document-gateway.example.com`

A/AAAA 指向这台 Linux 主机。开放 TCP 80 / 443。

## 2. 生成密钥

Windows 本机可先运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\GENERATE_ENV.ps1" -Domain "document-gateway.example.com"
```

把生成的 `.env` 安全复制到服务器本目录。不要提交 `.env`。

## 3. 启动

Linux:

```bash
chmod +x deploy-linux.sh
./deploy-linux.sh
```

架构：
- Caddy：唯一公网入口，80/443
- gateway：只暴露给 Docker edge 网络
- Gotenberg：只在 `document_internal` 内网
- Gotenberg Basic Auth 已开启

Gotenberg 官方建议不要将服务直接暴露公网；V32 按私网服务处理。

## 4. 配置 Vercel

生产环境增加：

```text
LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL=https://document-gateway.example.com
LINGXIFIELD_DOCUMENT_GATEWAY_SECRET=<.env 中同一个 LINGXIFIELD_DOCUMENT_GATEWAY_SECRET>
```

然后重新部署网站。

## 5. 健康检查

```bash
curl -i https://document-gateway.example.com/health
```

正常：

```json
{"ok":true,"service":"document-gateway"}
```

该检查会进一步探测私网 Gotenberg `/health`。

## 6. 全链路验收

网站部署并配置环境变量后：

```powershell
node scripts/document-gateway/smoke.mjs https://lingxifield.com
```

通过标记：

```text
DOCUMENT_GATEWAY_DIRECT_CONVERSION=PASS
DOCUMENT_GATEWAY_PDF_MAGIC=PASS
DOCUMENT_GATEWAY_REPLAY_GUARD=PASS
DOCUMENT_GATEWAY_END_TO_END=PASS
```

Smoke test 使用很小的 RTF 文档，真实走：
网站签名票据 → HTTPS 网关 → Gotenberg/LibreOffice → PDF，并验证同一个票据不能再次使用。

## 7. 生产格式

Word：DOC / DOCX / DOCM / DOT / DOTM / DOTX / ODT / FODT / OTT / RTF / TXT

Excel：XLS / XLSX / XLSM / XLT / XLTX / ODS / CSV / TSV

PowerPoint：PPT / PPTX / PPTM / POT / POTX / ODP

PDF 本身不需要进入转换网关。

## 8. Small-host resource budget

For a dedicated 2 GB host, Compose caps Gotenberg at 1 GiB, the Node gateway at 512 MiB, and Caddy at 128 MiB. The remaining 384 MiB is reserved for the OS and Docker; other workloads require separate capacity planning. These are limits, not proof that every 50 MiB document will fit. Run representative Office-file tests and watch `docker stats` and restart/OOM events before increasing limits.

The gateway admits one conversion at a time. A busy request receives HTTP 503 and Retry-After: 5 before its ticket is consumed; retry the same ticket while it remains valid. PDF responses are checked as they stream (100 MiB maximum), and the 70-second upstream deadline covers both headers and body. The same-origin fallback shares a 45-second deadline across providers to remain within its 60-second function budget.

After updating these files on the actual host, run `docker compose config`, rebuild the gateway, restart the stack and run the existing tiny-RTF smoke test. A website deployment alone does not update this server. The GPU worker compose file is a separate deployment and is unsuitable for this small CPU host.
