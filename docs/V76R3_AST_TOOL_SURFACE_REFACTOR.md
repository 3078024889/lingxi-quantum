# V76R3 AST 工具展示面总重构

## R2 为什么失败
R2 已经摆脱“大段源码完全匹配”，但仍把 `\n\nconst categories` 当作文本边界。
Windows 源文件是 CRLF（`\r\n`）时，文本边界仍可能漂移，因此报：
`TOOL_SURFACE_ALLTOOLS_BOUNDARY_DRIFT`。

这不是业务代码错误，而是 patch 技术路线仍然太依赖源码文本格式。

## 全球成熟方案提取
成熟 codemod 工具（jscodeshift / recast / TypeScript AST）都采用语法树定位代码节点，
而不是依赖空格、缩进、换行符和手工 anchor。
R3 直接使用仓库已经安装的 TypeScript Compiler API：

- AST 查找 `allTools` FunctionDeclaration
- AST 查找 import declaration
- 用节点 start/end 做结构替换
- 写入前重新 parse candidate
- 已安装状态自动跳过，保证幂等
- CRLF / LF / 格式化差异不再影响定位

## 本次业务目标不变
统一 registry + advanced-catalog 为 public surface，
让昨天新增的所有真实工具进入 `/tools` 首页、搜索、分类和 SEO 验收链。
