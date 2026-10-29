/** Manually curated engineering milestones. Not live deployment status. */
export const aiMarketEngineeringStatus = {
  snapshotDate: '2026-10-29',
  sourceBranch: 'feature/ai-market-review-gate-20261029',
  deployed: false,
  mainMerged: false,
  sourceUrl: 'https://github.com/3078024889/lingxi-quantum/tree/feature/ai-market-review-gate-20261029',
  note: '本表是已提交源码的人工核对快照，不代表 GitHub Actions、Vercel 或实际用户环境验收通过。',
  milestones: [
    {name:'独立 AI 行情 V2.9 页面',state:'local_build',detail:'本地 V2.9 曾通过独立构建；当前 localhost:3001 仍运行该旧实例'},
    {name:'主站 TypeScript 与生产构建',state:'local_build',detail:'用户已提供 MAIN_BUILD_PASS；不代表新分支合并后的构建结果'},
    {name:'管理员审查页面',state:'committed',detail:'提交了权限校验、审查清单与意见表单，尚未部署'},
    {name:'审查数据库与历史反馈',state:'migration_pending',detail:'迁移及 API 已编写；没有执行数据库迁移'},
    {name:'数据发布前校验',state:'committed',detail:'九语言、来源、口径、审核状态校验代码已提交；测试待实际运行'},
    {name:'Hugging Face 候选发现',state:'committed',detail:'模型与 Spaces 候选连接器已提交，尚未开始真实批量采集'},
    {name:'候选去重与文件持久化',state:'committed',detail:'原子写入与已验证资料保护已提交，尚未运行生产负载测试'},
    {name:'全球真实 AI 产品目录',state:'not_ready',detail:'尚未完成正式数据库入库、来源核验和 10 万级真实产品收录'},
    {name:'真实 SEO/GEO 排名及历史指标',state:'not_ready',detail:'缺少可审计的数据供给，不能展示模拟波动曲线作为实时行情'},
    {name:'厂商认领、收费与支付核验',state:'not_ready',detail:'须独立验证支付回调、套餐与权益，不改动已有主站支付'},
    {name:'当前分支云端预览',state:'not_deployed',detail:'未发现当前分支 Vercel 预览部署；本地浏览器刷新不会更新此分支'},
  ],
} as const;
