# LINGXIFIELD｜121 个不重复的公开工具验收账本（V128）

**审核日期：2026-11-02，发布候选：[#105](https://github.com/3078024889/lingxi-quantum/pull/105)，基础依赖：[#104](https://github.com/3078024889/lingxi-quantum/pull/104)。**

此文件沿用旧 `124-tools-one-by-one-v126.md` 路径，以保证历史链接有效。经过代码层查重，原目录 124 项中删除了 3 个重复展示入口，现在 **121 项独立工具**；3 条旧网址继续做 308 跳转，不会丢失用户书签。

| 指标 | 数量 |
|---|---:|
| 不重复公开工具 | **121** |
| 已登记真实浏览器操作场景（不等于 CI 全通过） | **82** |
| 仅有历史部分样本 | **2** |
| 尚未具备充分真实操作场景 | **22** |

## 重复工具处理记录

| 旧入口（不再展示工具卡片） | 保留的唯一入口 | 事实依据 |
|---|---|---|
| `/tools/image-to-pdf-pro` | `/tools/image-to-pdf` | 原路由已经是直接跳转，不存在第二套处理功能 |
| `/tools/heic-local` | `/tools/heic-to-jpg` | 均把 HEIC/HEIF 转成 JPG；保留 HeicWorkbench 的批量处理界面 |
| `/tools/compress-pdf` | `/tools/pdf-compress` | 都基于逐页图片重建压缩；保留三档压缩质量、显示体积变化和取消功能 |

以下**不应误删**：`qr-code-reader` 与 `qr-safe-reader`（后者在打开 URL 前要求用户查看内容）；`pdf-merge-split` 与 `merge-pdf`（前者额外覆盖提取和旋转等操作）；`compress-image-to-20kb` 与 `compress-image-to-100kb`（明确不同目标体积）。

## 九语言名称统一

`food-calorie` 的内部 slug、原有 API 计费标识和历史分享链接保持不变；九语言卡片名称、详情 H1、页面介绍、图片 alt 与 SEO 标题统一为“卡路里识别”（各语言对应表达）。说明依然要求用户确认食物、烹饪方式及份量，图片无法精确测量重量。

## 全部 121 个独立工具的证据状态

| 工具 slug | 验收证据状态 | 登记操作测试 |
|---|---|---|
| ai-image-check | FULL_E2E_STILL_MISSING | — |
| ai-video-audio-check | FULL_E2E_STILL_MISSING | — |
| audio-cleanup | REAL_E2E_CASE_REGISTERED_CI_PENDING | `paid-local-output-v89.spec.ts` |
| audio-transcription | FULL_E2E_STILL_MISSING | — |
| avif-to-jpg | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| base64-encode-decode | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| batch-image | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| batch-image-watermark-remover | FULL_E2E_STILL_MISSING | — |
| batch-pdf | FULL_E2E_STILL_MISSING | — |
| bmp-to-png | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| burn-after-read | FULL_E2E_STILL_MISSING | — |
| case-converter | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| compress-image | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-local-tool-real-v127.spec.ts` |
| compress-image-to-100kb | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-200kb | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-20kb | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-500kb | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-50kb | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| cron-parser | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| csv-json | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| csv-to-xlsx | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-office-roundtrip-v118.spec.ts` |
| document-copy-layout | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-subtitle-local-v129.spec.ts` |
| document-translate | FULL_E2E_STILL_MISSING | — |
| docx-to-txt | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-longtail-documents-v126.spec.ts` |
| e-sign-pdf | FULL_E2E_STILL_MISSING | — |
| epub-to-txt | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-longtail-documents-v126.spec.ts` |
| file-compare | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| file-type-detector | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| food-calorie | FULL_E2E_STILL_MISSING | — |
| gif-to-jpg | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| handwriting-ocr | FULL_E2E_STILL_MISSING | — |
| heic-to-jpg | FULL_E2E_STILL_MISSING | — |
| ico-to-png | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-ico-real-v129.spec.ts` |
| ics-to-csv | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-longtail-documents-v126.spec.ts` |
| id-photo-ai | FULL_E2E_STILL_MISSING | — |
| image-to-pdf | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-cross-workflow-v125.spec.ts` |
| image-translator | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-user-journeys-v1.spec.ts` |
| image-watermark-remover | FULL_E2E_STILL_MISSING | — |
| jfif-to-jpg | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| jpg-to-png | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| json-formatter | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| jwt-decoder | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| long-image | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| loop-video | FULL_E2E_STILL_MISSING | — |
| md5-sha256 | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| merge-pdf | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-pdf-qr-e2e-v119.spec.ts` |
| number-base-converter | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| ocr | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-ocr-real-v130.spec.ts` |
| odt-to-txt | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-longtail-documents-v126.spec.ts` |
| pdf-attachments | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-bates-numbering | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-bookmarks | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-compare | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-compress | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-local-tool-real-v127.spec.ts` |
| pdf-crop | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-editor | REAL_E2E_CASE_REGISTERED_CI_PENDING | `pdf-editor-save-reopen-v123.spec.ts` |
| pdf-flatten | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-grayscale | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-halve-pages | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-local-tool-real-v127.spec.ts` |
| pdf-header-footer | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-inspect | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-merge-split | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-metadata-editor | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-ocr | FULL_E2E_STILL_MISSING | — |
| pdf-overlay | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-page-numbers | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-page-size | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-pages | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-pages-per-sheet | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-permissions | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-protect | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-rasterize | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-local-tool-real-v127.spec.ts` |
| pdf-redact | REAL_E2E_CASE_REGISTERED_CI_PENDING | `pdf-redaction-output-v89.spec.ts` |
| pdf-remove-annotations | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-local-tool-real-v127.spec.ts` |
| pdf-remove-metadata | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-search | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-to-jpg | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-cross-workflow-v125.spec.ts` |
| pdf-to-markdown | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-to-text | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-to-word | REAL_E2E_CASE_REGISTERED_CI_PENDING | `paid-local-output-v89.spec.ts` |
| pdf-to-xlsx | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-table-real-v129.spec.ts` |
| pdf-unlock | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-viewer-preferences | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-watermark | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-pdf-real-v126.spec.ts` |
| pdf-web-optimize | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-subtitle-local-v129.spec.ts` |
| png-to-jpg | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| pptx-to-txt | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-longtail-documents-v126.spec.ts` |
| privacy-cleaner | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-privacy-cleaner-real-v129.spec.ts` |
| qr-code-generator | REAL_E2E_CASE_REGISTERED_CI_PENDING | `qr-cron-output-v86.spec.ts` |
| qr-code-reader | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-pdf-qr-e2e-v119.spec.ts` |
| qr-safe-reader | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| regex-tester | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| remove-duplicate-lines | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| remove-empty-lines | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| remove-exif | HISTORICAL_PARTIAL | — |
| resize-image | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-local-tool-real-v127.spec.ts` |
| reverse-video | FULL_E2E_STILL_MISSING | — |
| rotate-video | HISTORICAL_PARTIAL | — |
| screenshot-redact | REAL_E2E_CASE_REGISTERED_CI_PENDING | `screenshot-redaction-v89.spec.ts` |
| split-pdf | REAL_E2E_CASE_REGISTERED_CI_PENDING | `pdf-precision-split-v122.spec.ts` |
| stop-motion-video | FULL_E2E_STILL_MISSING | — |
| subtitle-tools | REAL_E2E_CASE_REGISTERED_CI_PENDING | `remaining-pdf-subtitle-local-v129.spec.ts` |
| subtitle-translate | REAL_E2E_CASE_REGISTERED_CI_PENDING | `subtitle-translation-v95.spec.ts` |
| svg-to-png | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-images-real-v126.spec.ts` |
| temp-mail | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-user-journeys-v1.spec.ts` |
| text-counter | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| text-diff | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| timestamp-converter | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| url-encode-decode | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-real-operations-v118.spec.ts` |
| url-parser | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| url-to-video | FULL_E2E_STILL_MISSING | — |
| uuid-generator | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |
| vcf-to-csv | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-longtail-documents-v126.spec.ts` |
| video-dubbing | FULL_E2E_STILL_MISSING | — |
| video-toolkit | FULL_E2E_STILL_MISSING | — |
| video-transcription | FULL_E2E_STILL_MISSING | — |
| video-translate | FULL_E2E_STILL_MISSING | — |
| video-watermark-remover | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-user-journeys-v1.spec.ts` |
| webp-to-jpg | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-image-file-e2e-v118.spec.ts` |
| xlsx-to-csv | REAL_E2E_CASE_REGISTERED_CI_PENDING | `tool-office-roundtrip-v118.spec.ts` |
| xml-formatter | REAL_E2E_CASE_REGISTERED_CI_PENDING | `unverified-developer-real-v126.spec.ts` |

## V130 附加审计

- `ocr` 新增真正本地 Tesseract WASM 英语图片识别、保存 TXT 内容复核、空白文件拒绝、修改语言后旧结果失效；**执行状态待本 SHA 的 CI**。
- `ai-image-check` 与 `ai-video-audio-check` 新增真实无来源签名 PNG/WAV 的文件头检查及 C2PA 未签名／不可用的保守解释测试。**这两项只有负向部分证据，仍列入 22 项缺完整实测；还需独立有效签名与失效签名样本及可选分析模型核验，不能称为完整检测通过。**
- 媒体来源签名只帮助核验声明与签发者，不能推断图像一定是真实、AI 生成或人工创作。

## 发布判定

- 测试脚本存在仅是**有测试场景登记**；以精确 SHA 的 GitHub Actions 实际通过、文件重新解析、桌面/手机、九语言验收为准。
- 原 `unverified-baseline-v126.ts` 记录的是去重前 **96 项缺口**。其路由巡检保留了对 3 个旧别名重定向的验证，不应重新把别名计为独立工具。
- 真实 AI 模型和第三方供应商、支付与账号授权相关功能须分别提供隔离测试和被授权生产环境端到端证据。不能将 UI 打开或模拟支付冒充功能完全竣工。
- 合并、上线、付款/数据库变更必须经过最终验收；本轮没有触碰生产数据或执行收款。
