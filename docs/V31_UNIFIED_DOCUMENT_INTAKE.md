# V31 统一文档入口

目标：所有以 PDF 为输入的工具统一接受 Word、PowerPoint、Excel、OpenDocument 等常见文档。

用户界面只描述结果：
- 上传 PDF、Word、PPT、Excel 等文档
- 非 PDF 文档会先转换，再进入原来的 PDF 编辑、签名、压缩、OCR、脱敏、页面处理或转图片流程
- 转换服务临时不可用时，不隐藏文档入口；用户会收到清晰提示，也仍可继续使用 PDF

内部转换顺序：
1. 自托管 Gotenberg + LibreOffice
2. 灵犀场自有转换服务
3. ConvertAPI 备用

安全：
- 上传最大 50 MB
- 不执行宏
- PDF 魔数校验
- Gotenberg 建议仅放在私网 / 防火墙后
- 不更改支付、提现、食品、本源、生产数据

统一覆盖：
- PDF 编辑
- PDF 电子签名 / 电子签章 / 骑缝章
- PDF OCR
- PDF 真脱敏
- PDF 页面删除 / 排序 / 旋转
- PDF 压缩
- PDF 合并 / 拆分
- PDF 转 JPG / PNG
- 通过通用 FileDropzone 的其他 PDF 输入工具
