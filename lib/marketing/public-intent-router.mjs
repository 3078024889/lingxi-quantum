/**
 * Public, zero-network task routing for the homepage search box.
 * Never attach the raw search phrase to cross-product paths; these URLs can
 * enter logs, referrals and sharing previews. Do not guess a paid entitlement.
 * Only return routes already present in the public tool catalogue.
 */
const has = (v, pattern) => pattern.test(v);
const compact = (query) => String(query ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
const pdf = /pdf|便携式文档|피디에프|피디에프|بي دي اف/i;
const image = /图片|照片|图像|image|photo|picture|画像|写真|이미지|사진|bild|foto|imagen|imagem|صورة|الصور/i;
const compress = /压缩|变小|太大|縮小|圧縮|압축|compress|reduce|shrink|smaller|kleiner|komprim|comprim|compactar|ضغط/i;
const merge = /合并|合成一个|結合|結合|병합|합치|merge|combine|join|fusionn|zusammenfüg|unir|juntar|دمج/i;
const split = /拆分|分割|分割|분할|split|separate|diviser|teilen|dividir|تقسيم/i;
const convert = /转换|转成|转为|格式|convert|to |変換|변환|konvert|convertir|converter|تحويل/i;

/** @returns {string|null} route path only, never an external URL */
export function resolvePublicSearchIntent(query) {
  const q = compact(query);
  if (!q || q.length > 240) return null;

  // Specific file workflows outrank generic SI/AI comparisons and model mentions.
  if (has(q, /heic|heif/i) && (has(q, /jpe?g|jpg|convert|转换|转|変換|변환|umwandeln|convertir|تحويل/i) || q.length <= 10))
    return "/tools/heic-to-jpg";
  if (has(q, pdf) && has(q, /excel|xlsx|表格|试算表/i)) return "/tools/pdf-to-xlsx";
  if (has(q, pdf) && has(q, /word|docx|可编辑文档/i)) return "/tools/pdf-to-word";
  if (has(q, pdf) && has(q, /ocr|扫描|掃描|스캔|scann|文字识别|识別|识别文字|texterkennung/i)) return "/tools/pdf-ocr";
  if (has(q, pdf) && has(q, compress)) return "/tools/pdf-compress";
  if (has(q, pdf) && has(q, split)) return "/tools/pdf-merge-split";
  if (has(q, pdf) && has(q, merge)) return "/tools/merge-pdf";
  if (has(q, pdf) && has(q, /签名|签字|签章|盖章|signature|sign pdf|unterschrift|签署|署名|firma|assinar/i)) return "/tools/e-sign-pdf";
  if (has(q, /ocr|图片文字|图片转文字|截图转文字|image to text|extract text from (image|photo)|文字起こし|문자 인식/i) && !has(q, /video|audio|视频|音频|录音|영상|오디오/i))
    return "/tools/ocr";
  if (has(q, image) && has(q, compress)) {
    const exact = q.match(/(?:^|[^\d])(20|50|100|200|500)\s*kb/i);
    return exact ? `/tools/compress-image-to-${exact[1]}kb` : "/tools/compress-image";
  }
  if (has(q, /临时邮箱|临时邮件|一次性邮箱|temporary email|temp mail|disposable email|捨てメアド|임시 이메일|e-mail temporaire|temporäre e-mail|correo temporal|email temporário|بريد مؤقت/i))
    return "/tools/temp-mail";
  if (has(q, /阅后即焚|看完销毁|burn after read|one-time secret|einmalgeheimnis|읽은 후 삭제/i))
    return "/tools/burn-after-read";
  if (has(q, /视频转文字|视频语音转文字|video to text|video transcription|transcribe video|영상.*텍스트|動画.*文字起こし/i))
    return "/tools/video-transcription";
  if (has(q, /录音转文字|音频转文字|audio to text|audio transcription|transcribe audio|녹음.*텍스트|音声.*文字起こし/i))
    return "/tools/audio-transcription";

  // Comparisons are research tasks, not paid generation. Never imply ranking quality.
  if (has(q, /siai|全球ai|全球si|ai.*(排名|排行|对比|哪个好|比较|费用|价格|多少钱|免费额度|商用|地区|排行榜)|\bai tools?\b.*(price|compare|best|free|cost)|model.*(price|comparison)|ai (ranking|directory|comparison)|vergleich.*ki|comparatif.*ia/i))
    return "/siai";
  if (has(q, /sasi|短剧|剧本|生成网站|做网站|short drama|website builder|ai video generation|création de site|webseite erstellen|sitio web con ia/i))
    return "/sasi";
  if (has(q, pdf) || has(q, image) || has(q, /视频|音频|字幕|video|audio|subtitle|文件|csv|excel|xml|json|수정|fichier|arquivo/i))
    return "/tools";
  return null;
}
