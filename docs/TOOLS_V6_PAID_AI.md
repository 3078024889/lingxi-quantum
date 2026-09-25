# 灵犀场工具中心 V6 — 付费 AI 执行门

本轮把“付费后才调用真实模型”接到：

- 食物图片卡路里分析
- 单张图片去文字 / 去物体
- 批量图片去文字 / 去物体
- 视频 / 音频翻译配音

## 核心安全设计

1. 浏览器只负责请求报价，不决定最终价格。
2. 报价读取 `tool_pricing`。
3. 支付平台回调产生 `tool_export_grants`。
4. AI API 在服务端调用 `claim_tool_paid_job(...)`。
5. 同一个 `quote_id + item_key` 具备幂等性：
   - 成功过：返回已有结果，不重复扣付费单位。
   - 失败过：允许重试，不重复扣单位。
6. 批量图片每张图片占 1 个已付单位。
7. 视频按分钟单位领取付费额度。

## 视频翻译特别处理

ElevenLabs 当前项目制 Dubbing API 在**创建项目时就会收取至少一个目标语言的费用**。
因此不能先调用供应商再让用户付款。

V6 顺序：

上传/链接 → 浏览器读取时长 → 服务端报价 → 支付 → 创建 ElevenLabs project
→ ElevenLabs 返回媒体真实 duration → 再核对已付分钟数
→ 数量足够才创建 target language → 输出。

项目创建时不直接传 `target_language`，避免在还没核对实际 duration 时立即生成目标语言。

对于普通网页链接，如果浏览器无法直接读取媒体 metadata：
**不允许猜时长收费**，要求用户改为上传文件或提供可直接读取的视频/音频地址。

## 供应商文档核对

- OpenAI 图像局部编辑：Image API `/v1/images/edits` + mask；
  默认模型 `gpt-image-2.5-sunburst`。
- OpenAI 图片理解：Responses API 支持 `input_image`。
- ElevenLabs：`POST /v1/dubbing/project` 创建项目；
  project 的 `media.duration_s` 是供应商返回的实际时长；
  `POST /v1/dubbing/project/:project_id/language` 创建目标语言。

## 仍未自动做的事情

- 视频“补差价”支付 UI：如果供应商实际 duration 大于用户付款分钟数，
  API 会返回 `TOPUP_REQUIRED`，但 V6 暂不自动创建“差额报价”。
  这是下一轮应做的 V6.1。
- 不做来源不明的视频万能下载。
