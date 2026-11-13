import type {SeoLocale} from '@/lib/seo/global-seo';
const COPY={
 zh:['操作教程','常见问题','为什么处理较慢？','大文件和首次使用可能需要更长时间。处理时保持页面打开；可以先用小文件试一下。','怎样保存或发给朋友？','先检查结果，再选择“保存文件”或“发送文件”。若微信转发没有下一步，可先存到“文件”，再到微信聊天中添加文件附件。','什么时候需要付费？','有体验额度的工具可先体验；需付费时会显示本次金额，确认后才继续。已经生成的同一份结果重复保存或发送不会重复计次。','选择要处理的文件，或粘贴文字、链接。','选择本次需要的功能和选项，再开始处理。','检查结果；保留原件，保存或发送需要的文件。'],
 en:['Step-by-step guide','Frequently asked questions','Why is processing slow?','Large files and first use may take longer. Keep the page open; try a small file first.','How can I save or send the result?','Review the result, then choose Save file or Send file. If forwarding to WeChat stalls, save to Files and attach it from inside the WeChat chat.','When is payment required?','Try the included allowance where available. Any charge is shown for confirmation before continuing. Saving or sending the same generated result again does not count twice.','Choose a file, or paste text or a link.','Choose the function and options you need, then start.','Review the result, keep the original, and save or send the files you need.'],
 ja:['操作ガイド','よくある質問','処理が遅いのはなぜ？','大容量や初回は時間がかかります。画面を開いたままにし、小さなファイルで試してください。','結果を保存・送信するには？','結果を確認して保存または送信を選びます。WeChatで止まる場合は「ファイル」に保存し、チャット内で添付してください。','支払いはいつ必要？','体験枠があれば利用できます。有料時は続行前に料金を確認します。同じ結果の再保存・再送信は重複計数しません。','ファイルを選ぶか文章・リンクを入力します。','機能と設定を選び、処理を開始します。','原本を保管し、結果を確認して保存・送信します。'],
 ko:['사용 가이드','자주 묻는 질문','처리가 느린 이유는?','큰 파일이나 첫 사용은 시간이 걸립니다. 화면을 열어 두고 작은 파일로 먼저 확인하세요.','결과를 저장하거나 보내려면?','결과 확인 후 저장 또는 보내기를 선택하세요. WeChat 전달이 멈추면 파일 앱에 저장한 뒤 대화에서 첨부하세요.','언제 요금이 발생하나요?','제공되는 무료 한도로 체험할 수 있습니다. 유료 작업은 금액 확인 후 계속합니다. 같은 결과 재저장·재전송은 중복 계산하지 않습니다.','파일을 선택하거나 텍스트·링크를 붙여 넣으세요.','필요한 기능과 옵션을 선택하고 시작하세요.','원본을 보관하고 결과를 확인한 뒤 저장하거나 보내세요.'],
 fr:['Guide pratique','Questions fréquentes','Pourquoi est-ce lent ?','Les gros fichiers et la première utilisation prennent plus de temps. Gardez la page ouverte et essayez un petit fichier.','Comment enregistrer ou envoyer ?','Vérifiez puis choisissez Enregistrer ou Envoyer. Si WeChat bloque, enregistrez dans Fichiers puis joignez depuis la conversation.','Quand faut-il payer ?','Utilisez le quota d’essai disponible. Tout coût est confirmé avant de continuer. Le même résultat enregistré ou envoyé à nouveau ne compte pas deux fois.','Choisissez un fichier ou collez du texte ou un lien.','Choisissez la fonction et les options, puis démarrez.','Vérifiez, gardez l’original puis enregistrez ou envoyez.'],
 de:['Schritt-für-Schritt-Anleitung','Häufige Fragen','Warum dauert es länger?','Große Dateien und die erste Nutzung brauchen länger. Seite offen lassen und eine kleine Datei testen.','Wie speichern oder senden?','Ergebnis prüfen und Speichern oder Senden wählen. Hängt WeChat, in Dateien speichern und im Chat anhängen.','Wann fallen Kosten an?','Nutze das verfügbare Testkontingent. Kosten werden vor dem Fortfahren bestätigt. Erneutes Speichern oder Senden desselben Ergebnisses zählt nicht doppelt.','Datei wählen oder Text bzw. Link einfügen.','Funktion und Optionen wählen, dann starten.','Ergebnis prüfen, Original behalten und speichern oder senden.'],
 es:['Guía paso a paso','Preguntas frecuentes','¿Por qué tarda?','Los archivos grandes y el primer uso tardan más. Mantén la página abierta y prueba un archivo pequeño.','¿Cómo guardar o enviar?','Revisa y elige Guardar o Enviar. Si WeChat se bloquea, guarda en Archivos y adjunta desde la conversación.','¿Cuándo se paga?','Usa la cuota de prueba disponible. Se confirma el coste antes de continuar. Volver a guardar o enviar el mismo resultado no cuenta dos veces.','Elige un archivo o pega texto o un enlace.','Elige la función y las opciones e inicia el proceso.','Revisa el resultado, conserva el original y guarda o envía.'],
 pt:['Guia passo a passo','Perguntas frequentes','Por que demora?','Arquivos grandes e o primeiro uso podem demorar. Mantenha a página aberta e teste um arquivo pequeno.','Como salvar ou enviar?','Confira e escolha Salvar ou Enviar. Se o WeChat travar, salve em Arquivos e anexe pela conversa.','Quando é preciso pagar?','Use a cota de teste disponível. O custo é confirmado antes de continuar. Salvar ou enviar o mesmo resultado novamente não conta duas vezes.','Escolha um arquivo ou cole texto ou um link.','Escolha a função e as opções e inicie.','Confira, guarde o original e salve ou envie o resultado.'],
 ar:['دليل الاستخدام','أسئلة شائعة','لماذا تستغرق المعالجة وقتاً؟','الملفات الكبيرة والاستخدام الأول قد يستغرقان وقتاً أطول. أبق الصفحة مفتوحة وجرّب ملفاً صغيراً.','كيف أحفظ النتيجة أو أرسلها؟','راجع النتيجة ثم اختر الحفظ أو الإرسال. إذا توقف WeChat فاحفظ في الملفات ثم أرفق من داخل المحادثة.','متى يلزم الدفع؟','استخدم حصة التجربة المتاحة. يُعرض السعر للتأكيد قبل المتابعة. إعادة حفظ النتيجة نفسها أو إرسالها لا تُحسب مرتين.','اختر ملفاً أو الصق نصاً أو رابطاً.','اختر الوظيفة والإعدادات ثم ابدأ.','راجع النتيجة واحتفظ بالأصل ثم احفظ أو أرسل.'],
} as const;
export function tutorialCopy(locale:SeoLocale){return COPY[locale]||COPY.en}


type GuideGroup = "file"|"pdf"|"pdfEditor"|"pdfSign"|"pdfMerge"|"pdfSplit"|"image"|"audio"|"audioCleanup"|"video"|"text"|"qr"|"ocr"|"privacy"|"translate"|"web";
const GUIDE_GROUP_BY_SLUG:Record<string,GuideGroup>={
 "pdf-editor":"pdfEditor","e-sign-pdf":"pdfSign","pdf-pages":"pdf","pdf-merge-split":"pdfMerge","merge-pdf":"pdfMerge","split-pdf":"pdfSplit","compress-pdf":"pdf","pdf-compress":"pdf","pdf-crop":"pdf","pdf-redact":"pdf","pdf-to-jpg":"pdf","pdf-to-xlsx":"pdf","pdf-watermark":"pdf","pdf-metadata-editor":"pdf","pdf-compare":"pdf","pdf-flatten":"pdf","pdf-permissions":"pdf","pdf-protect":"pdf","pdf-unlock":"pdf","pdf-overlay":"pdf","pdf-page-numbers":"pdf","pdf-pages-per-sheet":"pdf","pdf-search":"pdf","pdf-to-text":"pdf","pdf-to-word":"pdf","pdf-to-markdown":"pdf","pdf-web-optimize":"pdf","pdf-inspect":"pdf","pdf-attachments":"pdf","pdf-bates-numbering":"pdf","pdf-bookmarks":"pdf","pdf-rasterize":"pdf","pdf-grayscale":"pdf","pdf-halve-pages":"pdf","pdf-remove-metadata":"pdf","pdf-remove-annotations":"pdf","pdf-viewer-preferences":"pdf","pdf-page-size":"pdf",
 "png-to-jpg":"image","jpg-to-png":"image","webp-to-jpg":"image","compress-image":"image","compress-image-to-20kb":"image","compress-image-to-50kb":"image","compress-image-to-100kb":"image","compress-image-to-200kb":"image","compress-image-to-500kb":"image","resize-image":"image","remove-exif":"image","heic-to-jpg":"image","heic-local":"image","avif-to-jpg":"image","bmp-to-png":"image","gif-to-jpg":"image","ico-to-png":"image","jfif-to-jpg":"image","svg-to-png":"image","long-image":"image","image-to-pdf":"image","image-to-pdf-pro":"image","batch-image":"image","image-watermark-remover":"image","batch-image-watermark-remover":"image","screenshot-redact":"image","handwriting-ocr":"image","id-photo-ai":"image",
 "audio-transcription":"audio","audio-cleanup":"audioCleanup","video-transcription":"audio",
 "video-toolkit":"video","video-dubbing":"video","video-watermark-remover":"video","rotate-video":"video","reverse-video":"video","loop-video":"video","stop-motion-video":"video",
 "text-counter":"text","remove-duplicate-lines":"text","remove-empty-lines":"text","url-encode-decode":"text","base64-encode-decode":"text","json-formatter":"text","timestamp-converter":"text","csv-json":"text","text-diff":"text","regex-tester":"text","url-parser":"text","jwt-decoder":"text","number-base-converter":"text","uuid-generator":"text","cron-parser":"text","md5-sha256":"text","xml-formatter":"text",
 "qr-code-generator":"qr","qr-code-reader":"qr","qr-safe-reader":"qr",
 "ocr":"ocr","pdf-ocr":"ocr",
 "privacy-cleaner":"privacy","burn-after-read":"privacy","temp-mail":"privacy",
 "document-translate":"translate","image-translator":"translate","subtitle-translate":"translate","video-translate":"translate",
};
const TASK_GUIDES:Record<SeoLocale,Record<GuideGroup,readonly [string,string,string]>>={
 zh:{
  file:["选择本工具支持的文件。","核对文件格式、大小和页面提供的选项。","开始处理，检查结果后保存或发送。"],
  pdf:["上传 PDF 文件。","选择本工具提供的操作和页面或参数选项。","预览处理结果，导出 PDF 并重新打开核对。"],
  pdfEditor:["上传 PDF，等待页面预览完成。","添加文字、图片或签名，拖动对象并调整大小与位置。","逐页检查预览，再导出 PDF 并重新打开核对。"],
  pdfSign:["上传需要签署的 PDF。","绘制签名或上传签名图片、印章，并放到对应位置。","检查签名位置和页面预览，再导出 PDF。"],
  pdfMerge:["选择要合并的多个 PDF。","按最终阅读顺序排列文件。","执行合并，下载后检查页数和文件顺序。"],
  pdfSplit:["上传需要拆分的 PDF。","填写要提取的页码或页面范围。","执行拆分，分别下载并核对每个文件的页码。"],
  audioCleanup:["上传录音或音频文件。","选择降噪、音量或清晰度等页面提供的处理选项。","试听处理前后的声音，确认后保存音频。"],
  image:["选择图片文件。","设置目标格式、尺寸或压缩质量。","预览结果后保存，检查最终像素尺寸和文件大小。"],
  audio:["选择音频文件；支持视频的工具也可上传视频。","首次使用会在设备准备语音识别模型，文件处理在浏览器本地完成。","校对识别文字和时间轴，导出 TXT、SRT 或 VTT。"],
  video:["上传视频文件。","选择本页面提供的视频处理功能和对应参数。","预览后导出，检查画面、声音和播放是否正常。"],
  text:["输入或粘贴要处理的文本。","选择编码、格式或转换方向。","执行后核对结果，再复制或下载。"],
  qr:["输入网址、文本，或选择二维码内容类型。","填写对应内容，例如网址、Wi‑Fi 或联系人信息。","生成后用手机扫码核验，再保存二维码图片。"],
  ocr:["上传图片或扫描版 PDF。","选择图片或文档所使用的识别语言。","开始识别，校对提取文字，再保存 TXT。"],
  privacy:["选择需要清理或保护的内容。","先查看检测到的信息及本次将执行的操作。","确认后处理，下载结果并复查隐私信息。"],
  translate:["上传需要翻译的文件，或选择待翻译内容。","选择源语言和目标语言；如页面提示上传或费用确认，先核对再继续。","检查人名、数字、术语和排版，再导出译文。"],
  web:["输入公开网页的网址。","读取后检查网页标题和提取内容是否正确。","确认素材无误后，再继续交给 SASI 制作视频。"]
 },
 en:{
  file:["Choose a file supported by this tool.","Check the file format, size and options shown on the page.","Run the task, review the result, then save or send it."],
  pdf:["Upload the PDF file.","Choose the operation and page or setting options shown by this tool.","Preview the result, export the PDF and reopen it to verify."],
  pdfEditor:["Upload a PDF and wait for the page preview to finish.","Add text, images or signatures, then drag and resize each object into position.","Review each page, export the PDF and reopen it to verify the result."],
  pdfSign:["Upload the PDF you need to sign.","Draw a signature or upload a signature image or stamp, then place it on the page.","Check the placement and page preview, then export the PDF."],
  pdfMerge:["Choose the PDFs you want to combine.","Arrange the files in the order they should appear in the final document.","Merge and download the result, then check the page count and order."],
  pdfSplit:["Upload the PDF you want to split.","Enter the page numbers or page ranges to extract.","Split and download the files, then verify the pages in each output."],
  audioCleanup:["Upload a recording or audio file.","Choose the available noise, volume or clarity settings.","Listen to the result and compare it with the original before saving."],
  image:["Choose the image file.","Set the target format, dimensions or compression quality.","Preview and save the image; check its final dimensions and file size."],
  audio:["Choose an audio file; tools that accept video can also use a video file.","On first use, the speech model may be prepared on your device; the media is processed in your browser.","Review the transcript and timestamps, then export TXT, SRT or VTT."],
  video:["Upload the video file.","Choose the video operation and settings available on this page.","Preview and export the result, then check the picture, audio and playback."],
  text:["Enter or paste the text to process.","Choose the encoding, format or conversion direction.","Run the tool, check the result, then copy or download it."],
  qr:["Enter a URL or text, or choose a QR content type.","Fill in the details required for that type, such as Wi-Fi or contact information.","Generate the QR code, scan it with a phone to verify, then save the image."],
  ocr:["Upload an image or scanned PDF.","Choose the language used in the image or document.","Run text recognition, review the extracted text, then save it."],
  privacy:["Choose the content or file you want to protect or clean.","Review the information detected and the action that will be applied.","Confirm the action, then download and check the result."],
  translate:["Choose the document or media you want to translate.","Select the source and target languages; review any upload or price confirmation before continuing.","Check names, numbers, terminology and layout, then export the translation."],
  web:["Enter the URL of a public webpage.","Read the page title and extracted content to confirm it is the intended source.","Continue to SASI only after checking the source information."]
 },
 ja:{
  file:["このツールで対応しているファイルを選択します。","ファイル形式・サイズと画面に表示される設定を確認します。","処理を実行し、結果を確認して保存または送信します。"],
  pdf:["PDFファイルをアップロードします。","このツールで使える操作とページ・設定項目を選びます。","結果をプレビューしてPDFを書き出し、再度開いて確認します。"],
  pdfEditor:["PDFをアップロードし、ページプレビューの完了を待ちます。","文字・画像・署名を追加し、ドラッグしてサイズと位置を調整します。","各ページを確認してPDFを書き出し、再度開いて確認します。"],
  pdfSign:["署名するPDFをアップロードします。","署名を描くか画像・印鑑をアップロードし、ページ上に配置します。","位置とプレビューを確認してPDFを書き出します。"],
  pdfMerge:["結合する複数のPDFを選択します。","完成後に表示したい順番にファイルを並べます。","結合して保存し、ページ数と順番を確認します。"],
  pdfSplit:["分割するPDFをアップロードします。","抽出するページ番号または範囲を入力します。","分割ファイルを保存し、それぞれのページを確認します。"],
  audioCleanup:["録音または音声ファイルをアップロードします。","ノイズ、音量、明瞭さなど画面にある設定を選びます。","処理前後の音声を聞き比べてから保存します。"],
  image:["画像ファイルを選択します。","出力形式、サイズ、圧縮品質を設定します。","プレビューを確認して保存し、画像サイズとファイル容量を確認します。"],
  audio:["音声ファイルを選択します。動画対応ツールでは動画も選べます。","初回は端末上で音声認識モデルを準備する場合があります。メディアはブラウザ内で処理します。","文字起こしとタイムスタンプを確認し、TXT・SRT・VTTで保存します。"],
  video:["動画ファイルをアップロードします。","このページで利用できる動画処理機能と設定を選びます。","プレビュー後に書き出し、映像・音声・再生を確認します。"],
  text:["処理する文章を入力または貼り付けます。","エンコード、形式、変換方向を選びます。","実行後に結果を確認し、コピーまたはダウンロードします。"],
  qr:["URLやテキストを入力するか、QRの種類を選びます。","Wi-Fiや連絡先など、必要な情報を入力します。","QRを生成し、スマートフォンで読み取って確認してから保存します。"],
  ocr:["画像またはスキャンPDFをアップロードします。","文書で使われている認識言語を選びます。","文字認識を実行し、抽出結果を確認して保存します。"],
  privacy:["保護または整理したい内容・ファイルを選びます。","検出された情報と実行する処理を確認します。","処理を確定し、結果をダウンロードして確認します。"],
  translate:["翻訳する文書またはメディアを選びます。","原文と翻訳先の言語を選び、アップロードや料金の確認があれば確認します。","名前、数字、用語、レイアウトを確認して翻訳結果を書き出します。"],
  web:["公開ウェブページのURLを入力します。","読み取ったページ名と内容が正しいか確認します。","内容を確認してからSASIで動画制作へ進みます。"]
 },
 ko:{
  file:["이 도구가 지원하는 파일을 선택하세요.","파일 형식과 크기, 화면에 표시된 옵션을 확인하세요.","실행한 뒤 결과를 확인하고 저장하거나 보내세요."],
  pdf:["PDF 파일을 업로드하세요.","이 도구에서 제공하는 작업과 페이지 또는 설정 옵션을 선택하세요.","결과를 미리 보고 PDF를 내보낸 뒤 다시 열어 확인하세요."],
  pdfEditor:["PDF를 업로드하고 페이지 미리보기가 끝날 때까지 기다리세요.","텍스트·이미지·서명을 추가하고 드래그해 크기와 위치를 조정하세요.","각 페이지를 확인하고 PDF를 내보낸 뒤 다시 열어 검증하세요."],
  pdfSign:["서명할 PDF를 업로드하세요.","서명을 직접 그리거나 서명 이미지·도장을 올려 페이지에 배치하세요.","위치와 미리보기를 확인한 뒤 PDF를 내보내세요."],
  pdfMerge:["합칠 PDF 파일을 여러 개 선택하세요.","최종 문서에 표시할 순서대로 파일을 정렬하세요.","병합 후 다운로드하고 페이지 수와 순서를 확인하세요."],
  pdfSplit:["분할할 PDF를 업로드하세요.","추출할 페이지 번호나 범위를 입력하세요.","분할 파일을 다운로드하고 각 파일의 페이지를 확인하세요."],
  audioCleanup:["녹음 또는 오디오 파일을 업로드하세요.","노이즈, 음량 또는 선명도 설정을 선택하세요.","처리 전후 소리를 들어보고 확인한 뒤 저장하세요."],
  image:["이미지 파일을 선택하세요.","출력 형식, 크기 또는 압축 품질을 설정하세요.","미리보기 후 저장하고 최종 크기와 파일 용량을 확인하세요."],
  audio:["오디오 파일을 선택하세요. 동영상을 지원하는 도구에서는 동영상도 선택할 수 있습니다.","처음 사용할 때 기기에서 음성 모델을 준비할 수 있으며 미디어는 브라우저에서 처리됩니다.","변환된 텍스트와 타임스탬프를 확인하고 TXT·SRT·VTT로 내보내세요."],
  video:["동영상 파일을 업로드하세요.","이 페이지에서 제공하는 동영상 작업과 설정을 선택하세요.","미리보기 후 내보내고 영상·음성·재생 상태를 확인하세요."],
  text:["처리할 텍스트를 입력하거나 붙여 넣으세요.","인코딩, 형식 또는 변환 방향을 선택하세요.","실행 후 결과를 확인하고 복사하거나 다운로드하세요."],
  qr:["URL이나 텍스트를 입력하거나 QR 콘텐츠 유형을 선택하세요.","Wi-Fi 또는 연락처 정보 등 필요한 내용을 입력하세요.","QR을 생성하고 휴대전화로 스캔해 확인한 뒤 저장하세요."],
  ocr:["이미지 또는 스캔 PDF를 업로드하세요.","문서에 사용된 인식 언어를 선택하세요.","문자 인식을 실행하고 추출된 텍스트를 확인한 뒤 저장하세요."],
  privacy:["보호하거나 정리할 내용 또는 파일을 선택하세요.","감지된 정보와 적용될 작업을 확인하세요.","작업을 확정하고 결과를 다운로드해 다시 확인하세요."],
  translate:["번역할 문서나 미디어를 선택하세요.","원본 언어와 대상 언어를 선택하고 업로드·요금 확인이 있으면 검토하세요.","이름, 숫자, 용어와 레이아웃을 확인한 뒤 번역 결과를 내보내세요."],
  web:["공개 웹페이지 URL을 입력하세요.","읽어 온 페이지 제목과 내용이 올바른지 확인하세요.","출처 정보를 확인한 뒤 SASI에서 영상 제작을 계속하세요."]
 },
 fr:{
  file:["Choisissez un fichier pris en charge par cet outil.","Vérifiez le format, la taille et les options affichées.","Lancez le traitement, vérifiez le résultat puis enregistrez-le ou envoyez-le."],
  pdf:["Importez le fichier PDF.","Choisissez l’opération et les options de pages ou de réglages proposées.","Prévisualisez le résultat, exportez le PDF puis rouvrez-le pour le vérifier."],
  pdfEditor:["Importez un PDF et attendez la fin de l’aperçu des pages.","Ajoutez du texte, des images ou des signatures, puis déplacez et redimensionnez les objets.","Vérifiez chaque page, exportez le PDF et rouvrez-le pour contrôler le résultat."],
  pdfSign:["Importez le PDF à signer.","Dessinez une signature ou importez une image ou un tampon, puis placez-le sur la page.","Vérifiez son emplacement et l’aperçu, puis exportez le PDF."],
  pdfMerge:["Choisissez les PDF à fusionner.","Classez les fichiers dans l’ordre souhaité pour le document final.","Fusionnez et téléchargez le résultat, puis vérifiez le nombre et l’ordre des pages."],
  pdfSplit:["Importez le PDF à découper.","Saisissez les numéros ou plages de pages à extraire.","Téléchargez les fichiers séparés et vérifiez les pages de chacun."],
  audioCleanup:["Importez un enregistrement ou un fichier audio.","Choisissez les réglages disponibles de réduction du bruit, de volume ou de clarté.","Écoutez le résultat et comparez-le à l’original avant de l’enregistrer."],
  image:["Choisissez le fichier image.","Définissez le format, les dimensions ou la qualité de compression.","Prévisualisez et enregistrez l’image, puis vérifiez ses dimensions et sa taille."],
  audio:["Choisissez un fichier audio ; les outils compatibles acceptent aussi la vidéo.","Lors de la première utilisation, le modèle vocal peut être préparé sur votre appareil ; le média est traité dans le navigateur.","Vérifiez le texte et les horodatages, puis exportez en TXT, SRT ou VTT."],
  video:["Importez le fichier vidéo.","Choisissez la fonction vidéo et les réglages proposés sur cette page.","Prévisualisez et exportez, puis vérifiez l’image, le son et la lecture."],
  text:["Saisissez ou collez le texte à traiter.","Choisissez l’encodage, le format ou le sens de conversion.","Lancez l’outil, vérifiez le résultat puis copiez-le ou téléchargez-le."],
  qr:["Saisissez une URL ou un texte, ou choisissez le type de QR.","Renseignez les informations requises, comme le Wi-Fi ou un contact.","Générez le QR, scannez-le avec un téléphone pour le vérifier, puis enregistrez l’image."],
  ocr:["Importez une image ou un PDF numérisé.","Choisissez la langue utilisée dans le document.","Lancez la reconnaissance, vérifiez le texte extrait puis enregistrez-le."],
  privacy:["Choisissez le contenu ou le fichier à protéger ou nettoyer.","Vérifiez les informations détectées et l’action prévue.","Confirmez, téléchargez le résultat et contrôlez-le."],
  translate:["Choisissez le document ou le média à traduire.","Sélectionnez les langues source et cible ; vérifiez toute confirmation d’envoi ou de tarif.","Contrôlez les noms, nombres, termes et la mise en page, puis exportez la traduction."],
  web:["Saisissez l’URL d’une page web publique.","Vérifiez le titre et le contenu extraits pour confirmer la bonne source.","Après vérification, poursuivez dans SASI pour créer la vidéo."]
 },
 de:{
  file:["Wählen Sie eine von diesem Werkzeug unterstützte Datei.","Prüfen Sie Dateiformat, Größe und die angezeigten Optionen.","Starten Sie die Verarbeitung, prüfen Sie das Ergebnis und speichern oder senden Sie es."],
  pdf:["Laden Sie die PDF-Datei hoch.","Wählen Sie die angebotene Aktion sowie Seiten- oder Einstellungsmöglichkeiten.","Prüfen Sie die Vorschau, exportieren Sie das PDF und öffnen Sie es erneut zur Kontrolle."],
  pdfEditor:["Laden Sie ein PDF hoch und warten Sie, bis die Seitenvorschau fertig ist.","Fügen Sie Text, Bilder oder Signaturen hinzu und verschieben bzw. skalieren Sie die Objekte.","Prüfen Sie jede Seite, exportieren Sie das PDF und öffnen Sie es erneut zur Kontrolle."],
  pdfSign:["Laden Sie das zu signierende PDF hoch.","Zeichnen Sie eine Signatur oder laden Sie ein Signaturbild bzw. einen Stempel hoch und platzieren Sie ihn.","Prüfen Sie Position und Vorschau und exportieren Sie das PDF."],
  pdfMerge:["Wählen Sie die zusammenzuführenden PDFs aus.","Ordnen Sie die Dateien in der gewünschten Reihenfolge des fertigen Dokuments an.","Führen Sie sie zusammen, laden Sie das Ergebnis herunter und prüfen Sie Seitenzahl und Reihenfolge."],
  pdfSplit:["Laden Sie das PDF zum Aufteilen hoch.","Geben Sie die zu extrahierenden Seitenzahlen oder Bereiche ein.","Laden Sie die getrennten Dateien herunter und prüfen Sie deren Seiten."],
  audioCleanup:["Laden Sie eine Aufnahme oder Audiodatei hoch.","Wählen Sie die verfügbaren Einstellungen für Rauschen, Lautstärke oder Klarheit.","Hören Sie das Ergebnis an und vergleichen Sie es mit dem Original, bevor Sie speichern."],
  image:["Wählen Sie die Bilddatei aus.","Legen Sie Zielformat, Abmessungen oder Komprimierungsqualität fest.","Prüfen und speichern Sie das Bild; kontrollieren Sie Maße und Dateigröße."],
  audio:["Wählen Sie eine Audiodatei; videofähige Werkzeuge akzeptieren auch Videos.","Beim ersten Einsatz wird das Sprachmodell möglicherweise auf Ihrem Gerät vorbereitet; die Medienverarbeitung erfolgt im Browser.","Prüfen Sie Transkript und Zeitstempel und exportieren Sie TXT, SRT oder VTT."],
  video:["Laden Sie die Videodatei hoch.","Wählen Sie die auf dieser Seite angebotene Videofunktion und die Einstellungen.","Prüfen und exportieren Sie das Ergebnis; kontrollieren Sie Bild, Ton und Wiedergabe."],
  text:["Geben Sie den zu verarbeitenden Text ein oder fügen Sie ihn ein.","Wählen Sie Kodierung, Format oder Konvertierungsrichtung.","Starten Sie das Werkzeug, prüfen Sie das Ergebnis und kopieren oder laden Sie es herunter."],
  qr:["Geben Sie eine URL oder einen Text ein oder wählen Sie einen QR-Inhaltstyp.","Ergänzen Sie die erforderlichen Angaben, etwa WLAN- oder Kontaktdaten.","Erstellen Sie den QR-Code, prüfen Sie ihn mit dem Smartphone und speichern Sie das Bild."],
  ocr:["Laden Sie ein Bild oder ein gescanntes PDF hoch.","Wählen Sie die im Dokument verwendete Erkennungssprache.","Starten Sie OCR, prüfen Sie den erkannten Text und speichern Sie ihn."],
  privacy:["Wählen Sie den Inhalt oder die Datei, die geschützt oder bereinigt werden soll.","Prüfen Sie die erkannten Informationen und die vorgesehene Aktion.","Bestätigen Sie, laden Sie das Ergebnis herunter und kontrollieren Sie es."],
  translate:["Wählen Sie das zu übersetzende Dokument oder Medium.","Wählen Sie Quell- und Zielsprache und prüfen Sie Upload- oder Preisbestätigungen.","Kontrollieren Sie Namen, Zahlen, Fachbegriffe und Layout und exportieren Sie die Übersetzung."],
  web:["Geben Sie die URL einer öffentlichen Webseite ein.","Prüfen Sie Seitentitel und extrahierte Inhalte auf Richtigkeit.","Fahren Sie erst nach Prüfung der Quelle in SASI mit der Videoerstellung fort."]
 },
 es:{
  file:["Elige un archivo compatible con esta herramienta.","Comprueba el formato, el tamaño y las opciones disponibles.","Inicia el proceso, revisa el resultado y guárdalo o envíalo."],
  pdf:["Sube el archivo PDF.","Elige la operación y las opciones de páginas o ajustes disponibles.","Previsualiza el resultado, exporta el PDF y vuelve a abrirlo para comprobarlo."],
  pdfEditor:["Sube un PDF y espera a que termine la vista previa de las páginas.","Añade texto, imágenes o firmas y arrastra los objetos para ajustar su tamaño y posición.","Revisa cada página, exporta el PDF y vuelve a abrirlo para comprobarlo."],
  pdfSign:["Sube el PDF que necesitas firmar.","Dibuja una firma o sube una imagen de firma o sello y colócala en la página.","Comprueba la posición y la vista previa y exporta el PDF."],
  pdfMerge:["Elige los PDF que quieres combinar.","Ordena los archivos como deben aparecer en el documento final.","Combina y descarga el resultado; comprueba el número y el orden de las páginas."],
  pdfSplit:["Sube el PDF que quieres dividir.","Indica los números o rangos de páginas que deseas extraer.","Descarga los archivos separados y verifica las páginas de cada uno."],
  audioCleanup:["Sube una grabación o un archivo de audio.","Elige los ajustes disponibles de ruido, volumen o claridad.","Escucha el resultado y compáralo con el original antes de guardarlo."],
  image:["Elige el archivo de imagen.","Configura el formato, las dimensiones o la calidad de compresión.","Previsualiza y guarda la imagen; comprueba sus dimensiones y tamaño final."],
  audio:["Elige un archivo de audio; las herramientas compatibles también aceptan vídeo.","En el primer uso puede prepararse el modelo de voz en tu dispositivo; el archivo se procesa en el navegador.","Revisa el texto y las marcas de tiempo y exporta TXT, SRT o VTT."],
  video:["Sube el archivo de vídeo.","Elige la función de vídeo y los ajustes disponibles en esta página.","Previsualiza y exporta; comprueba la imagen, el sonido y la reproducción."],
  text:["Escribe o pega el texto que quieres procesar.","Elige la codificación, el formato o la dirección de conversión.","Ejecuta la herramienta, revisa el resultado y cópialo o descárgalo."],
  qr:["Introduce una URL o texto, o elige el tipo de contenido QR.","Completa los datos necesarios, como Wi-Fi o información de contacto.","Genera el QR, escanéalo con el móvil para verificarlo y guarda la imagen."],
  ocr:["Sube una imagen o un PDF escaneado.","Elige el idioma utilizado en el documento.","Ejecuta el reconocimiento, revisa el texto extraído y guárdalo."],
  privacy:["Elige el contenido o archivo que quieres proteger o limpiar.","Revisa la información detectada y la acción que se aplicará.","Confirma, descarga el resultado y vuelve a comprobarlo."],
  translate:["Elige el documento o medio que quieres traducir.","Selecciona los idiomas de origen y destino; revisa cualquier confirmación de carga o precio.","Comprueba nombres, números, términos y formato y exporta la traducción."],
  web:["Introduce la URL de una página web pública.","Comprueba el título y el contenido extraído para confirmar la fuente.","Tras verificar la información, continúa en SASI para crear el vídeo."]
 },
 pt:{
  file:["Escolha um arquivo compatível com esta ferramenta.","Confira o formato, o tamanho e as opções disponíveis.","Inicie o processamento, confira o resultado e salve ou envie."],
  pdf:["Envie o arquivo PDF.","Escolha a operação e as opções de páginas ou configurações disponíveis.","Visualize o resultado, exporte o PDF e abra-o novamente para conferir."],
  pdfEditor:["Envie um PDF e aguarde a conclusão da prévia das páginas.","Adicione textos, imagens ou assinaturas e arraste os objetos para ajustar tamanho e posição.","Confira cada página, exporte o PDF e abra-o novamente para verificar."],
  pdfSign:["Envie o PDF que precisa assinar.","Desenhe a assinatura ou envie uma imagem de assinatura ou carimbo e posicione-a na página.","Confira a posição e a prévia e exporte o PDF."],
  pdfMerge:["Escolha os PDFs que deseja juntar.","Organize os arquivos na ordem em que devem aparecer no documento final.","Junte e baixe o resultado; confira a quantidade e a ordem das páginas."],
  pdfSplit:["Envie o PDF que deseja dividir.","Informe os números ou intervalos de páginas para extrair.","Baixe os arquivos separados e confira as páginas de cada um."],
  audioCleanup:["Envie uma gravação ou arquivo de áudio.","Escolha as opções disponíveis de ruído, volume ou clareza.","Ouça o resultado e compare com o original antes de salvar."],
  image:["Escolha o arquivo de imagem.","Defina o formato, as dimensões ou a qualidade da compressão.","Visualize e salve a imagem; confira as dimensões e o tamanho final."],
  audio:["Escolha um arquivo de áudio; ferramentas compatíveis também aceitam vídeo.","No primeiro uso, o modelo de voz pode ser preparado no dispositivo; a mídia é processada no navegador.","Revise o texto e os tempos e exporte TXT, SRT ou VTT."],
  video:["Envie o arquivo de vídeo.","Escolha a função de vídeo e as configurações disponíveis nesta página.","Visualize e exporte; confira a imagem, o áudio e a reprodução."],
  text:["Digite ou cole o texto que deseja processar.","Escolha a codificação, o formato ou a direção da conversão.","Execute, confira o resultado e copie ou baixe."],
  qr:["Digite uma URL ou texto, ou escolha o tipo de conteúdo do QR.","Preencha os dados necessários, como Wi-Fi ou contato.","Gere o QR, leia com o celular para conferir e salve a imagem."],
  ocr:["Envie uma imagem ou PDF digitalizado.","Escolha o idioma usado no documento.","Execute o reconhecimento, revise o texto extraído e salve."],
  privacy:["Escolha o conteúdo ou arquivo que deseja proteger ou limpar.","Confira as informações detectadas e a ação que será aplicada.","Confirme, baixe o resultado e verifique novamente."],
  translate:["Escolha o documento ou mídia que deseja traduzir.","Selecione os idiomas de origem e destino; confira qualquer confirmação de envio ou preço.","Revise nomes, números, termos e formatação e exporte a tradução."],
  web:["Digite a URL de uma página pública.","Confira o título e o conteúdo extraído para confirmar a fonte.","Depois de verificar as informações, continue no SASI para criar o vídeo."]
 },
 ar:{
  file:["اختر ملفًا تدعمه هذه الأداة.","تحقق من صيغة الملف وحجمه والخيارات المعروضة.","ابدأ المعالجة، وراجع النتيجة ثم احفظها أو أرسلها."],
  pdf:["ارفع ملف PDF.","اختر العملية وخيارات الصفحات أو الإعدادات التي توفرها الأداة.","عاين النتيجة وصدّر PDF ثم افتحه مجددًا للتحقق."],
  pdfEditor:["ارفع ملف PDF وانتظر اكتمال معاينة الصفحات.","أضف النصوص أو الصور أو التوقيعات، ثم اسحب العناصر واضبط حجمها وموضعها.","راجع كل صفحة، وصدّر PDF ثم افتحه مجددًا للتحقق."],
  pdfSign:["ارفع ملف PDF المطلوب توقيعه.","ارسم توقيعًا أو ارفع صورة توقيع أو ختم وضعه في موضعه على الصفحة.","تحقق من الموضع والمعاينة ثم صدّر PDF."],
  pdfMerge:["اختر ملفات PDF التي تريد دمجها.","رتب الملفات وفق التسلسل المطلوب في المستند النهائي.","ادمج الملفات ونزّل النتيجة، ثم تحقق من عدد الصفحات وترتيبها."],
  pdfSplit:["ارفع ملف PDF الذي تريد تقسيمه.","أدخل أرقام الصفحات أو نطاقات الصفحات المطلوب استخراجها.","نزّل الملفات المنفصلة وتحقق من صفحات كل ملف."],
  audioCleanup:["ارفع تسجيلًا أو ملفًا صوتيًا.","اختر إعدادات إزالة الضوضاء أو مستوى الصوت أو الوضوح المتاحة.","استمع إلى النتيجة وقارنها بالأصل قبل الحفظ."],
  image:["اختر ملف الصورة.","حدد صيغة الإخراج والأبعاد أو جودة الضغط.","عاين الصورة واحفظها، ثم تحقق من أبعادها وحجم الملف."],
  audio:["اختر ملفًا صوتيًا؛ ويمكن للأدوات التي تدعم الفيديو قبول ملف فيديو أيضًا.","في الاستخدام الأول قد يتم تجهيز نموذج الصوت على جهازك؛ وتتم معالجة الوسائط داخل المتصفح.","راجع النص والتوقيتات ثم صدّر TXT أو SRT أو VTT."],
  video:["ارفع ملف الفيديو.","اختر وظيفة معالجة الفيديو والإعدادات المتاحة في هذه الصفحة.","عاين النتيجة وصدّرها، ثم تحقق من الصورة والصوت والتشغيل."],
  text:["أدخل النص المطلوب أو الصقه.","اختر الترميز أو التنسيق أو اتجاه التحويل.","نفّذ العملية وراجع النتيجة ثم انسخها أو نزّلها."],
  qr:["أدخل رابطًا أو نصًا أو اختر نوع محتوى رمز QR.","أكمل البيانات المطلوبة مثل معلومات Wi-Fi أو جهة الاتصال.","أنشئ الرمز وامسحه بالهاتف للتحقق ثم احفظ الصورة."],
  ocr:["ارفع صورة أو ملف PDF ممسوحًا ضوئيًا.","اختر لغة النص الموجود في المستند.","ابدأ التعرف على النص وراجعه ثم احفظه."],
  privacy:["اختر المحتوى أو الملف الذي تريد حمايته أو تنظيفه.","راجع المعلومات المكتشفة والإجراء الذي سيتم تطبيقه.","أكد العملية ونزّل النتيجة ثم تحقق منها."],
  translate:["اختر المستند أو الوسائط التي تريد ترجمتها.","حدد لغة المصدر واللغة المستهدفة، وراجع أي تأكيد للرفع أو السعر.","تحقق من الأسماء والأرقام والمصطلحات والتنسيق ثم صدّر الترجمة."],
  web:["أدخل عنوان صفحة ويب عامة.","تحقق من عنوان الصفحة والمحتوى المستخرج للتأكد من المصدر.","بعد مراجعة المعلومات، تابع إلى SASI لإنشاء الفيديو."]
 }
};
const AI_DETECT_GUIDES:Record<SeoLocale,{image:readonly [string,string,string];media:readonly [string,string,string]}>={
  "zh": {
    "image": [
      "上传图片并查看文件格式和 C2PA 来源签名。",
      "可选启动设备端 AI 图像特征分析，首次使用可能下载模型文件。",
      "分别核对来源与 AI 参考指标；分数不能证明图片真伪。"
    ],
    "media": [
      "上传视频或录音，检查格式和 C2PA 来源签名。",
      "视频仅分析抽取的 3 帧；录音只分析开头最多 12 秒的人声。",
      "分别核对来源与内容指标；分析不能证明整段媒体真伪。"
    ]
  },
  "en": {
    "image": [
      "Upload the image and check the file format and C2PA provenance.",
      "Optionally analyze AI indicators on-device; model files may download on first use.",
      "Review provenance and AI indicators separately; scores cannot prove authenticity."
    ],
    "media": [
      "Upload video or audio and inspect its format and C2PA provenance.",
      "Video checks 3 sampled frames; speech analysis examines up to 12 seconds from the start.",
      "Check provenance and content signals separately; these do not certify the full file."
    ]
  },
  "ja": {
    "image": [
      "画像をアップロードし、形式とC2PA出所情報を確認します。",
      "必要に応じて端末内AI分析を実行します。初回はモデルがダウンロードされる場合があります。",
      "出所情報とAI指標を分けて確認します。スコアでは真偽を証明できません。"
    ],
    "media": [
      "動画や音声をアップロードし、形式とC2PA出所情報を確認します。",
      "動画は3フレーム、音声は冒頭最大12秒を分析します。",
      "出所情報と指標を分けて確認します。ファイル全体の真偽は証明できません。"
    ]
  },
  "ko": {
    "image": [
      "이미지를 업로드하고 파일 형식과 C2PA 출처를 확인하세요.",
      "필요하면 기기에서 AI 지표를 분석하세요. 첫 사용 시 모델을 다운로드할 수 있습니다.",
      "출처와 AI 지표를 따로 검토하세요. 점수만으로 진위를 증명할 수 없습니다."
    ],
    "media": [
      "영상이나 오디오를 업로드하고 C2PA 출처를 확인하세요.",
      "영상은 3프레임, 음성은 시작 부분 최대 12초만 분석합니다.",
      "출처와 콘텐츠 지표를 따로 검토하세요. 전체 파일의 진위를 증명하지 않습니다."
    ]
  },
  "fr": {
    "image": [
      "Importez une image et examinez son format et sa provenance C2PA.",
      "L’analyse IA locale est facultative ; le modèle peut être téléchargé au premier usage.",
      "Vérifiez séparément provenance et indices IA ; les scores ne prouvent pas l’authenticité."
    ],
    "media": [
      "Importez une vidéo ou un audio et vérifiez sa provenance C2PA.",
      "La vidéo utilise 3 images ; la voix, au maximum les 12 premières secondes.",
      "Examinez séparément la provenance et les indicateurs ; ils ne certifient pas tout le média."
    ]
  },
  "de": {
    "image": [
      "Bild hochladen und Dateiformat sowie C2PA-Herkunft prüfen.",
      "Optional KI-Merkmale lokal analysieren; beim ersten Einsatz können Modelldaten heruntergeladen werden.",
      "Herkunft und KI-Indikatoren getrennt prüfen; Scores beweisen keine Echtheit."
    ],
    "media": [
      "Video oder Audio hochladen und C2PA-Herkunft prüfen.",
      "Video: 3 Einzelbilder; Sprache: höchstens die ersten 12 Sekunden.",
      "Herkunft und Signale getrennt prüfen; dies bestätigt nicht die gesamte Datei."
    ]
  },
  "es": {
    "image": [
      "Sube una imagen y comprueba su formato y procedencia C2PA.",
      "Ejecuta opcionalmente el análisis de IA local; el modelo puede descargarse la primera vez.",
      "Revisa por separado procedencia e indicadores IA; la puntuación no prueba autenticidad."
    ],
    "media": [
      "Sube un vídeo o audio y comprueba su procedencia C2PA.",
      "El vídeo analiza 3 fotogramas; la voz, hasta los primeros 12 segundos.",
      "Revisa procedencia e indicadores por separado; no certifican todo el archivo."
    ]
  },
  "pt": {
    "image": [
      "Envie uma imagem e confira o formato e a procedência C2PA.",
      "Se desejar, analise sinais de IA no dispositivo; o modelo pode ser baixado no primeiro uso.",
      "Confira procedência e sinais de IA em separado; a pontuação não comprova autenticidade."
    ],
    "media": [
      "Envie vídeo ou áudio e confira a procedência C2PA.",
      "Vídeo: 3 quadros; voz: até os primeiros 12 segundos.",
      "Confira procedência e sinais em separado; eles não certificam todo o arquivo."
    ]
  },
  "ar": {
    "image": [
      "ارفع الصورة وتحقق من تنسيقها ومعلومات مصدر C2PA.",
      "يمكنك تحليل مؤشرات الذكاء الاصطناعي على الجهاز؛ وقد يلزم تنزيل النموذج أول مرة.",
      "راجع المصدر والمؤشرات بشكل منفصل؛ لا تثبت الدرجة أصالة الصورة."
    ],
    "media": [
      "ارفع فيديو أو صوتًا وتحقق من معلومات مصدر C2PA.",
      "يحلل الفيديو 3 إطارات، والصوت أول 12 ثانية من الكلام كحد أقصى.",
      "راجع المصدر والمؤشرات بشكل منفصل؛ لا تثبت صحة الملف بأكمله."
    ]
  }
};
export function toolTutorialSteps(locale:SeoLocale,slug:string):readonly [string,string,string]{
 if(slug==="ai-image-check"||slug==="ai-video-audio-check")return AI_DETECT_GUIDES[locale][slug==="ai-image-check"?"image":"media"];
 const group=GUIDE_GROUP_BY_SLUG[slug]||"file";
 return TASK_GUIDES[locale]?.[group]||TASK_GUIDES.en[group];
}
