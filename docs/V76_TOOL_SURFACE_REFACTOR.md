# 灵犀场工具展示面总重构

## 根因
昨天新增页面、构建、SEO catalog 都成功，但 `/tools` 仍由 `ToolsHubV11.tsx` 的旧 `liveTools()+dedicated[]` 驱动。
新增工具主要进入 `advanced-catalog.ts`，因此出现“路由存在、Build PASS、线上入口不可见”。

## 本次重构
- 新增 `lib/tools/public-surface.ts`
- 统一汇总 `registry.ts + advanced-catalog.ts`
- `advanced-catalog.ts` 对同一路由拥有更丰富的展示信息优先级
- ToolsHub 不再直接绑定 base registry
- 旧 `dedicated[]` 仅作为兼容兜底，不再覆盖统一 surface
- 新增硬审计：关键新工具必须同时拥有 route / discovery / SEO
- advanced catalog 任意条目没有真实页面则直接 FAIL
- advanced catalog 重复 slug 直接 FAIL

## 为什么上次审计没发现
旧审计分别验证了“页面存在”“catalog 存在”“build 成功”，但没有验证“用户从 /tools 首页一定能发现它”。
这是审计维度缺失，不是部署失败。本轮新增 end-to-end discovery gate。
