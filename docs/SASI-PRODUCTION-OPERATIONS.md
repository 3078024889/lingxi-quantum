# SASI 制作内核运行手册

## 当前生产边界

SASI 只有在制作账户、视频供应、任务执行和内容标识同时通过真实验收后才允许收费。前端状态不决定是否开放；服务端 `sasiPaidProductionEnabled()` 与 `sasiReadiness()` 是最终门控。

## 生产链

1. 用户通过既有支付宝、微信或 PayPal 收银台建立制作储备。
2. 支付平台验签并核对金额后，`credit_sasi_topup` 在一个事务里把订单设为已支付并增加制作额度。
3. 用户确认单镜头提案，`create_and_reserve_sasi_job` 原子创建任务、锁定额度并写入账本。
4. Capability Router 按制作规格选择已验证的火山方舟 Seedance、阿里万相、xAI 或 OpenAI 线路；密钥和模型 ID 永不进入浏览器。
5. 用户工作区或受 `CRON_SECRET` 保护的调度器同步任务状态。
6. 成功结果只允许从受信 HTTPS 媒体域下载，经过体积和文件签名校验后进入私有 `sasi-deliveries` 桶。
7. `settle_sasi_job` 完成实际结算并释放差额；失败或取消由 `release_sasi_job` 归还未结算额度。
8. 用户下载时仅获得五分钟有效的签名链接。
9. 洁净画面申请、发布标识义务确认和协议版本随任务写入不可由用户修改的生产记录，至少保留六个月。

## 必须配置但不得提交的变量

- `ARK_API_KEY` / `SASI_SEEDANCE_VIDEO_MODEL`（填写火山方舟控制台实际开放的模型或推理接入点 ID）
- `XAI_API_KEY` / `SASI_XAI_VIDEO_MODEL`
- `OPENAI_API_KEY` / `SASI_OPENAI_VIDEO_MODEL` / `SASI_OPENAI_CINEMA_MODEL`
- `DASHSCOPE_API_KEY` / `SASI_WAN_BASE_URL` / `SASI_WAN_VIDEO_MODEL`
- `SASI_VERIFIED_VIDEO_PROVIDERS`（仅写入已完成真实闭环验收的线路）
- `SASI_PROVIDER_ASSET_HOSTS`（仅在供应结果跳转到内置规则之外的域名时配置精确域名）
- `SASI_REFUND_FLOW_TESTED`
- `CRON_SECRET`
- 支付渠道自身的正式商户变量

境内第一阶段线路为火山方舟 Seedance 与阿里万相；Grok Imagine、Sora 保留为可选国际线路。单镜头统一使用 8 或 12 秒，避免在供应商之间静默改变时长；智能模式按“灵感验证 → Wan 优先、正式制作 → Seedance 优先、典藏呈现 → Seedance 优先”选择已验证线路。若某线路不支持当前比例或时长，路由只选择明确兼容的备用线路，不做隐藏降级。

xAI 成功响应中的 `usage.cost_in_usd_ticks` 会换算为美元美分写入供应成本记录。Seedance、OpenAI 与万相当前不假设响应含实际费用字段，必须通过账单对账补齐，禁止把预估值伪装成实际采购成本。

## 三重开关

以下变量默认保持 `false`：

- `SASI_BILLING_ENABLED`
- `SASI_JOBS_ENABLED`
- `SASI_CONTENT_LABELING_ENABLED`
- `SASI_REFUND_FLOW_TESTED`

内容标识由 SASI 交付层负责，不依赖供应商水印。交付页持续展示 AI 生成合成提示，MP4 文件写入 GB 45438-2025 附录 E 字段结构的 AIGC 元数据；用户逐任务申请洁净画面导出并确认对外发布义务。系统不叠加持续可见水印。

```text
SASI_CONTENT_LABELING_ENABLED=true
SASI_CONTENT_LABELING_MODE=sasi_aigc_v1
SASI_CONTENT_PRODUCER_CODE=LINGXIFIELD
```

仅改变开关不等于验收完成。至少完成支付沙箱、支付小额实付、重复回调、重复任务、供应失败、取消、交付下载、额度守恒和内容标识检查。

## 调度

`GET|POST /api/internal/sasi/reconcile` 使用 `Authorization: Bearer <CRON_SECRET>`。它每次最多同步十个排队或执行中的任务。生产环境应由可信调度器周期调用；不要把 `CRON_SECRET` 放入前端或公开 URL。

## 当前不应承诺的能力

- 多镜头自动拆分与整片时间线合成
- 配音、音乐、字幕烧录
- 图片参考驱动的视频生成
- 供应商实际账单自动对账
- 自动退款到原支付渠道

这些能力应在单镜头生产闭环真实运行稳定后分阶段加入。
