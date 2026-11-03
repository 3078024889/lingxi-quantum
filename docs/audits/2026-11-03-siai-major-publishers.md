# 全球大型 SI/AI 平台资料采集｜B004+B005｜2026-11-03

## 数据治理结论
- 20 个产品候选，归属 19 个不同厂商组（Google 有 2 款不同产品）。
- 严格区分厂商主体、模型、模型 API、开发工具与系统内置智能。
- 只记录官方来源可观察的事实；没有付款、授权、地区来源的字段保留 missing 并注明原因。
- 全部保持 **unapproved / candidate / visibleToPublic=false / publishApproved=false**。
- 不加入线上62条公开目录，不进入营收系统，也不算真实使用通过。

## 企业优先级
Google（AI Studio、Gemini Enterprise Agent Platform），Amazon（Bedrock），Microsoft（Foundry），IBM（watsonx.ai），NVIDIA（NIM），Oracle（OCI），Salesforce（Agentforce），SAP（Joule），Meta（Meta AI），阿里云（Model Studio）、百度（千帆）、腾讯云（混元）、火山引擎（方舟）、Apple（Apple Intelligence）、Hugging Face、Databricks、Snowflake、Cohere、Stability AI。

## 新旧品牌排重
Google 官方名录将原 Vertex AI Platform 改称 Gemini Enterprise Agent Platform；保留原名作搜索别名，不重复建产品。Apple Intelligence 是受设备与地区限制的系统功能，不能当作所有国家可用的网页 SaaS。

## 审计现网
- 首页、/siai、/siai/claim、robots.txt、sitemap.xml 均返回 HTTP 200。
- /siai 显示 62 行（32 已收录资料 + 30 资料预览），脚本外的可见 HTML 无 TODO/TBD/undefined/null 字面占位。
- “尚无可靠资料”仍有6项，不能用猜测代替；成立年份、是否上市属于不同法律实体/母集团级事实，需独立官方证据。
- 本次采集不代表用户实际登录、生成、账单、API消耗、导出或移动端测试。

## 门禁
使用项目已存在的 `auditCandidateCohort`、`auditOfficialObservations`、`auditGlobalIntake` 检查，无条件保持发布关闭。
运行：`node --test tests/siai-major-publishers-004.test.mjs`
参考：https://playwright.dev/docs/test-sharding、https://playwright.dev/docs/ci
