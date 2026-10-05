# R7R1：修正共享动态工具页识别

上一版 R7 把 `app/tools/<slug>/page.tsx` 当成唯一页面形态，因此把一批老工具误判为 `NO_ROUTE`。

实际仓库架构已经确认：

- `app/tools/[slug]/page.tsx` 是真实动态工具页；
- 它通过 `getTool(params.slug)` 从 `lib/tools/registry.ts` 获取 live 工具；
- 再渲染 `<ToolWorkbench tool={tool} />`；
- `ToolWorkbench.tsx` 中有真实处理器，例如：
  - TextWorkbench
  - JSON formatter
  - Timestamp
  - QR
  - 图片压缩/缩放/EXIF
  - Excel/CSV
  - DOCX/PPTX
  - HEIC
  - PDF merge/split/compress/image-to-pdf/pdf-to-jpg
  - file type/hash/compare

所以这些工具没有独立文件夹并不代表没有路由。

## R7R1 新规则

GLOBAL_TOOL_CATALOG 中每个工具必须满足其一：

1. Stage Graph；
2. 独立 route；
3. infrastructure；
4. **shared dynamic route + registry live + ToolWorkbench 真实 handler**。

这次不会因为“没有独立目录”就误判，但也不会只凭 registry 元数据放行：
共享动态工具必须在 `ToolWorkbench.tsx` 找到真实执行处理器。
