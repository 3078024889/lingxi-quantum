# 全球 SIAI｜Telegram 五条/日 + QQ 营销运营手册

群组：https://t.me/globalsiai
机器人：https://t.me/GlobalSIAI_OfficialBot
QQ 一键复制工作台：https://lingxifield.com/community/share-kit（正式部署后才可访问）

## 自动发布计划（北京时间 / 新加坡时间）

| 类别 | 时间窗（Hobby 可能在小时内运行） | UTC Cron | API |
|---|---|---|---|
| 早间发现 | 09:00–09:59 | 5 1 * * * | /api/cron/telegram-daily |
| 实用教程 | 11:00–11:59 | 5 3 * * * | /api/cron/telegram-tutorial |
| 工具对比 | 14:00–14:59 | 5 6 * * * | /api/cron/telegram-comparison |
| 智能创作 | 17:00–17:59 | 5 9 * * * | /api/cron/telegram-creation |
| 晚间问答 | 20:00–20:59 | 5 12 * * * | /api/cron/telegram-community |

每个 Vercel Cron 独立运行一次/日，符合 Hobby 计时限制。共 35 条经过编辑的轮换话题；只发布已核实的品牌/功能、教程、问题，不编造最新版本、定价、收益和厂商动态。热点和新版本必须按官方来源人工复核后入库。按日期+栏目去重，外部调用必须持 CRON_SECRET。

## 当前激活条件

- [x] BotFather 已废弃此前泄露的机器人 Token
- [x] Production 已保存 BOT_TOKEN、WEBHOOK_SECRET、CHAT_ID
- [x] BOT_TOKEN / WEBHOOK_SECRET 已调整到 Sensitive/Secret
- [x] public.telegram_community_events 表及 RLS 受限已核查
- [x] public.telegram_community_daily_metrics 表及 RLS 已核查
- [x] site_page_views 增加 3 个可选的 UTM 来源列（不采集新增个人身份信息）
- [ ] 确认 Bot 在群内拥有管理权限
- [ ] 确认项目可合法用于商业用途（当前 Vercel Hobby 合同仅允许非商业个人用途；选 Pro/企业版或允许商用的托管环境）
- [ ] 最新 PR 完整 CI、构建、真实浏览器、SEO 与支付/数据门禁通过
- [ ] PR 合并并部署 Production，最新敏感环境变量随新版本加载
- [ ] 第一次 Cron setWebhook 后核实 Telegram getWebhookInfo 的地址、pending_update_count 及错误
- [ ] 群里实际验证 /help、/ranking、/tools、欢迎新成员、删诈骗信息和 5 次定时消息
- [ ] 用真实浏览器访问复制工作台与各推广链接，并验证 UTM 保存与访问量报表

若生产设备还未授权，保留代码候选，不制造已上线事实，不触发反复 Vercel 部署。

## 引流与复用

- 官方群聊链接已有 https://t.me/globalsiai；网站页脚保留群组入口。
- 每天 5 条的 Telegram 与 QQ 文案在一键复制工作台同时展示，QQ 使用 utm_source=qq，TG 使用 utm_source=telegram。
- 文案始终先给具体问题和做法，再给 /tools、/siai 或 /sasi 的官方入口；不要追求没有需求的假粉。
- QQ 群只在群规允许的范围内发布；不要批量私信陌生人或把别人强制拉群。
- 每晚群人数只取聚合数量，保存到 telegram_community_daily_metrics，不保存成员名单。
- site_page_views 保存准许值的来源标签和设备/页面已有统计信息；尊重 DNT / GPC。
- 站内未验收的收费入口不得包装成“已经能付款”。成交以真实支付到账、订单交付与退款后的净额核算。

## 首轮营收路径与验证

优先引导实际需求的用户使用工具；已经可以真实交付的 SASI 付费创作服务、合规的厂商合作、透明标注的赞助内容可作为收入来源。正式收费前先检查支付和退款是否闭环，不发布虚假价格。

以月入 ¥5,000 为目标：
- 若每单实收 ¥99，需要至少 51 笔（未扣除成本）。
- 若每单实收 ¥199，需要至少 26 笔（未扣除成本）。
- 若净利润目标 ¥5,000，则应扣除供应商生成成本、支付手续费、服务器成本、退款与税费等。
该数字是目标测算，不是收入承诺。必须有真实访问 → 可使用的服务 → 可支付订单 → 可交付的完整链路。

### 假设验证数据（非当前真实经营数据）

每周汇报：5 条日更的发送成功率、QQ 人工发布数、Telegram 群成员净变化、Telegram/QQ 标记访问数、关键工具使用完成数、真实付款/退款、当月净收入和每次有效访问成本。

## 安全

机器人不自动给陌生人发私信、不强行拉人进群；删除消息权限仅用于明显诈骗/刷屏。Webhook 必须验证 X-Telegram-Bot-Api-Secret-Token；定时任务必须持 CRON_SECRET。消息文本/成员个人标识不写入统计表。事件日志只存去重键和状态。机密不出现在 URL、用户可见页面或 GitHub。
