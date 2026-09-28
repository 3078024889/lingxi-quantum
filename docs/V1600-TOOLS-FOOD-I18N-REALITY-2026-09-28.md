# 灵犀场 LINGXIFIELD V16.00｜实用工具、食物识别、9 语言与真实验收总包

基线：`1b006277c21c599654cf098d33f8d216616fe1fd`

## 本轮真实审计结论

### 卡路里 / 营养

生产数据库在本轮审计时：

- `nutrition_foods = 0`
- `nutrition_portions = 0`
- `nutrition_nutrients = 0`

因此线上搜索实际上主要依赖约 30 条本地 fallback 食物，这就是“产品少得可怜”的直接原因。

仓库其实已经存在 USDA FoodData Central 导入器，但真实 USDA 数据还没有进入生产。

本包新增：

1. **火龙果本地兜底记录**：采用 TBCA `BRC0225C` 的 Pitaya/raw 数据；糖和钠没有可靠值时保持空值，不伪造为 0。
2. USDA Foundation Foods 2026-04 导入
3. USDA SR Legacy 导入
4. USDA FNDDS 2021–2023 导入
5. 可选 Branded Foods
6. 9 语言常见食物别名
7. 导入后真实计数与常见食物检索验证

数据导入脚本与代码发布脚本分离，不会偷偷改生产数据。

### 图片识别

现有 Food-101 是 101 类菜品分类器，不适合覆盖水果、原材料、混合盘和全球常见单品。

本包改成两层本地识别：

- 第一层：现有 Food-101，本地 WASM
- 第二层：可选本地 CLIP zero-shot，使用更广常见食物词表
- 两层只给候选，不直接生成营养结果
- 用户仍然确认食物和重量
- 不宣称单张照片能精确估计份量

CLIP 模型不会自动下载。单独提供安装器并固定 SHA256。

### 连续短剧 / 项目连续性 / 媒体资料

本轮同时补上：

- `?projectId=` 恢复已保存项目与原始需求
- 网站项目在重新进入后可继续读取该项目已就绪资料
- 音频 / 视频可在浏览器本机用现有 Whisper tiny 转成文字，再写回**当前用户自己的项目资料**
- 转录不会绕过文件扫描状态
- 多集短剧工作区：1–60 个镜头，批量报价、逐镜确认、进度刷新
- 已有本机镜头合成器改成全站设计 Token，并同步 9 语言
- 网站本地起稿可把用户上传的首张小型图片真正放进预览与 ZIP

### 9 语言

本轮补齐：

- SASI 短剧 / 网站 Composer 9 语言 UI
- 卡路里工具 9 语言 UI
- 项目语言代码 9 语言支持代码
- 项目语言 DB migration
- 当前数据库未迁移时，非中文项目先安全存为 `en`，同时把真实 `uiLanguage` 保存进项目输入，避免部署中断
- DB migration 明确应用后，可设置：
  `SASI_PROJECT_9LANG_DB_ENABLED=true`
  让项目 `language` 列直接保存全部 9 种语言

语言：
`zh/en/ja/ko/fr/de/es/pt/ar`

### 所有实用工具真实有效性

过去的 “59-tool source graph PASS” 只能说明代码图覆盖，不能证明 59 个工具全部真实可用。

本包新增 `tools-real-acceptance-v1600`：

- 发现全部工具 surface
- 检查 stage graph
- 执行真实 PDF fixture
- 执行真实文本/编码 fixture
- 探测 qpdf/pdfcpu/ffmpeg/whisper/PaddleOCR/OpenCV/MediaPipe/Argos 等本地运行时
- 区分：
  - `PASS_REAL_FIXTURE`
  - `SOURCE_AND_RUNTIME_READY_E2E_STILL_REQUIRED`
  - `BLOCKED_OR_FALLBACK_REQUIRES_RUNTIME_ACCEPTANCE`
  - `MANUAL_EXTERNAL_ACCEPTANCE_REQUIRED`
  - `BLOCKED_INCOMPLETE_BY_DESIGN`
  - `FAIL_GRAPH_MISSING`

只有实际 fixture 跑过的工具才写 `PASS_REAL_FIXTURE`。

不会再拿“源码存在”冒充“端到端已经通过”。

## 可选开源能力

### FoodData Central
USDA 官方公开数据库，用于营养记录和份量。

### Nutrition5k
作为视觉营养 benchmark / 研究数据，不直接当成营养查询数据库。

### CLIP
作为 Food-101 之外的 broad candidate signal。

这三者用途严格分开。

## 生产安全

主部署脚本：

- 不自动执行 DB migration
- 不自动导入 USDA 数据
- 不自动下载大模型
- 不自动开启新的付费路线

原因：代码发布、数据库结构、生产数据、大模型资产是四种不同风险面，不能绑成一个不可回退动作。

## 代码发布后还需要的显式动作

### A. USDA 数据
运行：
`scripts/nutrition/BOOTSTRAP_USDA_FDC_PRODUCTION.ps1`

这会写生产营养数据库，所以必须由操作者明确执行。

### B. SASI 9 语言 DB
审阅并单独应用：
`supabase/migrations/20260928195500_sasi_project_9lang.sql`

应用后再将：
`SASI_PROJECT_9LANG_DB_ENABLED=true`

加入 Production 并重新部署。

### C. Broad food vision
可选：
`scripts/food/INSTALL_CLIP_FOOD_VISION.ps1`

默认不影响 Food-101。模型未部署时自动使用 Food-101。

## 仍然不冒充完成的能力

- 视频最终付费生成仍需要真实 Provider / price / benchmark / settlement readiness。
- 2K / 4K 必须经过真实质量验收才收费。
- Video dubbing 最终音轨 / 成片仍 fail-closed。
- 浏览器本地模型工具必须做真实浏览器输入输出验收，源码和模型文件存在不等于 E2E PASS。
- 生产数据库中的实际 USDA 数据量以导入后的验证报告为准。


## 本轮外部资料核验

- USDA FoodData Central 官方下载页：Foundation Foods 最新批量 CSV 为 2026-04；FNDDS 当前批量版为 2021–2023；SR Legacy 为最终 2018 版。
- 日本食品标准成分表含 `ドラゴンフルーツ/生 (Pitaya/raw)` 条目。
- TBCA `BRC0225C` 提供 Pitaya/raw 每 100g 数据，本地火龙果兜底使用其中能明确支持的营养值；缺失糖/钠不填 0。
- Xenova CLIP Transformers.js ONNX `model_q4f16.onnx` 当前文件 SHA256 为 `0fa5651801a45889d15576d445b23172f706be5b5d17f6d96a61b486cf4a5252`；安装器固定校验该哈希。
