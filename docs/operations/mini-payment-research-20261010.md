# 支付实现参考与验证

本次参考公开官方资料，并独立实现适配现有余额账本的代码，没有复制 AGPL 项目源代码。

- [Medusa 余额交易](https://docs.medusajs.com/resources/commerce-modules/store-credit/concepts)：余额和具体订单引用关联，币种独立。现有余额支付事务继续复用，不建立第二份用户余额。
- [Medusa 付款与退款](https://docs.medusajs.com/resources/commerce-modules/payment/payment)：原付款、退款分开留记录。后台分别显示退款总额、扣回金额和人工核对金额。
- [Lago 充值通知](https://knowledge.getlago.com/articles/4992248568-how-to-detect-a-successful-wallet-top-up-via-webhook)：等待服务端确认后的最终状态。小程序付款成功弹窗不作为到账凭据。
- [Stripe Webhooks](https://docs.stripe.com/webhooks)：重复和乱序通知必须处理。累计退款只处理增量，退款后的迟到交付不能重新激活授权。
- [Stripe 幂等请求](https://docs.stripe.com/api/idempotent_requests)：保留稳定订单和流水引用，重复付款、到账与退款不重复处理。

验证：隔离 PGlite PostgreSQL 执行当前扣费 SQL 和本次迁移；重复充值、双击付款、交付失败回滚、部分及乱序退款、已消费本金、后续充值保护、历史来源人工核对、退款后交付与恢复权限均验证通过。`scripts/audit/mini-refund.mjs` 验证退款金额、原订单、退款状态和环境。完整 Next.js 构建及生产源码门禁通过。隔离测试不等于生产真机验收。
