# LINGXIFIELD 全球 AI 行情：Codex GitHub 工作核查和后续整合（2026-10-30）

## 事实来源与工作隔离
审计 GitHub 仓库 3078024889/lingxi-quantum 的 main 与 feature/ai-market-review-gate-20261029。
本次仅静态读取：无本机编译、Supabase 表内容验证、端到端浏览器验收。
**禁止直接合并 main、生产部署、写生产数据库或更新在线付款。**

## Codex 最近 main 工作
- e4a593bfd2：账户订单日期界限及钱包流水分页。
- bdaea93c56：订单历史九语言翻译。
- beb31f8e4e：订单状态及支付渠道九语言修复。
- 6c3d70c24c：认证用户订单及充值历史筛选分页。
这些是主站订单/支付功能，不是全球 AI 商业数据的规模化采集。

## 并行的两个 AI 市场实现
A 主站内置：/ai-market，components/ai-market/{AiMarketSearch,MarketRankings,ProductDetails}，app/api/ai-market/*。
  - verified-search：从 ai_market_identity(verified)、ai_market_verified_capabilities、ai_market_evidence 读取，依赖 Supabase 管理客户端，未配置返回 503。
  - metrics：同一天同指标同范围查询 ai_market_metric_observations + 证据表，500 行上限可能 partial；未配置返回 503。
  - profile：只返回 verified identity + 人工审核 profile claims，允许空字段而不造价。
  - candidates：账号管理员权限，只读取候选库。
B 分离工作区：lingxifield-ai-market/，前台总榜+详情、models.dev/HF/GitHub 本地快照和模型分组，尚未与主站 Supabase 候选库统一。
**不得误认为这两份数据已经互相写入或正式上线。**

## 当前最关键问题
1. 两套 AI 市场 UI 和数据源并行，缺少统一的事实 schema、正式 ID 对齐、读写接口以及可回滚的增量导入审批机制。
2. 分离项目的 276 产品候选尚未确认主体；不能把它们直接标成 verified 丢入主站。
3. 主站 verified-search 返回的免费、价格、地区字段目前仍是 null，不等于已经采集 276 个真实商业定价。
4. 真实 SEO/GEO 指标查询已搭架构，但不能据此声称真实全网排名、访问量或引用率已可用。
5. 原始两张图是总榜/详情的 UI 契约；主站页面不能因为数据缺少就退回只有搜索框或密集工程筛选框。

## 后续合规的统一闭环
1. 只读采集源数据写到分离快照，规范化 product / company / model / offer / metric / evidence；保留 URL/时间/范围和 hash。
2. 实体严格去重、按官方主域 + 人工认证处理同名；分类区别 commercial product/open-source/HF demo/API。
3. 形成 **staging 候选** 和 diff（新发现、价格变化、功能变更、停用）；相同记录不重复写。
4. 管理端审核通过的声明才可入 **verified** 的读表，自动更新需沿用已确认的来源可信规则与重大变更再审。
5. 为页面提供分页稳定的已核实读接口；无法验证则显示“待核验”且保留最近核验时间。
6. 独立建立 GEO 固定问题集+地区+型号+日期的重复试验，SEO 使用授权站点数据及有来源的公开指数，禁止混排无可比指标。
7. 九语言和阿语 RTL；按2GB阿里云机器设计离线处理+分页+缓存，不请求时全量抓取。
8. 验收 node --test + tsc + Next build + 本地 URL/浏览器 + API 数据范围 + 失败恢复证据后，才评估把分离数据接到主站。

## 下一个可执行批次
优先 **staging 规范化桥接和报告** 而不是再增加只读 demo 页面：
- 输入：源快照目录 AI_MARKET_SNAPSHOT_DIR。
- 输出：结构化候选 JSONL + 每行 evidence；去重映射 JSON、每源新增/变更/未变统计和差异/错误报告。
- 不提交真实数据密钥和运营账号；不上线写 Supabase。
- 以主站既有 ai_market_candidates 及 ai_market_profile_claims 的字段作为审核目标，不允许绕过管理员审批。
