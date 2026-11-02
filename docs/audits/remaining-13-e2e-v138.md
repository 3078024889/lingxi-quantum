# LINGXIFIELD V138｜121 项工具工程闭环证据账本

基于 2026-11-02 源码候选版本，尚未合并部署。每项以 **真实素材 → 浏览器用户操作 → 真实计算/模型输出 → 下载与独立解码 → 失败及收费安全 → 移动端复验** 为标准。静态内容、按钮出现、Mock JSON 和登记用例均不能算真实验收通过。

## 当前精确范围

- 全站独立工具：**121**。
- 仓库已经提交包含真实浏览器操作场景的工具：**108**；这些不是 108 个已通过 CI 的声明。
- 未提交充分完整用户操作测试：**13**。上一轮 17 的基础上，新增 `pdf-ocr`、`batch-pdf`、`image-watermark-remover` 和 `batch-image-watermark-remover` 四项。
- 已提交但仍需真实/生产验证的新操作：`pdf-ocr-real-v136.spec.ts`（真扫描 PDF → Tesseract WASM → TXT）、`image-inpaint-real-v136.spec.ts`（单/批图真实像素变化及隔离订单）、`batch-pdf-real-v137.spec.ts`（两个真实 PDF 合并+旋转+盖章+页码+清除元数据+表单扁平化+下载回读）。
- 已额外修复：PDF OCR 中止与改语言时旧 TXT/Excel 下载结果泄漏；AI 证件照修改背景/大小/位置后旧付费导出预览可残留；MODNet ONNX Runtime 改用现有站内 WASM 文件，不再强制依赖第三方 CDN，模型初始化失败时可重试。

## 13 项尚未完整验收

| slug | 真实通过条件 | 隔离测试或上线依赖 |
|---|---|---|
| `ai-image-check` | 有效签名/损坏签名/未签名 C2PA；完整信任链及真实来源声明 | 合法的独立认证样本及证书 |
| `ai-video-audio-check` | 多媒体真签名/伪造签名验证，抽帧/音轨与来源状态正确 | MP4、WAV 签名样本/验证器 |
| `audio-transcription` | 真实可听语音 WAV 识别文字+时间戳/SRT并独立比对 | Whisper 设备推理/多口音样本；模型许可 |
| `burn-after-read` | 真后端加密文件上传、首次读取、二次不可读、超时/过期实际清理 | 存储 R2/DB/权限及删除证明 |
| `document-translate` | 真实多页 Office/PDF 九语翻译，准确度、布局回写、失败重试 | 翻译模型/API、定价、授权 |
| `food-calorie` | 真食物照片模型识别；用户确认克数；营养来源；账单与保存 | 模型实测/营养数据库，沙盒及实际付款 |
| `handwriting-ocr` | 真手写图像的模型推断、输出纠错并生成可打开 DOCX/TXT | TrOCR/Tesseract 模型及真实文件 |
| `id-photo-ai` | 授权的人像照片、抠图质量、背景真实变化、尺寸合规、导出像素 | MODNet 模型与不同背景/发丝样本；签约价 |
| `url-to-video` | 真实可授权网页 → 安全抓取 → SASI 分镜 → 真实视频成片 | SSRF 防护、模型/媒体许可、成本 |
| `video-dubbing` | 音频识别 → 原始语种转译 → TTS 配音 → 真 MP4 音画对齐 | STT/TTS/FFmpeg，授权声线/语言 |
| `video-toolkit` | 压缩、截取、旋转、静音、变速、提取 MP3、转 MP4 每个模式的真输出和参数回读 | FFmpeg WASM 多格式及物理设备 |
| `video-transcription` | 视频中真实说话内容 → 时间戳/SRT/VTT 与视频对齐 | Whisper/媒体抽轨，GPU/CPU 场景 |
| `video-translate` | 真视频转录 → 翻译 → 成品内嵌字幕/外置 SRT → 下载重开 | STT/翻译/编码/额度账本 |

## 全球开源取长补短：实际核查过的许可证

| 参考项目及地址 | 许可 | 合法可提取的架构特点 |
|---|---|---|
| [Folio](https://github.com/doktorigi/folio) | MIT （`LICENSE`） | PDF.js 字层点击、视觉编辑、就地 OCR、搜索、真正重构式脱敏的分层思路；原编辑覆盖文字不等于删除底层原文 |
| [ClawPDF](https://github.com/shanto12/clawpdf) | MIT （`LICENSE`） | Next.js/PDF.js/pdf-lib/Tesseract 的端侧编辑工具组合、签名图层与 PDF 拆并流程 |
| [Whisper Web](https://github.com/whisper-web-online/whisper-web) | MIT （`LICENSE`） | 浏览器 Whisper 推断、WebGPU/WASM 回退、分段、文字编辑、TXT/SRT/VTT 输出 |
| [browser-whisper](https://github.com/tanpreetjolly/browser-whisper) | MIT（其 runtime、模型各自另有许可证） | WebGPU/WASM 推理优先级、字幕输出与本地音视频解码模块 |
| [Rescript](https://github.com/wassgha/rescript) | **PolyForm Noncommercial 1.0.0** | **不可直接复制进入灵犀场商业产品**；仅借鉴转写驱动视频编辑的公开产品交互思路 |

所有适配代码由本项目重新实现；本轮没有整套搬运第三方商业代码。源库 MIT 不自动覆盖其捆绑模型、编解码库、字体和媒体样本的许可。若引用受保护资源，按具体版本保存版权声明、源文件、许可及可重现构建信息。FFmpeg/HEVC 的编解码依赖另行作 GPL/LGPL 与专利许可审核。

## 发布与营收准入

1. 最新 HEAD 的完整构建、安全扫描、单元/Playwright 桌面及移动用例全部通过，保留真实运行日志及失败证据。
2. 对收费/登录服务逐个测试报价→明确授权→处理→真实文件交付→扣费/退款/重复幂等；mock 测试不代表商户实际收款。
3. 对用户内容存储验证权限拒绝、过期删除、禁止跨用户取回。隐私相关必须有可证明服务端数据生命周期。
4. 生产代码提交 SHA 必须与正式 Vercel deployment SHA 一致、正式域名可打开、真实浏览器可用，九语言和手机端实测通过。保留回滚策略。
5. 当前是 draft 叠加链 PR #104→#105→#106→#111；不独立合并 #111，不绕过生产门禁，不修改支付或数据库真实数据。


## V139–V140 实际新增工程与证据（2026-11-02）

### 生产门禁失败定位与修复
- **已核对生产 CI #41422268484 为 failure**，精确失败在 `node scripts/test-paid-processing-failure-v79.cjs`，模拟运行 `PdfOcrWorkbench.run` 时旧夹具没有 `jobRef`，报 `ReferenceError: jobRef is not defined`，不意味着生产已有可利用漏洞。已在 `scripts/test-paid-processing-failure-v79.cjs` 将任务编号 ref 纳入隔离夹具，新的 SHA 仍须实际跑过才可称修复通过。

### 音频/视频转写与字幕
- `lib/tools/autonomous/transcribe-local.ts`：不再用全局 `.replace(/,/g, ".")` 把 **WebVTT 正文**中每个普通逗号都破坏；现在单独格式化 cue 起止时间（SRT 逗号、VTT 句点），校验 NaN、负数和非有限时间值，开放式尾片段只给予最短正持续时间，不编造原始语音。
- `components/tools/TranscriptionWorkbench.tsx`：Whisper 确实返回文本、但没有有效时间段时仅提供 TXT；不生成空白 SRT 和只有文件头的 WebVTT，提供九语客户提示。每次新执行均清理旧文字/字幕结果。
- `scripts/test-transcript-captions-v139.cjs` 已接入生产 CI，验证毫秒时间戳、字幕内容中逗号（含伪时间串）保留、空片段和非法时间拒绝。
- 参考模型：`openai/whisper-tiny` Hugging Face 官方模型卡标示 **Apache-2.0**，源 https://huggingface.co/openai/whisper-tiny；现项目 `onnx-community/whisper-tiny` 是其 ONNX 转换，模型镜像元数据并未在此处单独注明许可证，商业交付时须确认实际 ONNX 权重、运行时和服务条款。未将 HF 资源可下载与实时可用混为一谈。

### 浏览器 FFmpeg 真实成片覆盖
- `components/tools/VideoToolkitWorkbench.tsx`：提取 MP3 出口在解码器返回空字节或非 MP3 文件时拒绝成功，避免空白下载。
- `video-toolkit-audio-speed-v140.spec.ts`：Playwright 创建 1.5 秒 440Hz、16kHz 的真 WAV，通过现有用户界面提取成 MP3；下载后浏览器 AudioContext 独立解码和对时长。另以仓库现有合成 4 秒 MP4 测试 2× 变速成片、重新读取尺寸/时长、参数改变时旧结果立即失效。
- 以上新增测试是候选代码，**尚未通过最新 SHA 的 GitHub CI，不能提前登记 video-toolkit 全七模式完整竣工**，因其他模式及物理移动端仍需补证。

### 当前数值不提前增长
- 已登记真实操作场景的工具仍为 **108 / 121**，余下 **13**。生产商业上线还需当前 HEAD 两套 CI 全绿、真实 SaaS 端点及付款沙盒/隐私后端和手机端联测。
- PR #111 仍是基于 #104/#105/#106 的叠加草稿，暂不合并或部署。
