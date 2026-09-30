# V1601 IMPLEMENTATION CONTRACT — GLOBAL DUAL-CURRENCY PRICING KERNEL

Baseline main: e793faf79339a4b7af793bb1c61ae6c6ef837a08
若当前 HEAD 已变化，先审 diff，保留新工作后集成，禁止覆盖。

## A. 唯一收费域
建立单一 server-only pricing policy / cost engine，至少包含：
currency=CNY|USD
executionMode=local|managed|byok
same-currency direct costs: supplier, compute, storage, bandwidth, payment, retryReserve, otherDirect
targetGrossMargin >= 0.45
tariff source/version/validUntil
quote expiry/idempotency

公式：
grossMargin=(price-directCost)/price
minimumPrice=directCost/(1-targetGrossMargin)
45% 毛利底线 => directCost/0.55

CNY 只使用 CNY 成本簿；USD 只使用 USD 成本簿。
严禁 USD=CNY/2、FX 换算或任何固定比例派生。

## B. 清除旧收费漂移
审计 lib/ai/provider-router.ts 等所有调用点。
AI_RETAIL_MULTIPLIER 默认 4、standard/high 导致的 4x/8x/20x 不得继续作为零售价权威。
若保留 tier，只能用于质量/路由，不得绕过 Cost Engine。
删除 components/SasiSkillsPanel.tsx 中“美元数字固定为人民币数字的一半”以及对应 10% Skill 折扣硬编码。
Skill 本身不产生外部成本时，不应凭空产生供应商费用。

## C. 工具收费分类
所有公开工具必须落入：
FREE_LOCAL
PAID_EXTERNAL
HYBRID
DISABLED_UNVERIFIED

FREE_LOCAL：无外部付费调用的 PDF/格式转换/压缩/哈希/QR/本地算法等默认免费。
PAID_EXTERNAL：确实产生收费 AI/第三方成本。
HYBRID：基础本地免费，增强外部调用单独报价。
DISABLED_UNVERIFIED：真实成本或交付能力尚未验证，不得收费。

不得因为工具名字包含 AI 就收费。

已知必须处理：
- video-dubbing：在真正能导出配音音轨/配音成片前不得收费。
- id-photo-ai：当前仅本地颜色阈值换背景时，不得按付费 AI 售卖；当前本地能力应免费且文案真实，付费增强待真实能力接通后再启用。
- cross-page-stamp 当前 disabled：除非另行验收，不擅自启用。

## D. 平台托管与 BYOK
BYOK Seedance 当前使用用户自己的供应商 credential，billing=supplier_direct。
必须保持事实一致：供应商生成费由用户供应商账户承担；不得再从灵犀场钱包扣同一供应商成本。
如未来收编排/项目服务费，必须作为独立产品价值，不伪装成供应商费。

Managed：
quote -> reserve/authorize -> idempotent claim -> provider call -> reconcile -> settle/release。
供应商调用前必须确保余额足够。
禁止负余额。
供应商超时不代表失败，uncertain 状态禁止自动重提导致双扣。

## E. Seedance
SASI_BYOK_SEEDANCE_PROFILES 继续 fail-closed。
estimatedFenPerSecond 只能作为经人工核验、有有效期的预估成本快照，不能永久作为实际结算事实。
能取得 provider usage 时，保存 usage + tariff version 后按同币种真实成本 reconciliation。
环境变量 JSON 必须压成单行、无首尾空格；不得自动部署未经核验的 model ID/价格。

## F. 用户界面
普通用户只看：选定币种、本次最终价格、会得到什么、失败后的退款/释放结果。
不显示 provider/API/token/markup/margin/internal cost。
BYOK 专业设置可明确说明“连接的供应商账户会承担生成费用”。
禁止裸露内部错误码。

## G. 必须新增的自动测试
1 CNY/USD 两本价格簿互不派生。
2 搜索不到固定比例/FX 收费逻辑。
3 CNY managed external >=45% 毛利。
4 USD managed external >=45% 毛利。
5 FREE_LOCAL 默认价格=0。
6 provider call 前必须 reserve/authorize。
7 调用前失败释放冻结。
8 BYOK 不扣 managed supplier cost。
9 禁止负余额。
10 tariff 过期 fail closed/requote。
11 quote tampering 被拒绝。
12 duplicate submit 不双扣。
13 UI 无“USD 是 CNY 一半”。
14 video-dubbing 未完整交付前不能收费。
15 当前本地证件照不得作为付费 AI。

## H. 生产数据库
tool_pricing 的 CNY/USD 列保持独立，禁止相互计算。
只为真实执行路径启用收费。
需要 migration 时：幂等、可审计、附 verification SQL。
本包不得自动 apply production DB；需要用户明确批准后再执行。

## I. 验收
必须真实运行，不得 echo 假 PASS：
git diff --check
typecheck
lint（如配置）
targeted pricing/billing tests
repo 已有相关 security/payment/tool/SASI acceptance
production build
git diff 人工复核
secret scan / 不新增密钥

全部成功后才允许提交：
fix: unify independent CNY USD pricing and margin guard

提交后再 push main；生产数据库和 Vercel 环境变量仍须单独明确批准。
