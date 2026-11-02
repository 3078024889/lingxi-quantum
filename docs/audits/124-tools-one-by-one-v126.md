# LINGXIFIELD｜124 个公开工具逐项验收账本 V126

日期：2026-11-02。统一发布候选： [PR #104](https://github.com/3078024889/lingxi-quantum/pull/104)。**本文件是源码登记证据，不是 124 项已经通过的证书。**

- 实际公开目录：**124**；注册真实浏览器操作情景：**61**（之前 26，本轮增加 35）；只有历史部分样本：**2**；剩余尚无完整操作情景：**61**。
- 96 个初始缺口均已加入 `unverified-96-route-audit-v126.spec.ts` 的**逐工具页面入口巡检**，在桌面+手机分别执行；仅证明对应路由、页面标题和基础控件，**不能证明生成结果、付费或真实供应商**。
- 35 个新增实测工具分别由 `unverified-developer-real-v126.spec.ts`、`unverified-pdf-real-v126.spec.ts`、`unverified-pdf-advanced-v126.spec.ts`、`unverified-images-real-v126.spec.ts` 覆盖；实际通过数量取决于精确 SHA 的 CI 结果。
- 原统计历史 7 项含 5 个已不属于这 124 项目录的老名称：`pdf-to-txt`、`video-trim`、`video-compress`、`video-speed`、`video-mute`，因此 **91 修正为 96**，不可把这些旧名称算作当前工具的验收。
- 状态 `REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED` = 实测测试源码已登记，仍需浏览器实际执行成功；`HISTORICAL_PARTIAL_ONLY` = 有部分历史证据不代表全面闭环；`ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION` = 仅有路由/控件级巡检计划与测试源码，核心输入→处理→可验证输出尚无充分证据。
- 已完成的实际源码修复包括：开发者工具输入变化清理旧结果；图片转换、SVG、批量图像、长图处理参数变化清理旧文件链接，避免旧导出结果冒充当前参数。

## 全部 124 个工具的逐项记录

| 工具 slug | 证据状态 | 已登记的真实操作测试 |
| --- | --- | --- |
| ai-image-check | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| ai-video-audio-check | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| audio-cleanup | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| audio-transcription | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| avif-to-jpg | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| base64-encode-decode | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| batch-image | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| batch-image-watermark-remover | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| batch-pdf | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| bmp-to-png | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| burn-after-read | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| case-converter | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| compress-image | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| compress-image-to-100kb | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| compress-image-to-200kb | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| compress-image-to-20kb | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| compress-image-to-500kb | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| compress-image-to-50kb | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| compress-pdf | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| cron-parser | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| csv-json | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| csv-to-xlsx | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-office-roundtrip-v118`](../../tests/final-closure/tool-office-roundtrip-v118.spec.ts) |
| document-copy-layout | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| document-translate | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| docx-to-txt | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| e-sign-pdf | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| epub-to-txt | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| file-compare | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| file-type-detector | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| food-calorie | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| gif-to-jpg | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| handwriting-ocr | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| heic-local | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| heic-to-jpg | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| ico-to-png | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| ics-to-csv | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| id-photo-ai | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| image-to-pdf | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-cross-workflow-v125`](../../tests/final-closure/tool-cross-workflow-v125.spec.ts) |
| image-to-pdf-pro | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| image-translator | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| image-watermark-remover | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| jfif-to-jpg | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| jpg-to-png | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| json-formatter | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| jwt-decoder | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| long-image | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| loop-video | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| md5-sha256 | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| merge-pdf | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-pdf-qr-e2e-v119`](../../tests/final-closure/tool-pdf-qr-e2e-v119.spec.ts) |
| number-base-converter | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| ocr | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| odt-to-txt | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-attachments | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-bates-numbering | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-bookmarks | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-compare | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-compress | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-crop | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-editor | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`pdf-editor-save-reopen-v123`](../../tests/final-closure/pdf-editor-save-reopen-v123.spec.ts) |
| pdf-flatten | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-grayscale | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-halve-pages | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-header-footer | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-inspect | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-merge-split | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-metadata-editor | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-ocr | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-overlay | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-page-numbers | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-page-size | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-pages | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-pages-per-sheet | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-permissions | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-protect | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-rasterize | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-redact | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-remove-annotations | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-remove-metadata | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-advanced-v126`](../../tests/final-closure/unverified-pdf-advanced-v126.spec.ts) |
| pdf-search | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-to-jpg | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-cross-workflow-v125`](../../tests/final-closure/tool-cross-workflow-v125.spec.ts) |
| pdf-to-markdown | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-to-text | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-to-word | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-to-xlsx | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-unlock | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-viewer-preferences | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| pdf-watermark | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-pdf-real-v126`](../../tests/final-closure/unverified-pdf-real-v126.spec.ts) |
| pdf-web-optimize | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| png-to-jpg | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| pptx-to-txt | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| privacy-cleaner | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| qr-code-generator | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| qr-code-reader | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-pdf-qr-e2e-v119`](../../tests/final-closure/tool-pdf-qr-e2e-v119.spec.ts) |
| qr-safe-reader | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| regex-tester | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| remove-duplicate-lines | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| remove-empty-lines | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| remove-exif | HISTORICAL_PARTIAL_ONLY | — |
| resize-image | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| reverse-video | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| rotate-video | HISTORICAL_PARTIAL_ONLY | — |
| screenshot-redact | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| split-pdf | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`pdf-precision-split-v122`](../../tests/final-closure/pdf-precision-split-v122.spec.ts) |
| stop-motion-video | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| subtitle-tools | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| subtitle-translate | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| svg-to-png | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-images-real-v126`](../../tests/final-closure/unverified-images-real-v126.spec.ts) |
| temp-mail | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| text-counter | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| text-diff | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| timestamp-converter | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| url-encode-decode | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-real-operations-v118`](../../tests/final-closure/tool-real-operations-v118.spec.ts) |
| url-parser | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| url-to-video | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| uuid-generator | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |
| vcf-to-csv | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| video-dubbing | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| video-toolkit | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| video-transcription | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| video-translate | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| video-watermark-remover | ROUTE_AUDIT_REGISTERED_NO_FULL_OPERATION | — |
| webp-to-jpg | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-image-file-e2e-v118`](../../tests/final-closure/tool-image-file-e2e-v118.spec.ts) |
| xlsx-to-csv | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`tool-office-roundtrip-v118`](../../tests/final-closure/tool-office-roundtrip-v118.spec.ts) |
| xml-formatter | REAL_BROWSER_SCENARIO_REGISTERED_NOT_YET_CONFIRMED | [`unverified-developer-real-v126`](../../tests/final-closure/unverified-developer-real-v126.spec.ts) |

## 正式通过门禁

必须是**同一头提交 SHA** 的交付 CI 与生产 CI 均通过、实际下载文件重新解析正确、桌面/手机、九语言重点路线验收；正式 Vercel 预览和部署必须比对 SHA。已登记测试或 GitHub READY 单独都不能等同生产竣工。对外部 AI、商户支付和登录依赖需要隔离单元/契约验证与经过授权的真实端到端测试两套证据；本轮没有开启真实收款、没有读取客户文件，也没有调整生产数据。
