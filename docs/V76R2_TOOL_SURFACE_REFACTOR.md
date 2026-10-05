# V76R2 工具展示面总重构

R1 失败原因：安装器用整段字符串替换 `allTools()`，对源码格式过度敏感。
R2 改为稳定边界替换：从 `function allTools(): ToolItem[] {` 到 `const categories` 之间整体替换，
同时支持“完全未安装”和“部分安装”两种状态。

本包不改工具执行逻辑、不改价格、不改支付，只修：
1. 新工具真实进入 `/tools`。
2. 搜索/分类读取统一 public surface。
3. route / advanced catalog / SEO 三向硬校验。
