# SASI 生成与利润配置交接

## 本次读取本地环境的结果

2026-09-29：`SASI_BYOK_VIDEO_ENABLED` 未配置；`SASI_BYOK_SEEDANCE_PROFILE` / `SASI_BYOK_SEEDANCE_PROFILES` 未配置；`SASI_VIDEO_RATES_JSON` 为 `[]`；`SASI_BYOK_TEXT_PROFILE`、`SASI_NATIVE_COMPUTE_URL` 未配置。

这说明本地没有已配置的视频生产路线。线上 Vercel 环境须另查，不能由本地推断线上账户与价格。没有把缺失配置改成模拟成功，也没有把过期价格延长有效期。

运行 `node scripts/check-sasi-creation-readiness.cjs` 可重新检查。退出码 2 表示没有配置可用视频路线；报告不输出密钥和服务地址。配置通过仍不代表模型权限、真实生成或支付验收通过。

## 配置顺序

1. 在已登录账户的创作设置中验证用户自己的生成连接，确认有目标模型调用权限。
2. 核实视频模型支持的分辨率、时长、参考图、音频及当前官方价格。
3. 配置 `SASI_BYOK_SEEDANCE_PROFILES`（JSON 数组）：每项包含 `model`、`resolution`（480p/720p/1080p）、`generateAudio`、`maxDuration`（当前适配器 4–12）、`estimatedFenPerSecond`、`validUntil`、`priceSource`、可选 `imageMode`（none/first_frame/reference_image）。单项也可用 `SASI_BYOK_SEEDANCE_PROFILE`。
4. 配置 `SASI_BYOK_VIDEO_ENABLED=true`。只有有效价格和可用连接同时存在才开始预算确认。
5. 文本配置 `SASI_BYOK_TEXT_PROFILE`：按 `lib/sasi/byok-text-profile.ts` 的实际结构填写经核验的模型和输入/输出价格；不能用未经核验的默认值冒充可用服务。
6. 若平台托管，配置经核验的 `SASI_VIDEO_RATES_JSON` 与对应生成服务及现有支付开关。自建算力需服务地址、认证和健康检查；一台 2GB 普通服务器不能替代 GPU。
7. 用已确认预算做一次真实任务，验证生成、下载、重复提交保护、失败处理与账单后，再开放售卖。

上述配置存放在服务端环境变量与加密连接中，不提交密钥到仓库。

## 利润不是供应商价差

继续使用 `docs/SASI-PRICING-AND-FUNCTIONS-20260928.md` 的成本计算器。视频售价 ¥6.90 的示例，在模型 ¥3.20、运行 ¥0.20、失败预留 ¥0.64、手续费假设 0.6% 下，贡献毛利 ¥2.81（40.72%），不是净利润。采用用户自带 API 时，供应商费用不属于平台收入，平台必须另有明确服务费才能产生收入。

建议托管任务以 **40% 贡献毛利率** 为初始测算目标，而非保证：目标售价约为（模型成本 + 运行成本 + 失败预留）÷（1 − 支付费率 − 0.40）。还要扣固定开支、税费和获客成本。成本未经实测时不启用自动收费。

网页构建与书本问答同样按实际输入量、回答上限和运行成本计算，不按选择几个功能重复收费，不出售“无限智能”承诺。本次没有变更现有收费或商户设置。
