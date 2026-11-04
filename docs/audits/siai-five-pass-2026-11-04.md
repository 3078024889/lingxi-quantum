# 2026-11-04 五轮真实验收审计记录（候选，不部署）

> 这是按现有生产提交 `da81393c` 和本次候选改动记录的审计材料，不代表全部验收通过。

## 1. 服务端 SEO 与九语言
- 实际生产 9/9 `/siai` 语言 URL 返回 200，有各自 canonical 和本地化 title；但初始 HTML `<html lang="zh-CN" dir="ltr">`，前端启动后才修正。客户端正确不等于爬虫第一次获得正确语言标签。
- 候选修复采用 middleware allowlist 标签 + 根布局读取安全 request header，避免客户端伪造；会让使用该 RootLayout 的静态页面变为依赖请求动态渲染，必须通过 Next build、SEO 路由和缓存/成本门禁后才合并。
- 独立市场 `robots.txt` 为禁止索引，按主域作为索引入口的现行政策保留，不当作缺陷。

## 2. 功能真实交付与触摸
- 记录本轮之前的最新真实运行证据：PR #149 `41742735376` PDF 合同差异浏览器 E2E success；`41742742405` mobile PDF smoke **failure**，新增图片右下角拖动后尺寸不变（10 passed, 1 skipped, 1 failed），不能称全部 PDF 手机上可用了。
- HEIC 独立浏览器 `41742872674` SUCCESS；此结果只覆盖特定真实 HEIC 输入、解码与交付，不能替代所有编解码器/平台。
- 本轮候选新增九语言 SSR 请求级浏览器测试。124 工具总台账仍需真实输入、处理、下载、重开，缓存和截图不是结果文件证据。

## 3. Supabase、财务及安全
- Supabase advisors：100 个 RLS 无策略 INFO（多数服务端私有表为 deny-all，不能直接改成可公开访问）；2 anon + 5 authenticated SECURITY DEFINER WARN；40 外键索引 INFO、15 auth_rls_initplan WARN。
- 已读取重要的 `ai_market_submit_vendor_submission` 与 `ai_market_submit_visitor_feedback` 定义：前者公开提交有结构/每日邮箱计数限制但需进一步防邮箱轮换刷单；后者带签名、时效及限流；moderation/read RPC 以 `auth.uid()`+管理员名单判断。单凭 advisor 警告不能断言已被提权。
- 本轮不修改生产 DB 权限/支付。长期修复须在独立环境验证 RLS、访客提交速率和实际支付回调。

## 4. 大厂资料采集（只入非公开审核层）
- B001–B005 50 条已在仓库，B004+B005 仍有大量价格/付款/授权字段缺官方依据。
- 新增 B006 10 条不同产品 API，70 个七类字段，来源核验日期 2026-11-04，`reviewed:false`、`publishApproved:false`、`visibleToPublic:false`。
- 原始官网证据按价格/免费/模型/地区/商业/付款/厂商归属分字段；未能独立确认的项目保留 missing，不填写推测优惠、不承诺国家可使用或特定付款。
- B006 不加入 32 条 curated + 30 条 public source preview，不改变公开目录计数，必须完成审核后单独批准。

## 5. 最终发布与回滚
- `main` 当前 `da81393c`，双 Vercel production READY。Hobby 额度敏感，所有本轮提交停留 Draft，验收完整后再合并，严禁自动覆盖正式站。
- 必须核对构建 commit SHA，Next TS 源码、整合桌面手机 E2E、性能/静态生成变化、官方数据校验、数据库安全告警及恢复。
- 所有运行日志及验收证据附 GitHub Action URL；没有成功报告则维持阻断，不把正在跑的测试写成成功。

## 2026-11-04 官网复核补充（B006）
- xAI 官方[区域端点](https://docs.x.ai/developers/advanced-api-usage/regions)与[账单说明](https://docs.x.ai/console/billing)分别提供区域**处理**和付款证据。美国端点并不等于美国以外不能访问；账户国家和全部 API 型号仍待独立验证。
- B006 七字段合计 70：现有 **29 条官网观察、41 条证据缺失**，无商用授权或实付款证明。全部产品仍为候选，不能公开上榜。
