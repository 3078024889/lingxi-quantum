# V64 五轮全球工具扫描与缺口矩阵

日期：2026-10-04

## 扫描 1：全球综合工具站
重点模式：本地优先、单工具单任务、批量、目标大小、社媒预设、连续工作流。

## 扫描 2：PDF / Office
对标：PDF24、Adobe Acrobat、iLovePDF、Smallpdf。
高频动作：PDF↔Word/Excel/PPT/图片/文本/HTML/Markdown、OCR、页面管理、裁边、页码、水印、表单、签名、脱敏、比较、扁平化、元数据、PDF/A、修复、网页转 PDF。

## 扫描 3：OCR / 手写
对标：Google Vision handwriting、Azure Read handwriting、PaddleOCR PP-OCRv5、TrOCR。
原则：手写 OCR 与印刷体 OCR 分开声明；模型能力不够时绝不冒充。

## 扫描 4：视频 / 音频 / 字幕
对标：Kapwing、VEED、Rask、Descript。
高频动作：批量、链接导入、转写、翻译、字幕、配音、压缩、裁剪、改比例、提音频、静音、变速、旋转、平台尺寸、字幕校时。

## 扫描 5：国际格式 / 二维码 / 安全 / 开发者
对标：CloudConvert 类 200+ 格式目录、国际条码/QR 工具。
需求池：ODT/ODS/ODP/RTF/EPUB/MOBI/AZW3、TIFF/BMP/ICO/JXL/JFIF、ZIP/7Z/TAR/GZ、QR/WiFi/vCard/GS1/DataMatrix/PDF417、hash、JSON/XML/YAML、JWT、时间戳/时区。

## V64 本轮真实落地
- 时间戳工具专业升级
- 手写文字识别
- PDF 转 Word（文本层 + 扫描页 OCR）
- PDF 加水印
- PDF 加页码
- PDF 裁边
- PDF 扁平化
- PDF 文本比较
- PDF 转 TXT
- PDF 转 Markdown

## 明确仍未冒充上线
以下能力需要更合适的引擎/格式实现，不能只做一个按钮：
- 高保真 PDF→Excel / PowerPoint
- PDF 密码加密/解密（当前 pdf-lib 不提供完整加密能力）
- PDF/A 严格合规验证/转换
- 视觉级 PDF 差异比较
- 复杂表格/分栏 1:1 PDF→Word
- PP-OCRv5 浏览器多语言专业手写模型
- 7Z/RAR 解压
- CAD / RAW / 字体等重型格式

后续按这一缺口矩阵逐项闭环，而不是把未实现能力伪装为“上线”。


## R3 五轮长尾扫描追加

### Round A — PDF 长尾
已确认成熟目录长期存在的独立入口：
Pages per sheet、Halve pages、Bookmark PDF、Extract images、Rasterize PDF、Remove PDF metadata、Search PDFs、PDF/A check/convert、Viewer preferences、Verify signatures。

### Round B — 图片/设计长尾
高价值低竞争格式与动作：
JFIF、ICO、BMP、AVIF、TIFF、TGA、EXR/HDR、DDS、RAW 相机格式、FITS 天文图、DICOM 医疗图；同时还有 image splitter、face blur、old photo restoration、animated GIF。
R3 先真实上线 JFIF/BMP/AVIF/ICO/GIF 静态转换。

### Round C — 视频/音频长尾
成熟站常见：
reverse video、loop video、stop motion、remove filler words、noise/echo cleanup、audio waveform、video-to-GIF、GIF-to-video、platform aspect presets。
后续继续并入 Video Toolkit，不另造重复 FFmpeg 引擎。

### Round D — QR/开发者长尾
高意图入口：
WiFi QR、vCard QR、SMS QR、email QR、geo QR、event QR、Bitcoin/SEPA QR、GS1/DataMatrix/PDF417；JWT decode/verify、UUID/ULID、cron、regex、XML/YAML、certificate/CSR inspect。
R3 升级 QR 主工具并上线 UUID/ULID。

### Round E — 国际文档/电子书/个人数据格式
ODT/ODS/ODP、EPUB/MOBI/AZW3/FB2/DJVU/XPS/OXPS、ICS、VCF/vCard、DBF。
R3 先上线 EPUB→TXT、ODT→TXT、ICS→CSV、VCF→CSV；其余必须在有可靠解析/转换引擎后再上线。
