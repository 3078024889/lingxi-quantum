# 灵犀场工具中心 V4 — 新增依赖许可证记录

本补丁新增或明确使用的前端依赖：

| 依赖 | 用途 | 许可证 | 商业使用 |
|---|---|---|---|
| pdf-lib | PDF 合并/拆分/编辑/元数据 | MIT | 允许 |
| heic2any | HEIC/HEIF 转换 | MIT | 允许 |
| jsQR | 二维码图片解析 | Apache-2.0 | 允许，保留许可信息 |
| tesseract.js | 浏览器 OCR | Apache-2.0 | 允许，保留许可信息 |
| @ffmpeg/ffmpeg / @ffmpeg/core | 浏览器媒体处理 | MIT / FFmpeg core 具体构建需保留项目既有 LICENSE/SOURCE 说明 | 按既有项目合规方式继续 |
| jszip | 批量结果 ZIP 打包 | MIT / GPLv3 dual license，项目选择 MIT 条款 | 允许 |

本轮没有复制 Stirling PDF、InkVault、IT-Tools、Alatify、omne、LaMa/IOPaint 的源码。
它们仅作为产品能力与架构研究来源；如未来引入任何代码、WASM、模型或二进制，必须再次逐项审查 LICENSE。
