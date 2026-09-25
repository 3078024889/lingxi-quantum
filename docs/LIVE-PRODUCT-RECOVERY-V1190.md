# V11.90 · Live Product Recovery

本阶段直接对应线上验收发现的 7 类问题：

1. 历史 `.lingxi-backup-*` 暂不自动删除。线上仍在修复，先保留最近恢复点。
2. 工具支付页全部显示“暂不可用”的直接原因之一：`/api/pay/providers` 在 GitHub main 中缺失。
3. `/tools` 改为不依赖缺失 CSS class 的 Tailwind 可见/可点击工具网格。
4. Book/Learning/Research SASI：去掉“现在是真实接口”这种开发态文案；未保存的当前正文也能作为本次证据；智能模式始终可选。
5. “我的场域”统一改为“我的账户”；顶部右侧以账户头像为主入口，账户菜单包含订单、切换、退出、注销入口。
6. 新增 `/explore`，九国语言，彩色小封面卡。
7. 小工具共享页面从“死白卡片”调整为有层次的彩色浅底、统一正文尺度。

重要：
- 代码能修支付接口缺失，但 Vercel 中微信/支付宝/PayPal 的真实密钥和启用开关仍必须存在。
- `/api/pay/providers` 会返回 available/configured/missing 诊断，但绝不返回 secret 值。
- 安装器不会提交、推送、部署，也不会发起真实付款。
