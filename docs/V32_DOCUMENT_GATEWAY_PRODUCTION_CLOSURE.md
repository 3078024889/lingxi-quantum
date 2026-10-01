# V32 灵犀场文档转换生产闭环

V32 在 V31 已通过的统一文档入口上补齐生产部署、安全、健康检查与真实端到端验收。

## 架构

浏览器
→ `/api/tools/document/ticket`
→ 5 分钟 HMAC 票据
→ HTTPS 文档网关
→ Docker 私网 Gotenberg + LibreOffice
→ PDF
→ 浏览器
→ 原 PDF 工具继续处理

## 生产保护

- Vercel 不承载大 Office 文件主体，避开 4.5 MB 请求/响应限制。
- Gotenberg 无公网端口。
- 公网网关只经 Caddy HTTPS 暴露。
- 票据 v1、5 分钟有效、绑定文件名/大小/MIME/nonce。
- nonce 单次使用，防止短期重放。
- 扩展名白名单。
- 50 MB 输入上限、100 MB 输出上限。
- 每 IP 每分钟 30 次网关转换入口限制。
- 内部 Gotenberg 使用 Basic Auth。
- 健康检查会真实探测 Gotenberg，而不是只返回静态 ok。
- 服务端与浏览器端双重校验 `%PDF-` 文件头。
- LibreOffice 转出时关闭交互表单导出，避免来源文档携带交互控件进入后续 PDF 工作流。

## 部署前提

需要一台可运行 Docker Compose 的 Linux 主机，以及一个指向该主机的 HTTPS 域名，例如：

`document-gateway.example.com`

把 DNS A/AAAA 记录指向主机后，Caddy 自动申请证书。

## 部署

在服务器的 `infra/document-converter` 目录：

1. 生成 `.env`
2. 启动 Compose
3. 配置 Vercel 两个变量
4. 重新部署网站
5. 跑端到端 smoke test

详见 `infra/document-converter/README.md`。
