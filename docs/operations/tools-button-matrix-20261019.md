# 全站逐按钮审计台账（持续执行）

公开工具 123 个；真实浏览器初始控件 450 项；33 个工具已有本轮交互轨迹。

状态保持待逐项核验。控件出现、发生点击、下载产物正确、微信实际收件分别记录；下表不表示全站已通过。输出后按钮、弹窗和选项分支还要按操作轨迹继续补齐。

已完成专项：复印排版 42 步/12 份 PDF；图片转 PDF 22 步/19 组参数；PDF 经微信附件发送、打开、另存的字节核对；PNG 经网站复制、微信粘贴发送、另存的像素核对。原生系统分享至 Weixin 仍复现失败。

| 工具 | 初始控件与选项（待核验） | 已记录交互次数 |
| --- | --- | ---: |
| 音频转文字 (audio-transcription) | INPUT(file): [无可读标签] | 0 |
| PDF / 文档翻译 (document-translate) | INPUT(file): [无可读标签]<br>SELECT(select-one): SourceDetect automatically中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [auto=Detect automatically; zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=D<br>SELECT(select-one): Target中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=Deutsch; es=Español; pt=Português; ar=العربية]<br>TEXTAREA(textarea): Glossary (source = target per line, up to 30)<br>BUTTON(submit): Translate [初始禁用] | 0 |
| 网址生成推广视频 (url-to-video) | INPUT(url): Website or product URL<br>BUTTON(submit): Read page [初始禁用]<br>INPUT(text): Audience<br>SELECT(select-one): ChannelYouTube ShortsTikTokInstagram ReelsWebsite [YouTube Shorts=YouTube Shorts; TikTok=TikTok; Instagram Reels=Instagram Reels; Website=Website]<br>SELECT(select-one): seconds [12=12 seconds; 24=24 seconds; 36=36 seconds; 60=60 seconds]<br>SELECT(select-one): Resolution [720p=720p; 1080p=1080p; 4k=4k]<br>BUTTON(submit): Review and continue in SASI [初始禁用] | 0 |
| 批量图片处理 (batch-image) | INPUT(file): [无可读标签]<br>INPUT(number): Max width px<br>INPUT(number): Quality 0.4–0.95<br>SELECT(select-one): Output formatJPGPNGWebP [image/jpeg=JPG; image/png=PNG; image/webp=WebP]<br>BUTTON(submit): Process batch [初始禁用] | 0 |
| AVIF 转 JPG (avif-to-jpg) | INPUT(file): [无可读标签]<br>SELECT(select-one): Output formatJPGPNGWebP [image/jpeg=JPG; image/png=PNG; image/webp=WebP]<br>INPUT(range): Quality 92%<br>BUTTON(submit): Convert [初始禁用] | 0 |
| Base64 编码解码 (base64-encode-decode) | TEXTAREA(textarea): Input text<br>SELECT(select-one): DirectionEncodeDecode [encode=Encode; decode=Decode]<br>BUTTON(submit): Start processing<br>TEXTAREA(textarea): Result<br>BUTTON(submit): Copy result [初始禁用] | 0 |
| 批量图片去水印 (batch-image-watermark-remover) | INPUT(file): [无可读标签] | 0 |
| 图片压缩 (compress-image) | INPUT(file): [无可读标签]<br>INPUT(number): Target size (KB)<br>INPUT(number): Quality seed (0.4–0.95)<br>BUTTON(button): Process now [初始禁用] | 0 |
| 图片压缩到 200KB (compress-image-to-200kb) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 图片压缩到 100KB (compress-image-to-100kb) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 图片压缩到 20KB (compress-image-to-20kb) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 图片压缩到 500KB (compress-image-to-500kb) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 图片压缩到 50KB (compress-image-to-50kb) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| PDF 压缩 (compress-pdf) | INPUT(file): [无可读标签]<br>SELECT(select-one): Compression presetHigh quality · largerBalancedSmaller file [high=High quality · larger; balanced=Balanced; small=Smaller file]<br>BUTTON(button): Process now [初始禁用] | 0 |
| CSV / TSV 转 Excel (csv-to-xlsx) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 证件复印排版 (document-copy-layout) | INPUT(file): [无可读标签]<br>INPUT(file): [无可读标签]<br>INPUT(radio): Black & white<br>INPUT(radio): Grayscale<br>INPUT(radio): Original color<br>INPUT(checkbox): Add purpose text<br>BUTTON(submit): Create A4 PDF [初始禁用] | 56 |
| DOCX 转 TXT (docx-to-txt) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| PDF 电子签名 (e-sign-pdf) | INPUT(file): Choose file | 12 |
| 文件一致性对比 (file-compare) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 文件真实格式检测 (file-type-detector) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| HEIC 转换 (heic-local) | INPUT(file): [无可读标签]<br>BUTTON(submit): Convert to JPG [初始禁用] | 0 |
| HEIC 转 JPG (heic-to-jpg) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| AI 证件照 (id-photo-ai) | INPUT(file): [无可读标签]<br>SELECT(select-one): Size25×35 mm photo35×49 mm photoPassport/visa 35×45 mmSquare portrait 600×600 [cn-1inch=25×35 mm photo; cn-2inch=35×49 mm photo; passport-35x45=Passport/visa 35<br>INPUT(range): Subject size<br>INPUT(range): Horizontal position<br>INPUT(range): Vertical position<br>BUTTON(button): White background<br>BUTTON(button): Blue background<br>BUTTON(button): Red background<br>BUTTON(button): Gray background | 0 |
| 阅后即焚 (burn-after-read) | TEXTAREA(textarea): 输入要分享的私密内容，也可以只上传文件…<br>INPUT(file): 添加附件<br>BUTTON(button): 阅后即焚适合一次性私密内容。<br>BUTTON(button): 定时焚毁到指定时间后自动失效。<br>BUTTON(button): 限次焚毁达到设定查看次数后失效。<br>BUTTON(button): 极速焚毁打开后开始倒计时，适合密码、验证码和短消息。<br>SELECT(select-one): 链接有效期10分钟1小时24小时3天7天 [10=10分钟; 60=1小时; 1440=24小时; 4320=3天; 10080=7天]<br>BUTTON(submit): 生成私密链接 [初始禁用]<br>SUMMARY: 为什么处理较慢？<br>SUMMARY: 怎样保存或发给朋友？<br>SUMMARY: 什么时候需要付费？<br>SUMMARY: 怎么用阅后即焚？<br>SUMMARY: 阅后即焚手机上能用吗？<br>SUMMARY: 阅后即焚免费吗？<br>SUMMARY: 阅后即焚处理文件时会上传吗？ | 0 |
| 图片转 PDF (image-to-pdf) | INPUT(file): [无可读标签]<br>BUTTON(submit): Create PDF [初始禁用] | 8 |
| 图片转 PDF (image-to-pdf-pro) | INPUT(file): [无可读标签]<br>BUTTON(submit): Create PDF [初始禁用] | 0 |
| 图片翻译 (image-translator) | INPUT(file): [无可读标签]<br>SELECT(select-one): Text in image中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=Deutsch; es=Español; pt=Português; ar=الع<br>SELECT(select-one): Translate to中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=Deutsch; es=Español; pt=Português; ar=العر | 0 |
| 图片去水印 (image-watermark-remover) | INPUT(file): [无可读标签] | 0 |
| JPG 转 PNG (jpg-to-png) | INPUT(file): [无可读标签]<br>BUTTON(submit): Convert · JPG to PNG [初始禁用] | 0 |
| JSON 格式化 / 修复 (json-formatter) | TEXTAREA(textarea): { "hello": "lingxi" }<br>BUTTON(button): Pretty print<br>BUTTON(button): Minify | 14 |
| 长图拼接 (long-image) | INPUT(file): [无可读标签]<br>SELECT(select-one): DirectionTop to bottomLeft to right [vertical=Top to bottom; horizontal=Left to right]<br>SELECT(select-one): AlignmentStartCenterEnd [start=Start; center=Center; end=End]<br>INPUT(number): Gap px<br>INPUT(number): Maximum edge per image (px)<br>INPUT(color): Background<br>SELECT(select-one): Output formatJPGPNGWebP [image/jpeg=JPG; image/png=PNG; image/webp=WebP]<br>INPUT(range): Output quality 92%<br>BUTTON(submit): Create long image [初始禁用] | 0 |
| PDF 合并 (merge-pdf) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| MD5 / SHA256 校验 (md5-sha256) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 图片 OCR (ocr) | INPUT(file): [无可读标签]<br>SELECT(select-one): Recognition languageSimplified Chinese + EnglishTraditional Chinese + EnglishEnglishJapanese + English한국어 + EnglishFrançais + EnglishDeutsch + EnglishEspañol + <br>BUTTON(submit): Extract text [初始禁用] | 0 |
| PDF 压缩 (pdf-compress) | INPUT(file): [无可读标签]<br>BUTTON(submit): Light<br>BUTTON(submit): Recommended<br>BUTTON(submit): Strong<br>BUTTON(submit): Compress PDF [初始禁用] | 0 |
| PDF 编辑 (pdf-editor) | INPUT(file): Choose file | 7 |
| PDF 合并 / 拆分 (pdf-merge-split) | INPUT(file): [无可读标签]<br>INPUT(text): Page range (extract / rotate)<br>BUTTON(submit): Merge PDFs [初始禁用]<br>BUTTON(submit): Extract pages [初始禁用]<br>BUTTON(submit): Rotate selected pages 90° [初始禁用] | 0 |
| PDF 页面整理 (pdf-pages) | INPUT(file): [无可读标签]<br>BUTTON(submit): Preview [初始禁用] | 0 |
| PDF OCR (pdf-ocr) | INPUT(file): [无可读标签]<br>SELECT(select-one): Simplified Chinese + EnglishTraditional Chinese + EnglishEnglishJapanese + English한국어 + English [chi_sim+eng=Simplified Chinese + English; chi_tra+eng=Tradition | 0 |
| 手写文字识别 (handwriting-ocr) | INPUT(file): [无可读标签]<br>SELECT(select-one): Recognition modeEnglish handwritingMultilingual text and neat handwriting [english-handwriting=English handwriting; multilingual=Multilingual text and neat hand | 0 |
| PDF 永久脱敏 (pdf-redact) | INPUT(file): [无可读标签] | 41 |
| PDF 转 Excel (pdf-to-xlsx) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| PDF 转 Word (pdf-to-word) | INPUT(file): [无可读标签]<br>SELECT(select-one): Word output modeEditable + layout-preserving versionsEditable WordLayout-preserving Word [both=Editable + layout-preserving versions; editable=Editable Word; vi<br>SELECT(select-one): OCR language for scansSimplified Chinese + EnglishTraditional Chinese + EnglishEnglishJapanese + English한국어 + EnglishFrançais + EnglishDeutsch + EnglishEspañol <br>INPUT(checkbox): Automatically OCR scanned pages with insufficient text | 0 |
| PDF 加水印 (pdf-watermark) | INPUT(file): [无可读标签]<br>INPUT(text): Watermark text<br>INPUT(number): Font size<br>INPUT(range): Opacity 18%<br>BUTTON(submit): Add PDF watermark [初始禁用] | 0 |
| PDF 加页码 (pdf-page-numbers) | INPUT(file): [无可读标签]<br>INPUT(number): Distance from bottom (pt)<br>BUTTON(submit): Add PDF page numbers [初始禁用] | 0 |
| 食物卡路里分析 (food-calorie) | BUTTON(button): Upload image<br>BUTTON(button): Multiple images<br>BUTTON(button): Enter foods<br>INPUT(file): Upload image | 0 |
| PDF 裁边 (pdf-crop) | INPUT(file): [无可读标签]<br>INPUT(number): Crop each edge (pt)<br>BUTTON(submit): Crop PDF [初始禁用] | 0 |
| PDF 扁平化 (pdf-flatten) | INPUT(file): [无可读标签]<br>BUTTON(submit): Flatten PDF [初始禁用] | 0 |
| PDF 比较 (pdf-compare) | INPUT(file): [无可读标签]<br>BUTTON(submit): Compare PDFs [初始禁用] | 0 |
| PDF 转 TXT (pdf-to-text) | INPUT(file): [无可读标签]<br>BUTTON(submit): PDF to text [初始禁用] | 0 |
| JFIF 转 JPG (jfif-to-jpg) | INPUT(file): [无可读标签]<br>SELECT(select-one): Output formatJPGPNGWebP [image/jpeg=JPG; image/png=PNG; image/webp=WebP]<br>INPUT(range): Quality 92%<br>BUTTON(submit): Convert [初始禁用] | 0 |
| PDF 转 Markdown (pdf-to-markdown) | INPUT(file): [无可读标签]<br>BUTTON(submit): PDF to Markdown [初始禁用] | 0 |
| BMP 转 PNG (bmp-to-png) | INPUT(file): [无可读标签]<br>SELECT(select-one): Output formatJPGPNGWebP [image/jpeg=JPG; image/png=PNG; image/webp=WebP]<br>BUTTON(submit): Convert [初始禁用] | 80 |
| ICO 转 PNG (ico-to-png) | INPUT(file): [无可读标签]<br>SELECT(select-one): Output formatJPGPNGWebP [image/jpeg=JPG; image/png=PNG; image/webp=WebP]<br>BUTTON(submit): Convert [初始禁用] | 0 |
| GIF 转 JPG (gif-to-jpg) | INPUT(file): [无可读标签]<br>SELECT(select-one): Output formatJPGPNGWebP [image/jpeg=JPG; image/png=PNG; image/webp=WebP]<br>INPUT(range): Quality 92%<br>BUTTON(submit): Convert [初始禁用] | 0 |
| ICS 转 CSV (ics-to-csv) | INPUT(file): [无可读标签]<br>BUTTON(submit): Process [初始禁用] | 0 |
| ODT 转 TXT (odt-to-txt) | INPUT(file): [无可读标签]<br>BUTTON(submit): Process [初始禁用] | 6 |
| EPUB 转 TXT (epub-to-txt) | INPUT(file): [无可读标签]<br>BUTTON(submit): Process [初始禁用] | 6 |
| VCF 转 CSV (vcf-to-csv) | INPUT(file): [无可读标签]<br>BUTTON(submit): Process [初始禁用] | 0 |
| UUID / ULID 生成器 (uuid-generator) | SELECT(select-one): TypeUUID v4ULID [uuid=UUID v4; ulid=ULID]<br>INPUT(number): Count<br>BUTTON(submit): Generate | 18 |
| PDF 栅格化 (pdf-rasterize) | INPUT(file): [无可读标签]<br>SELECT(select-one): Render scale1×1.5×2× [1=1×; 1.5=1.5×; 2=2×]<br>BUTTON(submit): Process [初始禁用] | 20 |
| 删除 PDF 元数据 (pdf-remove-metadata) | INPUT(file): [无可读标签]<br>BUTTON(submit): Process [初始禁用] | 0 |
| PDF 页面拆半 (pdf-halve-pages) | INPUT(file): [无可读标签]<br>SELECT(select-one): Split directionSplit left/right · landscape A3 → two A4 pagesSplit top/bottom · tall page → two pages [left-right=Split left/right · landscape A3 → two A4 pages<br>SELECT(select-one): Output orderLeft→right / top→bottomRight→left / bottom→top [first-second=Left→right / top→bottom; second-first=Right→left / bottom→top]<br>BUTTON(submit): Split pages in half [初始禁用] | 0 |
| PDF 多页合一 (pdf-pages-per-sheet) | INPUT(file): [无可读标签]<br>SELECT(select-one): Pages per sheet2469 [2=2; 4=4; 6=6; 9=9]<br>BUTTON(submit): Process [初始禁用] | 0 |
| 视频循环 (loop-video) | INPUT(file): [无可读标签]<br>INPUT(number): Loop count | 0 |
| 视频倒放 (reverse-video) | INPUT(file): [无可读标签]<br>INPUT(range): Reverse speed 1.00×<br>INPUT(checkbox): Mute output | 0 |
| PDF 全文搜索 (pdf-search) | INPUT(file): [无可读标签]<br>INPUT(text): Enter a name, contract number, keyword or regular expression…<br>INPUT(checkbox): Case sensitive<br>INPUT(checkbox): Regular expression<br>BUTTON(submit): Search all PDFs [初始禁用] | 0 |
| 视频定格 (stop-motion-video) | INPUT(file): [无可读标签]<br>SELECT(select-one): Take one frame every0.2 sec0.4 sec0.6 sec0.8 sec1 sec1.5 sec2 sec3 sec [0.2=0.2 sec; 0.4=0.4 sec; 0.6=0.6 sec; 0.8=0.8 sec; 1=1 sec; 1.5=1.5 sec; 2=2 sec; 3=3 s<br>SELECT(select-one): Playback rate6 fps8 fps10 fps12 fps15 fps20 fps24 fps [6=6 fps; 8=8 fps; 10=10 fps; 12=12 fps; 15=15 fps; 20=20 fps; 24=24 fps]<br>INPUT(checkbox): Add a reverse pass for a back-and-forth effect | 0 |
| 文本对比 (text-diff) | TEXTAREA(textarea): A<br>TEXTAREA(textarea): B<br>BUTTON(button): Run | 0 |
| 正则表达式测试 (regex-tester) | INPUT(text): /pattern/gi<br>TEXTAREA(textarea): Test text<br>BUTTON(button): Run | 12 |
| XML 格式化 (xml-formatter) | TEXTAREA(textarea): Paste or type here<br>BUTTON(button): Run | 8 |
| CSV 转 JSON (csv-json) | TEXTAREA(textarea): Paste or type here<br>BUTTON(button): Run | 0 |
| JWT 解码 (jwt-decoder) | TEXTAREA(textarea): eyJ...<br>BUTTON(button): Run | 0 |
| URL 解析 (url-parser) | TEXTAREA(textarea): https://example.com/path?a=1<br>BUTTON(button): Run | 0 |
| 大小写转换 (case-converter) | TEXTAREA(textarea): Paste or type here<br>SELECT(select-one): camelCasePascalCasesnake_casekebab-caseUPPERCASElowercase [camel=camelCase; pascal=PascalCase; snake=snake_case; kebab=kebab-case; upper=UPPERCASE; lower=lowerc<br>BUTTON(button): Run | 8 |
| 进制转换 (number-base-converter) | TEXTAREA(textarea): 255<br>INPUT(number): From<br>INPUT(number): To<br>BUTTON(button): Run | 0 |
| Cron 表达式解析器 (cron-parser) | INPUT(text): Cron expression<br>INPUT(number): Number of results | 0 |
| 批量 PDF 工作台 (batch-pdf) | INPUT(file): [无可读标签]<br>INPUT(checkbox): Remove title, author, keywords and common file details<br>SELECT(select-one): Rotate every pageNo rotation90°180°270° [0=No rotation; 90=90°; 180=180°; 270=270°]<br>INPUT(text): Text watermark<br>INPUT(checkbox): Add page numbers to each PDF<br>INPUT(checkbox): Fix form fields into the PDF for consistent display<br>INPUT(checkbox): Merge into one PDF after processing | 0 |
| 音频降噪 / 人声增强 (audio-cleanup) | INPUT(file): [无可读标签]<br>BUTTON(button): Voice clarity<br>BUTTON(button): Reduce background noise<br>BUTTON(button): Normalize loudness<br>BUTTON(button): Reduce low-frequency hum<br>BUTTON(submit): Preview the first 30 seconds free [初始禁用] | 0 |
| PDF 转 JPG (pdf-to-jpg) | INPUT(file): PDF and image files are processed on this device. Office documents are sent to the conversion service only after your confirmation.<br>INPUT(text): Pages<br>SELECT(select-one): FormatJPGPNG [jpeg=JPG; png=PNG]<br>SELECT(select-one): Scale1x1.5x2x3x [1=1x; 1.5=1.5x; 2=2x; 3=3x]<br>INPUT(number): JPG<br>BUTTON(submit): Convert [初始禁用] | 0 |
| PPTX 转 TXT (pptx-to-txt) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 6 |
| PNG 转 JPG (png-to-jpg) | INPUT(file): [无可读标签]<br>INPUT(range): Output quality92%<br>BUTTON(submit): Convert · PNG to JPG [初始禁用] | 0 |
| 二维码读取 (qr-code-reader) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 文件隐私清理 (privacy-cleaner) | INPUT(file): [无可读标签]<br>BUTTON(submit): Scan metadata [初始禁用]<br>BUTTON(submit): Clean & export [初始禁用] | 0 |
| 二维码生成 (qr-code-generator) | BUTTON(submit): url<br>BUTTON(submit): wifi<br>BUTTON(submit): vcard<br>BUTTON(submit): email<br>BUTTON(submit): sms<br>BUTTON(submit): tel<br>BUTTON(submit): geo<br>BUTTON(submit): event<br>BUTTON(submit): text<br>INPUT(text): URL<br>BUTTON(submit): Generate QR | 12 |
| 二维码安全识别 (qr-safe-reader) | INPUT(file): [无可读标签]<br>BUTTON(submit): Read QR code [初始禁用] | 0 |
| 删除空白行 (remove-empty-lines) | TEXTAREA(textarea): Input text<br>BUTTON(submit): Start processing<br>TEXTAREA(textarea): Result<br>BUTTON(submit): Copy result [初始禁用] | 0 |
| 文本去重行 (remove-duplicate-lines) | TEXTAREA(textarea): Input text<br>BUTTON(submit): Start processing<br>TEXTAREA(textarea): Result<br>BUTTON(submit): Copy result [初始禁用] | 0 |
| 图片尺寸修改 (resize-image) | INPUT(file): [无可读标签] | 58 |
| 清除图片 EXIF / 元数据 (remove-exif) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 截图打码 / 脱敏 (screenshot-redact) | INPUT(file): [无可读标签]<br>BUTTON(button): Scroll image [初始禁用]<br>BUTTON(button): Draw redaction [初始禁用]<br>BUTTON(button): Black<br>BUTTON(button): Blur<br>BUTTON(button): Pixelate<br>BUTTON(button): Undo last [初始禁用]<br>BUTTON(button): Clear [初始禁用]<br>BUTTON(submit): Export redacted image [初始禁用] | 36 |
| 字幕翻译 (subtitle-translate) | INPUT(file): [无可读标签]<br>SELECT(select-one): Source language中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=Deutsch; es=Español; pt=Português; ar=ا<br>SELECT(select-one): Target language中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=Deutsch; es=Español; pt=Português; ar=ا<br>INPUT(checkbox): Use online translation | 46 |
| PDF 拆分 (split-pdf) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 0 |
| 字幕 SRT / VTT 工具 (subtitle-tools) | INPUT(file): Load SRT / VTTYou can also paste subtitle text.<br>TEXTAREA(textarea): [无可读标签]<br>INPUT(number): Global shift (ms)<br>INPUT(number): Time scale ×<br>INPUT(number): Source FPS<br>INPUT(number): Target FPS<br>INPUT(checkbox): Trim subtitle whitespace and empty lines<br>BUTTON(submit): Create SRT / VTT / TXT [初始禁用] | 0 |
| SVG 转 PNG (svg-to-png) | INPUT(file): [无可读标签]<br>SELECT(select-one): Output scale1x2x3x4x [1=1x; 2=2x; 3=3x; 4=4x]<br>BUTTON(submit): Convert to PNG [初始禁用] | 0 |
| 字数与字符统计 (text-counter) | TEXTAREA(textarea): Input text<br>BUTTON(submit): Start processing<br>TEXTAREA(textarea): Result<br>BUTTON(submit): Copy result [初始禁用] | 4 |
| 时间戳转换 (timestamp-converter) | BUTTON(submit): Timestamp / date<br>BUTTON(submit): Batch<br>BUTTON(submit): JWT time<br>BUTTON(submit): Excel / Sheets<br>INPUT(text): 1791093560 / 2026-10-04T05:59:20Z<br>SELECT(select-one): Auto-detectsecondsmillisecondsmicrosecondsnanoseconds [auto=Auto-detect; s=seconds; ms=milliseconds; us=microseconds; ns=nanoseconds]<br>BUTTON(submit): Now<br>BUTTON(submit): UTC<br>BUTTON(submit): Asia/Shanghai<br>BUTTON(submit): Asia/Singapore<br>BUTTON(submit): Asia/Tokyo<br>BUTTON(submit): Asia/Seoul<br>BUTTON(submit): Asia/Kolkata<br>BUTTON(submit): Asia/Dubai<br>BUTTON(submit): Europe/London<br>BUTTON(submit): Europe/Paris<br>BUTTON(submit): Europe/Berlin<br>BUTTON(submit): America/New_York<br>BUTTON(submit): America/Chicago<br>BUTTON(submit): America/Denver<br>BUTTON(submit): America/Los_Angeles<br>BUTTON(submit): America/Sao_Paulo<br>BUTTON(submit): Australia/Sydney | 0 |
| URL 编码解码 (url-encode-decode) | TEXTAREA(textarea): Input text<br>SELECT(select-one): DirectionEncodeDecode [encode=Encode; decode=Decode]<br>BUTTON(submit): Start processing<br>TEXTAREA(textarea): Result<br>BUTTON(submit): Copy result [初始禁用] | 0 |
| 视频配音 (video-dubbing) | INPUT(file): [无可读标签]<br>SELECT(select-one): Source language中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=Deutsch; es=Español; pt=Português; ar=ا<br>SELECT(select-one): Dubbing language中文English日本語한국어FrançaisDeutschEspañolPortuguêsالعربية [zh=中文; en=English; ja=日本語; ko=한국어; fr=Français; de=Deutsch; es=Español; pt=Português; ar= | 0 |
| 视频翻译 (video-translate) | INPUT(file): [无可读标签]<br>TEXTAREA(textarea): https://v.douyin.com/... https://www.tiktok.com/... https://xhslink.com/... https://v.kuaishou.com/...<br>BUTTON(button): Load links 0 [初始禁用]<br>SELECT(select-one): Source languageAuto-detectChineseEnglishJapanese한국어FrançaisDeutschEspañolPortuguêsالعربية [auto=Auto-detect; zh=Chinese; en=English; ja=Japanese; ko=한국어; fr=Fra<br>SELECT(select-one): Output modeTranslated subtitles + high-quality MP4 with original audioTranslated subtitles + high-quality AI-dubbed MP4 [subtitle=Translated subtitles + high-qu<br>BUTTON(button): Chinese<br>BUTTON(button): English<br>BUTTON(button): Japanese<br>BUTTON(button): 한국어<br>BUTTON(button): Français<br>BUTTON(button): Deutsch<br>BUTTON(button): Español<br>BUTTON(button): Português<br>BUTTON(button): العربية | 0 |
| 视频压缩 / 裁剪 / 提取音频 (video-toolkit) | INPUT(file): [无可读标签]<br>TEXTAREA(textarea): https://v.douyin.com/... https://www.tiktok.com/... https://xhslink.com/... https://v.kuaishou.com/...<br>BUTTON(button): Load links 0 [初始禁用]<br>BUTTON(button): Compress<br>BUTTON(button): Trim<br>BUTTON(button): Extract MP3<br>BUTTON(button): Mute<br>BUTTON(button): Convert MP4<br>BUTTON(button): Rotate<br>BUTTON(button): Speed<br>SELECT(select-one): CompressionHigh qualityBalancedSmaller file [high=High quality; balanced=Balanced; small=Smaller file]<br>SELECT(select-one): Output resolutionKeep source1080p720p480p [source=Keep source; 1080=1080p; 720=720p; 480=480p]<br>INPUT(number): FPS (0 = keep source)<br>BUTTON(submit): Start processing [初始禁用] | 25 |
| 视频转文字 (video-transcription) | INPUT(file): [无可读标签] | 0 |
| 视频去水印 (video-watermark-remover) | INPUT(file): [无可读标签]<br>TEXTAREA(textarea): https://v.douyin.com/... https://www.tiktok.com/... https://xhslink.com/... https://v.kuaishou.com/...<br>BUTTON(button): Load links 0 [初始禁用] | 0 |
| WebP 转 JPG / PNG (webp-to-jpg) | INPUT(file): [无可读标签]<br>SELECT(select-one): Output formatJPGPNG [jpeg=JPG; png=PNG]<br>INPUT(range): Output quality92%<br>BUTTON(submit): Convert · WebP → JPG [初始禁用] | 0 |
| Excel 转 CSV (xlsx-to-csv) | INPUT(file): [无可读标签]<br>BUTTON(button): Process now [初始禁用] | 16 |
| PDF 叠加 (pdf-overlay) | INPUT(file): [无可读标签]<br>INPUT(file): [无可读标签]<br>INPUT(radio): Use the first overlay page on every page<br>INPUT(radio): Match pages; repeat the last overlay page when needed | 0 |
| PDF 页眉页脚 (pdf-header-footer) | INPUT(file): [无可读标签]<br>INPUT(text): Header text<br>INPUT(text): Footer text<br>INPUT(checkbox): Add page numbers | 0 |
| PDF 打开方式 (pdf-viewer-preferences) | INPUT(file): [无可读标签]<br>SELECT(select-one): Page layoutSingle pageContinuousTwo columnsTwo pages [SinglePage=Single page; OneColumn=Continuous; TwoColumnLeft=Two columns; TwoPageLeft=Two pages]<br>SELECT(select-one): Open withDocumentBookmarksThumbnailsFull screen [UseNone=Document; UseOutlines=Bookmarks; UseThumbs=Thumbnails; FullScreen=Full screen]<br>INPUT(checkbox): Fit window<br>INPUT(checkbox): Show document title<br>INPUT(checkbox): Hide toolbar<br>INPUT(checkbox): Hide menu bar<br>INPUT(checkbox): Right-to-left reading | 74 |
| PDF Bates 编号 (pdf-bates-numbering) | INPUT(file): [无可读标签]<br>INPUT(text): Number prefix<br>INPUT(text): Number suffix<br>INPUT(number): Starting number<br>INPUT(number): Number digits | 0 |
| PDF 转灰度 (pdf-grayscale) | INPUT(file): [无可读标签] | 6 |
| 删除 PDF 批注 (pdf-remove-annotations) | INPUT(file): [无可读标签] | 6 |
| 调整 PDF 页面尺寸 (pdf-page-size) | INPUT(file): [无可读标签]<br>SELECT(select-one): Page sizeA4A3LetterLegal [A4=A4; A3=A3; Letter=Letter; Legal=Legal] | 26 |
| 10分钟临时邮箱 (temp-mail) | BUTTON(submit): Refresh all<br>INPUT(number): [无可读标签]<br>BUTTON(submit): Create 50 · ¥2.50 | 0 |
| 编辑 PDF 文件信息 (pdf-metadata-editor) | INPUT(file): [无可读标签]<br>INPUT(text): Title<br>INPUT(text): Author<br>INPUT(text): Subject<br>INPUT(text): Keywords | 0 |
| PDF 权限设置 (pdf-permissions) | INPUT(file): [无可读标签]<br>INPUT(password): Owner passwordKeep the owner password safe. It is needed to remove restrictions later.<br>SELECT(select-one): Allow printingFull printingLow-quality printingNot allowed [full=Full printing; low=Low-quality printing; none=Not allowed]<br>SELECT(select-one): Allow changesAllow all changesAnnotations onlyForm filling onlyPage assembly onlyNot allowed [all=Allow all changes; annotate=Annotations only; form=Form fillin<br>INPUT(checkbox): Allow copying text and images | 148 |
| PDF 加密码 (pdf-protect) | INPUT(file): [无可读标签]<br>INPUT(password): Open password<br>INPUT(password): Confirm open password<br>INPUT(password): Owner password<br>SELECT(select-one): Allow printingFull printingLow-quality printingNot allowed [full=Full printing; low=Low-quality printing; none=Not allowed]<br>SELECT(select-one): Allow changesAllow all changesAnnotations onlyForm filling onlyPage assembly onlyNot allowed [all=Allow all changes; annotate=Annotations only; form=Form fillin<br>INPUT(checkbox): Allow copying text and images | 10 |
| 解除 PDF 密码 (pdf-unlock) | INPUT(file): [无可读标签]<br>INPUT(password): Current password | 8 |
| PDF 网页快速打开 (pdf-web-optimize) | INPUT(file): [无可读标签] | 14 |
| PDF 结构检查 (pdf-inspect) | INPUT(file): [无可读标签] | 4 |
| PDF 附件管理 (pdf-attachments) | INPUT(file): [无可读标签]<br>INPUT(file): Choose a file to attach<br>BUTTON(button): Add attachment [初始禁用]<br>INPUT(text): Attachment key to remove<br>BUTTON(button): Remove attachment [初始禁用] | 32 |
| PDF 书签查看 (pdf-bookmarks) | INPUT(file): [无可读标签] | 4 |
| AI 图片检测 (ai-image-check) | INPUT(file): [无可读标签] [初始禁用]<br>BUTTON(button): 开始检查 [初始禁用] | 0 |
| AI 视频与音频检测 (ai-video-audio-check) | INPUT(file): [无可读标签] [初始禁用]<br>BUTTON(button): 开始检查 [初始禁用] | 0 |

原始证据：`output/playwright/20261019-live-control-inventory.json`、`20261019-tool-button-ledger.json` 及各目录的 `tool-journey.json`。详细通过/失败范围见同目录审计报告。
