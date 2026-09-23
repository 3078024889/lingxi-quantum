# V11.80 · Final Production Closeout

这是提交仓库前的生产收口阶段。

## 本阶段补齐

### Book / Learning / Research SASI feedback UI

V11.10 已经有：
- `learningEventId`
- feedback API
- private feedback repository

但 UI 还没有真正让用户提交反馈。

V11.80 补上：

```text
AI answer
→ learningEventId
→ 有帮助 / 没帮助 / 有错误 / 证据不足
→ /api/sasi/learning/feedback
→ private feedback row
→ SASI learning/failure signal
```

反馈仍然不能直接成为全局事实。

### Knowledge route same-origin

`POST /api/knowledge/ask` 增加 same-origin mutation guard。

### Pre-submit acceptance

安装器会执行：

```text
production closeout static audit
TypeScript
Next production build
secret literal scan
exact git status
```

Build 必须真实通过，才允许进入下一阶段的精确 Git staging。

## 尚不等于“全部线上 E2E 已通过”

即使 V11.80 PASS，也只代表：

```text
代码层 + build 层达到提交条件
```

之后仍需：

```text
精确 Git staging
commit / push
Vercel production deploy
线上免费工具 smoke
真实 ¥0.50 卡路里支付
真实 ¥1.20 视频去水印支付
订单中心 / grant / paid job / result 验收
```


## V11.80.1 Resume

Runner resolution now supports `pnpm`, `corepack pnpm`, and `npm` without downloading packages.
