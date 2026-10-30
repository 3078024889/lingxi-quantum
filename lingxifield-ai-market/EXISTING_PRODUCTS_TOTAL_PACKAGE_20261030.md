# 灵犀场全球 AI 行情：现有产品总大包（2026-10-30）

## 目标与边界
停止扩大目录；优先把当前产品页面、官方出处、价格和免费额度、条件、公司背景与榜单证据闭环。
只在 `feature/ai-market-review-gate-20261029` 开发分支修改；**不合并 main、不部署、不改生产 DB 或付款**。
未验证指标显示待核验，**不以模拟数据填满 SEO/GEO、评分、流量、融资和成立年份**。

## 已合并到本批次的源码
- `app/market-workbench.tsx`：总榜补价格/免费额度/官方出处；详情价格页直接显示逐项证据。
- `lib/platform-repository.ts`：不再把种子中的演示资本和成立年份当事实展示。
- `scripts/run-existing-products-full-gate.mjs`：当前产品身份、重复域名、证据文件及目录验证。
- `scripts/build-existing-product-review-queue.mjs`：为当前目录所有产品生成 18 类逐项审核清单。
- `scripts/run-existing-market-total.mjs`：在一个批次中执行审计、校验、合同测试、类型检查，传入 `--build` 再进行 Next 构建。
- `scripts/run-source-pipeline.mjs`：原有的额外采集能力保留，但本批次**不运行**。
- 原先 `reviewed-product-facts.ts` 中已经核实的官方资料继续复用；有缺失不自动填空。

## 在 Windows 现有项目目录中统一运行
请先在 **git checkout/worktree 的干净开发副本**同步本分支；严禁对有未提交更改的代码使用 `git reset --hard` 或强制切分支。
进入包含 `lingxifield-ai-market/package.json` 的目录后：
```powershell
npm ci
node scripts/run-existing-market-total.mjs --build
```
结果：
- `reports/existing-product-gate/existing-products-full-gate.json`：现有产品目录和来源覆盖；
- `reports/existing-product-gate/review-queue.json`：逐产品核验任务；
- `reports/existing-product-gate/total-gate-results.json`：一键验收 PASS/FAIL 及失败日志。

## 生产前必须再通过
1. 对现有全部产品：官方身份、官网入口、功能、免费、价格及结算周期、地域/大陆可用、水印、商用、失败扣费、退款、电话/银行卡注册，逐项提供 URL、日期、区域和适用条件。无法核验显示待核验。
2. 公司成立、融资、上市不能由种子数据/估计数据展示为事实。
3. 总榜严格区分真实流量排名、HF-only 下载、官方目录顺序；相互不可替代。无实测 SEO/GEO 数据则保持无排名。
4. 详情：功能、价格与额度、数据与排名、公司、用户真实使用经历、竞品对比，应显示可用来源或明确为空，而非无效按钮/假图表。
5. 九语言完整翻译、阿语 RTL、移动端搜索对比及无痕网页入口。
6. Next 构建、单测、浏览器 E2E、真实数据 API 和登录/权限边界验证，并复测 2GB 服务器性能。
7. 审核记录及导入遵守已有主站候选审批体系；审计文件不自动上线。

## 官方资料研究优先级
- 产品的官方定价与产品说明；定价截图和时点需留存，记录货币和支付周期。
- 官方开发文档 / GitHub API；遵循 rate limit，记录许可证和 API 统计口径。
- Hugging Face Hub 只用于 Hub 数据/Space 身份，不用 Hub likes 等价全网用户活跃。
- 无供应商授权的第三方流量、SEO/GEO 或商店评论，不抓取受限数据、不得推断。
- 现有 6+ 个产品的逐项官方证据属于已有历史快照，并不意味着 2026-10-30 全部重新验证过。

## 验收状态
本文件提交表示**源码已写入**，不表示 `npm ci`、`next build`、正式网站测试、人工逐项核验已经完成。
