export type AdvancedToolCategory =
  | "pdf" | "sign" | "image" | "video" | "audio" | "text" | "privacy" | "daily" | "developer";

export type AdvancedToolCard = {
  href: string;
  title: string;
  description: string;
  keywords: string[];
  category: AdvancedToolCategory;
  badge?: string;
  popular?: boolean;
  localOnly?: boolean;
};

export const ADVANCED_TOOLS: AdvancedToolCard[] = [
  { href:"/tools/pdf-editor", title:"PDF 自由编辑", description:"改文字、加图片、签名、盖章、页面管理，先预览再导出。", keywords:["PDF","改字","修改文字","编辑合同","加图片","删页","旋转"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/e-sign-pdf", title:"PDF 签名 / 盖章 / 骑缝章", description:"上传签名或印章，多页盖章与骑缝章连续切片。", keywords:["签名","电子签章","公章","印章","骑缝章","合同盖章"], category:"sign", popular:true, localOnly:true },
  { href:"/tools/pdf-merge-split", title:"PDF 合并 / 拆分 / 页面处理", description:"合并、提取页、删除页、旋转页，全部浏览器本地完成。", keywords:["PDF合并","PDF拆分","提取页面","删除页面","旋转PDF"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/image-to-pdf-pro", title:"图片转 PDF", description:"多张 JPG/PNG 排序后生成一个 PDF。", keywords:["JPG转PDF","PNG转PDF","照片转PDF","图片转PDF"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/ocr", title:"图片 / 扫描件 OCR", description:"从图片中提取文字，中文、英文、日文等按需加载。", keywords:["OCR","图片转文字","截图转文字","扫描件文字"], category:"pdf", badge:"本地", localOnly:true },

  { href:"/tools/image-watermark-remover", title:"图片去文字 / 去物体", description:"框选需要移除的区域，AI 重建背景。", keywords:["图片","水印","去水印","去文字","去物体","移除路人"], category:"image", badge:"AI", popular:true },
  { href:"/tools/batch-image-watermark-remover", title:"批量图片去文字 / 去物体", description:"第一张框一次，同区域批量处理多张图片。", keywords:["批量","图片","水印","商品图","去文字"], category:"image", badge:"AI" },
  { href:"/tools/batch-image", title:"批量图片处理", description:"批量压缩、改尺寸、转 JPG/PNG/WebP，打包 ZIP 下载。", keywords:["批量压缩","批量改尺寸","批量转换","ZIP","图片批处理"], category:"image", popular:true, localOnly:true },
  { href:"/tools/heic-local", title:"HEIC 转 JPG", description:"iPhone HEIC 照片直接在浏览器转 JPG。", keywords:["HEIC","JPG","iPhone照片","苹果照片"], category:"image", localOnly:true },

  { href:"/tools/video-dubbing", title:"视频翻译配音", description:"语音识别、字幕翻译、AI 配音并合成为可下载 MP4；同时导出翻译字幕。", keywords:["视频翻译","英文视频中文","配音","多语言","字幕翻译"], category:"video", badge:"AI", popular:true },
  { href:"/tools/video-translate", title:"视频翻译", description:"批量上传视频或导入公开视频链接，自动转写并翻译，导出带翻译字幕的 MP4、SRT/VTT/TXT，可选 AI 配音。", keywords:["视频翻译","批量视频翻译","视频链接翻译","翻译字幕","AI配音"], category:"video", badge:"AI", popular:true },
  { href:"/tools/video-toolkit", title:"视频压缩 / 裁剪 / 提取音频", description:"常用视频处理用 FFmpeg 在浏览器本地完成。", keywords:["视频压缩","裁剪视频","提取音频","MP3","视频转音频"], category:"video", popular:true, localOnly:true },
  { href:"/tools/video-watermark-remover", title:"视频固定区域清理", description:"清理你有权编辑的视频中的固定遮挡或固定水印区域。", keywords:["视频去水印","固定水印","视频遮挡","logo"], category:"video", localOnly:true },

  { href:"/tools/food-calorie", title:"拍照估算卡路里", description:"识别一餐食物并估算热量和三大营养素区间。", keywords:["食物","卡路里","热量","蛋白质","减脂","饮食记录"], category:"daily", badge:"AI", popular:true },
  { href:"/tools/document-copy-layout", title:"证件复印排版", description:"正反面自动排到 A4，并添加“仅用于…”用途水印。", keywords:["身份证复印","护照复印","银行卡复印","A4排版","用途水印"], category:"daily", localOnly:true },

  { href:"/tools/privacy-cleaner", title:"文件隐私清理", description:"检查并清理图片/PDF中的 GPS、作者、标题等元数据。", keywords:["隐私","EXIF","GPS","元数据","文件隐私","清除定位"], category:"privacy", popular:true, localOnly:true },
  { href:"/tools/qr-safe-reader", title:"二维码安全读取", description:"先在本地读出二维码内容，再决定是否打开链接。", keywords:["二维码","扫码","QR","安全读取","二维码解析"], category:"privacy", localOnly:true },

  { href:"/tools/pdf-pages", title:"PDF 页面删除 / 排序 / 旋转", description:"调整页面顺序、删页和旋转，浏览器本地完成。", keywords:["PDF删除页面","PDF排序","旋转PDF","重排页面"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/pdf-to-jpg", title:"PDF 转 JPG / PNG", description:"按页真实渲染，批量打包下载图片。", keywords:["PDF转JPG","PDF转PNG","PDF转图片"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/batch-pdf", title:"批量 PDF 工作台", description:"一次批量处理多个 PDF：元数据、旋转、水印、页码、表单扁平化，可最终合并。", keywords:["批量PDF","PDF批处理","batch PDF","PDF工作流"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-halve-pages", title:"PDF 页面拆半", description:"双页扫描、A3 或长页面从中间拆成两个页面，保留原 PDF 页面内容。", keywords:["PDF页面拆半","A3拆A4","双页扫描拆分","halve PDF pages"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-search", title:"PDF 全文搜索", description:"批量搜索多个 PDF 文本层并导出命中页面 CSV。", keywords:["PDF搜索","批量搜索PDF","PDF查关键词","search PDFs"], category:"pdf", localOnly:true },
  { href:"/tools/reverse-video", title:"视频倒放", description:"本地倒放视频，可保留倒放音频或静音并调整速度。", keywords:["视频倒放","reverse video","倒放视频"], category:"video", localOnly:true },
  { href:"/tools/loop-video", title:"视频循环", description:"把视频重复 2–20 次导出为连续 MP4。", keywords:["视频循环","loop video","循环播放视频"], category:"video", localOnly:true },
  { href:"/tools/stop-motion-video", title:"视频定格 / Stop Motion", description:"按间隔抽帧生成定格视频，可追加倒放形成 Boomerang。", keywords:["定格视频","stop motion","视频抽帧","boomerang video"], category:"video", localOnly:true },
  { href:"/tools/audio-cleanup", title:"音频降噪 / 人声增强", description:"本地降低背景噪声、嗡声并标准化响度。", keywords:["音频降噪","人声增强","去背景噪声","audio cleanup"], category:"audio", localOnly:true },
  { href:"/tools/cron-parser", title:"Cron 表达式解析器", description:"验证标准 5 段 Cron 并计算未来运行时间。", keywords:["Cron解析","Cron下一次运行","cron expression","crontab"], category:"developer", localOnly:true },
  { href:"/tools/jfif-to-jpg", title:"JFIF 转 JPG", description:"把 JFIF 长尾图片格式本地转成 JPG。", keywords:["JFIF转JPG","JFIF转JPEG"], category:"image", localOnly:true },
  { href:"/tools/bmp-to-png", title:"BMP 转 PNG", description:"把 Windows BMP 位图转为 PNG。", keywords:["BMP转PNG","BMP图片转换"], category:"image", localOnly:true },
  { href:"/tools/avif-to-jpg", title:"AVIF 转 JPG", description:"把 AVIF 图片转成更通用的 JPG。", keywords:["AVIF转JPG","AVIF转JPEG"], category:"image", localOnly:true },
  { href:"/tools/ico-to-png", title:"ICO 转 PNG", description:"把 Windows 图标或 favicon 转为 PNG。", keywords:["ICO转PNG","favicon转PNG"], category:"image", localOnly:true },
  { href:"/tools/gif-to-jpg", title:"GIF 转 JPG", description:"提取 GIF 静态画面为 JPG。", keywords:["GIF转JPG","GIF转图片"], category:"image", localOnly:true },
  { href:"/tools/epub-to-txt", title:"EPUB 转 TXT", description:"按电子书阅读顺序提取 EPUB 正文。", keywords:["EPUB转TXT","电子书转文本"], category:"daily", localOnly:true },
  { href:"/tools/odt-to-txt", title:"ODT 转 TXT", description:"提取 OpenDocument 文档正文。", keywords:["ODT转TXT","LibreOffice转TXT"], category:"daily", localOnly:true },
  { href:"/tools/ics-to-csv", title:"ICS 转 CSV", description:"把日历 ICS 事件转换为 CSV。", keywords:["ICS转CSV","日历转Excel","iCalendar转CSV"], category:"daily", localOnly:true },
  { href:"/tools/vcf-to-csv", title:"VCF 转 CSV", description:"把 vCard 通讯录转换为 CSV。", keywords:["VCF转CSV","vCard转Excel","通讯录转CSV"], category:"daily", localOnly:true },
  { href:"/tools/uuid-generator", title:"UUID / ULID 生成器", description:"本地批量生成 UUID v4 或 ULID。", keywords:["UUID生成器","ULID生成器","批量UUID"], category:"text", localOnly:true },
  { href:"/tools/pdf-rasterize", title:"PDF 栅格化", description:"把 PDF 每页渲染为图像后重新生成 PDF。", keywords:["PDF栅格化","rasterize PDF","PDF转图片PDF"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-pages-per-sheet", title:"PDF 多页合一", description:"把 2/4/6/9 个 PDF 页面排到一张纸。", keywords:["PDF一页打印多页","PDF多页合一","pages per sheet"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-remove-metadata", title:"删除 PDF 元数据", description:"清除标题、作者、关键词等常见 PDF 文档属性。", keywords:["删除PDF元数据","PDF作者信息删除","remove PDF metadata"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-to-word", title:"PDF 转 Word", description:"文本型 PDF 直接提取可编辑文字，扫描页可 OCR；可同时生成可编辑版和版式保真 DOCX。", keywords:["PDF转Word","PDF转DOCX","扫描PDF转Word","OCR Word"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/pdf-watermark", title:"PDF 加水印", description:"批量给 PDF 页面添加文字水印。", keywords:["PDF水印","PDF加水印"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-page-numbers", title:"PDF 加页码", description:"给 PDF 所有页面添加连续页码。", keywords:["PDF页码","加页码"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-crop", title:"PDF 裁边", description:"统一裁剪 PDF 页面边距。", keywords:["PDF裁边","裁剪PDF","PDF边距"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-flatten", title:"PDF 扁平化", description:"将表单字段写入页面，生成更适合提交与归档的 PDF。", keywords:["PDF扁平化","flatten PDF","PDF表单"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-compare", title:"PDF 比较", description:"比较两个 PDF 文本层并按页面导出差异。", keywords:["PDF比较","PDF差异"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-to-text", title:"PDF 转 TXT", description:"提取 PDF 文本层为纯文本。", keywords:["PDF转TXT","PDF转文本"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-to-markdown", title:"PDF 转 Markdown", description:"按页面提取 PDF 文本并生成 Markdown。", keywords:["PDF转Markdown","PDF转MD"], category:"pdf", localOnly:true },
  { href:"/tools/handwriting-ocr", title:"手写文字识别", description:"英文手写使用 TrOCR 本地模型；多语言文字和工整手写可用本地 OCR，并导出 TXT / Word。", keywords:["手写文字识别","手写OCR","笔记转文字","图片转文字"], category:"image", badge:"AI", popular:true, localOnly:true },
  { href:"/tools/pdf-compress", title:"PDF 压缩", description:"扫描件/图片型 PDF 栅格压缩，显示真实前后大小。", keywords:["压缩PDF","PDF太大","PDF减小"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/pdf-ocr", title:"PDF OCR", description:"扫描 PDF 本地识别文字并导出 TXT。", keywords:["PDF OCR","扫描PDF转文字","PDF文字识别"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-redact", title:"PDF 真脱敏", description:"把敏感区域永久写入导出结果，不能复制恢复。", keywords:["PDF脱敏","删除敏感信息","PDF打码","身份证号"], category:"privacy", popular:true, localOnly:true },
  { href:"/tools/png-to-jpg", title:"PNG 转 JPG", description:"浏览器本地转换，适合上传兼容和减小体积。", keywords:["PNG转JPG","PNG转JPEG"], category:"image", localOnly:true },
  { href:"/tools/jpg-to-png", title:"JPG 转 PNG", description:"JPG/JPEG 直接转 PNG。", keywords:["JPG转PNG","JPEG转PNG"], category:"image", localOnly:true },
  { href:"/tools/webp-to-jpg", title:"WebP 转 JPG", description:"把 WebP 转成兼容性更高的 JPG。", keywords:["WebP转JPG","WebP转JPEG"], category:"image", localOnly:true },
  { href:"/tools/svg-to-png", title:"SVG 转 PNG", description:"SVG 本地渲染为高清 PNG。", keywords:["SVG转PNG","矢量图转PNG"], category:"image", localOnly:true },
  { href:"/tools/long-image", title:"截图长图拼接", description:"多张截图按顺序拼成一张长图。", keywords:["长图拼接","截图拼接","图片拼接"], category:"daily", popular:true, localOnly:true },
  { href:"/tools/screenshot-redact", title:"截图隐私打码", description:"框选敏感内容，模糊或黑块后本地导出。", keywords:["截图打码","隐私打码","身份证打码","聊天截图"], category:"privacy", popular:true, localOnly:true },
  { href:"/tools/subtitle-tools", title:"字幕 SRT / VTT 工具", description:"字幕整体偏移、SRT/VTT/TXT 转换。", keywords:["SRT","VTT","字幕转换","字幕延迟"], category:"video", localOnly:true },

  { href:"/tools/audio-transcription", title:"音频转文字", description:"按分钟转写，导出 TXT / SRT / VTT。", keywords:["音频转文字","录音转文字","语音转文字","SRT"], category:"audio", badge:"AI", popular:true },
  { href:"/tools/video-transcription", title:"视频转文字 / 自动字幕", description:"视频转写并生成字幕文件。", keywords:["视频转文字","自动字幕","视频字幕","SRT"], category:"video", badge:"AI", popular:true },
  { href:"/tools/subtitle-translate", title:"字幕翻译", description:"保留时间轴，只翻译 SRT / VTT 字幕文字。", keywords:["字幕翻译","SRT翻译","VTT翻译","双语字幕"], category:"video", badge:"AI" },
  { href:"/tools/id-photo-ai", title:"AI 证件照换背景", description:"选择常用尺寸和底色，调整人物大小与位置，先免费预览再保存高清照片。", keywords:["证件照","换背景","蓝底照片","白底照片","红底照片"], category:"image", badge:"AI", popular:true },
  { href:"/tools/regex-tester", title:"正则表达式测试", description:"测试正则表达式并查看匹配位置与捕获组。", keywords:["Regex Tester","regex tester"], category:"developer", localOnly:true },
  { href:"/tools/text-diff", title:"文本对比", description:"逐行比较两段文字，快速找到变化。", keywords:["Text Diff","text diff"], category:"developer", localOnly:true },
  { href:"/tools/csv-json", title:"CSV 转 JSON", description:"把 CSV 表格本地转换成结构化 JSON。", keywords:["CSV to JSON","csv json"], category:"developer", localOnly:true },
  { href:"/tools/xml-formatter", title:"XML 格式化", description:"检查并整理 XML，让层级更容易阅读。", keywords:["XML Formatter","xml formatter"], category:"developer", localOnly:true },
  { href:"/tools/jwt-decoder", title:"JWT 解码", description:"本地查看 JWT 的 Header 与 Payload，不验证签名。", keywords:["JWT Decoder","jwt decoder"], category:"developer", localOnly:true },
  { href:"/tools/url-parser", title:"URL 解析", description:"拆分网址中的域名、路径、参数和锚点。", keywords:["URL Parser","url parser"], category:"developer", localOnly:true },
  { href:"/tools/case-converter", title:"大小写转换", description:"在 camelCase、snake_case、kebab-case 等格式间转换。", keywords:["Case Converter","case converter"], category:"developer", localOnly:true },
  { href:"/tools/number-base-converter", title:"进制转换", description:"在 2 到 36 进制之间转换整数。", keywords:["Number Base Converter","number base converter"], category:"developer", localOnly:true },

  { href:"/tools/pdf-overlay", title:"PDF 叠加", description:"把抬头纸、背景或统一模板叠加到 PDF 页面。", keywords:["PDF叠加","PDF overlay","PDF背景","PDF抬头纸"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-header-footer", title:"PDF 页眉页脚", description:"给整份 PDF 添加统一页眉、页脚和页码。", keywords:["PDF页眉","PDF页脚","PDF header footer"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-bates-numbering", title:"PDF Bates 编号", description:"给合同、证据材料和归档 PDF 添加连续编号。", keywords:["Bates编号","PDF连续编号","证据编号"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-viewer-preferences", title:"PDF 打开方式", description:"设置 PDF 打开时的页面布局、侧栏和窗口显示。", keywords:["PDF打开方式","PDF viewer preferences","PDF页面布局"], category:"pdf", localOnly:true },

  { href:"/tools/pdf-remove-annotations", title:"删除 PDF 批注", description:"移除高亮、便签、图章和页面批注。", keywords:["删除PDF批注","PDF annotations","移除高亮"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-grayscale", title:"PDF 转灰度", description:"把彩色 PDF 转成黑白灰，适合打印和归档。", keywords:["PDF灰度","PDF黑白","grayscale PDF"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-page-size", title:"调整 PDF 页面尺寸", description:"把页面统一到 A4、A3、Letter 或 Legal，并自动居中。", keywords:["PDF页面尺寸","PDF A4","resize PDF"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-metadata-editor", title:"编辑 PDF 文件信息", description:"修改 PDF 标题、作者、主题和关键词。", keywords:["PDF标题","PDF作者","PDF metadata editor"], category:"pdf", localOnly:true },

  { href:"/tools/pdf-protect", title:"PDF 加密码", description:"在浏览器本地添加 AES-256 密码保护，并设置打印、修改和复制权限。", keywords:["PDF加密码","PDF密码保护","protect PDF"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-unlock", title:"解除 PDF 密码", description:"输入已知密码，在浏览器本地生成无需密码的 PDF 副本。", keywords:["PDF解除密码","PDF解锁","unlock PDF"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-permissions", title:"PDF 权限设置", description:"控制 PDF 的打印、修改和复制权限。", keywords:["PDF权限","禁止打印PDF","PDF permissions"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-web-optimize", title:"PDF 网页快速打开", description:"优化 PDF 结构，让网页预览更快显示第一页。", keywords:["PDF网页优化","Fast Web View","linearize PDF"], category:"pdf", localOnly:true },

  { href:"/tools/pdf-inspect", title:"PDF 结构检查", description:"查看 PDF 页数、附件、书签和结构信息，文件不上传。", keywords:["PDF检查","PDF结构","inspect PDF"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-attachments", title:"PDF 附件管理", description:"查看、添加或移除 PDF 内嵌附件。", keywords:["PDF附件","PDF embedded files","PDF attachment"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-bookmarks", title:"PDF 书签查看", description:"查看 PDF 书签层级和跳转页。", keywords:["PDF书签","PDF目录","PDF bookmarks"], category:"pdf", localOnly:true },
];

export const ADVANCED_CATEGORY_LABELS: Record<AdvancedToolCategory,string> = {
  pdf:"PDF / 文档", sign:"签名与盖章", image:"图片", video:"视频", audio:"音频",
  text:"文字", privacy:"隐私与安全", daily:"日常工具", developer:"开发者工具"
};
