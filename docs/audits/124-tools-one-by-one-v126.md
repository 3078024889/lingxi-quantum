# LINGXIFIELD｜121 个不重复的公开工具验收账本（V130）

**审核日期：2026-11-02，发布候选：[#105](https://github.com/3078024889/lingxi-quantum/pull/105)，基础依赖：[#104](https://github.com/3078024889/lingxi-quantum/pull/104)。**

此文件沿用旧 `124-tools-one-by-one-v126.md` 路径，以保证历史链接有效。经过代码层查重，原目录 124 项中删除了 3 个重复展示入口，现在 **121 项独立工具**；3 条旧网址继续做 308 跳转，不会丢失用户书签。

| 指标 | 数量 |
|---|---:|
| 不重复公开工具 | **121** |
| 已登记真实浏览器操作场景（不等于 CI 全通过） | **98** |
| 仅有历史部分样本 | **0** |
| 尚未具备充分真实操作场景 | **23** |

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
| ai-image-check | FULL_E2E_NOT_PROVEN | — |
| ai-video-audio-check | FULL_E2E_NOT_PROVEN | — |
| audio-cleanup | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `paid-local-output-v89.spec.ts` |
| audio-transcription | FULL_E2E_NOT_PROVEN | — |
| avif-to-jpg | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| base64-encode-decode | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| batch-image | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| batch-image-watermark-remover | FULL_E2E_NOT_PROVEN | — |
| batch-pdf | FULL_E2E_NOT_PROVEN | — |
| bmp-to-png | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| burn-after-read | FULL_E2E_NOT_PROVEN | — |
| case-converter | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| compress-image | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-local-tool-real-v127.spec.ts` |
| compress-image-to-100kb | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-200kb | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-20kb | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-500kb | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| compress-image-to-50kb | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| cron-parser | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| csv-json | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| csv-to-xlsx | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-office-roundtrip-v118.spec.ts` |
| document-copy-layout | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-subtitle-local-v129.spec.ts` |
| document-translate | FULL_E2E_NOT_PROVEN | — |
| docx-to-txt | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-longtail-documents-v126.spec.ts` |
| e-sign-pdf | FULL_E2E_NOT_PROVEN | — |
| epub-to-txt | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-longtail-documents-v126.spec.ts` |
| file-compare | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| file-type-detector | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| food-calorie | FULL_E2E_NOT_PROVEN | — |
| gif-to-jpg | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| handwriting-ocr | FULL_E2E_NOT_PROVEN | — |
| heic-to-jpg | FULL_E2E_NOT_PROVEN | — |
| ico-to-png | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-ico-real-v129.spec.ts` |
| ics-to-csv | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-longtail-documents-v126.spec.ts` |
| id-photo-ai | FULL_E2E_NOT_PROVEN | — |
| image-to-pdf | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-cross-workflow-v125.spec.ts` |
| image-translator | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-user-journeys-v1.spec.ts` |
| image-watermark-remover | FULL_E2E_NOT_PROVEN | — |
| jfif-to-jpg | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| jpg-to-png | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| json-formatter | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| jwt-decoder | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| long-image | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| loop-video | FULL_E2E_NOT_PROVEN | — |
| md5-sha256 | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| merge-pdf | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-pdf-qr-e2e-v119.spec.ts` |
| number-base-converter | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| ocr | FULL_E2E_NOT_PROVEN | — |
| odt-to-txt | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-longtail-documents-v126.spec.ts` |
| pdf-attachments | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-bates-numbering | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-bookmarks | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-compare | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-compress | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-local-tool-real-v127.spec.ts` |
| pdf-crop | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-editor | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `pdf-editor-save-reopen-v123.spec.ts` |
| pdf-flatten | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-grayscale | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-halve-pages | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-local-tool-real-v127.spec.ts` |
| pdf-header-footer | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-inspect | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-merge-split | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-metadata-editor | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-ocr | FULL_E2E_NOT_PROVEN | — |
| pdf-overlay | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-page-numbers | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-page-size | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-pages | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-pages-per-sheet | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-permissions | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-protect | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-rasterize | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-local-tool-real-v127.spec.ts` |
| pdf-redact | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `pdf-redaction-output-v89.spec.ts` |
| pdf-remove-annotations | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-local-tool-real-v127.spec.ts` |
| pdf-remove-metadata | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-advanced-v126.spec.ts` |
| pdf-search | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-to-jpg | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-cross-workflow-v125.spec.ts` |
| pdf-to-markdown | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-to-text | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-to-word | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `paid-local-output-v89.spec.ts` |
| pdf-to-xlsx | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-table-real-v129.spec.ts` |
| pdf-unlock | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-security-attachments-v129.spec.ts` |
| pdf-viewer-preferences | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-subtitle-local-v129.spec.ts` |
| pdf-watermark | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-pdf-real-v126.spec.ts` |
| pdf-web-optimize | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-subtitle-local-v129.spec.ts` |
| png-to-jpg | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| pptx-to-txt | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-longtail-documents-v126.spec.ts` |
| privacy-cleaner | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-privacy-cleaner-real-v129.spec.ts` |
| qr-code-generator | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `qr-cron-output-v86.spec.ts` |
| qr-code-reader | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-pdf-qr-e2e-v119.spec.ts` |
| qr-safe-reader | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| regex-tester | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| remove-duplicate-lines | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| remove-empty-lines | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| remove-exif | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remove-exif-real-v130.spec.ts` |
| resize-image | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-local-tool-real-v127.spec.ts` |
| reverse-video | FULL_E2E_NOT_PROVEN | — |
| rotate-video | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `video-toolkit-real-v131.spec.ts` |
| screenshot-redact | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `screenshot-redaction-v89.spec.ts` |
| split-pdf | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `pdf-precision-split-v122.spec.ts` |
| stop-motion-video | FULL_E2E_NOT_PROVEN | — |
| subtitle-tools | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `remaining-pdf-subtitle-local-v129.spec.ts` |
| subtitle-translate | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `subtitle-translation-v95.spec.ts` |
| svg-to-png | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-images-real-v126.spec.ts` |
| temp-mail | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-user-journeys-v1.spec.ts` |
| text-counter | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| text-diff | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| timestamp-converter | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| url-encode-decode | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-real-operations-v118.spec.ts` |
| url-parser | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| url-to-video | FULL_E2E_NOT_PROVEN | — |
| uuid-generator | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |
| vcf-to-csv | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-longtail-documents-v126.spec.ts` |
| video-dubbing | FULL_E2E_NOT_PROVEN | — |
| video-toolkit | FULL_E2E_NOT_PROVEN | — |
| video-transcription | FULL_E2E_NOT_PROVEN | — |
| video-translate | FULL_E2E_NOT_PROVEN | — |
| video-watermark-remover | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-user-journeys-v1.spec.ts` |
| webp-to-jpg | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-image-file-e2e-v118.spec.ts` |
| xlsx-to-csv | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `tool-office-roundtrip-v118.spec.ts` |
| xml-formatter | REGISTERED_REAL_E2E_NOT_YET_ALL_PASSED | `unverified-developer-real-v126.spec.ts` |

## 发布判定

- 测试脚本存在仅是**有测试场景登记**；以精确 SHA 的 GitHub Actions 实际通过、文件重新解析、桌面/手机、九语言验收为准。
- 原 `unverified-baseline-v126.ts` 记录的是去重前 **96 项缺口**。其路由巡检保留了对 3 个旧别名重定向的验证，不应重新把别名计为独立工具。
- 真实 AI 模型和第三方供应商、支付与账号授权相关功能须分别提供隔离测试和被授权生产环境端到端证据。不能将 UI 打开或模拟支付冒充功能完全竣工。
- 合并、上线、付款/数据库变更必须经过最终验收；本轮没有触碰生产数据或执行收款。
