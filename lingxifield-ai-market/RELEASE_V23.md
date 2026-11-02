# LINGXIFIELD V2.3 · 数据可信度与查询接口

本版保留 V2.2 首页、详情页及九语言/双币种 UI，新增企业档案合同、公开使用体验合同、搜索 API、厂商套餐 API、校验与单元测试。所有未有可靠数值的指标显示“待核验”，不画虚假排名曲线。

## API
- `/api/v1/platforms` 平台目录（非排行）
- `/api/v1/search?q=...&category=...` 名称/能力搜索，单次输入上限 120 字符
- `/api/v1/companies` 公司主体资料，null 代表未知，不等于零
- `/api/v1/experiences?platformId=...` 仅可发布已核实且带来源的使用体验
- `/api/v1/commercial-plans?currency=CNY|USD` 两种币种同名义数额，支付尚未启用
- `/api/v1/evidence` 仅发布已核实的行情证据

## 现状
- 当前 evidence 数量 0，实际流量、GEO 引用率、价格和下载趋势不可据此排名。
- 公司档案只收录官方主体入口和基础背景字段，其余为 null 或待核验。
- 完整九语言 URL、翻译校对、双域名 canonical、真实数据授权采集、支付通道及 2GB 生产压测未完成。
- 仍然 noindex，禁止自动上线前被索引。

## 本地验收
```
npm.cmd install
npm.cmd run validate:data
npm.cmd run test:contracts
npm.cmd run build
```

## 上线门槛
需要按来源许可接入数据，完成真实性、地区/语言/套餐一致性与支付流程核验。切勿直接把演示指标作为事实。
