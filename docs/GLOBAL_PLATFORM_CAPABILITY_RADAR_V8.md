# 灵犀场全球顶级平台能力雷达（V8）

本文件用于产品/架构研究，不代表复制第三方产品代码。

## 已提炼的方向
- Adobe Acrobat：统一 create/edit/organize/convert/merge/e-sign 文档工作流、跨设备连续性、协作通知。
- iLovePDF：直接 PDF 文本编辑、表单字段、附件、证书查看、低学习成本页范围操作。
- Smallpdf：低摩擦上传→处理→导出、工具链式衔接。
- Canva：PDF 视觉画布、拖拽页面管理、多格式导入/导出。
- CloudConvert：统一转换任务合同、格式专属参数、安全任务模型。
- Squoosh：浏览器本地处理、前后体积可视化、codec 参数化。
- remove.bg：单任务极快结果、后续裁剪/位置/背景组合。
- Photopea：浏览器深度编辑与图层心智模型。
- ABBYY/Tesseract/OCRmyPDF：布局感知 OCR、可搜索 PDF、校正/清理流水线。
- FFmpeg：probe + filter graph + deterministic media pipeline。
- whisper.cpp：本地/离线语音识别与量化运行。
- VEED/Descript：时间线 + transcript 为中心的媒体编辑。
- PrivateBin：失效时间、访问次数、分享链接为中心的隐私工作流。

## 原则
1. “通吃优势”=研究成熟 UX、任务分解、容错、性能与边界，不等于复制代码。
2. 开源代码必须先经过 `license-firewall.json`。
3. 专有平台默认仅作为 UX/架构参考；需要 API 时必须走正式合同。
4. 用户可见界面禁止出现 Capability ID、Pipeline、Runtime、Provider 等内部词。
5. 新工具优先组合已有能力，只有确实缺少时才新增底层 capability。
