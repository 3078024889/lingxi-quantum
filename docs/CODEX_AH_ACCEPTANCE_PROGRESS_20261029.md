# A–H 接管实测记录（未通过生产验收）

基线：e2113219，feature/ai-market-review-gate-20261029。
本轮工作分支：codex/ai-market-ah-auth-20261029。
工作目录：D:\30780\lingxi-ai-market-acceptance-ah。

## 登录原因及修复

原代码只在 NODE_ENV=development 时允许严格同源的 localhost 请求。
next start 使用 production，因而即使页面可打开，同源登录也会被拒绝。
新增 LINGXIFIELD_LOCAL_AUTH_ORIGIN 显式本地验收配置：仅 http localhost/127.0.0.1，Host、端口、来源及转发 Host 必须匹配；生产请求默认仍不允许 loopback 例外。
没有关闭 CSRF、OAuth state 或生产域名校验。

本地原本缺少 Supabase 公共配置，现通过已连接项目的有效公开 anon key 配置 .env.local；没有获取或写入 service_role。
数据库只读确认 business@lingxifield.com 邮箱已确认且在既有 money_operator_settings 管理员名单。
只读本地审查使用同一名单的临时服务器配置：经过 auth.getUser 验证的该账户才可访问，严格绑定 127.0.0.1:3100，2026-10-30 17:00（Asia/Shanghai）到期。
这不是完整管理员写入权限。候选审核、反馈保存、付款及发布未向该临时入口开放，相关 API 仍使用原权限门禁。

## 实际通过

- request-security 运行回归 9/9（包含 production 配置、跨端口、外站、转发 Host、原生产域名）。
- 本地 HTTP POST /account/auth：同源无效邮箱 → auth_error=email；跨端口与外站 → auth_error=origin。未使用管理员密码。
- scripts/ai-market 测试 72/72；lib/ai-market 原测试 91/91；新增本地只读权限测试 3/3。
- TypeScript tsc --noEmit 成功。
- 浏览器打开 /ai-market，点击账户入口，显示真实登录表单且 next 指向审查台。
- 浏览器 Qwen → 查找模型，返回 12 条 Hugging Face 公开仓库，有发布者、来源链接和日期。不是官方 Qwen 模型认证或热度榜。
- 网络诊断成功写出报告；解释器兼容 PowerShell UTF-8 BOM，缺报告时输出操作提示，不再抛 ENOENT 堆栈。
- 实际 Hugging Face API 采集成功，保存 20 条候选；不代表入库或可靠排名。

## 修复的额外可见问题

- 缺少后台数据库配置时，已核验搜索原先误报 RATE_LIMITED；现在明确返回 VERIFIED_DATA_UNAVAILABLE。
- 用户界面不再直接显示该内部错误码。
- 添加九语言导航、账户入口及审查台“打开当前版本 AI 行情”链接。
- 网络 TCP 探针单个连接最多等待 5 秒，不改变系统执行策略；诊断脚本仅以单进程 Bypass 运行。

## 仍未通过或未执行

- 真实管理员登录：等待用户自己输入密码；不能以函数测试代替完整登录验收。
- 已核验产品搜索、候选审核和反馈持久化：缺少隔离数据库及完整配置；禁止将新表迁移到正式 Supabase。
- 全套九语言详情/排行/订单：未通过。现有语言页只有搜索组件，尚无完整行情组件，不能用九个 HTTP 200 冒充完整翻译。
- 界面仍未完整达到两张行情终端设计图，不能称为最终成品。
- 合法备用数据源、支付沙盒/退款/对账、真实 SEO/GEO 排名、历史指标和评价均未闭环。
- 本机没有检测到 docker/psql 命令；未安装重型运行栈，未执行数据库迁移。
- 2GB 进程限制与生产并发测试未执行；没有对旧电脑进行高负载冲击。
- 本轮未运行新的生产构建；本地可见版本运行 next dev。旧的 MAIN_BUILD_PASS 不能替代本次构建。
- 未合并 main、未部署生产、未启用收费。

## 查看与证据

- http://127.0.0.1:3100/ai-market
- http://127.0.0.1:3100/account?next=%2Faccount%2Fai-market-review
- output/playwright/account-login-ready.png
- reports/ai-market-local/codex-regression.txt
- reports/ai-market-local/codex-core-regression.txt
- reports/ai-market-local/hf-model-candidates.json
- reports/ai-market-network/network-diagnostic.json

所有配置、缓存与证据在 D 盘。.env.local 被 Git 忽略，不提交密钥。
本机服务重启：在本工作目录运行 node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100；测试缓存环境变量按 AGENTS.md 设置到 D 盘。

补充：云端 workflow 的预检步骤含字面量反斜杠 n，已改为真实换行，并以 js-yaml 解析确认 8 个步骤。新增云端生产构建步骤；尚待 CI 结果。集成契约测试新增 1 项，本轮 scripts 总计 73 项；lib 本轮共 94 项。
