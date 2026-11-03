# LINGXIFIELD V135 — 121 个独立工具逐项验收与成熟开源实现审计

日期：2026-11-02。当前候选代码：依赖 [#104](https://github.com/3078024889/lingxi-quantum/pull/104) → [#105](https://github.com/3078024889/lingxi-quantum/pull/105) → [#106](https://github.com/3078024889/lingxi-quantum/pull/106)，本轮在草稿 [#111](https://github.com/3078024889/lingxi-quantum/pull/111)。

**可核对账本：121 项公开独立工具，104 项登记了真实操作测试，0 项只有历史部分场景，17 项尚无充分完整操作测试。** 登记 ≠ 最新 SHA CI 全部通过 ≠ 已部署 ≠ 生产商用验收成功。最新 CI 实际结果才可改变通过状态。

## 本轮真实源码产出

| 项目 | 已提交源码 | 端到端验证范围 | 仍不能宣称 |
|---|---|---|---|
| 视频循环 `loop-video` | `VideoEffectsWorkbench.tsx` 正确取消、参数失效、处理锁定 | 四秒合成 MP4 → 2 次循环 → MP4 下载 → 浏览器实际解码时长 | 全部源格式/物理手机 |
| 视频倒放 `reverse-video` | 同一组件 | 实际音视频输入 → 静音倒放 → 下载/重开；改变速度清除旧结果 | 有声倒放所有变速轨道 |
| 视频定格 `stop-motion-video` | 同一组件 | 实际视频 → 定格与往返 → MP4 下载/重开；改变帧率清除旧结果 | 所有手机/格式 |
| HEIC 转 JPG `heic-to-jpg` | 共用 `heicToJpgFiles`，限制真实 HEVC/HEIF 标识，验证 JPG 头尾与浏览器解码，保留转换器实际返回的多图 | MIT 上游真实 HEIC 离线 fixture → 浏览器转换 → JPEG 下载 → Sharp 解码；伪装/损坏文件拒绝 | HEIC HDR、P3、高位深、色彩与 EXIF 完整保留 |
| PDF 电子签名 `e-sign-pdf` | 复用现有 `PdfEditorWorkbench` 的自由手写、拖放、八方向缩放、图片签章 | 画板真实指针手写 → 插入 PDF → 拖动/缩放 → 额外上传印章 → 模拟授权导出 → PDF.js 独立验证图片对象 | CA/PKI 数字签名、真实付费商户、法律签约身份核验 |

本轮真实 MP4 使用仓库自建合成四秒视频；真实 HEIC 使用 `alexcorvi/heic2any` 上游 `demo/1.heic`，仓库内完整保留 MIT 许可归属。**不使用用户隐私照片。** 新增加的操作测试在最新 PR SHA 的 CI 未完成前不能记为通过。

## 全球可借鉴且许可已核实的源码/能力

| 开源项目 | 许可和适配判断 | 当前落地原则 |
|---|---|---|
| [Mozilla PDF.js](https://github.com/mozilla/pdf.js) | Apache-2.0，擅长 PDF 字形解析/高 DPI 预览 | 现有 PDF.js 解析与预览作为基座；编辑先做可靠的真实对象 |
| [pdf-lib](https://github.com/Hopding/pdf-lib) | MIT，可嵌入文本、图片、页码和 PDF 页 | 现有导出重开验证，无需重复引入重型 PDF 引擎 |
| [React Konva](https://github.com/konvajs/react-konva) | MIT，拖放、画布变换、对象层；需匹配当前 React 版本 | 参考其场景图/选择框 UX；不贸然引入版本不匹配的新核心包 |
| [heic2any](https://github.com/alexcorvi/heic2any) | JS 封装 MIT；捆绑的 libheif/libde265 仍各有 LGPL 等许可义务 | 复用现有依赖，实际检查输入/输出字节与真实 HEIC |
| [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) | JS 包 MIT；WASM Core 与所编译 FFmpeg/编码器适用不同 GPL/LGPL 等条款 | 复用已安装本地 WASM，必须保存适用源码/许可证，出片真实重解码 |
| [StoryBored](https://github.com/storybored-app/storybored) | MIT，剧本→镜头→多 take→审批→实际短视频合成 | 将 SASI 规划/素材生成/最终成片分别验收，不直接搬运整个 GPU/ComfyUI 服务 |

商用许可应按具体版本及实际发给用户的 JS/WASM 文件审计。若核心含 LGPL/GPL，还需履行通知、可替换/重链接或对应源码等适用义务；HEVC 专利问题与开源软件版权许可分开核实。不要从未许可的商业平台直接复制代码。

## 剩余 17 个真实未闭环（继续逐项工程与验收）

| 工具 | 不可替代的验收条件 | 主要依赖 |
|---|---|---|
| `ai-image-check` | 真实有效和无效 C2PA 签名、信任链/来源状态区分 | 签名验证器与合法样本 |
| `ai-video-audio-check` | MP4/WAV 原生抽取、有效/损坏 C2PA 文件 | 可信媒体证明 |
| `audio-transcription` | 真语音到可校验文字/字幕，失败不扣款 | STT 连接/计费 |
| `batch-image-watermark-remover` | 多图真实遮罩修补，授权后完整下载与恢复 | 图片修复与支付 |
| `batch-pdf` | 多页批量页面变换，实付/免费结果与下载验证 | PDF 引擎/支付 |
| `burn-after-read` | 真实加密上传、一次访问、二次拒绝、TTL 及删除 | R2/DB/鉴权 |
| `document-translate` | 多语言文件真正翻译并保持导出文档布局 | 翻译模型/费用 |
| `food-calorie` | 真实食品照片识别、人工克数确认、营养来源、保存 | 本地模型/营养库 |
| `handwriting-ocr` | 实际书写图→可验证文字/OCR 纠错 | OCR 服务与支付 |
| `id-photo-ai` | 人像抠图、背景替换、边缘与证件规格校验 | 抠图模型 |
| `image-watermark-remover` | 自有图片画笔/框选输出可复核像素，隔离付费验证 | 原生修补/权限 |
| `pdf-ocr` | 扫描 PDF 多页 → 真可选文字/PDF/TXT，读回一致 | OCR/PDF 引擎 |
| `url-to-video` | URL 安全采集、真实分镜、真实可播放 MP4 | SASI 模型/网页安全 |
| `video-dubbing` | 真语音提取+字幕+配音+音视频导出 | STT/TTS/媒体 |
| `video-toolkit` | 压缩、剪辑、静音、音频提取、变速、旋转所有模式 | FFmpeg WASM |
| `video-transcription` | 真实语音视频逐字与时序文字/SRT | STT |
| `video-translate` | 真视频转写、翻译、字幕合成、成片下载 | STT/翻译/媒体 |

### 生产准入

每一项都要求独立合成样本、浏览器上传或操作、真实生成字节、解析与重开、控制变化后旧结果清除、无权限/错误失败，以及桌面与移动端。含收费、登录和隐私服务须额外核对真实数据库/商户授权后才能商用上线。所有 PR 为 **draft**；不能绕过 CI/许可证/资金/生产 SHA 门禁直接合并和部署。
