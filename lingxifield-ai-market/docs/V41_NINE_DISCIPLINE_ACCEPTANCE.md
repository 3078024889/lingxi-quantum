# 全球 SI AI 行情平台 V4.1｜九领域研发与验收规则

> 2026-10-31。此文件是工程验收门槛，不是已完成全部验证的声明。AI 作为智能伙伴；“AI 工具”只用于搜索和产品分类，不用于主品牌。

## 产品承诺

**新手**：描述要做什么 → 得到适合当前国家/语言的 1–3 个候选 → 可直接看到完成任务、免费额度、官方单价、付款、商用、风险、官网入口 → 一步跳转。没有足够可信事实的维度直接写“未知”。

**厂商**：产品被检索的真实次数、向官网跳出的有效点击、与谁被比较、用户任务标签及地域、纠错审核进度（合规脱敏） → 免费基础资料维护及商业推广。未发布的服务不冒充已可购买。付费推荐与自然排序永不混淆。

## 九领域交叉审计

| 研究领域 | 真实研发输出 | 可验收、可否证 |
| --- | --- | --- |
| 数学与应用统计 | 成本公式及模型比较的归一化、置信区间 | 原始输入、单位和失效条件可复算；缺失数据不产生分数 |
| 复杂系统与控制 | 数据采集 → 复核 → 发表 → 修正 → 撤回完整状态机 | 来源过期、数据冲突时自动降级而不是继续排名 |
| 量子信息 | 不虚构量子优势，明确经典基线 | 只有可复现实验才能发布“量子加速”声明 |
| 天体物理/信号处理 | 时序热度异常检测、采样偏差标记 | 数据来源、采样窗口、异常噪声均可回溯 |
| 量化与风险科学 | 价格/能力/性能构成真正可比较的多目标决策 | 比较时间窗、样本量、各指标单位一致；无后见泄漏 |
| 安全系统工程 | 来源白名单、密钥隔离、最小权限、RBAC | 提交接口限制长度、来源与频率；未审数据不可发布 |
| 商业战略 | 任务搜索转化、有效官网跳转、厂商认领和赞助 | 计算 CTR/CVR 与单位经济，不使用虚构浏览量 |
| 实验科学 | 同等预算对照、样本外评测、独立复核 | 每一项推荐可复现、可提出相反证据 |
| 对抗安全与取证 | 假评论、假厂商、SEO 垃圾、恶意链接与定价污染 | 攻击者无法凭付费、批量刷评或自称厂商改变事实 |

## 数据主键与证据表（建议下一版数据库实现）

- products: product_id, vendor_id, product_kind（平台/模型/API/开源框架）, reviewed_at
- claims: product_id, field, locale, country, plan, model, value, unit, source_url, observed_at, verified_at, reviewer_id, status（unverified / verified / stale / contradicted）
- pricing: provider, model, modality, currency, price_unit（per_1m_input / per_1m_output / per_credit / per_second / per_minute / per_month）, tier, effective_at, source_url, restrictions
- rights: output_usage, commercial_status, attribution, plan_scope, source_url, checked_at, license_kind（软件代码许可和内容许可必须分开）
- reviews: claim_id, reviewer_validation_state, firsthand_evidence, review_date, related_vendor_interest, moderation_state；遵守第三方平台的内容版权与引用限制
- measurements: benchmark_id, test_set_version, model_revision, endpoint, country, observation_window, cost, latency, quality, n, uncertainty, independent_source
- vendors: identity proof, domain verification, role, claim quota, audit log；免费认领数量在服务端执行
- promotions: explicit sponsored label, impressions, valid_clicks, spend, active_period；**不能写入客观排名评分表**

所有公开记录都带来源和时间戳。不得从“安装包下载地区”推断产品官网支付资格，不得从“开源 SDK 许可”推断模型输出可商用。

## 排名发布门槛

1. “目录序号”不能写成“全球第一”。最低条件：独立来源 + 可重复的评价规则 + 样本量 + 更新时间。
2. SEO/GEO 仅有真实观察结果才允许显示数字；没有真实来源的显示“暂无可靠数据”。
3. 评价与测量不同：用户主观体验与客观基准分别展示，并标注是否自愿/有利益关系。
4. 厂商提交需要审核通过才公开，站内流量统计必须拒绝刷量和僵尸流量。
5. 数据恢复、降级、回滚都留存审计日志。

## 九语言与国家/地区

九语言：zh/en/ja/ko/fr/de/es/pt/ar。价格与政策原文不自动误译；阿拉伯语 RTL、移动端和长文本必须跑浏览器实测。

地区支持拆为注册、网页、API、付款、商用、下载和企业版，不因用户可能通过技术手段访问就伪称厂商“官方支持”。

本站商业服务的 CNY/USD 数字相同，只适用于**本站自有服务定价**；第三方模型 API 官方美元单价不能错误换算为相同人民币数字。

## 2026-10-31 V4.1 开发分支完成/未完成

已实现：新的全球 SI AI 行情平台名称、九语言页头、用户输入真实单价的短视频/百万 Token 计算器、商用条款来源、方法论页面、5 项回归测试。

未完成：所有产品原始来源核对和动态采集、供应商身份认证完整闭环、广告结算闭环、独立排名采样、用户体验反作弊、实际浏览器交互全覆盖、阿里云 2 GB 压测和正式 SEO 索引。不得直接标记为生产就绪。

## 清理规则

2026-10-31 用户本地 V2.9 原工作区已经删除 59 个历史脚本，这些未提交删除记录**未同步至远端 V4.1 分支**。任何进一步删除须先校验当前 V4.0+ 的 Git 索引、动态引用、CI 流程、迁移和恢复依赖。禁止用 V2.9 文件扫描结果直接批量清理 V4.0 源码，禁止 git reset --hard / git clean -fd。
