# 全球 SIAI 排行榜生产切换清单（2026-11-01）

## 已完成

- 独立 Next.js 应用目录 `lingxifield-ai-market/` 已建立，并通过 Vercel Preview 构建。
- 32 个精选产品的搜索接口实际返回 32 条；ChatGPT 详情 API 正常。
- 九语言首页实际返回 HTTP 200；中文品牌 H1、九语言 SEO 标题已统一。
- 预览环境保持 `noindex,nofollow`；robots 禁止抓取，sitemap 为空。
- 111 项预构建合同/回归测试通过。
- `globalsiai.com`、`globalsiai.cn` 已加入受控 canonical-origin 与 GSC 验证白名单，但白名单不代表域名已绑定或已验证。
- GSC 采集、人工复核、SERP/GEO 原始证据哈希链路已实现；当前公开观测为 0，未虚构排名。

## 生产阻塞

1. **应用目录缺失于 main**：Vercel 项目 Root Directory 指向 `lingxifield-ai-market`，而 main 之前没有该目录，导致生产构建失败。独立接入 PR 仅添加该目录和专用 CI 工作流，不合并行情预览分支中的其他主站改动。
2. **域名未绑定**：AI 行情 Vercel 项目只有 `vercel.app` 域名；globalsiai.com/cn 尚未绑定。
3. **生产环境变量缺失**：当前项目仅有 Preview 环境变量。生产密钥和数据连接需独立配置。
4. **SEO/GEO 数据为空**：0 条已核验观测；需要 GSC 授权和独立 SERP/GEO 采集复核。
5. **支付未启用**：支付宝、微信、PayPal 均未满足真实商户授权和全链路验收。
6. **厂商身份闭环未完成**：申请入口存在，正式身份验证、厂商账号和逐产品 ACL 仍需闭环。

## 生产上线顺序

1. 合并“仅增加独立应用目录”的 PR；确认 main 的 Vercel 生产构建不再出现 Root Directory 错误。
2. 验证 Vercel 生产部署 SHA 与 GitHub main SHA 一致；确认主站 lingxifield.com/.cn 未受影响。
3. 确认 globalsiai.com 的 DNS、HTTPS 和所有权，随后绑定到行情项目。
4. globalsiai.cn 等 ICP 完成并确认阿里云接入方式后再配置；两个域名确定唯一 canonical 方案。
5. 独立设置 Production 环境变量和密钥，不复制 Preview secrets。
6. 九语言、移动端、RTL、详情页、下载直达、搜索、比较、接口、安全和恢复测试通过。
7. 接入 GSC，只读采集并人工复核；独立 SERP/GEO 样本具备原始证据和 SHA-256 后再公开。
8. 支付渠道完成沙盒交易、签名、重放、金额绑定、退款、对账和履约验收后，才开启真实结账。

## 禁止事项

- 不因 Vercel READY 就宣称全面竣工。
- 不把 32 个精选产品档案、22 条旧目录记录或 200 条待审候选混成一个全球市场总数。
- 不将 SEO/GEO 的 0 条观测包装成排名。
- 不在域名未验证时开放索引。
- 不在商户未授权、签名与退款未验收时启用收款。
- 不修改主站根目录业务代码来绕过行情项目 Root Directory 错误。
