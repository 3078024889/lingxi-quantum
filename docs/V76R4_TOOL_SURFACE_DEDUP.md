# V76R4 去重收口

R3 的 AST patch 已成功：`TOOLS_HUB_AST_PATCH=PASS`。

随后审计阻断在：
`ADVANCED_DUPLICATE_SLUGS:avif-to-jpg`

这说明新的硬门禁确实发现了一个之前长期存在的目录重复项：
`advanced-catalog.ts` 中 `/tools/avif-to-jpg` 出现两次。

R4 使用 TypeScript AST 定位 `ADVANCED_TOOLS` 数组，保留第一次定义，自动删除后续重复 href。
不是只针对 AVIF：以后如果出现任何重复 href 都会被统一去重并再次审计。

本包继续复用 R3 已完成的 `public-surface.ts` 与 ToolsHub AST 重构，不重复覆盖它们。
