# 全球 SIAI Telegram 官方群运营部署手册

群组：https://t.me/globalsiai
机器人：https://t.me/GlobalSIAI_OfficialBot

## 激活前必须完成

1. 在 BotFather 对此前公开过的旧 Token 发送 /revoke。新密钥只保存于密钥管理平台，不要发聊天、截图或提交到 GitHub。
2. 核对机器人已加入群组，授予必要权限：删除消息、限制违规成员；不授予添加管理员及修改群信息权限。
3. Vercel Production 私有环境变量：
   - TELEGRAM_BOT_TOKEN：更换后的新 Token
   - TELEGRAM_WEBHOOK_SECRET：32 字节的 URL-safe 随机字符串（A-Z、a-z、0-9、_、-）
   - TELEGRAM_CHAT_ID：@globalsiai
   - CRON_SECRET：复用主站现有值，不要重置其它定时任务的口令
4. 审核并执行新建表迁移 supabase/migrations/20261105090000_telegram_community_events.sql。测试 RLS、匿名用户不可读写、服务端可插入更新。
5. 独立分支 CI、构建、安全门禁及真实浏览器验收通过后才允许合并，合并前不要触发主站生产部署。
6. 正式合并部署后，/api/cron/telegram-daily 会在每天约 09:05（新加坡时间）使用**服务端私有环境变量**自动调用 Telegram setWebhook：
   - url：https://lingxifield.com/api/telegram/webhook
   - secret_token：与 TELEGRAM_WEBHOOK_SECRET 完全相同
   - allowed_updates：["message"]
   不需要把 Token 拼入链接或手工复制到聊天。
7. 首次自动注册后，通过 Telegram Bot API 的 getWebhookInfo 核对实际注册状态与报错，再私聊机器人 /help、/tools、/ranking，实测群内新成员欢迎和反诈骗。
8. 如果用户想提前激活，必须通过安全的服务器端触发注册；不要从浏览器地址栏提交 Token。

## 运营范围

- 北京/新加坡时间每天上午约 09:05 发布 1 条经核实的工具教程或功能介绍。Cron 使用 UTC 01:05；免费计划可能在该小时内延迟。
- 回复 /start、/help、/tools、/ranking、/community；不主动给陌生人群发私信。
- 新入群成员自动欢迎。普通外部链接可以发送，只有很明显的诈骗诱导和极端刷链接才自动删除。
- 所有推广链接附加 UTM 来源标记。成交归因仍以网站实际访问和订单数据为准。
- 事件表仅保存 update ID / 日期和处理状态，不存成员资料、聊天文本或敏感密钥。
- 出错时记录为 failed 并停止重复推送，由管理员复核后再处理。

## 真正上线前的验收清单

- [ ] 新 Bot Token 已替换、旧 Token 已失效
- [ ] Vercel Secret 和 Webhook Secret 已设置
- [ ] 数据表 RLS/服务端写入经真实验收
- [ ] Webhook 未授权请求返回 401
- [ ] 私聊 /help、/tools、/ranking 正常
- [ ] 群组新成员欢迎正常，其他群不响应
- [ ] 普通链接不会被误删，诈骗链接能删除
- [ ] 每天仅发布一次，重复触发不会重复发送
- [ ] 主站来源流量和真实转化有可靠数据记录

运营原则：不购买假粉、不发送未经同意的私信、不自动邀请陌生人，不发布虚构价格或收益承诺。即时新闻必须核对官方来源之后再发布。
