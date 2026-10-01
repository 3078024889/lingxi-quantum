# 灵犀场文档高保真转换服务

## 选择
主站不把 DOC/DOCX 粗略转成 HTML 后冒充原版式。DOC/DOCX 先由独立 LibreOffice Writer 服务转换为 PDF，再进入灵犀场现有页面模型、签名、印章、骑缝章、预览和导出链。

## 许可证边界
- LibreOffice：MPL 2.0 为主；本仓库不复制 LibreOffice 源码或二进制，只提供调用边界和可选容器构建文件。
- ONLYOFFICE Community：AGPL v3；网络集成到闭源商业 SaaS 需要额外评估/商业许可，因此本实现不内嵌。
- Collabora Online：源代码许可与可执行形式存在不同条件；本实现不内嵌其可执行版。

## 部署
生产环境把 `services/document-converter` 部署到独立受控服务，设置随机强密钥：
- `LINGXIFIELD_DOCUMENT_CONVERTER_SECRET`
主站设置：
- `LINGXIFIELD_DOCUMENT_CONVERTER_URL=https://<your-converter-host>`
- `LINGXIFIELD_DOCUMENT_CONVERTER_SECRET=<same-secret>`

转换服务只接受 DOC/DOCX，20MB 上限，45 秒转换超时，不接收用户指定 URL，不执行 shell 字符串，转换结束清理临时目录。
