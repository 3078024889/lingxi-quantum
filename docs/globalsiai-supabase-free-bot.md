# 全球 SIAI Telegram 免费运营机器人（已部署）

**不购买 Telegram Premium，不升级 Vercel Pro。**

## 已实装

- 项目：Supabase `sxsgdpqojepgbbrxrzlq`，当前组织计划 `Free`
- Edge Function：`globalsiai-bot`（ACTIVE）
- URL：`https://sxsgdpqojepgbbrxrzlq.supabase.co/functions/v1/globalsiai-bot`
- pg_cron：5 条已启用 `globalsiai-discovery/tutorial/comparison/creation/community`
- 时间：新加坡/北京时间 09:05、11:05、14:05、17:05、20:05
- 7 日轮换 35 条内容，原网站无须因为 Telegram 升级 Vercel
- 数据表：`public.telegram_community_events` 和 `public.telegram_community_daily_metrics`
- 调度凭证：Supabase Vault `lx_globalsiai_schedule_secret`（加密保存，Cron 只引用名字）

## 唯一的手动授权

当前 Bot Token 仅在 Vercel Sensitive Secret 中，无法安全地跨云平台自动复制，**不能要求用户在聊天中提供 Token**。

1. 打开 https://supabase.com/dashboard/project/sxsgdpqojepgbbrxrzlq/functions/secrets
2. 选择 Add new secrets。
3. Key = `TELEGRAM_BOT_TOKEN`
4. Value = BotFather 执行 `/revoke` 之后的新 Token。
5. Save。不要通过 GitHub、聊天或 URL 传 Token。

Supabase 官方文档说明 Secrets 保存后立即对已部署 Edge Function 生效，不需要重新部署。

## 实际验收

- 已通过网关调用 GET 健康检测，HTTP 200，返回 `{"ok":true,"service":"globalsiai-bot","mode":"supabase-free"}`。
- 未配置 Token 时受保护发布调用返回 HTTP 503 `BOT_SECRET_NOT_CONFIGURED`，不会擅自发布。
- Bot Token 配好后，先由具备 Vault 数据库权限的维护者调用服务端密钥验证的 `{"action":"setup"}` 注册 Webhook，再调用 `{"action":"smoke"}` 发送最多一条测试公告。**仅在用户完成 Secret 配置并确认机器人仍在群组时进行。**
- 核对 telegram_community_events 中 `smoke:YYYY-MM-DD` 是否为 `delivered`。
- 测试 /help、/tools、/ranking 和新成员欢迎、反诈骗删除消息。
- 检查首个 Cron 是否将 `post:YYYY-MM-DD:slot` 写成 `delivered`。

## 故障处理

- Secret 为空或有误：503，不能发送。
- Telegram 拒绝发布：确认群组 @globalsiai 中 Bot 具有权限。
- webhook 被其他 Bot 服务占用：setWebhook 将覆盖旧配置，确保同一个机器人只有这一套服务。
- 发送失败后记录 failed，阻止重复营销信息。不能把失败标记为成功。
- 数据库活动不足时，Supabase Free 项目仍有被平台暂停的风险，须监控项目状态和用量。
- 不发送骚扰私信、不购买群成员、不捏造价格和收入。
