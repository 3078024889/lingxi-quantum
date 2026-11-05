# 全站实用工具计次与通用包迁移审计 · 2026-11-05

## 用户已确定的规则
- 免费：每个账户、每个可信 IP、每个工具每天一次；任一额度用尽即不能再次免费使用，北京时间自然日重置。
- 计次：图片、视频、文件上传并启动使用即计次，无须导出；每个文件各计一次。文本和二维码按执行计次；任务请求幂等。
- 通用包：7 天 ¥29/$29、30 天 ¥99/$99、90 天 ¥269/$269、365 天 ¥899/$899；现有余额购买、有效期顺延、SASI 原计费不变。
- 覆盖全部现有及新增实用工具；正常人工使用不限次数，只禁止自动化滥用。
- 九国语言、两个域名共用账户及服务器数据库计次，不靠本地存储控制配额。

## 当前已写入分支（不是生产验收结果）
- SQL：账户/IP/工具每日限额、数据库原子锁、购买工具包、旧钱包同币种扣款与订单 —— 待真实数据库测试。
- API：/api/tools/access、/api/tools/pass —— 待真实运行。
- UI：/tools/pass 九语言购买页面 —— 待 9 语言/手机浏览器验收。
- Workbench：通用 FileToolWorkbench 上传、TextWorkbench 执行、QR 执行已接入 —— 待端到端测试。
- 约 94 项独立工具专用路由和众多专用 Workbench 未全部接入。不能把当前分支标记为完成。
- 原单工具收费报价、购买、导出计费代码仍存在；在迁移前直接删除会伤害存量订单和退款恢复。

## 已证实存在的旧收费路径
- lib/tools/capability-billing-policy.ts
- lib/tools/paid-catalog.ts
- app/api/tools/pricing/route.ts
- app/api/tools/quote/route.ts
- app/api/tools/pay/create/route.ts
- app/api/tools/free-export/route.ts
- lib/tools/commerce/export-access-client.ts
- components/tools/ExportAccessProvider.tsx
- app/api/tools/local-paid/job/route.ts
- food-calorie、temp-mail、watermark、burn-after-read 还有独立收费逻辑。

## 全面上线门禁
1. 全工具清单：每项有明确的首次使用触发点、上传/无上传计次时刻、独立执行拦截和结果验收记录。
2. 所有独立 Workbench + Worker + 服务端接口都接入权限校验；禁止前端绕过产生付费能力。
3. 通用包用户不再弹出任何旧单工具支付/导出收费；过期自动回到每天一次。
4. 测试单文件、多文件、重复点击、幂等重试、并发抢占、跨 IP 与跨域、跨日、数据库失效、匿名登录。
5. 测试两种币种、重复购买、余额不足、有效期累加、历史订单和退款对账。
6. 九语言完整文案、手机/桌面、两个域名登录与业务验证。
7. 不删除历史账本；旧收费执行路径最后切换并回归后才移除。
8. CI/Build/E2E/安全审计/真实交付测试全部通过后才启用与部署。

## 发布安全开关
- NEXT_PUBLIC_TOOL_PASS_ENFORCED 默认为关闭；当前候选实现不得直接启用、合并或触发 Vercel 预览与生产部署。
- 目前没有完成生产发布、数据库迁移部署或真实支付验收，不得对用户宣称已上线。
