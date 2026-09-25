import fs from "node:fs";
const failures=[];
const read=p=>fs.readFileSync(p,"utf8");
const save=(p,s)=>fs.writeFileSync(p,s,"utf8");
function rep(p,a,b,n){
  let s=read(p);
  if(s.includes(b)){console.log(`ALREADY ${n}`);return}
  if(!s.includes(a)){console.error(`MISS ${n} :: ${p}`);failures.push(n);return}
  save(p,s.replace(a,b));console.log(`PASS ${n}`);
}
function rex(p,re,b,n){
  let s=read(p);
  if(!re.test(s)){console.error(`MISS ${n} :: ${p}`);failures.push(n);return}
  save(p,s.replace(re,b));console.log(`PASS ${n}`);
}

// ---------- 1) Restore useful hero line + every card gets a functional sentence ----------
{
 const p="lib/tools/hub-copy-v1470.ts";
 let s=read(p);
 {
   // IMPORTANT: the file already has CATEGORIES.subtitle.
   // Only inspect the HUB object; never use a whole-file `subtitle:L(` guard.
   const hubStart=s.indexOf("const HUB={");
   const summaryStart=s.indexOf("const SUMMARY:",hubStart);
   if(hubStart<0||summaryStart<0){
     console.error("MISS HUB structural anchors");
     failures.push("HUB structural anchors");
   }else{
     const hubBlock=s.slice(hubStart,summaryStart);
     if(!hubBlock.includes("subtitle:L(")){
       const searchPos=s.indexOf(' search:L(',hubStart);
       if(searchPos<0||searchPos>summaryStart){
         console.error("MISS HUB search anchor");
         failures.push("HUB search anchor");
       }else{
         const subtitle=' subtitle:L("PDF、图片、视频、字幕、表格、网页、隐私文件与日常识别，打开即可处理并得到结果。","PDFs, images, video, subtitles, tables, web content, private files and everyday recognition tools — open one and get the result.","PDF、画像、動画、字幕、表、Web、プライバシー文書、日常認識ツール。開いてすぐ処理できます。","PDF, 이미지, 영상, 자막, 표, 웹, 개인정보 파일과 일상 인식 도구를 바로 처리하세요.","PDF, images, vidéo, sous-titres, tableaux, web, fichiers privés et reconnaissance du quotidien : ouvrez l’outil et obtenez le résultat.","PDFs, Bilder, Videos, Untertitel, Tabellen, Webinhalte, private Dateien und Alltagserkennung direkt bearbeiten.","PDF, imágenes, vídeo, subtítulos, tablas, web, archivos privados y reconocimiento cotidiano, listos para usar.","PDF, imagens, vídeo, legendas, tabelas, web, ficheiros privados e reconhecimento do dia a dia, prontos a usar.","PDF والصور والفيديو والترجمة والجداول والويب والملفات الخاصة وأدوات التعرّف اليومية — افتح الأداة وابدأ مباشرة."),\n';
         s=s.slice(0,searchPos)+subtitle+s.slice(searchPos);
       }
     }
   }
 }

 if(!s.includes("export const toolCardLine=")){
   s += `
const GENERIC:Record<string,T>={
 image:L("转换、压缩、调整或整理图片。","Convert, compress, resize or organize images.","画像の変換・圧縮・サイズ調整・整理。","이미지 변환·압축·크기 조정·정리.","Convertir, compresser, redimensionner ou organiser les images.","Bilder konvertieren, komprimieren, skalieren oder ordnen.","Convierte, comprime, redimensiona u organiza imágenes.","Converta, comprima, redimensione ou organize imagens.","تحويل الصور وضغطها وتغيير حجمها وتنظيمها."),
 document:L("处理 PDF 与文档内容、页面或格式。","Handle PDF and document content, pages or formats.","PDFや文書の内容・ページ・形式を処理。","PDF와 문서의 내용·페이지·형식을 처리.","Traiter le contenu, les pages ou les formats PDF et documents.","PDF- und Dokumentinhalte, Seiten oder Formate bearbeiten.","Procesa contenido, páginas o formatos de PDF y documentos.","Processe conteúdo, páginas ou formatos de PDF e documentos.","معالجة محتوى PDF والمستندات وصفحاتها وصيغها."),
 video:L("处理视频内容、画面或声音。","Process video content, visuals or audio.","動画の内容・映像・音声を処理。","영상의 내용·화면·소리를 처리.","Traiter le contenu, l’image ou le son d’une vidéo.","Videoinhalt, Bild oder Ton bearbeiten.","Procesa contenido, imagen o audio de vídeo.","Processe conteúdo, imagem ou áudio de vídeo.","معالجة محتوى الفيديو والصورة والصوت."),
 audio:L("处理录音、语音或音轨。","Process recordings, speech or audio tracks.","録音・音声・音声トラックを処理。","녹음·음성·오디오 트랙을 처리.","Traiter enregistrements, voix ou pistes audio.","Aufnahmen, Sprache oder Audiospuren bearbeiten.","Procesa grabaciones, voz o pistas de audio.","Processe gravações, voz ou faixas de áudio.","معالجة التسجيلات والصوت والمسارات الصوتية."),
 privacy:L("清理、遮盖或临时分享敏感内容。","Clean, redact or temporarily share sensitive content.","機密内容の整理・秘匿・一時共有。","민감한 내용의 정리·가림·임시 공유.","Nettoyer, masquer ou partager temporairement des contenus sensibles.","Sensible Inhalte bereinigen, schwärzen oder vorübergehend teilen.","Limpia, oculta o comparte temporalmente contenido sensible.","Limpe, oculte ou partilhe temporariamente conteúdo sensível.","تنظيف المحتوى الحساس أو إخفاؤه أو مشاركته مؤقتًا."),
 utility:L("处理文本、文件或常用数据。","Handle text, files or everyday data.","テキスト・ファイル・日常データを処理。","텍스트·파일·일상 데이터를 처리.","Traiter textes, fichiers ou données courantes.","Text, Dateien oder Alltagsdaten bearbeiten.","Procesa texto, archivos o datos habituales.","Processe texto, ficheiros ou dados do dia a dia.","معالجة النصوص والملفات والبيانات اليومية."),
 ai:L("识别、生成或理解图片与媒体内容。","Recognize, generate or understand image and media content.","画像やメディアを認識・生成・理解。","이미지와 미디어를 인식·생성·이해.","Reconnaître, générer ou comprendre des images et médias.","Bild- und Medieninhalte erkennen, erzeugen oder verstehen.","Reconoce, genera o entiende contenido visual y multimedia.","Reconheça, gere ou compreenda imagens e multimédia.","التعرّف على الصور والوسائط أو إنشاؤها وفهمها."),
 qr:L("生成、识别或检查二维码内容。","Create, read or inspect QR code content.","QRコードの生成・読取・確認。","QR 코드 생성·인식·확인.","Créer, lire ou vérifier le contenu d’un QR code.","QR-Codes erstellen, lesen oder prüfen.","Crea, lee o revisa el contenido de códigos QR.","Crie, leia ou verifique conteúdo de códigos QR.","إنشاء رموز QR وقراءتها وفحص محتواها.")
};
const SIMPLE:Record<string,T>={
 "text-counter":L("统计文字、单词、字符、行数与字节。","Count words, characters, lines and bytes.","文字・単語・文字数・行数・バイト数を集計。","글자·단어·문자·줄·바이트 수를 계산.","Compter mots, caractères, lignes et octets.","Wörter, Zeichen, Zeilen und Bytes zählen.","Cuenta palabras, caracteres, líneas y bytes.","Conte palavras, caracteres, linhas e bytes.","حساب الكلمات والأحرف والأسطر والبايتات."),
 "remove-duplicate-lines":L("删除重复行，保留第一次出现的内容。","Remove duplicate lines and keep the first occurrence.","重複行を削除し、最初の内容を残します。","중복 줄을 제거하고 첫 항목을 유지합니다.","Supprimer les lignes en double en gardant la première.","Doppelte Zeilen entfernen und den ersten Eintrag behalten.","Elimina líneas duplicadas y conserva la primera.","Remove linhas duplicadas e mantém a primeira.","إزالة الأسطر المكررة مع الاحتفاظ بأول ظهور."),
 "remove-empty-lines":L("删除空行，只保留有内容的行。","Remove blank lines and keep lines with content.","空行を削除し、内容のある行だけ残します。","빈 줄을 제거하고 내용이 있는 줄만 유지합니다.","Supprimer les lignes vides et garder celles avec du contenu.","Leere Zeilen entfernen und Inhaltszeilen behalten.","Elimina líneas vacías y conserva las que tienen contenido.","Remove linhas vazias e mantém as linhas com conteúdo.","إزالة الأسطر الفارغة والاحتفاظ بالأسطر ذات المحتوى."),
 "url-encode-decode":L("编码或解码 URL 参数和中文字符。","Encode or decode URL parameters and text.","URLパラメータや文字列をエンコード・デコード。","URL 매개변수와 텍스트를 인코딩·디코딩.","Encoder ou décoder paramètres URL et texte.","URL-Parameter und Text kodieren oder dekodieren.","Codifica o decodifica parámetros URL y texto.","Codifique ou descodifique parâmetros URL e texto.","ترميز أو فك ترميز معلمات URL والنص."),
 "base64-encode-decode":L("在文本与 Base64 之间相互转换。","Convert between text and Base64.","テキストとBase64を相互変換。","텍스트와 Base64를 상호 변환.","Convertir entre texte et Base64.","Text und Base64 ineinander umwandeln.","Convierte entre texto y Base64.","Converta entre texto e Base64.","التحويل بين النص وBase64."),
 "png-to-jpg":L("把 PNG 转成 JPG。","Convert PNG to JPG.","PNGをJPGへ変換。","PNG를 JPG로 변환.","Convertir PNG en JPG.","PNG in JPG umwandeln.","Convierte PNG a JPG.","Converta PNG para JPG.","تحويل PNG إلى JPG."),
 "jpg-to-png":L("把 JPG / JPEG 转成 PNG。","Convert JPG / JPEG to PNG.","JPG / JPEGをPNGへ変換。","JPG / JPEG를 PNG로 변환.","Convertir JPG / JPEG en PNG.","JPG / JPEG in PNG umwandeln.","Convierte JPG / JPEG a PNG.","Converta JPG / JPEG para PNG.","تحويل JPG / JPEG إلى PNG."),
 "webp-to-jpg":L("把 WebP 转成 JPG 或 PNG。","Convert WebP to JPG or PNG.","WebPをJPGまたはPNGへ変換。","WebP를 JPG 또는 PNG로 변환.","Convertir WebP en JPG ou PNG.","WebP in JPG oder PNG umwandeln.","Convierte WebP a JPG o PNG.","Converta WebP para JPG ou PNG.","تحويل WebP إلى JPG أو PNG."),
 "compress-image":L("减小图片体积，并尽量保留清晰度。","Reduce image size while keeping useful quality.","画質を保ちながら画像容量を縮小。","화질을 유지하며 이미지 용량을 줄입니다.","Réduire la taille de l’image en conservant la qualité utile.","Bildgröße reduzieren und brauchbare Qualität erhalten.","Reduce el tamaño de la imagen manteniendo la calidad.","Reduza o tamanho da imagem mantendo a qualidade.","تقليل حجم الصورة مع الحفاظ على جودة مناسبة."),
 "resize-image":L("按像素修改图片宽高，可保持比例。","Change image width and height in pixels, with optional aspect ratio lock.","画像の幅と高さをピクセル指定で変更。","픽셀 단위로 이미지 너비와 높이를 변경.","Modifier largeur et hauteur de l’image en pixels.","Bildbreite und -höhe in Pixeln ändern.","Cambia el ancho y alto de la imagen en píxeles.","Altere largura e altura da imagem em píxeis.","تغيير عرض الصورة وارتفاعها بالبكسل."),
 "remove-exif":L("清除图片中的 GPS、设备和拍摄信息。","Remove GPS, device and capture metadata from images.","画像のGPS・端末・撮影情報を削除。","이미지의 GPS·기기·촬영 정보를 제거.","Supprimer GPS, appareil et métadonnées de prise de vue.","GPS-, Geräte- und Aufnahmedaten aus Bildern entfernen.","Elimina GPS, dispositivo y metadatos de captura.","Remova GPS, dispositivo e metadados de captura.","إزالة GPS ومعلومات الجهاز وبيانات التصوير."),
 "md5-sha256":L("生成 MD5 与 SHA256 校验值。","Generate MD5 and SHA256 checksums.","MD5とSHA256のチェック値を生成。","MD5와 SHA256 검사값을 생성.","Générer les empreintes MD5 et SHA256.","MD5- und SHA256-Prüfsummen erzeugen.","Genera comprobaciones MD5 y SHA256.","Gere verificações MD5 e SHA256.","إنشاء قيم MD5 وSHA256 للتحقق."),
 "xlsx-to-csv":L("把 Excel 工作表导出为 CSV。","Export Excel sheets as CSV.","ExcelシートをCSVへ書き出し。","Excel 시트를 CSV로 내보냅니다.","Exporter les feuilles Excel en CSV.","Excel-Blätter als CSV exportieren.","Exporta hojas de Excel a CSV.","Exporte folhas Excel para CSV.","تصدير أوراق Excel إلى CSV."),
 "csv-to-xlsx":L("把 CSV / TSV 转成 Excel 文件。","Convert CSV / TSV into Excel files.","CSV / TSVをExcelへ変換。","CSV / TSV를 Excel 파일로 변환.","Convertir CSV / TSV en fichiers Excel.","CSV / TSV in Excel-Dateien umwandeln.","Convierte CSV / TSV en archivos Excel.","Converta CSV / TSV em ficheiros Excel.","تحويل CSV / TSV إلى ملفات Excel."),
 "docx-to-txt":L("提取 DOCX 正文为 TXT。","Extract DOCX text to TXT.","DOCX本文をTXTへ抽出。","DOCX 본문을 TXT로 추출.","Extraire le texte DOCX en TXT.","DOCX-Text als TXT extrahieren.","Extrae texto DOCX a TXT.","Extraia texto DOCX para TXT.","استخراج نص DOCX إلى TXT."),
 "pptx-to-txt":L("提取 PPTX 幻灯片文字为 TXT。","Extract PPTX slide text to TXT.","PPTXスライド文字をTXTへ抽出。","PPTX 슬라이드 텍스트를 TXT로 추출.","Extraire le texte des diapositives PPTX en TXT.","PPTX-Folientext als TXT extrahieren.","Extrae texto de diapositivas PPTX a TXT.","Extraia texto dos slides PPTX para TXT.","استخراج نص شرائح PPTX إلى TXT."),
 "json-formatter":L("格式化、压缩并检查 JSON。","Format, minify and validate JSON.","JSONの整形・圧縮・確認。","JSON 서식·압축·검사를 수행.","Formater, minifier et vérifier le JSON.","JSON formatieren, minimieren und prüfen.","Formatea, minimiza y valida JSON.","Formate, compacte e valide JSON.","تنسيق JSON وضغطه والتحقق منه."),
 "timestamp-converter":L("在 Unix 时间戳与可读时间之间转换。","Convert between Unix timestamps and readable time.","Unixタイムスタンプと日時を相互変換。","Unix 타임스탬프와 읽을 수 있는 시간 변환.","Convertir horodatages Unix et dates lisibles.","Unix-Zeitstempel und lesbare Zeit umwandeln.","Convierte marcas Unix y fecha legible.","Converta timestamps Unix e hora legível.","التحويل بين توقيت Unix والوقت المقروء."),
 "qr-code-generator":L("把文本或链接生成二维码。","Create a QR code from text or a link.","テキストやURLからQRコードを生成。","텍스트나 링크로 QR 코드를 생성.","Créer un QR code à partir d’un texte ou lien.","QR-Code aus Text oder Link erstellen.","Crea un QR desde texto o enlace.","Crie QR a partir de texto ou link.","إنشاء QR من نص أو رابط."),
 "qr-code-reader":L("读取二维码里的文本或链接。","Read text or links from a QR code.","QRコード内の文字やURLを読取。","QR 코드의 텍스트나 링크를 읽습니다.","Lire le texte ou lien d’un QR code.","Text oder Links aus QR-Code lesen.","Lee texto o enlaces de un QR.","Leia texto ou links de um QR.","قراءة النص أو الرابط من رمز QR."),
 "merge-pdf":L("按顺序把多个 PDF 合成一个文件。","Merge multiple PDFs into one file in order.","複数PDFを順番に1つへ結合。","여러 PDF를 순서대로 하나로 합칩니다.","Fusionner plusieurs PDF en un seul dans l’ordre.","Mehrere PDFs in Reihenfolge zusammenführen.","Une varios PDF en un solo archivo y en orden.","Junte vários PDF num só ficheiro pela ordem.","دمج عدة ملفات PDF في ملف واحد بالترتيب."),
 "split-pdf":L("把 PDF 按页拆成独立文件。","Split a PDF into separate page files.","PDFをページごとのファイルに分割。","PDF를 페이지별 파일로 분할.","Diviser un PDF en fichiers page par page.","PDF in einzelne Seitendateien aufteilen.","Divide un PDF en archivos por página.","Divida PDF em ficheiros por página.","تقسيم PDF إلى ملفات منفصلة لكل صفحة."),
 "compress-pdf":L("减小扫描件和图片型 PDF 的体积。","Reduce the size of scanned and image-heavy PDFs.","スキャン・画像中心PDFの容量を縮小。","스캔·이미지 중심 PDF 용량을 줄입니다.","Réduire la taille des PDF scannés ou riches en images.","Gescanntes oder bildlastiges PDF verkleinern.","Reduce PDF escaneados o con muchas imágenes.","Reduza PDF digitalizados ou com muitas imagens.","تقليل حجم ملفات PDF الممسوحة أو الغنية بالصور."),
 "image-to-pdf":L("把多张图片按顺序生成一个 PDF。","Create one PDF from multiple images in order.","複数画像を順番に1つのPDFへ。","여러 이미지를 순서대로 하나의 PDF로 만듭니다.","Créer un PDF à partir de plusieurs images dans l’ordre.","Mehrere Bilder in Reihenfolge zu einem PDF zusammenstellen.","Crea un PDF con varias imágenes en orden.","Crie um PDF com várias imagens por ordem.","إنشاء PDF واحد من عدة صور بالترتيب."),
 "pdf-to-jpg":L("把 PDF 每一页导出为 JPG。","Export every PDF page as JPG.","PDF各ページをJPGへ書き出し。","PDF 각 페이지를 JPG로 내보냅니다.","Exporter chaque page PDF en JPG.","Jede PDF-Seite als JPG exportieren.","Exporta cada página PDF como JPG.","Exporte cada página PDF como JPG.","تصدير كل صفحة PDF بصيغة JPG.")
};
export const toolCardLine=(lang:LingxiLang,slug:string,kind:keyof typeof GENERIC,fallbackZh:string,fallbackEn:string)=>{
 const special=SUMMARY[slug]?.[lang]||SIMPLE[slug]?.[lang];
 if(special)return special;
 if(lang==="zh"&&fallbackZh)return fallbackZh.replace(/浏览器本地|本地完成|本地处理|文件不上传服务器|不上传服务器|不上传灵犀场服务器|全部在浏览器本地处理|，本地完成|，本地处理|。本地处理/g,"").replace(/\s{2,}/g," ").trim();
 if(lang==="en"&&fallbackEn)return fallbackEn.replace(/entirely in your browser|locally in your browser|locally|local only|nothing is uploaded|without uploading it/gi,"").replace(/\s{2,}/g," ").trim();
 return GENERIC[kind]?.[lang]||GENERIC.utility[lang];
};
`;
 }
 save(p,s);console.log("PASS hub hero + function lines");
}

// ---------- 2) Hub: every card has function line, restore hero subtitle ----------
{
 const p="components/tools/ToolsHubV11.tsx";
 let s=read(p);
 s=s.replace(
  'import {toolCategoryLabel,toolHubCopy,toolSummary,type ToolDisplayCategory} from "@/lib/tools/hub-copy-v1470";',
  'import {toolCategoryLabel,toolHubCopy,toolCardLine,type ToolDisplayCategory} from "@/lib/tools/hub-copy-v1470";'
 );
 s=s.replace('  const foreign = lang !== "zh";\n','');
 s=s.replace(
  '<div><span>{toolHubCopy(lang,"kicker")}</span><h1>{toolHubCopy(lang,"title")}</h1></div>',
  '<div><span>{toolHubCopy(lang,"kicker")}</span><h1>{toolHubCopy(lang,"title")}</h1><p>{toolHubCopy(lang,"subtitle")}</p></div>'
 );
 s=s.replace(
  '              const summary=toolSummary(lang,slug);',
  '              const summary=toolCardLine(lang,slug,item.kind,item.descZh,item.descEn);'
 );
 s=s.replace('<ToolGlyph kind={item.kind} />','<ToolGlyph kind={item.kind} slug={slug} />');
 save(p,s);console.log("PASS hub functional descriptions + glyph slug");
}

// ---------- 3) Small colorful glyphs: varied by slug, no heavy file icon ----------
{
 const p="components/tools/ToolGlyph.tsx";
 const content=`"use client";

type Kind = "image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

const ICON:Record<Kind,string>={
 image:"◒",
 document:"≡",
 video:"▶",
 audio:"♪",
 privacy:"◇",
 utility:"✣",
 ai:"✦",
 qr:"⌗",
};
const PALETTES=[
 ["#fff0f6","#ffe7c7","#d64d88"],
 ["#eef4ff","#e8efff","#5877d8"],
 ["#eefcf8","#dff7ef","#2e9c78"],
 ["#f5efff","#eee6ff","#8062d9"],
 ["#fff7df","#ffead7","#d68135"],
 ["#edf9ff","#e2f1ff","#3788bd"],
 ["#fff0ef","#ffe5e9","#d55b68"],
 ["#f1f7ee","#e8f5df","#5c9b49"],
] as const;
function palette(slug:string){
 let n=0;for(let i=0;i<slug.length;i++)n=(n*31+slug.charCodeAt(i))>>>0;
 return PALETTES[n%PALETTES.length];
}
export default function ToolGlyph({kind,slug=""}:{kind:Kind;slug?:string}) {
 const [a,b,fg]=palette(slug||kind);
 return <span aria-hidden="true" style={{
   width:34,height:34,borderRadius:10,display:"grid",placeItems:"center",
   fontSize:17,fontWeight:750,lineHeight:1,color:fg,
   background:\`linear-gradient(145deg,\${a},\${b})\`,
   boxShadow:"inset 0 0 0 1px rgba(25,38,60,.055),0 4px 12px rgba(40,55,75,.055)"
 }}>{ICON[kind]??ICON.utility}</span>;
}
`;
 save(p,content);console.log("PASS colorful lightweight glyphs");
}

// ---------- 4) Replace photo-frame cards with dense tool cards ----------
{
 const p="app/globals.css";
 let s=read(p);
 const marker="/* V14.72.1 dense living tool cards */";
 if(!s.includes(marker)){
   s+=`

${marker}
.lx-tools-v124 .lx11-wrap{max-width:1210px!important}
.lx-tools-v124 .lx11-tools-hero{
  padding:22px 0 16px!important;
  min-height:0!important;
  border-bottom:0!important;
}
.lx-tools-v124 .lx11-tools-hero>div{max-width:760px}
.lx-tools-v124 .lx11-tools-hero h1{
  margin:4px 0 0!important;
  font-size:clamp(1.7rem,2.35vw,2.2rem)!important;
  line-height:1.16!important;
}
.lx-tools-v124 .lx11-tools-hero p{
  margin:9px 0 0!important;
  color:var(--lx-muted)!important;
  font-size:13px!important;
  line-height:1.7!important;
}
.lx-tools-v124 .lx11-tool-searchbar{margin-top:0!important}
.lx-tools-v124 .lx11-tool-group{margin-top:16px!important}
.lx-tools-v124-grid{
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:10px!important;
}
.lx-tools-v124-card{
  position:relative!important;
  display:grid!important;
  grid-template-columns:34px minmax(0,1fr)!important;
  gap:11px!important;
  align-items:start!important;
  min-height:84px!important;
  height:84px!important;
  max-height:84px!important;
  padding:13px 34px 12px 13px!important;
  border:1px solid rgba(33,55,82,.10)!important;
  border-radius:13px!important;
  background:rgba(255,255,255,.72)!important;
  box-shadow:0 4px 14px rgba(35,52,76,.025)!important;
  overflow:hidden!important;
  transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease!important;
}
.lx-tools-v124-card:hover{
  transform:translateY(-1px)!important;
  border-color:rgba(100,115,210,.24)!important;
  background:#fff!important;
  box-shadow:0 8px 20px rgba(35,52,76,.065)!important;
}
.lx-tools-v124-card .lx11-tool-cover{
  width:34px!important;
  min-width:34px!important;
  max-width:34px!important;
  height:34px!important;
  min-height:34px!important;
  max-height:34px!important;
  padding:0!important;
  margin:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
  display:block!important;
  align-self:start!important;
  overflow:visible!important;
}
.lx-tools-v124-card .lx11-tool-copy{
  display:block!important;
  min-width:0!important;
  min-height:0!important;
  height:auto!important;
  padding:0!important;
  margin:0!important;
  background:transparent!important;
}
.lx-tools-v124-card .lx11-tool-title-row{padding:0!important;margin:0!important}
.lx-tools-v124-card .lx11-tool-title-row h3{
  margin:0!important;
  padding:0!important;
  color:var(--lx-ink)!important;
  font-size:13.5px!important;
  font-weight:650!important;
  line-height:1.38!important;
}
.lx-tools-v124-card .lx-tools-v124-desc{
  margin:5px 0 0!important;
  color:var(--lx-muted)!important;
  font-size:11.5px!important;
  line-height:1.48!important;
  display:-webkit-box!important;
  overflow:hidden!important;
  -webkit-box-orient:vertical!important;
  -webkit-line-clamp:2!important;
}
.lx-tools-v124-card .lx-tool-card-arrow{
  position:absolute!important;
  right:12px!important;
  top:13px!important;
  color:rgba(53,74,105,.28)!important;
  font-size:13px!important;
}
.lx-tools-v124-card:hover .lx-tool-card-arrow{
  color:rgba(89,101,194,.75)!important;
  transform:translateX(2px)!important;
}
@media(max-width:1180px){.lx-tools-v124-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:820px){.lx-tools-v124-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.lx-tools-v124-card{height:88px!important;max-height:88px!important}}
@media(max-width:540px){.lx-tools-v124-grid{grid-template-columns:1fr!important}.lx-tools-v124-card{height:auto!important;max-height:none!important;min-height:78px!important}}
`;
   save(p,s);console.log("PASS dense living tool cards");
 }else console.log("ALREADY dense living tool cards");
}

// ---------- 5) Supersede failed V14.72: remove engineering copy exactly ----------
{
 const p="app/tools/[slug]/page.tsx";
 let s=read(p);

 // Replace the complete FAQ function by structural anchors.
 // Do not depend on LF vs CRLF: Windows Git worktrees may contain CRLF.
 const faqStart=s.indexOf("function faqFor(slug: string): BilingualFaqItem[] {");
 const pageStart=s.indexOf("export default function ToolSlugPage",faqStart);
 if(faqStart<0||pageStart<0){
   console.error("MISS dynamic FAQ structural anchors");
   failures.push("dynamic FAQ structural anchors");
 }else{
   const newFaq=`function faqFor(slug: string): BilingualFaqItem[] {
  const common: BilingualFaqItem[] = [
    {
      qZh: "处理失败怎么办？",
      qEn: "What if processing fails?",
      aZh: "页面会说明原因和可以尝试的解决办法，例如文件过大、格式不支持或浏览器版本过旧。",
      aEn: "The page explains the reason and what to try next, such as file size, unsupported format, or an outdated browser.",
    },
  ];
  if (slug.startsWith("compress-image")) {
    common.unshift({
      qZh: "为什么压不到目标大小？",
      qEn: "Why can’t it reach the target size?",
      aZh: "图片分辨率或细节很多时，继续缩小会明显影响清晰度。工具会尽量接近目标，并显示实际结果。",
      aEn: "Very large or detailed images may lose noticeable quality if reduced further. The tool gets as close as possible and shows the actual result.",
    });
  }
  return common;
}

`;
   s=s.slice(0,faqStart)+newFaq+s.slice(pageStart);
 }

 // Remove technical props using syntax landmarks, not newline text.
 // Find <ToolWorkbench, then keep the closing ">" of the opening <ToolShell ...> tag.
 const techStart=s.indexOf("          techNoteZh={");
 if(techStart>=0){
   const workbenchStart=s.indexOf("<ToolWorkbench",techStart);
   const openTagClose=workbenchStart>=0?s.lastIndexOf(">",workbenchStart):-1;
   if(workbenchStart<0||openTagClose<techStart){
     console.error("MISS tech note structural end");
     failures.push("tech note structural end");
   }else{
     s=s.slice(0,techStart)+s.slice(openTagClose);
   }
 }

 save(p,s);console.log("PASS dynamic detail page engineering copy removed");
}

// ToolShell: no repeated implementation/privacy essays; keep title, useful summary, FAQs and related tools.
{
 const p="components/tools/ToolShell.tsx";
 let s=read(p);
 s=s.replace('import PrivacyBadge from "./PrivacyBadge";\n','');
 if(!s.includes('import {toolTitle} from "@/lib/tools/card-i18n";')){
   s=s.replace('import {toolShellText} from "@/lib/tool-shell-i18n";',
   'import {toolShellText} from "@/lib/tool-shell-i18n";\nimport {toolTitle} from "@/lib/tools/card-i18n";\nimport {toolCardLine} from "@/lib/tools/hub-copy-v1470";');
 }
 s=s.replace(
 'export default function ToolShell({tool,children,faq,techNoteZh,techNoteEn}:{tool:ToolMeta;children:ReactNode;faq?:BilingualFaqItem[];techNoteZh?:string;techNoteEn?:string}){\n const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolShellText(lang,zh,en);',
 'export default function ToolShell({tool,children,faq}:{tool:ToolMeta;children:ReactNode;faq?:BilingualFaqItem[];techNoteZh?:string;techNoteEn?:string}){\n const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolShellText(lang,zh,en);const title=toolTitle(lang,tool.slug,lang==="zh"?tool.titleZh:tool.titleEn);const summary=toolCardLine(lang,tool.slug,tool.category==="pdf"?"document":tool.category==="image"?"image":tool.category==="qr"?"qr":"utility",tool.oneLinerZh,tool.oneLinerEn);'
 );
 s=s.replace(
 '<h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">{lang==="zh"?tool.titleZh:tool.titleEn}</h1>\n  <p className="mt-4 max-w-2xl text-base leading-8 text-bone-dim">{lang==="zh"?tool.oneLinerZh:tool.oneLinerEn}</p>\n  <div className="mt-5"><PrivacyBadge localOnly={tool.localOnly}/></div><div className="mt-10">{children}</div>',
 '<h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">{title}</h1>\n  <p className="mt-4 max-w-2xl text-base leading-8 text-bone-dim">{summary}</p>\n  <div className="mt-8">{children}</div>'
 );
 s=s.replace(/\n  \{\(techNoteZh\|\|techNoteEn\)&&<section[\s\S]*?<\/section>\}/,"");
 s=s.replace(/\n  <section className="mt-10"><h2 className="font-display text-xl font-light text-bone">\{t\("隐私说明","Privacy"\)\}<\/h2><p className="mt-3 text-sm leading-7 text-bone-dim">\{tool\.localOnly[\s\S]*?<\/p><\/section>/,"");
 save(p,s);console.log("PASS ToolShell engineering copy removed");
}

// ---------- 6) Supersede remaining V14.72 payment/provider-copy fixes ----------
rep("components/tools/ToolWorkbench.tsx",
'        {t("此工具已在产品路线图中，但尚未实现真实处理逻辑。我们不会用假按钮或演示数据冒充上线。请先使用已标记为可用的工具。","This tool is on the roadmap but not implemented yet. We will not ship fake buttons or mock results. Please use tools marked as live.")}',
'        {t("此功能暂未开放。","This feature is not available yet.")}',
"planned user copy");
rep("components/tools/ToolWorkbench.tsx",
'      messageZh: "已通过画布重编码去除 EXIF / GPS 等元数据。",',
'      messageZh: "图片中的 EXIF、GPS 等隐私信息已清除。",',
"remove-exif copy");
rep("components/tools/ToolWorkbench.tsx",
'      messageEn: "Metadata (EXIF/GPS etc.) removed by re-encoding on canvas.",',
'      messageEn: "EXIF, GPS and other image metadata have been removed.",',
"remove-exif en");
rep("components/tools/ToolWorkbench.tsx",
'      messageZh: "哈希已在本地计算完成。",',
'      messageZh: "文件校验值已生成。",',
"hash copy");
rep("components/tools/ToolWorkbench.tsx",
'      messageEn: "Hashes computed locally.",',
'      messageEn: "File verification hashes are ready.",',
"hash en");

{
 const p="components/tools/PaidActionButton.tsx";
 let s=read(p);
 s=s.replace(
  'type Quote={id:string;tool_id:string;quantity:number;unit_name:string;amount_rmb:number;expires_at:string;status?:string};',
  'type Quote={id:string;tool_id:string;quantity:number;unit_name:string;amount_rmb:number;amount_usd:number;expires_at:string;status?:string};'
 );
 s=s.replace(
  'priced:c("价格已由服务器计算。确认后才开始付费处理。","Price calculated by the server. Paid processing starts only after confirmation.","価格はサーバーで計算済みです。","가격은 서버에서 계산되었습니다.","Prix calculé par le serveur.","Preis serverseitig berechnet.","Precio calculado por el servidor.","Preço calculado pelo servidor.","تم حساب السعر على الخادم."),',
  'priced:c("价格已确认，选择支付方式后继续。","Price confirmed. Choose a payment method to continue.","価格を確認しました。支払い方法を選んで続けてください。","가격이 확인되었습니다. 결제 수단을 선택해 계속하세요.","Prix confirmé. Choisissez un moyen de paiement pour continuer.","Preis bestätigt. Zahlungsmethode wählen und fortfahren.","Precio confirmado. Elige un método de pago para continuar.","Preço confirmado. Escolha uma forma de pagamento para continuar.","تم تأكيد السعر. اختر طريقة الدفع للمتابعة."),'
 );
 s=s.replace(
  '<div className="rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">{t(UI.thisTime)} {quote.quantity} {quote.unit_name} · <b className="text-lg">¥{quote.amount_rmb}</b></div>',
  '<div className="rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">{t(UI.thisTime)} {quote.quantity} {quote.unit_name} · <b className="text-lg">¥{quote.amount_rmb}</b><span className="ml-2 text-slate-500">/ ${quote.amount_usd} USD</span></div>'
 );
 save(p,s);console.log("PASS paid tool dual currency copy");
}
rep("app/tools/pay/page.tsx",
'<div className="text-sm text-slate-500">{q.tool_id}</div><div className="mt-2 text-sm text-slate-500">{t("actualQty")}：{q.quantity} {q.unit_name}</div>',
'<div className="text-sm text-slate-500">{t("actualQty")}：{q.quantity} {q.unit_name}</div>',
"hide internal tool id");
rep("components/tools/ImageWatermarkWorkbench.tsx",
'    if(!r.ok)throw new Error(d.error==="OPENAI_NOT_CONFIGURED"?"还没有配置 OPENAI_API_KEY。":(d.detail?.error?.message||d.error||"处理失败"));',
'    if(!r.ok)throw new Error(d.error==="OPENAI_NOT_CONFIGURED"?"图片处理服务暂不可用，请稍后再试。":(d.detail?.error?.message||d.error||"处理失败"));',
"image provider copy");
rep("components/tools/ImageWatermarkWorkbench.tsx",
'  <p className="mt-3 text-xs leading-5 text-slate-500">付款确认后才调用图像编辑模型。仅处理你拥有版权、已获授权或自己制作的内容。</p>',
'  <p className="mt-3 text-xs leading-5 text-slate-500">确认价格并付款后开始处理。仅处理拥有版权、已获授权或自行制作的内容。</p>',
"image model copy");
rep("components/tools/VideoDubbingWorkbench.tsx",
'   if(!res.ok)throw new Error(data.error==="ELEVENLABS_NOT_CONFIGURED"?"还没有配置 ELEVENLABS_API_KEY。":(data.detail||data.error||"创建失败"));',
'   if(!res.ok)throw new Error(data.error==="ELEVENLABS_NOT_CONFIGURED"?"视频配音服务暂不可用，请稍后再试。":(data.detail||data.error||"创建失败"));',
"dubbing provider copy");
rep("components/tools/VideoDubbingWorkbench.tsx",
'if(d.error==="TOPUP_REQUIRED"){setTopupRequired(Number(d.required_minutes)||0);setError(`供应商检测到实际时长需要按 ${d.required_minutes} 分钟计费，需要补差价。`)}else{setTopupRequired(0)}',
'if(d.error==="TOPUP_REQUIRED"){setTopupRequired(Number(d.required_minutes)||0);setError(`检测到实际时长需要按 ${d.required_minutes} 分钟计费，需要补足差额。`)}else{setTopupRequired(0)}',
"dubbing topup copy");
rep("components/tools/VideoDubbingWorkbench.tsx",
'  <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">ElevenLabs 当前按源媒体分钟数、按目标语言收费。我们先检测时长并由服务器报价，付款后才创建项目。项目创建本身会产生供应商费用。</div>',
'  <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">按源媒体时长和目标语言计费。确认本次价格并付款后开始处理。</div>',
"dubbing pricing copy");
rep("components/tools/VideoDubbingWorkbench.tsx",
'{status&&<div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">当前状态：<strong>{status}</strong>{projectId&&<span className="ml-2 text-slate-400">{projectId}</span>}</div>}',
'{status&&<div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">当前状态：<strong>{status}</strong></div>}',
"hide dubbing project id");

if(failures.length){
 console.error(`V14.72.4_PATCH_FAILURES=${failures.length}`);
 failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));
 process.exit(1);
}
console.log("V14.72.4_PATCH=PASS");
