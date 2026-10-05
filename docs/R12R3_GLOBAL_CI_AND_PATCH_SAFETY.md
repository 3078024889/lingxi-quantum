# R12R3 — Self-tested Patch Transformer / 全球成熟 CI 优势

## 这次 R12R2 为什么仍然漏掉

R12R2 的修复脚本本身仍有两层错误：

1. 它用错误的转义字符串检查/替换 `\n`；
2. 如果已经存在 `R12R2` marker，会提前 return，因此坏的 owned CSS tail 根本没有被重写。

所以 R12R2 的 preflight 也可能错误通过，最后仍由 webpack/PostCSS 抓出。

R12R3 不再对整个 CSS 做模糊 replace，而是：
- 找到我们自己生成的 R12/R12R1/R12R2/R12R3 identity marker；
- 只移除这个“owned tail”；
- 保留 marker 之前的原站 CSS 字节内容；
- 用真实换行重新写入唯一的 R12R3 block；
- 对 transformer 本身运行 fixture test；
- 再运行 negative poisoned-CSS recovery；
- 再做 changed-file preflight；
- 最后才 production build。

## 本轮继续检索成熟平台后的提取

### Nx（开源）
Nx 的 `affected` 会基于 Git + project graph 只运行受修改影响的任务和依赖它们的任务。
价值：以后灵犀场工具越来越多，不应该每个小改动都盲扫所有无关代码；应做“变更影响图 + 全局关键门”的组合。

### Vercel / Preview 思想
正式生产发布前应该先有与提交绑定的 preview/review surface。
价值：以后 SASI 大改不应“本地 build pass = 直接生产”，应先预览真实浏览器状态、真实路由和真实流式行为。

### Bazel / Hermetic 思想
构建必须尽量由声明输入决定，减少机器状态、隐含缓存、环境漂移造成的“我这里能过”。
价值：灵犀场安装包必须越来越接近可重放 release capsule：固定 pnpm、锁文件、环境契约、变更清单、审计版本。

### Temporal / Durable Versioning 思想
长期运行任务与新部署必须兼容。
价值：SASI 将来真正有跨小时/跨天 Run 后，不能一次前端/worker 发布就让旧 Run 无法恢复。

## 从此 Patch 也必须被测试

以前：
代码有测试，但“修改代码的脚本”本身没有测试。

现在：
Patch Transformer 本身也是生产代码。

所以每个复杂自动 patch 至少有：
- fixture before
- expected after
- idempotent rerun
- poisoned input negative test
- base-content preservation
- target drift fail-closed
