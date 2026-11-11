# SASI 软件作品与卖家服务：免费额度内的 R2 交付

状态：工程预发布，所有销售/上传/提现开关保持 false。旧 SASI 充值、退款和 PayPal 审核所需订单一律保留。

## 设计

- 站点 .cn 阿里云 ECS 只处理账户与订单，不接收 ZIP 文件流。
- 站点 .com Cloudflare 继续保持静态页面为主；管理 API 由独立轻量 Worker 代理至受信 .cn 服务，且不将美元支付伪装成人民币支付。
- 卖家上传使用已有 `lib/sasi-kernel/artifact-store/r2.ts` 的 AWS SigV4 限时 PUT，直传私有 R2；不引入新数据库 BLOB 或 ECS 硬盘。
- R2 路径：`sasi/<seller>/market/<listing>/images/<uuid>.(jpg|png|webp)` 或 `.../quarantine/<uuid>.zip`。
- 正式交付路径仅允许 `.../approved/<file>.zip`。商品文件经过扫描、版权审核、哈希校验后才由特权审核流程从 quarantine 移入 approved。不能在商家自助接口直接声明 clean/published。
- 产品图片每套最多 5 张，每张最大 1 MiB。ZIP 最大 30 MiB。图片只有 approved 且所属商品 published 才能生成 120 秒观看链接；购买后 ZIP 生成 60 秒单次受授权下载链接。
- 订单成功且商户回调核验后记录服务费 15%，卖家份额 85%。拒付、退款、重复回调不形成可用余额；默认 7 天风险结算冻结期。
- 已核验卖家的提现请求目标 15 分钟内完成平台审核和支付机构提交；最终到账取决于支付机构回执。**没有转账渠道前提现功能不可上线。**

## Cloudflare R2

官方 2026-10 定价：Standard 免费 10 GB-month、100 万 Class A、1000 万 Class B、零出口流量费。按所有桶共享额度计算；多余付费。创建低权限仅对专用桶可用的 R2 Access Key，不复用服务器管理员密钥。

R2 专用私有存储桶（建议，不与公开静态大文件同桶）：`lingxifield-sasi-private`。

在 ECS/Cloudflare 的服务端**机密配置**中映射现有只读签名器的变量：
```
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<PRIVATE_R2_KEY_ID>
R2_SECRET_ACCESS_KEY=<PRIVATE_R2_SECRET>
R2_BUCKET_SASI_ARTIFACTS=lingxifield-sasi-private
```
绝不在浏览器或 GitHub 提交这些值。私有桶的 public access 必须为 false。

在 R2 仪表板给该桶配置最窄 CORS（需按实际浏览器抓包验证）：
```json
[
  {
    "AllowedOrigins": ["https://lingxifield.cn", "https://lingxifield.com"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["content-type"],
    "ExposeHeaders": ["etag"],
    "MaxAgeSeconds": 300
  }
]
```
只有经过验证的域名可以作为浏览器上传来源；服务端签名也必须短期过期。**Presigned PUT 本身不能替代防超量配额**，在开通上传前还需要部署文件实际大小检查、上传次数限制、孤儿文件生命周期清理与桶容量告警。

## 开关（默认全部关闭）

```
SASI_MARKET_UPLOADS_ENABLED=false
SASI_MARKET_SALES_ENABLED=false
SASI_MARKET_DELIVERY_ENABLED=false
SASI_MARKET_PAYOUTS_ENABLED=false
SOFTWARE_COMMERCE_READY=false
```
确保单独开放卖家申请/草稿时不会误开付款与提现。

## 上线前要求

1. SQL 在事务回滚演练中成功；迁移只创建新市场表，不删除历史订单。
2. Github Actions 的安全、类型检查、Next 完整构建均成功；对 15% 佣金、并发、幂等、拒付/退款做实际测试。
3. R2 独立桶、CORS、容量预算与病毒/内容审核服务就绪。
4. 用测试商户走真实付款通知、自动交付、退款、权益撤销、卖家结算和提现回执。
5. 先独立预发布，再分别验收 .cn 与 .com；不触发当月 Vercel 免费额度。
6. 任一步失败所有资金与交付开关保持关闭。只可宣传“开发中”，不能称已开放。
