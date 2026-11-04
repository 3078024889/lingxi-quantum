# 灵犀场：Google、Bing、百度双域名 SEO（2026-11-04）

## 真实索引策略
- `https://lingxifield.com/siai`：国际主站中文通用入口，自引用 canonical。
- `https://lingxifield.cn/siai`：中国区域中文入口，自引用 canonical，已去掉指向 .com 的 HTTP Link canonical。
- `/{locale}/siai` 八种其他语言仅在 .com 作标准版。`hreflang` 中 `zh-CN` → .cn、`zh` 与 `x-default` → .com，其他语言 → .com。跨域声明互相一致。
- `.com/sitemap.xml` 保持已真实开放的全球工具/专题/语言页面；`.cn/sitemap.xml` 当前只列入中文 SIAI 首页。其他 .cn 镜像页尚未单独优化，仍指向 .com，不提交大量重复 URL。
- 目录仍保留 32 已审核 + 30 来源预览 = 62 条；结构化数据仅列已审核的 32 条，绝不生成虚假的价格、日期、公司背景或 SEO 关键词页。

## 合并前验证
```powershell
pnpm install --frozen-lockfile
pnpm seo:audit:domains
node --test tests/siai-localized-indexing.test.mjs
pnpm build
```
还必须通过原有生产门禁、桌面/手机浏览器、九语言、支付与工具功能的回归。禁止在验收前合并/触发 Vercel 生产构建。

## 部署后真实检测
```powershell
pnpm seo:check:live
```
脚本只读请求两域名 robots/sitemap/SIAI HTML，检查 HTTP 200、canonical、hreflang、跨域 URL、noindex、HTTP Link 冲突和 SSR 标题；不会提交索引。

## Google Search Console
- https://search.google.com/search-console/ 分别核验 `lingxifield.com` 和 `lingxifield.cn`，各提交对应的 `/sitemap.xml`。
- 用网址检查观察 Google 实际选定的 canonical、抓取、覆盖率与点击；不能因 Sitemap 提交就宣称已收录。
- Google Indexing API **不适用**普通网页批量提交。

## Bing Webmaster / IndexNow
- https://www.bing.com/webmasters 分别核验两站及提交 Sitemap。
- 对**已经发布且实际新增/修改/删除**的 URL 使用 IndexNow。每个域名的 `/<key>.txt` 必须公开可访问。提交成功不代表 Bing 已索引。
```powershell
$env:INDEXNOW_SITE='https://lingxifield.com'
pnpm seo:submit:indexnow
$env:INDEXNOW_SITE='https://lingxifield.cn'
pnpm seo:submit:indexnow
Remove-Item Env:INDEXNOW_SITE
```

## 百度搜索资源平台
- https://ziyuan.baidu.com/ 验证 `https://lingxifield.cn` 并提交 `https://lingxifield.cn/sitemap.xml`。
- 如果账号有 API 提交权限，安全环境预先设置 `BAIDU_TOKEN`；不要在终端历史、代码、PR、聊天中直接写 Token。
```powershell
$env:BAIDU_SITE='https://lingxifield.cn'
pnpm seo:submit:baidu
Remove-Item Env:BAIDU_SITE
```
百度官方明确：URL 提交能缩短发现时间，不能保证收录。提交后看抓取诊断、索引覆盖、关键词表现。

## 监测与发布门禁
仅以站长平台反馈与实际搜索展示为收录证据。现有 Google/Bing/百度验证文件或 meta 标签不等于账号已完成所有权验证。非 main Vercel 部署已由仓库 `vercel.json` 禁止；独立分支 PR 审核通过后，合并生产需遵守原发布门禁。

## 全站公开内容发现门禁（新）

`pnpm seo:audit:fullsite`：审计 124 条 SEO 工具、九语言路由、站点地图、SIAI 区域入口、SEO 页面元数据及教程内链。已确认的 5 个 SASI 重定向入口不再进入 sitemap；账户、订单、私密链接不可被索引。GEO 文本只提供 canonical 链接，避免误把 `.cn` 镜像页面写成独立的九语言页面。公开网页和真实官方来源是主要搜索入口，`llms.txt` 只是辅助导航文件，不能保证 AI 引用。

### 2026-11-04 工具网页独立收录修复
- 扫描 94 个独立工具路由，定位并为 29 个真实工具页增加独立的 SEO 标题、摘要、hreflang 和自引用 canonical，不修改任何工具处理逻辑。
- 另为 `/release`、`/legal/sasi` 补独立 canonical，删除过期的「SASI 智能生态」元文案。
- `/tools/image-to-pdf-pro` 是重定向别名（真实操作页 `/tools/image-to-pdf`），不作为独立 sitemap 页面；八种语言的别名也 308 重定向。目录仍记录 124 个 SEO 项，其中 123 个是非别名的可索引工具入口。
- 构建前强制审计所有独立工具页面的 metadata 与 canonical；发现遗漏就阻断发布，而非把 SEO 工具都标记完成。

- 补齐 AI 图片检测与 AI 视频音频检测两个已发布页面原本缺失的 canonical/hreflang，保留各自真实功能限制描述。所有 94 个独立工具路由已逐个核对，重定向别名不作为独立页面。

### SSR 生产网页自动门禁
新增 `node scripts/seo/verify-built-pages.mjs`，在 GitHub 执行 `pnpm build` 后启动本地 Next.js 生产服务器（不部署），用不同 Host 模拟 .com/.cn 测试真实 robots、XML sitemap、SIAI canonical、语言备用链接、已开放工具、去重标题、永久重定向、余额 noindex。此检查从 HTML 与 HTTP 响应判定，避免只靠源码正则假阳性。正式域名上线后仍需执行独立 `pnpm seo:check:live`。

### 每天只读线上 SEO 巡检
新增 `.github/workflows/seo-live-monitor.yml`：在本 PR 经完整验收合并到默认分支后，每天北京时间 09:15 自动运行（也可以手动 workflow_dispatch），不需要 pnpm、网站权限或任何密钥，不触发 Vercel 预览/生产部署，也不执行 IndexNow/百度主动推送。只读取两域名 SIAI、robots、sitemap，并抽查 7 个关键公开工具及 3 个 sitemap 位置样本；校验 canonical、HTTP 200、索引状态、HTML 标题和可发现性。运行失败由 GitHub Actions 记录并警示；搜索平台实际收录须查询已验证的站长后台，不能用此巡检代替。
