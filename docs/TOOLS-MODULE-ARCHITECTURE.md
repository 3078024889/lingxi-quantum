# 在线工具模块架构（基于真实仓库）

更新日期：2026-09-18  
仓库：`3078024889/lingxi-quantum`  
域名：lingxifield.com / lingxifield.cn

## A. 现有项目架构情况（实勘）

| 项 | 结论 |
|----|------|
| 框架 | Next.js 14 App Router + TypeScript + Tailwind |
| 首页 | `/` = SASI Workspace（非旧六道之门营销页） |
| 鉴权 / 数据 | Supabase SSR；middleware 刷新 session |
| 支付 | PayPal / 微信 / 支付宝路由已存在 |
| 已有工具 | `app/tools/number-energy`（数字能量，本地计算） |
| 可复用依赖 | `qrcode`、`jspdf`、`html2canvas` 已在 package.json |
| SEO | `FaqSection` + `FaqSchema`、sitemap 按 host 切 .com/.cn |
| i18n | `Bi` 组件 + `html.lang-en` + `useLang` |
| 风险 | 仓库曾含 `.pnpm-store` 导致体积 ~800MB+；已写入 gitignore |

## B. 可复用现有组件

- `Nav` / `Footer` / `Bi` / `LangToggle`
- `FaqSection` / `FaqSchema`
- 视觉令牌：`bone` / `void` / `lattice` / `lx-*` 样式
- **不复用** SASI 上传票据与对象存储（工具默认本地，避免误走服务器）

## C. 目录结构（已落地）

```text
app/tools/page.tsx              工具目录
app/tools/[slug]/page.tsx       动态工具页（generateStaticParams）
app/tools/number-energy/        既有专用页（保留）
components/tools/
  ToolShell.tsx
  ToolWorkbench.tsx
  FileDropzone.tsx
  ResultPanel.tsx
  ErrorExplain.tsx
  PrivacyBadge.tsx
  RelatedTools.tsx
lib/tools/
  registry.ts                   元数据中心
  types.ts
  shared/download.ts
  shared/magic-bytes.ts
  shared/hash.ts
  shared/image-canvas.ts        转换 / 压缩 / 清 EXIF
docs/TOOLS-MODULE-ARCHITECTURE.md
```

## D–G. 技术选型（第一批）

| 工具 | 实现 | 本地 | 新依赖 |
|------|------|------|--------|
| PNG/JPG/WebP 转换 | Canvas | 100% | 无 |
| 精确压缩到 KB | 二分质量 + 缩边 | 100% | 无 |
| 尺寸 / 清 EXIF | Canvas 重编码 | 100% | 无 |
| Magic Bytes 检测 | 自研 | 100% | 无 |
| MD5/SHA256 | 纯 JS MD5 + subtle SHA-256 | 100% | 无 |
| 文件对比 | 字节 / SHA | 100% | 无 |
| JSON / 时间戳 | 纯 JS | 100% | 无 |
| 二维码生成 | 动态 `import('qrcode')` | 100% | 已有 |
| HEIC / PDF / 读码 | planned | — | heic2any / pdf-lib / pdfjs / jsQR（仅对应页） |

## H. SEO 路由

- `/tools` + `/tools/{slug}`  
- 长尾：`compress-image-to-{20,50,100,200,500}kb`  
- 每页：title / description / canonical / FAQ JSON-LD  
- sitemap 已加入 live 路由；.com/.cn 仍按 host 生成  

## I. 公共组件原则

工具页 **只接 registry + workbench**；禁止再写第二套 Dropzone/下载/错误文案。

## J. 开发顺序（后续）

1. ✅ 共享地基 + 图片/文件/通用 live 工具  
2. 下一迭代：`pdf-lib` 合并/拆分、`jspdf` 图转 PDF、`jsQR` 读码、`heic2any`  
3. 再后：急用型「上传失败诊断」、网站诊断中心、付费高级能力  

## K. 性能

- 工具代码在 `/tools/*`，不进入 SASI 首页引用链  
- `qrcode` 仅在二维码页动态 import  
- 大图限制边长与文件大小，避免移动端 OOM  

## L. 安全

- 不信任扩展名；Magic Bytes 对照  
- 本地处理不落盘服务器  
- 文件名展示转义（React 文本节点）  
- 未来若有服务器任务：随机 ID、自动删除、白名单 MIME  

## 与主站关系

- 不修改 SASI 制作账本、场域付费报告链路  
- Nav / Footer 仅增加「在线工具」入口  
- 旧 README 已替换为反映 SASI + Field + Tools 的现行文档  
