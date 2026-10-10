# Vercel 部署与额度检查：2026-10-10

目标项目：celestial9 / lingxi-quantum；免费 Hobby。未升级、未购买资源、未删除生产部署或数据。

## 实际检查结果

- 正式部署 `097d5d4f75e446edc1c479feec200b1054153416` 为 Ready，用时 2 分 54 秒。当前没有观察到账号封禁或正式站被暂停，不能声称本次解除了账号处罚。
- 最近列表有大量 `feat/r33-total-tools-signature-quality-20261009` 分支 Preview 构建失败。抽查 `4ad8904` 的构建日志：`lib/tools/document/image-preparation.ts` 重复声明 `pixels`，属于开发分支编译错误，不是免费额度不足的错误。
- 后台 Ignored Build Step 已存在“仅构建正式环境”的命令。官方明确：忽略步骤取消的构建仍计入部署次数。因此这项设置不能单独解决每日次数问题。
- 后台所选区间为 9 月 9 日 17:00 至 10 月 9 日 17:00，显示 Active CPU 3 小时 37 分钟 / 4 小时、内存 39.6 / 360 GB 小时、流量 11.08 GB、部署存储 16.87 GB。该历史区间不等同实时剩余额度，也不能据此认定当前已超额。

## 已采取的调整

- `vercel.json` 使用官方 `git.deploymentEnabled`：`**:false`、`main:true`。含斜杠的研发分支也被覆盖；正式分支保持可发布。
- 35 个已有非 main 远程分支以正常、原子、非强制快进方式同步同一策略。每个提交只改 `vercel.json`，保留原有代码和定时任务；遇到并发远程修改会拒绝推送。
- 调整后核查部署列表，未出现这 35 个配置提交对应的新 Preview 部署。私有提交回执位于 artifacts，不入 Git。
- Middleware 对没有会话 Cookie 的访问直接返回原响应，减少访客初始化鉴权客户端的工作。整段及分片会话 Cookie 仍调用验证；API 独立权限、旧页面下线、主域名跳转和私有页面 noindex 保留。
- `.vercelignore` 排除本地操作回执与宣传素材目录，避免 CLI 发布上传无关材料；本地文件保留。
- 回归脚本验证 main / 深层开发分支匹配、原有三项定时任务、无会话访问、正常及分片会话校验、私有页面和域名跳转。
- 本地 TypeScript 检查及完整 Next.js 构建已通过。

## 后续发布方式

研发先在本地或 CI 验证，完成一批再合并 main。不要对同一问题不断点击 Redeploy。仅改小程序包时不需要发布网页。忽略构建只能省构建工作，不能把它描述为返还每日部署次数。

Hobby 每 86400 秒最多 100 次部署，不能通过项目配置提升上限；实际超额按平台提示等待窗口恢复，删除历史部署不能重置次数。需要人工增加上限或确认误限时联系官方支持，不冒充已获豁免。

Hobby 官方用途为个人非商业项目。灵犀场提供收费服务，长期托管方案需符合商业使用要求；可另行评估允许商业用途且能人民币付款的托管。此轮没有升级或迁移，不能将额度优化视为商业使用许可。

官方参考：

- https://vercel.com/docs/project-configuration/git-configuration
- https://vercel.com/docs/project-configuration/project-settings#ignored-build-step
- https://vercel.com/docs/limits#deployments-per-day-hobby
- https://vercel.com/docs/plans/hobby
