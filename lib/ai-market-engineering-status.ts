/** Manually curated engineering milestones. Not live deployment status. */
export const aiMarketEngineeringStatus = {
  snapshotDate: '2026-10-30',
  sourceBranch: 'feature/ai-si-detail-decisions-20261030',
  deployed: false,
  mainMerged: false,
  sourceUrl: 'https://github.com/3078024889/lingxi-quantum/pull/51',
  note: '2026-10-30 源码与后端核对快照；动态 GitHub 构建另有实时记录。独立 staging 不代表主站正式上线或工具真实功能全部验收。',
  milestones: [
    {name:'独立 AI 行情 V2.9 页面',state:'local_build',detail:'本地 V2.9 曾通过独立构建；当前 localhost:3001 仍运行该旧实例'},
    {name:'主站 TypeScript 与生产构建',state:'local_build',detail:'用户已提供 MAIN_BUILD_PASS；不代表新分支合并后的构建结果'},
    {name:'管理员审查页面',state:'committed',detail:'开发分支已提交权限校验及云端构建进度；主站 main 仍未部署此页面'},
    {name:'审查数据库与候选记录',state:'committed',detail:'正式 Supabase 已创建 ai_market_candidates 与 ai_market_review_records 两张受限私有表；已导入 24 条 candidate，所有候选仍未核验'},
    {name:'数据发布前校验',state:'committed',detail:'九语言、来源、口径、审核状态校验代码已提交；测试待实际运行'},
    {name:'Hugging Face 候选发现',state:'committed',detail:'GitHub 云端采集完成 100 个 HF 模型与 100 个 Spaces 候选；原始样本与 SHA-256 存档，不代表已核验商业产品'},
    {name:'候选去重与文件持久化',state:'committed',detail:'原子写入与已验证资料保护已提交，尚未运行生产负载测试'},
    {name:'全球真实 AI 产品目录',state:'not_ready',detail:'尚未完成正式数据库入库、来源核验和 10 万级真实产品收录'},
    {name:'真实 SEO/GEO 排名及历史指标',state:'not_ready',detail:'缺少可审计的数据供给，不能展示模拟波动曲线作为实时行情'},
    {name:'厂商认领、收费与支付核验',state:'not_ready',detail:'须独立验证支付回调、套餐与权益，不改动已有主站支付'},
    {name:'独立行情 Staging',state:'committed',detail:'已独立部署 Vercel staging；版本仍处于 noindex 和审核状态，尚未绑定正式两个域名'},
  ],
} as const;
