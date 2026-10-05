# R14R2 — Supabase Await Semantics / Failure Bookkeeping

## 当前 Build 失败的根因

TypeScript 报错：

`Property 'catch' does not exist on type 'PostgrestFilterBuilder...'`

Supabase 官方 JavaScript 文档对 `rpc()` 的标准调用方式是：

```ts
const { data, error } = await supabase.rpc("function_name", args)
```

`PostgrestFilterBuilder` 是 awaitable / PromiseLike 风格的 builder，但类型并不保证它拥有原生 Promise 的 `.catch()` 方法。

R14R1 的这段：

```ts
await admin.rpc(...).catch(()=>{})
```

因此在当前 Supabase 类型版本下不成立。

## 本轮全球成熟平台提取

### Supabase 官方 JS API
RPC 应该显式 `await`，再读取 `{data,error}`。
不要假设 query builder 就是原生 `Promise`。

### Inngest Error Handling
Inngest 将错误明确区分：
- 临时错误：允许重试；
- 永久错误：NonRetriable；
- 上游给出恢复时间：RetryAfter；
- 最终失败：failure handler / compensation。

更重要的是，失败后的清理/记录不应该覆盖最初真正导致任务失败的异常。

R14R2 因此采用：
1. 原业务 error 保存在 `e`；
2. `fail_sasi_durable_step_v140` 只是 best-effort bookkeeping；
3. bookkeeping 自己失败时吞掉 cleanup error；
4. 最终仍 `throw e`。

这样日志记录故障不会把真正的 Provider/执行错误换成“记录失败”。

### Inngest Side-effect Safety
completed step 可以 memoize，但外部 effect 仍可能发生后响应丢失。
因此 SASI 继续保持：
- 稳定 business idempotency key；
- step result memoization；
- 不宣称 provider exactly-once。

## 新永久门禁

新增扫描：
`R14R2_NO_POSTGREST_DOT_CATCH`

以后 SASI durable / knowledge / knowledge API 中：
- Supabase RPC/query 统一显式 await；
- 不允许对 PostgREST builder 直接 `.catch()`；
- cleanup/compensation 不能覆盖 original error。
