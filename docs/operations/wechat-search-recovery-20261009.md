# 微信小程序搜索与支付整改（2026-10-09）

账号：灵犀场lingxifield实用工具；AppID：wxbf4ae90406e7e26b。

## 已确认的后台状态

名称搜索允许、页面收录开启、已认证且已备案。正式版 5.0 发布于 2026-10-04。2026-10-05 改为现名，旧名保护期 2026-10-07 结束。10 月 8 日有一次搜一搜引流，不能证明完整名称当前能被所有用户搜到；用户已确认完整名称在小程序分类无结果。

违规 30025740762 因虚拟商品未使用平台虚拟支付，永久限制安卓支付能力。通知未说明搜索处罚，不能把该违规断言为搜索失效原因。已按用户授权提交复核，微信回执为已提交、7 个工作日处理；尚未通过。

虚拟支付此前已开通，Offer ID 为 1450617775，iOS IAP 已开通。发货消息推送已启用，指向 https://lingxifield.cn/api/wechat/mini/pay/notify ，采用明文 JSON。Vercel 原有八项微信变量已确认存在；Secret 类型无法回读，存在不等于已验证密钥有效。

微信后台仍有旧订阅、内容商品。已发布商品界面只显示编辑、查看线上，未提供删除/下架操作，本次没有声称已删除。当前应用旧商品目录为空，服务端不允许通过旧商品创建购买。

## 本次实现

- 小程序工具购买改为 wx.requestVirtualPayment；新工具商品按实际价格和已审核 SKU 精确匹配，服务端保存不可由客户端修改的购买快照。
- 支付签名区分正式与沙箱环境；沙箱购买要求测试用户白名单。
- 服务端向微信查询实际支付状态、订单、环境和金额，再调用现有幂等发货流程。客户端成功提示不直接授予付费权益。
- 回调丢失时，用户可通过原生订单页再次确认，避免盲目重复付款。
- 小程序充值及内嵌网页的普通支付入口暂停。人民币、美元均不回退外部付款；独立浏览器网站保留原有支付。
- 新增独立开关 WECHAT_MINI_VPAY_TOOLS_ENABLED，默认关闭。商品映射 WECHAT_MINI_VPAY_TOOL_GOODS 默认空对象。没有修改用户余额或资金流水。
- 九语言原生首页/工具列表连接四个公开介绍页，分享文案含品牌及用途；账户、付款及动态 WebView 页面继续禁止收录。

## 验证及发布边界

生产构建、TypeScript、mini-search-recovery、mini-payment-pause、mini-virtual-payment 检查通过。测试覆盖九语言入口、实际 sitemap 规则、支付暂停、签名与金额匹配、回调丢失与重复操作。未用这些测试宣称微信搜索恢复或真机支付通过。

用户已于 2026-10-09 授权现在提交 Vercel 部署。网站服务端与网页保护通过 Vercel 发布；原生 miniapp 文件需要微信开发者工具上传、审核及正式发布，Vercel 部署不会替换正式小程序版本。

## 仍待完成，不能提前打开支付

1. 微信处理申诉、解除限制；名称搜索需平台单独确认搜索资格和索引，仍需普通用户正式码及搜索验证。
2. 为当前工具创建并审核正确商品，填写实际 SKU/单价映射，不复用旧订阅商品或虚构价格。
3. 校验现有密钥与后台配置，完成沙箱及安卓/iOS 真机验收。
4. 完成并验证虚拟支付退款通知、权益撤销及退款追踪；当前未知事件仅留待核查，不能据此宣称退款自动完成。
5. 余额充值涉及可退款/可提现资金与虚拟商品权益的区别，暂不以工具道具冒充充值。
6. 完成上述条件才启用工具支付开关；不能仅因变量存在就开放。

参考：
- https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment.html
- https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestVirtualPayment.html
- https://developers.weixin.qq.com/miniprogram/dev/server/API/VirtualPayment/api_query_order
- https://developers.weixin.qq.com/miniprogram/dev/server/API/VirtualPayment/api_notify_provide_goods

后台证据、申诉回执、私有源码包保存在本地 artifacts/wechat-search-recovery-20261009，含后台会话信息，不进入 Git。
