# 灵犀场 Tools 真实能力审计

生成时间：2026-09-23

> 这是源码结构审计，不等于真实浏览器/第三方支付/AI供应商的端到端验收。凡涉及微信、支付宝、PayPal、外部AI、浏览器编解码器或大文件内存压力，仍需实际运行测试。

## 结论摘要

- **MISSING ROUTE**：20
- **REAL LOCAL CODE**：14
- **SHELL / NEEDS REVIEW**：10
- **PLANNED / SHELL**：4
- **REAL SERVER FLOW**：4
- **PARTIAL BUT FUNCTIONAL**：2
- **LIKELY FUNCTIONAL**：1
- Advanced catalog 卡片：33
- registry live：18
- registry planned：7
- advanced / registry 重复 slug：3（jpg-to-png、png-to-jpg、webp-to-jpg）
- advanced 卡片缺独立 route：0

## 每个工具

| Tool | 结构判断 | 代码证据 | Caveat | API |
|---|---|---|---|---|
| `[slug]` | **PLANNED / SHELL** | File bytes | planned marker, mock/demo marker | — |
| `audio-transcription` | **REAL SERVER FLOW** | Download, Server API | — | /api/ai/transcribe<br>/api/tools/pay/status<br>/api/tools/quote |
| `avif-to-jpg` | **REAL LOCAL CODE** | Canvas, Download, Image bitmap | — | — |
| `batch-image` | **REAL LOCAL CODE** | Canvas, ZIP, Download, Image bitmap | — | — |
| `batch-image-watermark-remover` | **SHELL / NEEDS REVIEW** | — | — | — |
| `compress-image` | **MISSING ROUTE** | — | — | — |
| `compress-image-to-100kb` | **MISSING ROUTE** | — | — | — |
| `compress-image-to-200kb` | **MISSING ROUTE** | — | — | — |
| `compress-image-to-20kb` | **MISSING ROUTE** | — | — | — |
| `compress-image-to-500kb` | **MISSING ROUTE** | — | — | — |
| `compress-image-to-50kb` | **MISSING ROUTE** | — | — | — |
| `compress-pdf` | **MISSING ROUTE** | — | — | — |
| `document-copy-layout` | **PARTIAL BUT FUNCTIONAL** | PDF, Canvas, Download, File bytes | partial marker | — |
| `e-sign-pdf` | **SHELL / NEEDS REVIEW** | — | — | — |
| `file-compare` | **MISSING ROUTE** | — | — | — |
| `file-type-detector` | **MISSING ROUTE** | — | — | — |
| `food-calorie` | **SHELL / NEEDS REVIEW** | — | — | — |
| `heic-local` | **SHELL / NEEDS REVIEW** | Download | — | — |
| `heic-to-jpg` | **MISSING ROUTE** | — | — | — |
| `id-photo-ai` | **REAL SERVER FLOW** | Download, Server API | — | /api/ai/id-photo<br>/api/tools/pay/status<br>/api/tools/quote |
| `image-to-pdf` | **MISSING ROUTE** | — | — | — |
| `image-to-pdf-pro` | **REAL LOCAL CODE** | PDF, Download, File bytes | — | — |
| `image-watermark-remover` | **SHELL / NEEDS REVIEW** | — | — | — |
| `jpg-to-png` | **REAL LOCAL CODE** | Canvas, Download, Image bitmap | — | — |
| `json-formatter` | **MISSING ROUTE** | — | — | — |
| `long-image` | **REAL LOCAL CODE** | Canvas, Download, Image bitmap | — | — |
| `md5-sha256` | **MISSING ROUTE** | — | — | — |
| `merge-pdf` | **MISSING ROUTE** | — | — | — |
| `number-energy` | **SHELL / NEEDS REVIEW** | — | — | — |
| `ocr` | **SHELL / NEEDS REVIEW** | OCR | — | — |
| `pdf-compress` | **REAL LOCAL CODE** | PDF, Download, File bytes | — | — |
| `pdf-editor` | **SHELL / NEEDS REVIEW** | — | — | — |
| `pdf-merge-split` | **PLANNED / SHELL** | PDF, Download, File bytes | planned marker | — |
| `pdf-ocr` | **REAL LOCAL CODE** | OCR, Download | — | — |
| `pdf-pages` | **REAL LOCAL CODE** | PDF, Download, File bytes | — | — |
| `pdf-redact` | **REAL LOCAL CODE** | PDF, Canvas, Download, File bytes | — | — |
| `pdf-to-jpg` | **PLANNED / SHELL** | ZIP, Download | planned marker | — |
| `png-to-jpg` | **REAL LOCAL CODE** | Canvas, Download, Image bitmap | — | — |
| `privacy-cleaner` | **PARTIAL BUT FUNCTIONAL** | PDF, Canvas, Download, Image bitmap, File bytes | partial marker | — |
| `qr-code-generator` | **MISSING ROUTE** | — | — | — |
| `qr-code-reader` | **MISSING ROUTE** | — | — | — |
| `qr-safe-reader` | **LIKELY FUNCTIONAL** | Canvas, Image bitmap | — | — |
| `remove-exif` | **MISSING ROUTE** | — | — | — |
| `resize-image` | **MISSING ROUTE** | — | — | — |
| `screenshot-redact` | **REAL LOCAL CODE** | Canvas, Download, Image bitmap | — | — |
| `split-pdf` | **MISSING ROUTE** | — | — | — |
| `subtitle-tools` | **PLANNED / SHELL** | Download | planned marker | — |
| `subtitle-translate` | **REAL SERVER FLOW** | Download, Server API | — | /api/ai/subtitle-translate<br>/api/tools/pay/status<br>/api/tools/quote |
| `svg-to-png` | **REAL LOCAL CODE** | Canvas, Download | — | — |
| `timestamp-converter` | **MISSING ROUTE** | — | — | — |
| `video-dubbing` | **SHELL / NEEDS REVIEW** | — | — | — |
| `video-toolkit` | **REAL LOCAL CODE** | FFmpeg, Download | — | — |
| `video-transcription` | **REAL SERVER FLOW** | Download, Server API | — | /api/ai/transcribe<br>/api/tools/pay/status<br>/api/tools/quote |
| `video-watermark-remover` | **SHELL / NEEDS REVIEW** | — | — | — |
| `webp-to-jpg` | **REAL LOCAL CODE** | Canvas, Download, Image bitmap | — | — |

## 必须优先处理

- `[slug]` — **PLANNED / SHELL**
- `batch-image-watermark-remover` — **SHELL / NEEDS REVIEW**
- `compress-image` — **MISSING ROUTE**
- `compress-image-to-100kb` — **MISSING ROUTE**
- `compress-image-to-200kb` — **MISSING ROUTE**
- `compress-image-to-20kb` — **MISSING ROUTE**
- `compress-image-to-500kb` — **MISSING ROUTE**
- `compress-image-to-50kb` — **MISSING ROUTE**
- `compress-pdf` — **MISSING ROUTE**
- `e-sign-pdf` — **SHELL / NEEDS REVIEW**
- `file-compare` — **MISSING ROUTE**
- `file-type-detector` — **MISSING ROUTE**
- `food-calorie` — **SHELL / NEEDS REVIEW**
- `heic-local` — **SHELL / NEEDS REVIEW**
- `heic-to-jpg` — **MISSING ROUTE**
- `image-to-pdf` — **MISSING ROUTE**
- `image-watermark-remover` — **SHELL / NEEDS REVIEW**
- `json-formatter` — **MISSING ROUTE**
- `md5-sha256` — **MISSING ROUTE**
- `merge-pdf` — **MISSING ROUTE**
- `number-energy` — **SHELL / NEEDS REVIEW**
- `ocr` — **SHELL / NEEDS REVIEW**
- `pdf-editor` — **SHELL / NEEDS REVIEW**
- `pdf-merge-split` — **PLANNED / SHELL**
- `pdf-to-jpg` — **PLANNED / SHELL**
- `qr-code-generator` — **MISSING ROUTE**
- `qr-code-reader` — **MISSING ROUTE**
- `remove-exif` — **MISSING ROUTE**
- `resize-image` — **MISSING ROUTE**
- `split-pdf` — **MISSING ROUTE**
- `subtitle-tools` — **PLANNED / SHELL**
- `timestamp-converter` — **MISSING ROUTE**
- `video-dubbing` — **SHELL / NEEDS REVIEW**
- `video-watermark-remover` — **SHELL / NEEDS REVIEW**

## 不能仅凭源码宣称“已验收”的工具

- 所有付费导出：必须真实完成至少一笔支付 → 回跳 → status → consume → export。
- AI OCR / 转写 / 翻译 / 卡路里 / 去水印：必须实际调用当前生产 provider，并验证失败、限额与计费。
- FFmpeg/WASM：必须在 Chrome / Edge 和移动端测试实际加载、大文件、取消与内存边界。
- PDF 编辑/脱敏/盖章：必须用真实多页 PDF 验证导出后内容确实写入文件，而不是只覆盖视觉层。

## 下一阶段构建原则

1. **不复制页面壳**：同类工具共用 PDF / Image / Video / OCR / Web Fetch / Billing 基础层。
2. **目录卡片只展示真实能力**：shell/planned 不进入“可执行”搜索结果。
3. **免费工具优先形成搜索入口**：一个真实问题，一个清晰 URL，一个能完成的结果。
4. **新工具优先级**：阅后即焚 → 临时邮箱 → 网页正文/Markdown/PDF/截图 → 表格转 Excel → 合同/PDF 对比 → 卡路里记录化。

## 新工具技术基线：阅后即焚

- 浏览器端 AES-256-GCM 加密；服务器只存密文。
- 解密 key 只放 URL fragment `#...`，正常 HTTP 请求不会把 fragment 发给服务器。
- 默认读取一次即删除；同时提供短期自动过期。
- 服务器保存密文、IV、过期时间、读取次数，不保存明文或解密 key。
- 创建/读取 API 限流；密文大小硬限制；禁止渲染未净化 HTML。
- 第一版先做文本，文件版在存储与 abuse-control 完整后再开放。

### 开源架构参考（只借鉴架构，不复制 UI）

- **1time.io — MIT**：浏览器 AES-GCM、URL fragment 持有 key、服务器零知识、默认一次读取。
- **PrivateBin — zlib license**：成熟的 zero-knowledge paste 模型，支持 AES-GCM、密码、过期与 burn-after-reading。
- **Password Pusher — Apache-2.0**：自动过期、阅读次数限制和审计思路成熟。
- **largerio/secret — MIT**：文本/文件、read limit、过期、QR、多语言与大文件分块设计可参考。

> 使用任何开源代码前仍需逐项核 LICENSE、依赖与模型/权重条款。本阶段仅采用公开架构思想，不直接复制第三方源码。