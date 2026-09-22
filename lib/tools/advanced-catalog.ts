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

  { href:"/tools/video-dubbing", title:"视频翻译配音", description:"上传视频/音频或合法公开链接，生成目标语言版本。", keywords:["视频翻译","英文视频中文","配音","多语言","字幕翻译"], category:"video", badge:"AI", popular:true },
  { href:"/tools/video-toolkit", title:"视频压缩 / 裁剪 / 提取音频", description:"常用视频处理用 FFmpeg 在浏览器本地完成。", keywords:["视频压缩","裁剪视频","提取音频","MP3","视频转音频"], category:"video", popular:true, localOnly:true },
  { href:"/tools/video-watermark-remover", title:"视频固定区域清理", description:"清理你有权编辑的视频中的固定遮挡或固定水印区域。", keywords:["视频去水印","固定水印","视频遮挡","logo"], category:"video", localOnly:true },

  { href:"/tools/food-calorie", title:"拍照估算卡路里", description:"识别一餐食物并估算热量和三大营养素区间。", keywords:["食物","卡路里","热量","蛋白质","减脂","饮食记录"], category:"daily", badge:"AI", popular:true },
  { href:"/tools/document-copy-layout", title:"证件复印排版", description:"正反面自动排到 A4，并添加“仅用于…”用途水印。", keywords:["身份证复印","护照复印","银行卡复印","A4排版","用途水印"], category:"daily", localOnly:true },

  { href:"/tools/privacy-cleaner", title:"文件隐私清理", description:"检查并清理图片/PDF中的 GPS、作者、标题等元数据。", keywords:["隐私","EXIF","GPS","元数据","文件隐私","清除定位"], category:"privacy", popular:true, localOnly:true },
  { href:"/tools/qr-safe-reader", title:"二维码安全读取", description:"先在本地读出二维码内容，再决定是否打开链接。", keywords:["二维码","扫码","QR","安全读取","二维码解析"], category:"privacy", localOnly:true },

  { href:"/tools/pdf-pages", title:"PDF 页面删除 / 排序 / 旋转", description:"调整页面顺序、删页和旋转，浏览器本地完成。", keywords:["PDF删除页面","PDF排序","旋转PDF","重排页面"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/pdf-to-jpg", title:"PDF 转 JPG / PNG", description:"按页真实渲染，批量打包下载图片。", keywords:["PDF转JPG","PDF转PNG","PDF转图片"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/pdf-compress", title:"PDF 压缩", description:"扫描件/图片型 PDF 栅格压缩，显示真实前后大小。", keywords:["压缩PDF","PDF太大","PDF减小"], category:"pdf", popular:true, localOnly:true },
  { href:"/tools/pdf-ocr", title:"PDF OCR", description:"扫描 PDF 本地识别文字并导出 TXT。", keywords:["PDF OCR","扫描PDF转文字","PDF文字识别"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-redact", title:"PDF 真脱敏", description:"把敏感区域永久写入导出结果，不能复制恢复。", keywords:["PDF脱敏","删除敏感信息","PDF打码","身份证号"], category:"privacy", popular:true, localOnly:true },
  { href:"/tools/png-to-jpg", title:"PNG 转 JPG", description:"浏览器本地转换，适合上传兼容和减小体积。", keywords:["PNG转JPG","PNG转JPEG"], category:"image", localOnly:true },
  { href:"/tools/jpg-to-png", title:"JPG 转 PNG", description:"JPG/JPEG 直接转 PNG。", keywords:["JPG转PNG","JPEG转PNG"], category:"image", localOnly:true },
  { href:"/tools/webp-to-jpg", title:"WebP 转 JPG", description:"把 WebP 转成兼容性更高的 JPG。", keywords:["WebP转JPG","WebP转JPEG"], category:"image", localOnly:true },
  { href:"/tools/avif-to-jpg", title:"AVIF 转 JPG", description:"浏览器支持 AVIF 时直接本地转换。", keywords:["AVIF转JPG","AVIF转JPEG"], category:"image", localOnly:true },
  { href:"/tools/svg-to-png", title:"SVG 转 PNG", description:"SVG 本地渲染为高清 PNG。", keywords:["SVG转PNG","矢量图转PNG"], category:"image", localOnly:true },
  { href:"/tools/long-image", title:"截图长图拼接", description:"多张截图按顺序拼成一张长图。", keywords:["长图拼接","截图拼接","图片拼接"], category:"daily", popular:true, localOnly:true },
  { href:"/tools/screenshot-redact", title:"截图隐私打码", description:"框选敏感内容，模糊或黑块后本地导出。", keywords:["截图打码","隐私打码","身份证打码","聊天截图"], category:"privacy", popular:true, localOnly:true },
  { href:"/tools/subtitle-tools", title:"字幕 SRT / VTT 工具", description:"字幕整体偏移、SRT/VTT/TXT 转换。", keywords:["SRT","VTT","字幕转换","字幕延迟"], category:"video", localOnly:true },

  { href:"/tools/audio-transcription", title:"音频转文字", description:"按分钟转写，导出 TXT / SRT / VTT。", keywords:["音频转文字","录音转文字","语音转文字","SRT"], category:"audio", badge:"AI", popular:true },
  { href:"/tools/video-transcription", title:"视频转文字 / 自动字幕", description:"视频转写并生成字幕文件。", keywords:["视频转文字","自动字幕","视频字幕","SRT"], category:"video", badge:"AI", popular:true },
  { href:"/tools/subtitle-translate", title:"字幕翻译", description:"保留时间轴，只翻译 SRT / VTT 字幕文字。", keywords:["字幕翻译","SRT翻译","VTT翻译","双语字幕"], category:"video", badge:"AI" },
  { href:"/tools/id-photo-ai", title:"AI 证件照换背景", description:"白/蓝/红/灰背景，保持人物身份。", keywords:["证件照","换背景","蓝底照片","白底照片","红底照片"], category:"image", badge:"AI", popular:true },
];

export const ADVANCED_CATEGORY_LABELS: Record<AdvancedToolCategory,string> = {
  pdf:"PDF / 文档", sign:"签名与盖章", image:"图片", video:"视频", audio:"音频",
  text:"文字", privacy:"隐私与安全", daily:"日常工具", developer:"开发者工具"
};
