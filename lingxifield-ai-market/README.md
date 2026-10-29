# LINGXIFIELD 全球 AI 行情原型

基于 Next.js 15 / React 19 / TypeScript。含全球 AI 排行首页、平台详情、搜索、分类、榜单切换、平台对比选择、公司融资及上市档案展示、SEO/GEO 演示指标、移动端布局。

## Windows PowerShell 本地运行

```powershell
cd D:\lingxifield-ai-market-demo
npm install
npm run dev
```
打开 http://localhost:3000

## 接入现有 D:\lingxi-quantum

本包是**隔离演示项目**，不会覆盖现有代码或自动部署。正式接入时，将交互组件迁移至现有 `/ai` 路由，先审查当前 Next.js、国际化和 UI 依赖，再对接数据库/API，完成回归验收后合并。不要直接把整个 `app` 文件夹覆盖现有项目。

## 数据边界

`lib/data.ts` 的平台目录为演示样本，评分、趋势、SEO/GEO 等不是实时测量；未核验字段显示“待核验”。正式版应在数据库中加入 `source_url`, `observed_at`, `period_start`, `period_end`, `region`, `methodology`, `confidence`，以及独立的 company/platform/model/plan/metrics 历史表。

## 待接入的真实模块

- Similarweb/AppMagic 等授权数据 API 和公开官方资料。
- SEO 关键词位置、GEO 引用率，依据确定的模型、问题集、地区和样本量计算。
- 厂商融资轮次、估值、上市公告、股票代码的逐项事实核验。
- X/YouTube/应用商店带来源的用户反馈摘要。
- 免费额度、退款、失败扣费等按套餐/地区/模型版本核验。
- 真实的对比矩阵、历史图表、登录收藏、九语言路由、SEO 结构化数据。
