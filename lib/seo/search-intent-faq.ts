import type { SeoLocale } from "./global-seo";
import { SEO_LOCALES, toolTitle, getGlobalTool } from "./global-seo";

export type SearchFaqItem = { q: string; a: string };

type Localized<T> = Record<SeoLocale, T>;
const L = <T>(zh:T,en:T,ja:T,ko:T,fr:T,de:T,es:T,pt:T,ar:T):Localized<T> => ({zh,en,ja,ko,fr,de,es,pt,ar});

const SECTION_TITLE = L(
  "用户常搜", "Common searches", "よく検索される質問", "자주 검색하는 질문",
  "Questions fréquentes", "Häufig gesucht", "Búsquedas frecuentes", "Pesquisas frequentes", "عمليات البحث الشائعة"
);
const SECTION_INTRO = L(
  "这些问题来自当前公开搜索结果中反复出现的真实搜索表达，并会随着实际搜索数据继续更新。",
  "These questions reflect recurring search wording seen in current public search results and are intended to be updated with first-party search data.",
  "現在の公開検索結果で繰り返し見られる検索表現をもとにし、実際の検索データに合わせて更新します。",
  "현재 공개 검색 결과에서 반복적으로 나타나는 검색 표현을 바탕으로 하며 실제 검색 데이터에 맞춰 업데이트합니다.",
  "Ces questions reprennent des formulations récurrentes observées dans les résultats publics et seront mises à jour avec les données de recherche propriétaires.",
  "Diese Fragen greifen wiederkehrende Suchformulierungen aus aktuellen öffentlichen Ergebnissen auf und werden mit eigenen Suchdaten weiter gepflegt.",
  "Estas preguntas reflejan formulaciones recurrentes observadas en resultados públicos y se actualizarán con datos propios de búsqueda.",
  "Estas perguntas refletem formulações recorrentes observadas nos resultados públicos e serão atualizadas com dados próprios de pesquisa.",
  "تعكس هذه الأسئلة صيغ بحث متكررة ظهرت في نتائج البحث العامة الحالية، وسيتم تحديثها ببيانات البحث الفعلية."
);

const GENERIC = {
  use: L(
    (n:string)=>`怎么用${n}？`,
    (n:string)=>`How do I use ${n}?`,
    (n:string)=>`${n}はどう使いますか？`,
    (n:string)=>`${n}은(는) 어떻게 사용하나요?`,
    (n:string)=>`Comment utiliser ${n} ?`,
    (n:string)=>`Wie verwende ich ${n}?`,
    (n:string)=>`¿Cómo se usa ${n}?`,
    (n:string)=>`Como usar ${n}?`,
    (n:string)=>`كيف أستخدم ${n}؟`
  ),
  mobile: L(
    (n:string)=>`${n}手机上能用吗？`,
    (n:string)=>`Can I use ${n} on a phone?`,
    (n:string)=>`${n}はスマホで使えますか？`,
    (n:string)=>`${n}을(를) 휴대폰에서 사용할 수 있나요?`,
    (n:string)=>`Puis-je utiliser ${n} sur téléphone ?`,
    (n:string)=>`Kann ich ${n} auf dem Handy nutzen?`,
    (n:string)=>`¿Puedo usar ${n} en el móvil?`,
    (n:string)=>`Posso usar ${n} no celular?`,
    (n:string)=>`هل يمكن استخدام ${n} على الهاتف؟`
  ),
  free: L(
    (n:string)=>`${n}免费吗？`,
    (n:string)=>`Is ${n} free?`,
    (n:string)=>`${n}は無料ですか？`,
    (n:string)=>`${n}은(는) 무료인가요?`,
    (n:string)=>`${n} est-il gratuit ?`,
    (n:string)=>`Ist ${n} kostenlos?`,
    (n:string)=>`¿${n} es gratis?`,
    (n:string)=>`${n} é gratuito?`,
    (n:string)=>`هل ${n} مجاني؟`
  ),
  privacy: L(
    (n:string)=>`${n}处理文件时会上传吗？`,
    (n:string)=>`Are files uploaded when using ${n}?`,
    (n:string)=>`${n}の処理でファイルはアップロードされますか？`,
    (n:string)=>`${n} 사용 중 파일이 업로드되나요?`,
    (n:string)=>`Les fichiers sont-ils téléversés avec ${n} ?`,
    (n:string)=>`Werden Dateien bei ${n} hochgeladen?`,
    (n:string)=>`¿Se suben archivos al usar ${n}?`,
    (n:string)=>`Os arquivos são enviados ao usar ${n}?`,
    (n:string)=>`هل يتم رفع الملفات عند استخدام ${n}؟`
  ),
} as const;

type QOverride = Partial<Record<SeoLocale, SearchFaqItem[]>>;

/*
 * Search-intent overrides are deliberately limited to high-demand tools.
 * Chinese wording is based on recurring public SERP phrases observed in
 * October 2026; it is not presented as Search Console volume data.
 */
const OVERRIDES: Record<string, QOverride> = {
  "pdf-compress": {
    zh: [
      {q:"PDF文件太大怎么办？",a:"先使用 PDF 压缩，下载后检查文件大小、文字和图片清晰度；原文件建议保留。"},
      {q:"PDF怎么压缩变小？",a:"上传 PDF 后执行压缩即可。图片和扫描件通常更容易明显减小体积，纯文字 PDF 的变化可能较小。"},
      {q:"PDF怎么压缩到10MB以内？",a:"先压缩并查看实际结果；仍超过限制时，可先拆分 PDF，再分别处理。不要为了追求体积把文字和图片压得无法阅读。"},
      {q:"PDF压缩后不清晰怎么办？",a:"回到原文件重新处理，降低压缩强度或先调整图片尺寸。不要继续在已经压坏的文件上重复压缩。"},
      {q:"手机可以压缩PDF吗？",a:"可以，使用手机浏览器打开工具即可处理。"},
    ],
    en: [
      {q:"How do I make a PDF file smaller?",a:"Upload the PDF, run compression, then check the resulting size and readability. Keep the original file for another pass if needed."},
      {q:"How do I compress a PDF to under 10 MB?",a:"Compress the PDF and check the actual output. If it is still over the limit, split it into smaller PDFs rather than forcing extreme compression."},
      {q:"Why did my PDF barely get smaller?",a:"Text-heavy or already-compressed PDFs may have little room to shrink. Image-heavy and scanned PDFs usually have more compression headroom."},
      {q:"How do I keep a compressed PDF readable?",a:"Check the output at normal and enlarged views. If images or small text are degraded, return to the original and use a lighter compression setting."},
      {q:"Can I compress a PDF on my phone?",a:"Yes. Open the tool in a mobile browser and process the PDF there."},
    ],
  },
  "compress-pdf": {
    zh: [
      {q:"PDF文件太大怎么压缩？",a:"这个工具适合扫描件和图片型 PDF。处理后请检查清晰度，因为页面可能会重新生成成图片。"},
      {q:"PDF压缩后为什么变成图片了？",a:"该模式会重建页面并压缩图片，适合体积优先的扫描件；文字和矢量内容可能被栅格化。"},
      {q:"扫描件PDF怎么压缩？",a:"上传扫描件执行重建压缩，再检查文字和图片是否仍然清楚。"},
      {q:"PDF压缩后不清楚怎么办？",a:"重新使用原文件处理，并降低压缩程度；不要继续压缩已经模糊的结果。"},
    ],
    en: [
      {q:"How do I compress a large scanned PDF?",a:"Upload the scanned PDF and use the rebuild-and-compress workflow, then review the output for readability."},
      {q:"Why does the compressed PDF become image-based?",a:"This workflow rebuilds pages from rendered images to reduce image-heavy PDF size, so text and vector content may be rasterized."},
      {q:"Is this PDF compression lossless?",a:"No. It is designed for scanned or image-heavy PDFs and may trade editable text/vector structure for a smaller file."},
      {q:"What if the compressed PDF looks blurry?",a:"Start again from the original PDF and use a lighter setting rather than repeatedly compressing the degraded output."},
    ],
  },
  "merge-pdf": {
    zh: [
      {q:"多个PDF怎么合并成一个？",a:"把需要合并的 PDF 一次加入工具，确认文件顺序后执行合并，完成后保存新的 PDF。"},
      {q:"PDF怎么合并成一个文件？",a:"选择多个 PDF，按最终阅读顺序排列，再开始合并。"},
      {q:"PDF合并后顺序乱了怎么办？",a:"重新从原文件开始处理，先检查上传列表的顺序，再导出结果。"},
      {q:"手机可以合并PDF吗？",a:"可以，手机浏览器打开工具即可处理多个 PDF。"},
    ],
    en: [
      {q:"How do I combine multiple PDFs into one?",a:"Add the PDFs, put them in the final reading order, run the merge, and save the new PDF."},
      {q:"How do I merge PDF files online?",a:"Select the PDFs, check their order, then start the merge and download the result."},
      {q:"Why is my merged PDF in the wrong order?",a:"The output follows the selected file order. Return to the original files, correct the list order, and merge again."},
      {q:"Can I merge PDFs on a phone?",a:"Yes. Open the tool in a mobile browser and select the PDF files."},
    ],
  },
  "e-sign-pdf": {
    zh: [
      {q:"PDF怎么添加手写电子签名？",a:"打开 PDF 电子签名工具，加入手写签名后拖到需要签字的位置，调整大小、位置并预览，再导出 PDF。"},
      {q:"PDF怎么签字？",a:"上传 PDF，添加手写签名，拖动到签字位置并确认预览，最后导出。"},
      {q:"PDF怎么盖章？",a:"上传 PDF 后添加印章图片，调整位置和大小，预览无误后导出。"},
      {q:"手机上可以签PDF吗？",a:"可以，手机浏览器即可打开工具完成签名和盖章操作。"},
    ],
    en: [
      {q:"How do I add a handwritten signature to a PDF?",a:"Open the PDF signing tool, add the handwritten signature, place and resize it, preview the page, then export the PDF."},
      {q:"How do I sign a PDF online?",a:"Upload the PDF, add your signature, position it where needed, review the result, and export."},
      {q:"How do I stamp a PDF?",a:"Add a stamp image, position and resize it, review the page, and export the PDF."},
      {q:"Can I sign a PDF on my phone?",a:"Yes. Open the tool in a mobile browser and complete the signing workflow there."},
    ],
  },
  "ocr": {
    zh: [
      {q:"图片怎么转文字？",a:"上传照片、截图或扫描图片，使用 OCR 识别文字，然后复制或保存识别结果。"},
      {q:"截图怎么转文字？",a:"把截图上传到图片 OCR 工具，识别后即可复制文字。"},
      {q:"手机图片怎么提取文字？",a:"用手机浏览器打开图片 OCR，选择图片后开始识别，再复制需要的文字。"},
      {q:"图片文字识别不准确怎么办？",a:"尽量使用清晰、端正、文字较大的原图；识别结果中的姓名、数字、网址等内容建议人工核对。"},
    ],
    en: [
      {q:"How do I turn an image into text?",a:"Upload a photo, screenshot, or scanned image, run OCR, then copy or save the recognized text."},
      {q:"How do I extract text from a screenshot?",a:"Upload the screenshot to the OCR tool and copy the recognized text after processing."},
      {q:"Can I extract text from a photo on my phone?",a:"Yes. Open the OCR tool in a mobile browser, select the image, and copy the result."},
      {q:"What if image OCR is inaccurate?",a:"Use a sharp, upright image with sufficiently large text, and manually check names, numbers, URLs, and other critical characters."},
    ],
  },
  "compress-image-to-100kb": {
    zh: [
      {q:"图片怎么压缩到100KB以内？",a:"打开 100KB 图片压缩工具，选择图片后执行压缩，工具会自动逼近目标体积并显示实际结果。"},
      {q:"照片怎么压缩到100KB？",a:"上传照片并以 100KB 为目标进行压缩；原图像素很大时，先调整尺寸通常更容易兼顾清晰度。"},
      {q:"图片压不到100KB怎么办？",a:"先降低图片像素尺寸，再重新压缩；不要只反复降低质量，否则更容易变模糊。"},
      {q:"图片压缩到100KB会变模糊吗？",a:"压缩可能影响清晰度。建议先缩小过大的像素尺寸，再逼近 100KB，并检查最终图片。"},
    ],
    en: [
      {q:"How do I compress an image to under 100KB?",a:"Open the 100KB image compressor, select the image, run compression, and check the actual output size."},
      {q:"How do I make a photo smaller than 100KB?",a:"Set a 100KB target. If the original image is very large, reduce its pixel dimensions first to preserve better visual quality."},
      {q:"What if the image cannot reach 100KB?",a:"Reduce the image dimensions and compress again. Repeatedly lowering quality alone can make the image unnecessarily blurry."},
      {q:"Will compressing an image to 100KB make it blurry?",a:"It can. Reducing excessive pixel dimensions before compression often gives a better quality-size balance."},
    ],
  },
  "heic-to-jpg": {
    zh: [
      {q:"HEIC怎么转换成JPG？",a:"选择 HEIC/HEIF 图片，执行转换并保存 JPG。"},
      {q:"iPhone照片怎么转JPG？",a:"把 iPhone 的 HEIC 照片加入工具，转换为 JPG 后即可用于多数网站、Windows 软件和常见分享场景。"},
      {q:"HEIC转JPG会降低画质吗？",a:"JPG 是有损格式，导出质量会影响体积和细节。需要无损图像时可考虑 PNG。"},
      {q:"HEIC转JPG可以批量吗？",a:"可以，工具支持多张图片一起处理时，可一次选择多个 HEIC/HEIF 文件。"},
    ],
    en: [
      {q:"How do I convert HEIC to JPG?",a:"Select the HEIC/HEIF photos, run the conversion, and save the JPG results."},
      {q:"How do I convert iPhone photos to JPG?",a:"Add the iPhone HEIC photos to the converter and export JPG files for broader compatibility."},
      {q:"Does HEIC to JPG reduce quality?",a:"JPG is lossy, so output quality affects file size and detail. Use PNG when lossless output is more important."},
      {q:"Can I convert multiple HEIC photos at once?",a:"Yes, when batch selection is available you can process multiple HEIC/HEIF files together."},
    ],
  },
  "pdf-to-word": {
    zh: [
      {q:"PDF怎么转Word？",a:"上传 PDF 后执行转换，完成后下载 Word 文件并检查文字、表格和分页。"},
      {q:"PDF转Word后格式乱了怎么办？",a:"PDF 与 Word 的版式模型不同，复杂表格、字体和扫描件更容易出现变化。转换后应检查并从原 PDF 重新处理。"},
      {q:"扫描PDF可以转Word吗？",a:"扫描 PDF 通常需要 OCR 才能获得可编辑文字；转换前先确认页面是否包含文字层。"},
      {q:"PDF转Word能保持原格式吗？",a:"简单文字版式通常更容易保持，复杂排版不能保证完全一致，转换后应检查页面。"},
    ],
    en: [
      {q:"How do I convert PDF to Word?",a:"Upload the PDF, run the conversion, download the Word file, and review text, tables, and pagination."},
      {q:"Why is my PDF-to-Word formatting messed up?",a:"PDF and Word use different layout models. Complex tables, fonts, and scanned pages can change during conversion, so review the output."},
      {q:"Can a scanned PDF be converted to Word?",a:"Scanned PDFs generally need OCR to produce editable text. Check whether the PDF already contains a text layer."},
      {q:"Can PDF to Word keep the original formatting?",a:"Simple layouts are easier to preserve, but complex formatting cannot always be reproduced exactly. Review the converted document."},
    ],
  },
  "pdf-to-xlsx": {
    zh: [
      {q:"PDF怎么转Excel？",a:"上传 PDF 后提取其中的表格并生成 XLSX，完成后检查行列、数字和日期格式。"},
      {q:"PDF表格怎么转换成Excel？",a:"选择 PDF 转 Excel 工具，处理后打开 XLSX 检查表头、行列和数字是否正确。"},
      {q:"扫描PDF可以转Excel吗？",a:"扫描件没有文字层时通常需要 OCR；当前工具会根据文件类型提示合适的处理方式。"},
      {q:"PDF转Excel后数据错位怎么办？",a:"复杂表格、合并单元格和扫描件更容易出现错位。请保留原 PDF，并逐页核对转换后的行列和数字。"},
    ],
    en: [
      {q:"How do I convert PDF to Excel?",a:"Upload the PDF, extract its tables into XLSX, then check rows, columns, numbers, and dates."},
      {q:"How do I convert a PDF table to Excel?",a:"Use the PDF-to-Excel tool and review the resulting workbook for headers, columns, and numeric values."},
      {q:"Can a scanned PDF be converted to Excel?",a:"Scanned pages generally need OCR before structured table extraction. The tool indicates when OCR is required."},
      {q:"Why are PDF-to-Excel columns misaligned?",a:"Complex tables, merged cells, and scanned pages can cause structural differences. Keep the original PDF and verify the resulting rows and numbers."},
    ],
  },
  "pdf-to-jpg": {
    zh: [
      {q:"PDF怎么转JPG？",a:"上传 PDF，工具会把页面导出为独立 JPG 图片，完成后保存需要的页面。"},
      {q:"PDF怎么转成图片？",a:"使用 PDF 转 JPG，把 PDF 页面逐页转换成图片即可。"},
      {q:"PDF每一页怎么保存成图片？",a:"上传 PDF 后执行转换，结果会按页面生成对应图片。"},
      {q:"手机可以把PDF转图片吗？",a:"可以，手机浏览器打开工具即可处理。"},
    ],
    en: [
      {q:"How do I convert PDF to JPG?",a:"Upload the PDF and export each page as an individual JPG image."},
      {q:"How do I turn a PDF into images?",a:"Use the PDF-to-JPG tool to render the PDF pages into separate image files."},
      {q:"How do I save every PDF page as an image?",a:"Upload the PDF, run the conversion, and save the generated page images you need."},
      {q:"Can I convert PDF to images on a phone?",a:"Yes. Open the tool in a mobile browser and process the PDF there."},
    ],
  },
  "video-transcription": {
    zh: [
      {q:"视频怎么转文字？",a:"选择视频并开始转写，完成后检查文字结果，再复制或保存需要的内容。"},
      {q:"怎么把视频里的文字提取出来？",a:"如果文字来自语音，可用视频转文字提取语音内容；如果文字已经出现在画面中，则需要 OCR 类工具。"},
      {q:"视频转文字准确吗？",a:"转写结果会受口音、噪声、多人说话和音频质量影响。姓名、数字、时间等关键信息建议人工核对。"},
      {q:"手机可以视频转文字吗？",a:"可以，使用手机浏览器打开工具即可选择视频进行处理。"},
    ],
    en: [
      {q:"How do I convert a video to text?",a:"Select the video, start transcription, review the transcript, and copy or save the text you need."},
      {q:"How do I extract words from a video?",a:"For spoken words, use video transcription. For text visible inside the video frames, use an OCR workflow instead."},
      {q:"How accurate is video transcription?",a:"Accuracy depends on accents, noise, overlapping speakers, and audio quality. Review names, numbers, dates, and other critical details."},
      {q:"Can I transcribe a video on my phone?",a:"Yes. Open the tool in a mobile browser and select the video file."},
    ],
  },
  "audio-transcription": {
    zh: [
      {q:"录音怎么转文字？",a:"上传录音或音频文件开始转写，完成后复制或保存文字稿。"},
      {q:"会议录音怎么转文字？",a:"把会议录音加入音频转文字工具，转写完成后检查姓名、数字、日期和行动项。"},
      {q:"MP3可以转文字吗？",a:"可以，支持的音频格式以工具页面显示的范围为准。"},
      {q:"音频转文字准确吗？",a:"口音、背景噪声、多人同时说话等情况会影响结果。重要内容应对照原音频复核。"},
    ],
    en: [
      {q:"How do I convert a recording to text?",a:"Upload the recording or audio file, run transcription, then copy or save the transcript."},
      {q:"How do I transcribe a meeting recording?",a:"Add the meeting recording to the audio transcription tool and review names, numbers, dates, and action items afterward."},
      {q:"Can MP3 files be converted to text?",a:"Yes, when the MP3 format is supported by the tool. Check the current supported formats on the page."},
      {q:"How accurate is audio transcription?",a:"Accents, background noise, and overlapping speech can affect results. Verify important content against the original recording."},
    ],
  },
  "temp-mail": {
    zh: [
      {q:"临时邮箱是什么？",a:"临时邮箱是短期使用的收件地址，常用于接收验证码、激活链接和一次性通知。"},
      {q:"临时邮箱可以接收验证码吗？",a:"可以用于接收部分网站的验证邮件和验证码，但并非所有网站都接受一次性邮箱。"},
      {q:"临时邮箱安全吗？",a:"它适合低风险、短期场景，不适合银行、支付、政务或需要长期找回的重要账户。"},
      {q:"临时邮箱可以注册网站吗？",a:"部分网站可以使用，但有些服务会屏蔽一次性邮箱域名，请遵守目标网站的注册规则。"},
    ],
    en: [
      {q:"What is a temporary email?",a:"A temporary email is a short-lived inbox commonly used for verification emails, activation links, and one-time notifications."},
      {q:"Can a temporary email receive verification codes?",a:"It can receive verification emails and codes from some services, but some websites block disposable email domains."},
      {q:"Is temporary email safe?",a:"It is best for low-risk, short-term uses. Do not use it for banking, payments, government services, or important accounts that need recovery."},
      {q:"Can I use a temporary email to register on websites?",a:"Some websites accept it, while others block disposable addresses. Follow the target service's registration rules."},
    ],
  },
  "remove-exif": {
    zh: [
      {q:"怎么删除图片EXIF？",a:"选择图片并执行 EXIF 清理，处理后保存新的图片文件。"},
      {q:"怎么删除照片GPS位置？",a:"照片中的 GPS 信息通常属于 EXIF 元数据，可使用图片 EXIF 清理工具删除。"},
      {q:"图片元数据怎么清除？",a:"上传图片后执行元数据清理，完成后使用新文件分享。"},
      {q:"删除EXIF会影响图片画质吗？",a:"清理元数据本身不是为了改变画面内容，但导出格式和处理方式仍应以最终文件为准。"},
    ],
    en: [
      {q:"How do I remove EXIF from a photo?",a:"Select the image, run EXIF cleanup, and save the resulting image as a new file."},
      {q:"How do I remove GPS location from a photo?",a:"GPS coordinates are commonly stored in EXIF metadata. Use the EXIF cleanup tool to remove that metadata."},
      {q:"How do I clear image metadata?",a:"Upload the image, run metadata cleanup, and share the cleaned output instead of the original."},
      {q:"Does removing EXIF reduce image quality?",a:"Metadata cleanup is not intended to change the visible image, but the final export format and processing should still be checked."},
    ],
  },
  "file-type-detector": {
    zh: [
      {q:"怎么检测文件真实格式？",a:"选择文件后检查文件内容识别出的真实类型，并与文件扩展名进行对照。"},
      {q:"文件后缀改了怎么判断真实格式？",a:"不要只看文件名后缀。使用真实格式检测工具查看文件内容对应的类型。"},
      {q:"怎么判断一个文件是不是PDF？",a:"选择文件进行真实格式检测，比单看 .pdf 后缀更可靠。"},
    ],
    en: [
      {q:"How do I detect a file's real format?",a:"Select the file and compare the detected content type with its filename extension."},
      {q:"How can I tell whether a file extension was changed?",a:"Do not rely only on the filename. Use real file type detection to inspect the file's content signature."},
      {q:"How can I check whether a file is really a PDF?",a:"Run the real file type detector instead of trusting the .pdf extension alone."},
    ],
  },
  "ai-image-check": {
    zh: [
      {q:"怎么判断一张图片是不是AI生成的？",a:"先查看来源和内容凭证，再结合图片检测结果判断。检测分数属于参考线索，不能单独证明图片来源。"},
      {q:"AI图片检测准吗？",a:"检测结果存在误判可能。图片压缩、裁剪、截图和编辑都会影响可检测特征，重要内容应结合原文件和来源继续核验。"},
      {q:"图片没有EXIF还能检测AI吗？",a:"可以尝试检测，但缺少 EXIF 或内容凭证会减少可用证据。没有元数据不等于图片就是 AI 生成。"},
      {q:"C2PA和AI图片检测有什么区别？",a:"C2PA 用于验证文件中存在的来源声明和签名链；AI 检测用于分析可能的生成特征，两者回答的问题不同。"},
    ],
    en: [
      {q:"How can I tell whether an image was AI-generated?",a:"Check the source and content credentials first, then use AI-analysis results as additional evidence. A detector score alone does not prove provenance."},
      {q:"How accurate are AI image detectors?",a:"Detectors can make mistakes. Compression, cropping, screenshots, and editing can change detectable signals, so important cases need source verification."},
      {q:"Can an AI detector work without EXIF data?",a:"It can still attempt image analysis, but missing EXIF or content credentials removes some evidence. Missing metadata does not mean an image is AI-generated."},
      {q:"What is the difference between C2PA and AI image detection?",a:"C2PA verifies signed provenance claims embedded in supported files; AI detection analyzes possible generation characteristics. They answer different questions."},
    ],
  },
  "ai-video-audio-check": {
    zh: [
      {q:"怎么检测AI生成的视频？",a:"上传视频并查看代表性画面或检测结果，再结合来源和文件信息判断。"},
      {q:"怎么检测AI生成的音频？",a:"上传支持的音频文件进行分析，并把结果作为参考线索；重要内容仍应结合来源核验。"},
      {q:"AI视频检测100%准确吗？",a:"不能保证。压缩、重新编码、剪辑和模型变化都会影响检测结果。"},
    ],
    en: [
      {q:"How do I check whether a video is AI-generated?",a:"Upload the video, review representative frames and the analysis result, then compare it with source and file evidence."},
      {q:"How do I detect AI-generated audio?",a:"Upload a supported audio file for analysis and treat the result as evidence rather than absolute proof."},
      {q:"Are AI video detectors 100% accurate?",a:"No detector can guarantee that. Re-encoding, editing, compression, and changes in generation models can affect results."},
    ],
  },
};

function genericItems(slug:string,locale:SeoLocale):SearchFaqItem[] {
  const tool=getGlobalTool(slug);
  if(!tool)return [];
  const n=toolTitle(locale,tool);
  const answerUse = L(
    `打开${n}，按页面提示选择文件或输入内容，完成处理后检查结果再保存。`,
    `Open ${n}, follow the page prompts, process the file or input, then review the result before saving.`,
    `「${n}」を開き、画面の案内に従ってファイルや内容を選び、処理後に結果を確認して保存します。`,
    `${n}을(를) 열고 화면 안내에 따라 파일이나 내용을 선택한 뒤 결과를 확인하고 저장하세요.`,
    `Ouvrez ${n}, suivez les indications, traitez le fichier ou le contenu, puis vérifiez le résultat avant de l’enregistrer.`,
    `Öffne ${n}, folge den Hinweisen, verarbeite die Datei oder Eingabe und prüfe das Ergebnis vor dem Speichern.`,
    `Abre ${n}, sigue las indicaciones, procesa el archivo o contenido y revisa el resultado antes de guardarlo.`,
    `Abra ${n}, siga as instruções, processe o arquivo ou conteúdo e confira o resultado antes de salvar.`,
    `افتح ${n} واتبع التعليمات لمعالجة الملف أو المحتوى ثم راجع النتيجة قبل الحفظ.`
  )[locale];
  const answerMobile = L(
    "可以直接用手机浏览器打开；具体输入格式和大小以工具页面为准。",
    "You can open it in a mobile browser; supported formats and limits are shown on the tool page.",
    "スマホのブラウザで開けます。対応形式と容量はツールページで確認してください。",
    "휴대폰 브라우저에서 사용할 수 있으며 지원 형식과 제한은 도구 페이지에서 확인하세요.",
    "Vous pouvez l’ouvrir dans un navigateur mobile ; les formats et limites sont indiqués sur la page.",
    "Du kannst es im mobilen Browser öffnen; Formate und Limits stehen auf der Tool-Seite.",
    "Puedes abrirlo en un navegador móvil; los formatos y límites aparecen en la página de la herramienta.",
    "Você pode abrir no navegador do celular; os formatos e limites aparecem na página da ferramenta.",
    "يمكن فتحه في متصفح الهاتف؛ راجع الصيغ والحدود في صفحة الأداة."
  )[locale];
  const answerFree = L(
    "是否免费以工具页面当前显示为准；付费步骤会在执行前显示费用。",
    "Check the current tool page for pricing; any paid step shows its cost before execution.",
    "無料・有料は現在のツールページに表示されます。有料工程は実行前に料金を表示します。",
    "무료·유료 여부는 현재 도구 페이지에서 확인할 수 있으며 유료 단계는 실행 전에 비용을 표시합니다.",
    "Vérifiez le tarif actuel sur la page ; toute étape payante affiche son coût avant exécution.",
    "Prüfe den aktuellen Preis auf der Tool-Seite; kostenpflichtige Schritte zeigen die Kosten vor der Ausführung.",
    "Consulta el precio actual en la página; los pasos de pago muestran el coste antes de ejecutarse.",
    "Confira o preço atual na página; etapas pagas mostram o custo antes da execução.",
    "تحقق من السعر الحالي في صفحة الأداة؛ تعرض الخطوات المدفوعة التكلفة قبل التنفيذ."
  )[locale];
  const answerPrivacy = L(
    "处理方式以工具页面显示为准；本地工具会在浏览器中直接处理，在线工具会明确说明在线处理方式。",
    "The tool page states the processing method. Local tools process in the browser; online tools identify when online processing is used.",
    "処理方式はツールページに表示されます。ローカル処理はブラウザ内、オンライン処理はオンライン処理であることを明示します。",
    "처리 방식은 도구 페이지에 표시됩니다. 로컬 도구는 브라우저에서 처리하고 온라인 도구는 온라인 처리를 명시합니다.",
    "La page indique le mode de traitement. Les outils locaux traitent dans le navigateur ; les outils en ligne l’indiquent clairement.",
    "Die Tool-Seite nennt die Verarbeitung. Lokale Tools arbeiten im Browser; Online-Tools weisen auf Online-Verarbeitung hin.",
    "La página indica el método de procesamiento. Las herramientas locales procesan en el navegador; las online lo indican.",
    "A página informa o modo de processamento. Ferramentas locais processam no navegador; as online informam o uso online.",
    "توضح صفحة الأداة طريقة المعالجة؛ الأدوات المحلية تعالج في المتصفح والأدوات المتصلة توضح المعالجة عبر الإنترنت."
  )[locale];
  return [
    {q:GENERIC.use[locale](n),a:answerUse},
    {q:GENERIC.mobile[locale](n),a:answerMobile},
    {q:GENERIC.free[locale](n),a:answerFree},
    {q:GENERIC.privacy[locale](n),a:answerPrivacy},
  ];
}

export function searchIntentFaq(slug:string,locale:SeoLocale):SearchFaqItem[] {
  const override=OVERRIDES[slug]?.[locale];
  if(override?.length)return override;
  const bilingual=OVERRIDES[slug];
  if(locale!=="zh"&&locale!=="en"){
    // Keep high-demand pages useful in every language without pretending
    // we have first-party query volume for those locales.
    return genericItems(slug,locale);
  }
  return bilingual?.zh || bilingual?.en ? genericItems(slug,locale) : genericItems(slug,locale);
}

export function searchFaqTitle(locale:SeoLocale){return SECTION_TITLE[locale];}
export function searchFaqIntro(locale:SeoLocale){return SECTION_INTRO[locale];}
export function searchFaqQueries(slug:string,locale:SeoLocale){
  return searchIntentFaq(slug,locale).map(item=>item.q);
}
