# 全站十轮审计与修复 · 2026-10-04

范围为当前实际仓库和可访问的生产数据库。起点 main 3d48fea；4932 个受版本管理文件、179 个 API 路由、88 个页面入口，构建生成 803 个页面。源码解析没有语法错误。源码检查、浏览器模拟和真实生产数据库检查分别记录，不能互相替代。

## 从前一窗口接回的事项

- PDF 编辑、签名、文件工具和支付审查是最早的任务重点，不能误记成只处理 SASI。九语言 PDF 按钮、介绍、错误和保存真实性本轮再次运行实际文件测试。
- 用户已确认收到 1 元和 4 元微信原路退款、运营邮件，并看到了资金看板。本轮生产 SQL 汇总确认两条微信/CNY 提现记录均为 completed。没有发起新的扣费或退款。
- 余额四入口和自动进度查询已实现；本轮验证单次查询、隐藏/离线暂停、恢复刷新、结束停止，取消与确认竞态，以及 CNY/USD 分离。
- 两个旧工作区的 60 个修改及旧缓存在前次清理中已处理。本次不重复删除当前依赖、模型、原始内容、迁移或其他聊天新建的工作文件。
- 全站口径、九语言回退、真实服务器资源状态以及搜索增长的实际效果，仍要持续以行为验证，不可用“全通过”掩盖未验证范围。

## 十轮检查

| 轮次 | 范围 | 发现与处理 | 证据与边界 |
| --- | --- | --- | --- |
| 1 | 系统地图与依赖 | 建立路由/页面/迁移地图；确认 65 个公开工具和 9 种语言；保留动态服务和原始资料 | tmp/ten-round-system-map.json；全站源码解析；tool-registry / capability-genome。关键词未匹配不等于缺少鉴权 |
| 2 | 任务、恢复、保存 | 保留持久任务与当前共享文件工作区；验证失败保存不会显示“已保存”或继续请求报价 | v57/v58、all-paid-task-recovery、实际两页 PDF 和 WAV 浏览器测试；未调用收费模型进行压力试验 |
| 3 | 支付、退款、提现 | 核查两个币种、三渠道适配、冻结释放、原路退款、请求幂等、取消限制和自动查询；修复安全脚本仍依赖旧退款文件的问题 | money 生命周期/运营/管理员/自动刷新/进度/恢复/签名测试；22 项桌面+手机资金浏览器用例；生产仅两条已完成微信记录，不宣称真实支付宝/PayPal 退款已测试 |
| 4 | 权限、数据库与请求安全 | 模型连接探测增加公网 DNS 校验、地址固定、TLS 校验、禁止重定向、2 MiB 响应上限和覆盖 DNS/响应体的超时。四个后台 money RPC 收回 anon/authenticated EXECUTE，保留 service_role | provider-json-probe 行为测试；生产权限查询；11 个核心表开启 RLS；函数内 service_role 检查保留，余额快照保留 auth.uid 所有权校验 |
| 5 | 文件与文档转换 | 网关只接纳一个转换；忙时不消费票据；限制流式输出，完整 70 秒超时；备用转换共用 45 秒预算、限制输入/输出、禁止第三方返回任意下载地址，不对无效/超大文件重试 | 真实本机 HTTP 网关测试（假转换服务，不是 LibreOffice 验收）；转换适配器测试；6 项文档入口浏览器测试；没有伪称未配置服务转换成功 |
| 6 | 九语言与公共文案 | 首页、页脚、搜索介绍、结构化资料统一为实际用途；移除生态/未完成产品等长篇内部口径；保留各工具真实收费、隐私与未开放标记；翻译更新链接、SASI 输入/下载按钮、视频准备提示、文件过大下一步 | PDF 九语言、8 类工具介绍、首页/页脚/阿拉伯语方向、SASI 输入；粗略中文源码扫描标出 153 个文件，包含完整翻译表和技术常量，不能当成 153 个确认缺陷 |
| 7 | 桌面、手机、键盘与可访问性 | 首页输入增加可访问名称；余额四入口单面板、键盘、金额保留、无横向溢出；SASI 功能导航名称翻译 | 第一组 66 项浏览器测试全部通过；文档 6 项通过；首页/余额索引/SASI/反馈九语言 58 项复测通过，增加卡片介绍与入口不重叠检查、弹窗键盘和失败保留文字检查；截图 tmp/ten-round-home-desktop.png / mobile.png |
| 8 | 性能与小服务器 | Compose 限制 Gotenberg 1 GiB、gateway 512 MiB、Caddy 128 MiB；最多一个转换；总限额 1664 MiB，为系统预留约 384 MiB | 这是专用 2 GB 主机的预算，不能证明每个大文档都能转换。必须在实际服务器运行 docker stats/OOM/代表文件测试；GPU 工作节点不能照搬到此主机 |
| 9 | SEO/GEO、双域名与产品真实性 | 同步首页/meta/JSON-LD/九语言介绍，避免宣传未开放生成能力；余额页 noindex，退出 sitemap，公开工具 hreflang/费用/处理方式仍来自实际目录 | site-facts 对 65 工具×9语言、6类页面、双域名验证；V59 搜索/小程序检查；余额 HTTP noindex、canonical、10 个语言 alternate 浏览器测试。llms.txt 为资料目录，不承诺 Google 排名收益 |
| 10 | 仓库、构建与上线 | 删除无运行时引用的 EarthGrid、SpiralField、UniversalFileRouter；安全审计更新为当前退款实现；CI 增加探测/文档/网关行为回归；本轮采用完整构建后窄范围提交 | production-gate、Next 正式构建、Playwright 依赖契约与迁移历史检查；上线要等 Vercel commit status 成功并复查两域名，不能把 push 成功当部署成功 |

## 截图复查后的补修

正式构建后查看真实英文截图，发现书籍/学习卡片介绍与入口发生重叠。改为自然纵向排版，九语言、桌面和手机逐卡检查文字与入口边界。反馈入口/弹窗原来仅中文，已补齐九语言介绍、按钮与错误；发送失败保留文字，必须收到 ok 和问题编号才显示成功，未知内部错误不会直接显示。弹窗增加名称、初始焦点、Tab 循环和 Esc 关闭。语言选择移除重复英文标签，币种设置使用已有九语言控件。

前一批提交 18dfd16 的 GitHub 完整流水线和 Vercel 部署成功，两域名真实首页、法语 SASI、阿拉伯语方向、余额 noindex 和站点地图已复查。补修提交继续由同一流水线与实际部署复查，不能使用前一批的结果冒充补修已上线。本轮临时下载的 Supabase CLI 缓存已删除约 244 MB；其他聊天未核实的新工作文件保持原样。

## 最终完整流水线暴露的语言问题

a5c10ef 的源码与正式构建通过，完整桌面 206 项中 205 项通过，唯一失败为 /en/tools 的 html.lang 被改回 zh-CN。新挂载反馈组件触发旧的共享语言钩子；钩子原本只读查询参数/缓存，没有读取语言网址前缀。修复共享钩子：有效网址前缀优先，其次显式查询参数，最后已保存偏好；随 pathname 变化重新同步。存储不可访问时仍可正常设置语言，主题、通知已读时间与账户显示偏好也安全回退。通知按钮原来的直接读取会触发整页错误页，已由真实浏览器禁用存储用例复现并修复；无效语言参数不能命中对象原型属性。保留旧断言，并增加中文缓存进入英文/阿拉伯语网址、禁用存储及无效参数的行为回归。独立工作区正式构建与源码检查通过，四项桌面/手机专项回归通过；完整浏览器回归继续执行，以该补修提交的流水线结果作为最终依据。

## 双域名复查发现的外部拦截

第二批部署 a5c10ef 在 Vercel 成功，.com 的实际首页、余额 noindex、站点地图、法语 SASI、阿拉伯语方向、英文卡片边界和反馈弹窗复查通过。随后 .cn 多次返回 403，server=nginx/1.24.0、x-vercel-mitigated=challenge，页面为 Vercel Security Checkpoint；真实浏览器执行页面脚本后仍显示“无法验证您的浏览器，代码 99”。这是发布后的新发现，不可沿用第一批双域名成功结果将其标为通过。

当前 Vercel 连接无权访问 celestial9，不能读取规则命中日志；服务器 SSH 与当前 Nginx 配置尚未取得。外部代理可能影响真实客户端识别，是待验证推断，不能武断归因于网站代码或具体防火墙规则。官方说明自托管代理需要相应的 Verified Proxy 接入，不能假定加 X-Forwarded-For 就已解决：[Vercel 反向代理说明](https://vercel.com/docs/security/reverse-proxy)。此项应作为上线后的高优先级运维问题；没有关闭防护或添加宽泛绕过规则。

## 生产数据库检查

20261004043722_money_worker_execute_least_privilege 已在生产应用并回读：四个后台 RPC 的 anon_execute=false、user_execute=false、service_execute=true。余额快照保持 user_execute=true、anon_execute=false，代码内限制只能读取本人。后台队列、通知、提现和付费任务均有相应查询/唯一索引，未新增无必要索引。

安全检查剩余的 68 项 RLS 无策略提示是 INFO，应按每张表的后台访问模式复核，不能统一开放策略。余额快照的已登录执行提示是预期授权，已检查所有权逻辑。泄露密码保护未启用，应在 Auth 设置与计划支持范围内处理：[官方说明](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)。

远程迁移版本由实际 apply_migration 记录取得，CLI 创建的本地迁移文件对齐该真实版本。现有历史迁移重复时间戳两组未改名、未重放，避免改变线上历史；65 个已记录远程历史版本对齐检查通过。

## 研究采用的优势

- [Google 官方 AI 搜索指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)：清晰、可抓取、真实有用的内容与良好体验；不堆关键词、不声称 llms.txt 能提高 Google 排名。
- [Gotenberg 官方配置](https://gotenberg.dev/docs/configuration)：有上限的队列、并发和超时；现有转换服务采用 [MIT 许可](https://github.com/gotenberg/gotenberg/blob/main/LICENSE)。
- [Immich 官方上传实现说明](https://github.com/immich-app/immich/blob/main/docs/docs/features/command-line-interface.md)：有界并发、内容去重、先核查再删除。仅学习机制，不复制整套服务到小服务器。
- [Paperless-ngx 官方文档](https://github.com/paperless-ngx/paperless-ngx/blob/dev/docs/usage.md)：重型文件任务与页面请求分开，并能查到失败；仅参考设计，未引入其 GPL 代码或重型依赖。
- [OWASP SSRF 指南](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)：验证实际目标地址，防止重解析与跳转绕过。
- [W3C WCAG](https://www.w3.org/WAI/WCAG22/quickref/)：清晰名称、键盘操作、手机可操作和正确文字方向。
- [Supabase 函数权限](https://supabase.com/docs/guides/database/functions)：服务函数最小授权，保留函数内身份检查。

本轮新增代码自行实现，未复制 Immich/Paperless 的源码；依赖数量和 lockfile 没有增加。

## 必须延续的工作与上线边界

1. 阿里云服务器地址/SSH 用户/已有密钥路径未取得。容器配置和网关代码已修，但不能声称远端已更新、没有 OOM 或真实 LibreOffice 全格式通过。
2. 无生产模型密钥的本机环境仅用于模拟支付/生成，不做真实收费生成。登录后的真实生成、文件交付、支付宝/PayPal 退款还需要受控的真实凭据与小额验收。
3. 中文源码启发式审计不可靠地把完整九语言字典计为问题，后续以当前挂载页面的真实 DOM 和失败分支为准，继续清理旧面板中的双语言提示与工程术语。本轮不是所有隐藏后台/历史面板的九语言认证。
4. Search Console、百度后台、小程序开发者工具和服务器日志没有完整接入；搜索收录、点击、收入和小程序真机支付不能由源码检查保证。
5. 原始小说资料、数据库历史、模型权重、当前 node_modules/.next 和其他聊天尚未确认用途的新备份不是可直接删除的垃圾。

## 从错误提炼的提交与部署方式

缺失 site-facts 是源码依赖缺失，须提交被引用的事实文件并验证干净构建；不能靠缓存掩盖。旧源码字符串审计与真实实现分离时，应更新检查目标并增加行为测试，不能硬写 PASS。所有新翻译必须同步类型声明，先过 TypeScript 再构建。Windows 本机没有 Playwright 自带浏览器，本轮使用已安装的 Chrome 临时配置；CI 使用官方 Chromium 安装步骤。

正常方式：检查当前 main 与其他聊天修改 → 只暂存本轮明确文件 → production-gate / 正式构建 / 有意义浏览器验证 → 普通 commit、push main → 查询对应提交的 Vercel 状态 → 两域名复查。不 force push，不 stage 全部，不携带环境密钥，不把仅本机清理当成必须再部署的产品改动。
