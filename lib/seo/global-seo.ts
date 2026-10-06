import {BRAND_PUBLIC_COPY} from "@/lib/brand-public-copy";
import {PUBLIC_FEATURE_COPY} from "@/lib/public-feature-copy";
import {toolIntro} from "@/lib/tools/product-copy";
import {toolTitle as translatedToolTitle} from '@/lib/tools/card-i18n';
import {toolFacts} from './product-facts';
import {PRIMARY_SITE} from "./site-domains";
export const SITE=PRIMARY_SITE;
export const SEO_LOCALES={  "zh":{
    hreflang:"zh-CN",name:"中文",dir:"ltr",
    brand:"灵犀场 LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.zh.title,homeDesc:PUBLIC_FEATURE_COPY.zh.description,
    toolsTitle:"在线实用工具｜PDF、图片、视频与文件",toolsDesc:"选择 PDF、图片、视频或文字工具，按步骤处理并保存文件。处理方式和费用请查看工具页面。",
    open:"打开工具",allTools:"查看全部工具",how:"怎么使用",what:"能做什么",privacy:"处理方式",
    local:"这项工具优先在你的设备中完成处理。",online:"这项工具需要在线处理；如产生费用，会在真正执行前说明。",topicIntro:"SASI 可以用于短剧、网站、书本、学习和科研创作。需要付费的步骤会在真正执行前显示费用；需要智能生成时可连接自己的智能服务。",
    searchTerms:["灵犀场SASI","LINGXIFIELD SASI","灵犀场实用工具","SASI资料问答","PDF压缩","PDF合并","PDF拆分","图片压缩","图片格式转换","视频转文字","音频转文字","字幕翻译","临时邮箱","阅后即焚","图片OCR","书本智能体","科研智能体","学习智能体"]
  },
  "en":{
    hreflang:"en",name:"English",dir:"ltr",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.en.title,homeDesc:PUBLIC_FEATURE_COPY.en.description,
    toolsTitle:"Online tools for PDF, images, video and files",toolsDesc:"Choose a PDF, image, video or text tool, follow the steps and save your file. See each tool for processing details and prices.",
    open:"Open tool",allTools:"Browse all tools",how:"How to use it",what:"What it does",privacy:"Processing",
    local:"This tool is designed to run on your device whenever possible.",online:"This tool uses online processing. Any charge is shown before paid execution.",topicIntro:"SASI supports drama, website, book, learning and research workflows. Paid steps show the price before execution; connect your own intelligence service when intelligent generation is needed.",
    searchTerms:["PDF compressor","merge PDF","split PDF","image compressor","image converter","video transcription","audio to text","subtitle translator","temporary email","burn after reading","image OCR","book to AI agent","AI research assistant","AI study assistant"]
  },
  "ja":{
    hreflang:"ja",name:"日本語",dir:"ltr",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.ja.title,homeDesc:PUBLIC_FEATURE_COPY.ja.description,
    toolsTitle:"PDF・画像・動画・ファイルの実用ツール",toolsDesc:"PDF・画像・動画・テキストのツールを選び、手順に沿って処理して保存します。処理方法と料金は各ツールで確認できます。",
    open:"ツールを開く",allTools:"すべてのツール",how:"使い方",what:"できること",privacy:"処理方法",
    local:"可能な処理は端末内で実行します。",online:"オンライン処理を使います。有料の場合は実行前に料金を表示します。",topicIntro:"SASIは短編ドラマ、Webサイト、本、学習、研究に利用できます。有料の工程は実行前に料金を表示し、智能生成が必要な場合は自分のAIサービスを接続できます。",
    searchTerms:["PDF 圧縮","PDF 結合","PDF 分割","画像 圧縮","画像 変換","動画 文字起こし","音声 文字起こし","字幕 翻訳","捨てメアド","OCR","書籍 AI","研究 AI","学習 AI"]
  },
  "ko":{
    hreflang:"ko",name:"한국어",dir:"ltr",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.ko.title,homeDesc:PUBLIC_FEATURE_COPY.ko.description,
    toolsTitle:"PDF, 이미지, 영상, 파일 실용 도구",toolsDesc:"PDF·이미지·영상·텍스트 도구를 선택하고 안내에 따라 처리한 뒤 저장하세요. 처리 방식과 요금은 각 도구에서 확인하세요.",
    open:"도구 열기",allTools:"모든 도구 보기",how:"사용 방법",what:"할 수 있는 일",privacy:"처리 방식",
    local:"가능한 작업은 기기에서 직접 처리합니다.",online:"온라인 처리를 사용합니다. 유료 작업은 실행 전에 비용을 표시합니다.",topicIntro:"SASI는 숏드라마, 웹사이트, 책, 학습, 연구 작업에 사용할 수 있습니다. 유료 단계는 실행 전에 요금을 표시하며 지능형 생성이 필요할 때 자신의 서비스를 연결할 수 있습니다.",
    searchTerms:["PDF 압축","PDF 합치기","PDF 분할","이미지 압축","이미지 변환","영상 텍스트 변환","음성 텍스트 변환","자막 번역","임시 이메일","OCR","책 AI 에이전트","AI 연구 도우미","AI 학습 도우미"]
  },
  "fr":{
    hreflang:"fr",name:"Français",dir:"ltr",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.fr.title,homeDesc:PUBLIC_FEATURE_COPY.fr.description,
    toolsTitle:"Outils en ligne pour PDF, images, vidéo et fichiers",toolsDesc:"Choisissez un outil PDF, image, vidéo ou texte, suivez les étapes et enregistrez votre fichier. Consultez les modalités et tarifs sur sa page.",
    open:"Ouvrir l’outil",allTools:"Voir tous les outils",how:"Comment l’utiliser",what:"Ce que l’outil fait",privacy:"Traitement",
    local:"Lorsque c’est possible, le traitement reste sur votre appareil.",online:"Cet outil utilise un traitement en ligne. Tout coût est indiqué avant l’exécution payante.",topicIntro:"SASI prend en charge les flux de mini-séries, sites, livres, apprentissage et recherche. Les étapes payantes affichent le tarif avant exécution ; connectez votre service d’IA lorsque la génération intelligente est nécessaire.",
    searchTerms:["compresser PDF","fusionner PDF","diviser PDF","compresser image","convertir image","transcription vidéo","audio en texte","traduction sous-titres","email temporaire","OCR","livre agent IA","assistant recherche IA","assistant étude IA"]
  },
  "de":{
    hreflang:"de",name:"Deutsch",dir:"ltr",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.de.title,homeDesc:PUBLIC_FEATURE_COPY.de.description,
    toolsTitle:"Online-Tools für PDF, Bilder, Video und Dateien",toolsDesc:"Wähle ein Tool für PDF, Bilder, Video oder Text, folge den Schritten und speichere die Datei. Verarbeitung und Preise stehen auf der Tool-Seite.",
    open:"Tool öffnen",allTools:"Alle Tools",how:"So funktioniert es",what:"Was das Tool macht",privacy:"Verarbeitung",
    local:"Wo möglich, wird die Verarbeitung direkt auf deinem Gerät ausgeführt.",online:"Dieses Tool nutzt Online-Verarbeitung. Kosten werden vor einer kostenpflichtigen Ausführung angezeigt.",topicIntro:"SASI unterstützt Kurzdrama-, Website-, Buch-, Lern- und Forschungsabläufe. Kostenpflichtige Schritte zeigen den Preis vor der Ausführung; bei Bedarf kannst du deinen eigenen KI-Dienst verbinden.",
    searchTerms:["PDF komprimieren","PDF zusammenfügen","PDF teilen","Bild komprimieren","Bild konvertieren","Video transkribieren","Audio in Text","Untertitel übersetzen","temporäre E-Mail","OCR","Buch KI Agent","KI Forschungsassistent","KI Lernassistent"]
  },
  "es":{
    hreflang:"es",name:"Español",dir:"ltr",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.es.title,homeDesc:PUBLIC_FEATURE_COPY.es.description,
    toolsTitle:"Herramientas online para PDF, imágenes, vídeo y archivos",toolsDesc:"Elige una herramienta para PDF, imágenes, vídeo o texto, sigue los pasos y guarda el archivo. Consulta los detalles y precios en cada herramienta.",
    open:"Abrir herramienta",allTools:"Ver todas las herramientas",how:"Cómo usarla",what:"Qué hace",privacy:"Procesamiento",
    local:"Siempre que sea posible, el procesamiento se realiza en tu dispositivo.",online:"Esta herramienta usa procesamiento online. Cualquier coste se muestra antes de ejecutar una acción de pago.",topicIntro:"SASI admite flujos de minidramas, sitios web, libros, aprendizaje e investigación. Los pasos de pago muestran el precio antes de ejecutarse; conecta tu propio servicio de IA cuando haga falta generación inteligente.",
    searchTerms:["comprimir PDF","unir PDF","dividir PDF","comprimir imagen","convertir imagen","transcribir video","audio a texto","traducir subtítulos","correo temporal","OCR","libro a agente IA","asistente investigación IA","asistente estudio IA"]
  },
  "pt":{
    hreflang:"pt",name:"Português",dir:"ltr",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.pt.title,homeDesc:PUBLIC_FEATURE_COPY.pt.description,
    toolsTitle:"Ferramentas online para PDF, imagens, vídeo e arquivos",toolsDesc:"Escolha uma ferramenta para PDF, imagens, vídeo ou texto, siga as etapas e salve o arquivo. Consulte os detalhes e preços na página da ferramenta.",
    open:"Abrir ferramenta",allTools:"Ver todas as ferramentas",how:"Como usar",what:"O que faz",privacy:"Processamento",
    local:"Sempre que possível, o processamento acontece no seu dispositivo.",online:"Esta ferramenta usa processamento online. Qualquer custo é mostrado antes de uma execução paga.",topicIntro:"O SASI oferece fluxos de minidramas, sites, livros, estudo e pesquisa. Etapas pagas mostram o preço antes da execução; conecte seu próprio serviço de IA quando a geração inteligente for necessária.",
    searchTerms:["comprimir PDF","juntar PDF","dividir PDF","comprimir imagem","converter imagem","transcrever vídeo","áudio para texto","traduzir legendas","email temporário","OCR","livro para agente IA","assistente pesquisa IA","assistente estudo IA"]
  },
  "ar":{
    hreflang:"ar",name:"العربية",dir:"rtl",
    brand:"LINGXIFIELD",homeTitle:BRAND_PUBLIC_COPY.ar.title,homeDesc:PUBLIC_FEATURE_COPY.ar.description,
    toolsTitle:"أدوات أونلاين لملفات PDF والصور والفيديو",toolsDesc:"اختر أداة لملفات PDF أو الصور أو الفيديو أو النصوص، واتبع الخطوات واحفظ الملف. راجع طريقة المعالجة والأسعار في صفحة الأداة.",
    open:"فتح الأداة",allTools:"عرض كل الأدوات",how:"طريقة الاستخدام",what:"ما الذي تفعله",privacy:"طريقة المعالجة",
    local:"تتم المعالجة على جهازك كلما كان ذلك ممكناً.",online:"تستخدم هذه الأداة معالجة عبر الإنترنت. تظهر أي تكلفة قبل التنفيذ المدفوع.",topicIntro:"يدعم SASI مسارات الدراما القصيرة والمواقع والكتب والتعلم والبحث. تعرض الخطوات المدفوعة السعر قبل التنفيذ، ويمكن ربط خدمة الذكاء الخاصة بك عند الحاجة إلى التوليد الذكي.",
    searchTerms:["ضغط PDF","دمج PDF","تقسيم PDF","ضغط الصور","تحويل الصور","تحويل الفيديو إلى نص","تحويل الصوت إلى نص","ترجمة الترجمة النصية","بريد مؤقت","OCR","كتاب إلى وكيل ذكاء اصطناعي","مساعد بحث بالذكاء الاصطناعي","مساعد دراسة بالذكاء الاصطناعي"]
  }} as const;
export type SeoLocale=keyof typeof SEO_LOCALES;
export const LOCALIZED_LOCALES=(Object.keys(SEO_LOCALES) as SeoLocale[]).filter(x=>x!=="zh");
export function isSeoLocale(v:string):v is SeoLocale{return Object.prototype.hasOwnProperty.call(SEO_LOCALES,v)}

export const GLOBAL_TOOL_CATALOG=[
  {slug:"audio-transcription",zh:"音频转文字",en:"Audio Transcription",mode:"online" as const},
  {slug:"avif-to-jpg",zh:"AVIF 转 JPG",en:"AVIF to JPG",mode:"local" as const},
  {slug:"base64-encode-decode",zh:"Base64 编码解码",en:"Base64 Encode & Decode",mode:"local" as const},
  {slug:"batch-image",zh:"批量图片处理",en:"Batch Image Tools",mode:"local" as const},
  {slug:"batch-image-watermark-remover",zh:"批量图片去水印",en:"Batch Watermark Cleanup",mode:"online" as const},
  {slug:"burn-after-read",zh:"阅后即焚",en:"Burn After Reading",mode:"online" as const},
  {slug:"compress-image",zh:"图片压缩",en:"Compress Image",mode:"local" as const},
  {slug:"compress-image-to-100kb",zh:"图片精确压缩到 100KB",en:"Compress Image to 100KB",mode:"local" as const},
  {slug:"compress-image-to-200kb",zh:"图片精确压缩到 200KB",en:"Compress Image to 200KB",mode:"local" as const},
  {slug:"compress-image-to-20kb",zh:"图片精确压缩到 20KB",en:"Compress Image to 20KB",mode:"local" as const},
  {slug:"compress-image-to-500kb",zh:"图片精确压缩到 500KB",en:"Compress Image to 500KB",mode:"local" as const},
  {slug:"compress-image-to-50kb",zh:"图片精确压缩到 50KB",en:"Compress Image to 50KB",mode:"local" as const},
  {slug:"compress-pdf",zh:"PDF 重建压缩",en:"Rebuild & Compress PDF",mode:"local" as const},
  {slug:"csv-to-xlsx",zh:"CSV / TSV 转 Excel",en:"CSV / TSV to Excel",mode:"local" as const},
  {slug:"document-copy-layout",zh:"证件复印排版",en:"Document Copy Layout",mode:"local" as const},
  {slug:"docx-to-txt",zh:"DOCX 转 TXT",en:"DOCX to TXT",mode:"local" as const},
  {slug:"e-sign-pdf",zh:"PDF电子签名 / 电子签章",en:"E-sign & Stamp PDF",mode:"local" as const},
  {slug:"file-compare",zh:"两个文件是否完全一致",en:"Compare Two Files",mode:"local" as const},
  {slug:"file-type-detector",zh:"文件真实格式检测",en:"Real File Type Detector",mode:"local" as const},
  {slug:"food-calorie",zh:"食物热量与营养",en:"Food Nutrition Calculator",mode:"online" as const},
  {slug:"heic-local",zh:"HEIC 本地转换",en:"Local HEIC Converter",mode:"local" as const},
  {slug:"heic-to-jpg",zh:"HEIC 转 JPG",en:"HEIC to JPG",mode:"local" as const},
  {slug:"id-photo-ai",zh:"AI 证件照",en:"AI ID Photo",mode:"online" as const},
  {slug:"image-to-pdf",zh:"图片转 PDF",en:"Images to PDF",mode:"local" as const},
  {slug:"image-to-pdf-pro",zh:"图片转 PDF",en:"Images to PDF Pro",mode:"local" as const},
  {slug:"image-translator",zh:"图片翻译",en:"Image Translator",mode:"online" as const},
  {slug:"image-watermark-remover",zh:"图片去水印",en:"Image Watermark Cleanup",mode:"online" as const},
  {slug:"jpg-to-png",zh:"JPG 转 PNG",en:"JPG to PNG",mode:"local" as const},
  {slug:"json-formatter",zh:"JSON 格式化 / 修复",en:"JSON Format / Repair",mode:"local" as const},
  {slug:"long-image",zh:"长图拼接",en:"Long Image Stitcher",mode:"local" as const},
  {slug:"md5-sha256",zh:"MD5 / SHA256 校验",en:"MD5 / SHA256 Hash",mode:"local" as const},
  {slug:"merge-pdf",zh:"PDF 合并",en:"Merge PDF",mode:"local" as const},
  {slug:"ocr",zh:"图片 OCR",en:"Image OCR",mode:"online" as const},
  {slug:"pdf-compress",zh:"PDF 压缩",en:"Compress PDF",mode:"local" as const},
  {slug:"pdf-editor",zh:"PDF 编辑",en:"PDF Editor",mode:"local" as const},
  {slug:"pdf-merge-split",zh:"PDF 合并 / 拆分",en:"Merge / Split PDF",mode:"local" as const},
  {slug:"pdf-ocr",zh:"PDF OCR",en:"PDF OCR",mode:"online" as const},
  {slug:"pdf-pages",zh:"PDF 页面整理",en:"PDF Page Organizer",mode:"local" as const},
  {slug:"pdf-redact",zh:"PDF 永久脱敏",en:"PDF Redaction",mode:"local" as const},
  {slug:"handwriting-ocr",zh:"手写文字识别",en:"Handwriting OCR",mode:"online" as const},
  {slug:"pdf-to-word",zh:"PDF 转 Word",en:"PDF to Word",mode:"local" as const},
  {slug:"pdf-watermark",zh:"PDF 加水印",en:"Watermark PDF",mode:"local" as const},
  {slug:"pdf-page-numbers",zh:"PDF 加页码",en:"Add PDF Page Numbers",mode:"local" as const},
  {slug:"pdf-crop",zh:"PDF 裁边",en:"Crop PDF",mode:"local" as const},
  {slug:"pdf-flatten",zh:"PDF 扁平化",en:"Flatten PDF",mode:"local" as const},
  {slug:"pdf-compare",zh:"PDF 比较",en:"Compare PDFs",mode:"local" as const},
  {slug:"pdf-to-text",zh:"PDF 转 TXT",en:"PDF to Text",mode:"local" as const},
  {slug:"pdf-to-markdown",zh:"PDF 转 Markdown",en:"PDF to Markdown",mode:"local" as const},
  {slug:"jfif-to-jpg",zh:"JFIF 转 JPG",en:"JFIF to JPG",mode:"local" as const},
  {slug:"bmp-to-png",zh:"BMP 转 PNG",en:"BMP to PNG",mode:"local" as const},
  {slug:"ico-to-png",zh:"ICO 转 PNG",en:"ICO to PNG",mode:"local" as const},
  {slug:"gif-to-jpg",zh:"GIF 转 JPG",en:"GIF to JPG",mode:"local" as const},
  {slug:"epub-to-txt",zh:"EPUB 转 TXT",en:"EPUB to TXT",mode:"local" as const},
  {slug:"odt-to-txt",zh:"ODT 转 TXT",en:"ODT to TXT",mode:"local" as const},
  {slug:"ics-to-csv",zh:"ICS 转 CSV",en:"ICS to CSV",mode:"local" as const},
  {slug:"vcf-to-csv",zh:"VCF 转 CSV",en:"VCF to CSV",mode:"local" as const},
  {slug:"uuid-generator",zh:"UUID / ULID 生成器",en:"UUID / ULID Generator",mode:"local" as const},
  {slug:"pdf-rasterize",zh:"PDF 栅格化",en:"Rasterize PDF",mode:"local" as const},
  {slug:"pdf-pages-per-sheet",zh:"PDF 多页合一",en:"PDF Pages per Sheet",mode:"local" as const},
  {slug:"pdf-remove-metadata",zh:"删除 PDF 元数据",en:"Remove PDF Metadata",mode:"local" as const},
  {slug:"pdf-halve-pages",zh:"PDF 页面拆半",en:"Halve PDF Pages",mode:"local" as const},
  {slug:"pdf-search",zh:"PDF 全文搜索",en:"Search PDFs",mode:"local" as const},
  {slug:"reverse-video",zh:"视频倒放",en:"Reverse Video",mode:"local" as const},
  {slug:"loop-video",zh:"视频循环",en:"Loop Video",mode:"local" as const},
  {slug:"stop-motion-video",zh:"视频定格",en:"Stop Motion Video",mode:"local" as const},
  {slug:"regex-tester",zh:"正则表达式测试",en:"Regex Tester",mode:"local" as const},
  {slug:"text-diff",zh:"文本对比",en:"Text Diff",mode:"local" as const},
  {slug:"csv-json",zh:"CSV 转 JSON",en:"CSV to JSON",mode:"local" as const},
  {slug:"xml-formatter",zh:"XML 格式化",en:"XML Formatter",mode:"local" as const},
  {slug:"jwt-decoder",zh:"JWT 解码",en:"JWT Decoder",mode:"local" as const},
  {slug:"url-parser",zh:"URL 解析",en:"URL Parser",mode:"local" as const},
  {slug:"case-converter",zh:"大小写转换",en:"Case Converter",mode:"local" as const},
  {slug:"number-base-converter",zh:"进制转换",en:"Number Base Converter",mode:"local" as const},
  {slug:"audio-cleanup",zh:"音频降噪 / 人声增强",en:"Audio Cleanup",mode:"local" as const},
  {slug:"cron-parser",zh:"Cron 表达式解析器",en:"Cron Parser",mode:"local" as const},
  {slug:"batch-pdf",zh:"批量处理 PDF",en:"Batch PDF",mode:"local" as const},
  {slug:"pdf-to-jpg",zh:"PDF 转 JPG",en:"PDF to JPG",mode:"local" as const},
  {slug:"png-to-jpg",zh:"PNG 转 JPG",en:"PNG to JPG",mode:"local" as const},
  {slug:"pptx-to-txt",zh:"PPTX 转 TXT",en:"PPTX to TXT",mode:"local" as const},
  {slug:"privacy-cleaner",zh:"文件隐私清理",en:"Privacy Cleaner",mode:"local" as const},
  {slug:"qr-code-generator",zh:"二维码生成",en:"QR Code Generator",mode:"local" as const},
  {slug:"qr-code-reader",zh:"二维码读取",en:"QR Code Reader",mode:"local" as const},
  {slug:"qr-safe-reader",zh:"二维码安全识别",en:"Safe QR Reader",mode:"local" as const},
  {slug:"remove-duplicate-lines",zh:"文本去重行",en:"Remove Duplicate Lines",mode:"local" as const},
  {slug:"remove-empty-lines",zh:"删除空白行",en:"Remove Empty Lines",mode:"local" as const},
  {slug:"remove-exif",zh:"清除图片 EXIF / 元数据",en:"Remove Image EXIF / Metadata",mode:"local" as const},
  {slug:"resize-image",zh:"图片尺寸修改",en:"Resize Image",mode:"local" as const},
  {slug:"screenshot-redact",zh:"截图打码 / 脱敏",en:"Screenshot Redaction",mode:"local" as const},
  {slug:"split-pdf",zh:"PDF 拆分",en:"Split PDF",mode:"local" as const},
  {slug:"subtitle-tools",zh:"字幕 SRT / VTT 工具",en:"Subtitle SRT / VTT Tools",mode:"local" as const},
  {slug:"subtitle-translate",zh:"字幕翻译",en:"Subtitle Translation",mode:"online" as const},
  {slug:"svg-to-png",zh:"SVG 转 PNG",en:"SVG to PNG",mode:"local" as const},
  {slug:"temp-mail",zh:"10分钟临时邮箱",en:"10-Minute Temporary Email",mode:"online" as const},
  {slug:"text-counter",zh:"字数与字符统计",en:"Text Counter",mode:"local" as const},
  {slug:"timestamp-converter",zh:"时间戳转换",en:"Timestamp Converter",mode:"local" as const},
  {slug:"url-encode-decode",zh:"URL 编码解码",en:"URL Encode & Decode",mode:"local" as const},
  {slug:"video-dubbing",zh:"视频配音",en:"Video Dubbing",mode:"online" as const},
  {slug:"video-toolkit",zh:"视频压缩 / 裁剪 / 提取音频",en:"Video Toolkit",mode:"local" as const},
  {slug:"video-translate",zh:"视频翻译",en:"Video Translator",mode:"online" as const},
  {slug:"video-transcription",zh:"视频转文字",en:"Video Transcription",mode:"online" as const},
  {slug:"video-watermark-remover",zh:"视频去水印",en:"Video Watermark Cleanup",mode:"online" as const},
  {slug:"webp-to-jpg",zh:"WebP 转 JPG / PNG",en:"WebP to JPG / PNG",mode:"local" as const},
  {slug:"xlsx-to-csv",zh:"Excel 转 CSV",en:"Excel to CSV",mode:"local" as const}
,
  {slug:"pdf-overlay",zh:"PDF 叠加",en:"Overlay PDF",mode:"local" as const},
  {slug:"pdf-header-footer",zh:"PDF 页眉页脚",en:"PDF Header & Footer",mode:"local" as const},
  {slug:"pdf-bates-numbering",zh:"PDF Bates 编号",en:"PDF Bates Numbering",mode:"local" as const},
  {slug:"pdf-viewer-preferences",zh:"PDF 打开方式",en:"PDF Viewer Preferences",mode:"local" as const},

  {slug:"pdf-remove-annotations",zh:"删除 PDF 批注",en:"Remove PDF Annotations",mode:"local" as const},
  {slug:"pdf-grayscale",zh:"PDF 转灰度",en:"Grayscale PDF",mode:"local" as const},
  {slug:"pdf-page-size",zh:"调整 PDF 页面尺寸",en:"Resize PDF Pages",mode:"local" as const},
  {slug:"pdf-metadata-editor",zh:"编辑 PDF 文件信息",en:"Edit PDF Metadata",mode:"local" as const},

  {slug:"pdf-protect",zh:"PDF 加密码",en:"Protect PDF",mode:"local" as const},
  {slug:"pdf-unlock",zh:"解除 PDF 密码",en:"Unlock PDF",mode:"local" as const},
  {slug:"pdf-permissions",zh:"PDF 权限设置",en:"PDF Permissions",mode:"local" as const},
  {slug:"pdf-web-optimize",zh:"PDF 网页快速打开",en:"Optimize PDF for Web",mode:"local" as const},

  {slug:"pdf-inspect",zh:"PDF 结构检查",en:"Inspect PDF",mode:"local" as const},
  {slug:"pdf-attachments",zh:"PDF 附件管理",en:"PDF Attachments",mode:"local" as const},
  {slug:"pdf-bookmarks",zh:"PDF 书签查看",en:"View PDF Bookmarks",mode:"local" as const},
] as const;

export type GlobalTool=(typeof GLOBAL_TOOL_CATALOG)[number];
export function getGlobalTool(slug:string){return GLOBAL_TOOL_CATALOG.find(t=>t.slug===slug)}

export const SEO_TOPICS={  "ai-short-drama-generator":{"zh":"AI 短剧生成","en":"AI Short Drama Generator","ja":"AI ショートドラマ生成","ko":"AI 숏폼 드라마 생성","fr":"Générateur de mini-séries IA","de":"KI-Kurzdrama Generator","es":"Generador de minidramas con IA","pt":"Gerador de minidramas com IA","ar":"مولد الدراما القصيرة بالذكاء الاصطناعي"},
  "book-to-ai-agent":{"zh":"书本变成可追问的 SASI","en":"Turn a Book into an AI Agent","ja":"本を質問できるAIエージェントに","ko":"책을 질문 가능한 AI 에이전트로","fr":"Transformer un livre en agent IA","de":"Buch in einen KI-Agenten verwandeln","es":"Convertir un libro en agente de IA","pt":"Transformar livro em agente de IA","ar":"تحويل كتاب إلى وكيل ذكاء اصطناعي"},
  "document-ai-agent":{"zh":"资料与文档活化为智能体","en":"Turn Documents into an AI Agent","ja":"文書をAIエージェント化","ko":"문서를 AI 에이전트로","fr":"Transformer des documents en agent IA","de":"Dokumente in einen KI-Agenten verwandeln","es":"Convertir documentos en agente de IA","pt":"Transformar documentos em agente de IA","ar":"تحويل المستندات إلى وكيل ذكاء اصطناعي"},
  "learning-ai-agent":{"zh":"学习 SASI","en":"AI Study Assistant","ja":"AI 学習アシスタント","ko":"AI 학습 도우미","fr":"Assistant d'étude IA","de":"KI-Lernassistent","es":"Asistente de estudio con IA","pt":"Assistente de estudo com IA","ar":"مساعد دراسة بالذكاء الاصطناعي"},
  "research-ai-agent":{"zh":"科研 SASI","en":"AI Research Assistant","ja":"AI 研究アシスタント","ko":"AI 연구 도우미","fr":"Assistant de recherche IA","de":"KI-Forschungsassistent","es":"Asistente de investigación con IA","pt":"Assistente de pesquisa com IA","ar":"مساعد بحث بالذكاء الاصطناعي"},
  "ai-website-builder":{"zh":"AI 网站与应用构建","en":"AI Website & App Builder","ja":"AI Webサイト・アプリ構築","ko":"AI 웹사이트·앱 제작","fr":"Créateur de sites et apps IA","de":"KI Website- & App-Builder","es":"Creador de sitios y apps con IA","pt":"Criador de sites e apps com IA","ar":"بناء المواقع والتطبيقات بالذكاء الاصطناعي"}} as const;
export type SeoTopic=keyof typeof SEO_TOPICS;
export function isSeoTopic(v:string):v is SeoTopic{return Object.prototype.hasOwnProperty.call(SEO_TOPICS,v)}

export function localePath(locale:SeoLocale,path:string){
  const clean=path.startsWith("/")?path:`/${path}`;
  return locale==="zh"?clean:`/${locale}${clean==="/"?"":clean}`;
}

export function languageAlternates(path:string){
  const out:Record<string,string>={};
  for(const locale of Object.keys(SEO_LOCALES) as SeoLocale[]){
    out[SEO_LOCALES[locale].hreflang]=localePath(locale,path);
  }
  out["x-default"]=localePath("zh",path);
  return out;
}

const HOT_TOOL_TERMS:Record<string,string[]>= {
  "pdf-compress":["PDF compressor","compress PDF","reduce PDF size"],
  "compress-pdf":["PDF compressor","compress PDF","reduce PDF size"],
  "pdf-merge-split":["merge PDF","split PDF","PDF merger"],
  "merge-pdf":["merge PDF","combine PDF"],
  "split-pdf":["split PDF","extract PDF pages"],
  "pdf-editor":["PDF editor","edit PDF online"],
  "e-sign-pdf":["sign PDF","e-sign PDF","PDF stamp"],
  "compress-image":["image compressor","compress image online"],
  "image-watermark-remover":["remove watermark from image","image watermark remover"],
  "video-watermark-remover":["remove watermark from video","video watermark remover"],
  "video-translate":["video translator","translate video","video subtitle translation","AI video translation"],
  "video-transcription":["video transcription","video to text"],
  "audio-transcription":["audio transcription","audio to text"],
  "subtitle-translate":["subtitle translator","translate subtitles"],
  "temp-mail":["temporary email","10 minute mail","disposable email"],
  "ocr":["image OCR","image to text"],
  "pdf-ocr":["PDF OCR","scanned PDF to text"],
  "food-calorie":["calorie calculator","food nutrition calculator"],
};

export function toolKeywords(locale:SeoLocale,tool:GlobalTool){
  const base=[toolTitle(locale,tool),tool.en,tool.slug.replaceAll("-"," ")];
  return Array.from(new Set([...base,...(HOT_TOOL_TERMS[tool.slug]||[])]));
}

export function toolTitle(locale:SeoLocale,tool:GlobalTool){
  return translatedToolTitle(locale,tool.slug,locale==='zh'?tool.zh:tool.en);
}

export function toolDescription(locale:SeoLocale,tool:GlobalTool){
  const intro=toolIntro(locale,tool.slug==="heic-local"?"heic-to-jpg":tool.slug);if(intro)return intro;
  const name=toolTitle(locale,tool);
  return `${name} — ${toolFacts(tool.slug,locale).summary}`;
}

export function topicTitle(locale:SeoLocale,topic:SeoTopic){
  return SEO_TOPICS[topic][locale];
}

export function topicPath(locale:SeoLocale,topic:SeoTopic){
  return localePath(locale,`/discover/${topic}`);
}
