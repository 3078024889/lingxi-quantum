# 灵犀场生产级文档转换

## 为什么需要独立网关

Vercel Functions 当前请求体和响应体都有 4.5 MB 上限。Office 文件和转换后的 PDF 很容易超过这个限制。

因此生产环境采用：

浏览器 → 灵犀场签名票据 → 文档转换网关 → 私网 Gotenberg / LibreOffice → PDF 直接返回浏览器

Gotenberg 不直接暴露公网。

## 启动

```powershell
$env:GOTENBERG_BASIC_USER="lingxifield"
$env:GOTENBERG_BASIC_PASSWORD="<strong-random-password>"
$env:LINGXIFIELD_DOCUMENT_GATEWAY_SECRET="<another-long-random-secret>"
docker compose -f infra/document-converter/compose.yaml up -d --build
```

公网只开放 gateway 的 3100 端口，并由 HTTPS 反向代理保护。

## Vercel 配置

```text
LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL=https://document-gateway.example.com
LINGXIFIELD_DOCUMENT_GATEWAY_SECRET=<与 gateway 相同的 secret>
```

票据 5 分钟有效，绑定文件名、文件大小、MIME 与随机 nonce。

## 内部转换

网关通过 Docker 私网访问：

```text
http://gotenberg:3000/forms/libreoffice/convert
```

Gotenberg 启用官方 Basic Auth，不映射宿主公网端口。

## 回退

没有网关时：
- 非 Vercel / 本地环境仍可走 Next.js `/api/tools/document/normalize`
- Vercel 环境只对约 3.5 MB 以下文件保留 best-effort 同源回退
- 更大的 Office 文件会明确提示转换服务尚未准备，而不是上传后才触发 413
