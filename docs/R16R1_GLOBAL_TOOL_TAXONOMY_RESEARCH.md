# R16R1 工具分类重构

当前生产页把 UUID、正则、XML、JWT、URL、大小写、进制、长图拼接一起放进“文本 / 文件”。
其中“长图拼接”明显误分类，文件转换与文本常用工具也被混成一个桶。

根因：仓库里同时存在 registry、advanced-catalog、public-surface、ToolsHub legacy map、dedicated list 多套分类解释。

## 全球产品提取
- PDF24：按用户任务分类，如编辑、整理、优化、安全、查看、转换；同时保留全局搜索。
- iLovePDF：排列、优化、转换、编辑、安全等任务导向分类。
- TinyWow：顶层保持 PDF / Image / Video / AI / Other 简单分类，同时搜索全部工具。
- CloudConvert：工具规模大时按 Documents / Images / Video / Audio / Spreadsheets 等用户熟悉类型分组。

## 灵犀场采用
一级分类：
全部 / PDF文档 / 图片 / 视频音频 / 字幕语音 / 表格数据 / 隐私安全 / 识别二维码 / 文本常用 / 文件转换 / 其他

原则：
1. 每个公开工具只有一个主分类。
2. 搜索仍跨全部 118 个工具。
3. 不再把“开发者工具”作为首页工程化一级标签。
4. 无法稳定归类的未来工具进入“其他”，不再错误塞进文本文件。
5. 分类只保留一个来源：display-taxonomy.ts。
6. GLOBAL_TOOL_CATALOG 的 118 个公开工具必须全部出现在 Tools Hub。
7. 删除 ToolsHub 的旧 DISPLAY_CATEGORY_BY_SLUG 和 dedicated 第二套来源。

典型纠正：
- 长图拼接 → 图片
- UUID / Regex / XML / JWT / URL / 进制 → 文本 / 常用
- DOCX / PPTX / EPUB / ODT → 文件 / 转换
- ICS / VCF / CSV JSON → 表格 / 数据
- 音视频转文字 / 字幕翻译 / 配音 → 字幕 / 语音
- PDF 密码 / 权限 / 脱敏 / 元数据 → 隐私 / 安全
- AI 证件照 → 图片
- OCR / 二维码 / 食物识别 → 识别 / 二维码
