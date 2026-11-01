# 部署与生产发布门禁

## 应用和项目

- Git 仓库：`3078024889/lingxi-quantum`
- 独立应用目录：`lingxifield-ai-market/`
- Vercel 项目：`lingxifield-ai-market-review`
- Vercel Root Directory：`lingxifield-ai-market`
- 生产分支：`main`
- 构建：`npm ci`，随后 `npm run build`；完整验收使用 `npm run gate`。

此目录必须存在于生产分支，否则 Vercel 会在构建容器初始化阶段报 `NOW_SANDBOX_WORKER_ROOTDIR_NOT_EXIST`。本次独立接入 PR 将只把此应用目录加入主分支，不覆盖主站根目录的 SASI、实用工具、账户、支付或其他业务代码。

## 当前 Vercel 实况（2026-11-01）

- AI 行情项目当前只有 `lingxifield-ai-market-review.vercel.app` 项目域名，没有绑定 `globalsiai.com` 或 `globalsiai.cn)。
- 预览部署可构建；生产分支此前因应用目录不存在而失败。应用目录合并到 main 后，必须重新验收生产部署。
- 当前项目生产环境变量尚未配置；现有变量仅属于 Preview 环境。不得把预览密钥直接复制到 Production。
- 预览环境受 Vercel SSO 保护；不要把预览域名当作公开生产域名。

## 域名方案

- `globalsiai.com`：全球站候选域名。待 DNS 指向、域名验证、HTTPS 证书及实际页面验收后，方可绑定到 AI 行情生产项目。
- `globalsiai.cn`：大陆站候选域名。待 ICP 备案完成及阿里云接入条件满足后，再按确定的部署架构配置 DNS 和反向代理。
- 两个域名可以同时访问，但同一份页面内容必须确定唯一 canonical 主域名；另一个域名采用 301 跳转。只有真正独立的本地化页面才使用跨域 hreflang，不得把相同内容复制成两个互相竞争的站点。
- 不得将尚未验收的预览项目绑定到用户正式域名。

## SEO / GEO 开放门禁

以下条件全部满足前，保持预览 noindex、robots 禁止抓取、sitemap 为空：

1. 生产分支部署 READY，且部署 SHA 与 GitHub 合并 SHA 一致。
2. canonical 域名 DNS、HTTPS 和域名所有权已验证。
3. 九种语言的首页、详情页、hreflang、canonical、移动端和 RTL 实际验收通过。
4. GSC 属性已验证，服务账号已获只读权限；采集数据经过人工逐条复核。
5. 独立 Google/Bing SERP 与 GEO 引用样本具有原始采集文件、SHA-256、模型/版本、查询、地区、日期和复核记录。

通过后才可在 Production 环境按发布审批设置：
- `AI_MARKET_CANONICAL_ORIGIN`：唯一 HTTPS canonical origin。
- `AI_MARKET_DOMAIN_VERIFIED=1`。
- `AI_MARKET_INDEX_READY=1`。
- `AI_MARKET_INDEXED_LOCALES`：仅填写已通过验收的语言。
- `GSC_PROPERTY` 与 `GSC_SERVICE_ACCOUNT_JSON`：仅使用已验证的 Search Console 属性和只读服务账号。

不得为了让 sitemap 出现内容而伪造排名或补造 GSC/GEO 观测。

## 支付和厂商系统

- 支付渠道当前均为 `not_live`。商户凭证、渠道授权、签名回调、订单账本、幂等、退款和履约全部独立验收后，才允许开启结账。
- Production 使用独立生成的密钥；不得复用 Preview 的 HMAC、服务端密钥或数据库凭证。
- 厂商免费提交不代表身份已验证。登录、域名所有权、逐产品 ACL、争议处理和审计日志完成前，不得开放厂商自助修改或商业推广结算。
