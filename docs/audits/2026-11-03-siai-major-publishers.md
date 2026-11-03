# SIAI 大厂采集 & 占位审计（2026-11-03）

## 现网确认
- 已检查首页、/siai、/siai/claim、robots.txt、sitemap.xml，HTTP 200。
- /siai 服务端渲染 62 行；剔除 script/style 之后没有用户可见的 TODO、TBD、lorem ipsum、undefined、null 字面占位。
- 六项「尚无可靠资料」仍是来源证据缺口，不能被0元、全球可用或任意付款方式替代。
- 其他「未确认上市」需逐发布/归属主体核验；不能从母公司上市推断产品所在法人上市。

## 新研究批次
- Batch 004 共 15 个产品、14 个厂商归属组；仅采集第一方来源，未注册实际使用。
- Google 官方文档明确 Vertex AI Platform 已更名为 Gemini Enterprise Agent Platform，旧品牌仅用作搜索别名。
- Apple Intelligence 不是普通网页版 SaaS，且有设备与中国大陆等地区限制。
- 未找到官方依据的付款及商用许可字段均记录 missing，没有编造。
- 该批次不可直接进入正式排行榜，需每款核对独立支付、注册、真实输出、API调用、移动端和多语言资料后再决定上架。

## 成熟工程参考
- Playwright 官方分片： https://playwright.dev/docs/test-sharding
- Playwright CI 范例： https://playwright.dev/docs/ci
- 新源采用与已有 batch-001/003 同构的数据结构，独立测试强制可追溯、未审核不可发布，未复制其他平台的专有代码。

## 离线验证
`node --test tests/siai-major-publishers-004.test.mjs`
