# 灵犀场微信小程序 · 第一阶段接入

本目录是原生微信小程序，不是网站页面的缩小版。原生层承载场域首页、商品发现、虚拟支付与用户权益；复杂报告阅读页后续通过一次性身份桥接进入已备案业务域名。

## 已完成

- 原生四入口：场域、精测、叙事、我的
- `wx.login` → 服务端 `jscode2session`，AppSecret 不进入客户端
- 微信 `session_key` 使用 AES-256-GCM 加密保存
- 30 天随机不透明会话，数据库只保存 token 哈希
- 网站与小程序共用 `orders`、`unlocks` 和原子化 `fulfill_paid_order`
- 虚拟支付 `signData`、`paySig`、`signature` 双签名
- 服务端发货通知验签、金额/商品/数量/OpenID/订单归属校验与幂等发货
- 沙箱/现网支付密钥完全分离

## 上线前必须按顺序完成

1. 在 Supabase SQL Editor 执行 `sql-history/SQL-v267-wechat-mini-program.sql`。
2. 在 Vercel 配置 `.env.example` 中全部 `WECHAT_MINI_*` 变量；密钥不得提交 Git。
3. 微信后台服务器域名：
   - request 合法域名：`https://lingxifield.cn`
   - 业务域名：`https://lingxifield.cn`
   - 当前没有 WebSocket、上传或独立下载请求，不要为了填满表格而配置 socket/upload/download 域名。
4. 虚拟支付先使用沙箱：`WECHAT_MINI_VPAY_ENV=sandbox`。
5. 下载微信后台“批量添加道具”的官方示例 xlsx，使用项目 SKU 映射填入；不要自行猜测模板列名。
6. 在虚拟支付基础配置中完成发货推送，并为每个已发布道具开启发货推送。
7. 微信开发者工具导入本目录，AppID 已设置为 `wxbf4ae90406e7e26b`。
8. Android 沙箱完成：登录 → 下单 → 支付 → 服务端推送 → `orders.status=paid` → `unlocks` 生效。
9. 再使用低价现网道具验证 iOS；iOS 虚拟支付测试可能产生真实扣款与平台服务费。
10. 全链路通过后才将 `WECHAT_MINI_VPAY_ENV` 改为 `production` 并上传审核版。

## 微信后台回调

- 当前代码预留回调：`https://lingxifield.cn/api/wechat/mini/pay/notify`
- 消息 Token 对应 Vercel 的 `WECHAT_MINI_MESSAGE_TOKEN`
- 当前实现要求明文 JSON + URL Token 签名模式。
- 若虚拟支付后台实际要求证书/密钥签名或安全模式 AES 消息，必须按该页面下载的证书规范扩展验签，不能关闭验签临时放行。

## 第二阶段边界

- 用一次性、短时、可消费的身份桥接，把小程序微信用户安全带入网页报告，不在 URL 暴露长期 token。
- 用户明确确认后，才把微信 UnionID 身份与既有邮箱账户合并；禁止自动猜测合并。
- 精测输入、报告列表和摘要逐步原生化；完整艺术报告保持 Web 出版层，避免重写十套渲染器导致网页/PDF/小程序分叉。
- 服务号负责内容触达、菜单入口、客服与召回；交易、用户档案与交互主场放在小程序。

\n