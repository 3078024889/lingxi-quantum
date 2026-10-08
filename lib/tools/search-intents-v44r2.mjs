/* LINGXIFIELD V44 — multilingual task intent search. User language in, useful tool out. */
const COMMON_PREFIXES = [
  '我要','我想','想要','请帮我','帮我','请','怎么','如何','需要','有没有','能不能','可以','给我',
  'i want to','i want','i need to','i need','please help me','please','how do i','how to','can i',
  'したい','してほしい','お願い','方法','どうやって',
  '하고 싶어요','하고 싶어','해주세요','방법','어떻게',
  'je veux','je voudrais','j ai besoin de','comment','pouvez vous',
  'ich möchte','ich will','ich brauche','wie kann ich','bitte',
  'quiero','necesito','cómo','como','por favor','puedo',
  'quero','preciso','como','por favor','posso',
  'أريد','اريد','أحتاج','احتاج','كيف','من فضلك','هل يمكن'
];

const COMMON_SUFFIXES = [
  '一下','一个','工具','功能','处理','在线','可以吗','怎么弄',
  'for me','online','tool','please',
  'したい','できますか','ツール',
  '해주세요','도구','온라인',
  'en ligne','outil','svp',
  'online','werkzeug','bitte',
  'online','herramienta','por favor',
  'online','ferramenta','por favor',
  'اونلاين','أونلاين','أداة','اداة'
];

const TOKEN_STOPWORDS = new Set([
  'i','want','need','to','a','an','the','please','me','my','can','how','do',
  'je','veux','voudrais','ai','besoin','de','un','une','le','la','les','svp','comment',
  'ich','mochte','will','brauche','einen','eine','ein','wie','kann','bitte',
  'quiero','necesito','un','una','el','la','los','las','como','por','favor','puedo',
  'quero','preciso','um','uma','o','a','os','as','como','por','favor','posso'
]);

function canonical(value='') {
  let s=String(value)
    .normalize('NFKD')
    .replace(/\p{M}/gu,'')
    .toLowerCase()
    .replace(/[，。！？、,.!?;；:："'“”‘’()（）【】\[\]{}<>《》/_–—-]+/g,' ');

  // CJK / Arabic conversational wrappers that do not change the requested task.
  s=s
    .replace(/^(我要|我想|想要|请帮我|帮我|请|怎么|如何|需要|有没有|能不能|可以|给我)/g,' ')
    .replace(/(一下|一个|工具|功能|处理|在线|可以吗|怎么弄)$/g,' ')
    .replace(/^(お願い|どうやって)/g,' ')
    .replace(/(を|が|の|したい|してほしい|できますか|ツール)/g,' ')
    .replace(/(하고\s*싶어요|하고\s*싶어|해주세요|도구|온라인)/g,' ')
    .replace(/^(أريد|اريد|أحتاج|احتاج|كيف|من فضلك|هل يمكن)/g,' ')
    .replace(/(اونلاين|أونلاين|أداة|اداة)$/g,' ');

  const tokens=s.split(/\s+/).filter(Boolean).filter(t=>!TOKEN_STOPWORDS.has(t));
  return tokens.join('');
}

export function normalizeIntent(value='') { return canonical(value); }
function normalizeLoose(value='') { return canonical(value); }

export const INTENT_ALIASES = {
  'ai-image-check':['AI图片','AI图像','AI图片检测','AI图片真假','AI生成图片','AI绘画检测','图片是不是AI生成','图片真伪','deepfake image','ai image detector','ai generated image','生成画像','AI 이미지 감지','détection image IA','KI Bild erkennen','detectar imagen IA','detectar imagem IA','كشف الصور بالذكاء الاصطناعي'],
  'ai-video-audio-check':['AI视频','AI音频','AI视频检测','AI视频真假','AI生成视频','AI换脸检测','深度伪造视频','视频是不是AI做的','视频真伪','AI配音检测','AI语音','deepfake video','ai video detector','ai generated video','deepfake audio','ai audio detector','AI動画検出','AI 영상 검사','détection vidéo IA','KI Video erkennen','detectar vídeo IA','كشف الفيديو المزيف'],
  'file-type-detector':['文件真实格式','文件格式检测','文件格式识别','后缀名和格式不一致','magic bytes','file type detector','file format checker'],
  'pdf-compress':[
    '压缩pdf','pdf变小','减小pdf体积','pdf太大',
    'compress pdf','reduce pdf size','make pdf smaller',
    'pdf 圧縮','pdfを小さく','pdf 압축','pdf 용량 줄이기',
    'compresser pdf','réduire taille pdf','pdf komprimieren','pdf verkleinern',
    'comprimir pdf','reducir pdf','compactar pdf','reduzir pdf','ضغط pdf','تصغير pdf'
  ],
  'pdf-merge-split':[
    '合并pdf','拆分pdf','pdf合并','pdf拆分','merge pdf','split pdf','combine pdf',
    'pdf 結合','pdf 分割','pdf 병합','pdf 분할','fusionner pdf','diviser pdf',
    'pdf zusammenfügen','pdf teilen','unir pdf','dividir pdf','juntar pdf','separar pdf','دمج pdf','تقسيم pdf'
  ],
  'image-watermark-remover':[
    '图片去水印','照片去水印','去掉图片水印','remove image watermark','remove watermark from image',
    '画像 透かし 削除','이미지 워터마크 제거','supprimer filigrane image','wasserzeichen bild entfernen',
    'quitar marca de agua imagen','remover marca d agua imagem','إزالة علامة مائية من صورة','ازالة علامة مائية من صورة'
  ],
  'video-watermark-remover':[
    '视频去水印','去掉视频水印','remove video watermark','remove watermark from video',
    '動画 透かし 削除','비디오 워터마크 제거','supprimer filigrane vidéo','wasserzeichen video entfernen',
    'quitar marca de agua video','remover marca d agua vídeo','إزالة علامة مائية من فيديو','ازالة علامة مائية من فيديو'
  ],
  'ocr':[
    '图片文字识别','提取图片文字','图片转文字','把图片里的文字提出来','图片里的文字提出来','image ocr','image to text','extract text from image',
    '画像 文字 認識','画像 テキスト','이미지 글자 추출','ocr image','extraire texte image',
    'text aus bild','texto de imagen','extrair texto imagem','استخراج النص من الصورة','تحويل صورة الى نص'
  ],
  'video-transcription':[
    '视频转文字','视频语音转文字','video to text','video transcription','transcribe video',
    '動画 文字起こし','영상 텍스트 변환','transcription vidéo','video transkribieren',
    'video a texto','transcribir video','vídeo para texto','transcrever vídeo','تحويل الفيديو إلى نص','تفريغ الفيديو'
  ],
  'audio-transcription':[
    '音频转文字','录音转文字','audio to text','audio transcription','transcribe audio',
    '音声 文字起こし','오디오 텍스트 변환','audio en texte','audio transkribieren',
    'audio a texto','transcribir audio','áudio para texto','transcrever áudio','تحويل الصوت إلى نص','تفريغ الصوت'
  ],
  'subtitle-translate':[
    '字幕翻译','翻译字幕','translate subtitles','subtitle translator','字幕 翻訳','자막 번역',
    'traduire sous titres','untertitel übersetzen','traducir subtítulos','traduzir legendas','ترجمة الترجمة النصية','ترجمة字幕'
  ],
  'temp-mail':[
    '临时邮箱','一次性邮箱','收验证码邮箱','temporary email','temp mail','disposable email','10 minute mail',
    '捨てメアド','一時メール','임시 이메일','email temporaire','temporäre email','correo temporal','email temporário','بريد مؤقت','ايميل مؤقت'
  ],
  'burn-after-read':[
    '阅后即焚','看一次就消失','临时私密链接','burn after reading','one time link','expiring private link',
    '一度読んだら消える','읽고 사라지는 링크','lien éphémère','einmal link','enlace que caduca','link que expira','رابط يختفي بعد القراءة','رابط مؤقت'
  ],
  'food-calorie':[
    '卡路里','食物热量','营养识别','calorie','food calories','food nutrition','nutrition calculator',
    'カロリー','食事 栄養','칼로리','음식 영양','calories aliments','nutrition repas','kalorien essen',
    'calorías comida','nutrición comida','calorias comida','nutrição alimento','سعرات الطعام','تغذية الطعام'
  ],
  'id-photo-ai':[
    '证件照','证件照片','id photo','passport photo','証明写真','증명사진','photo identité','passfoto',
    'foto carnet','foto documento','صورة هوية','صورة جواز'
  ],
  'document-copy-layout':[
    '证件复印排版','身份证复印','证件a4排版','document copy layout','id copy layout','証明書 コピー 配置',
    '신분증 복사 배치','mise en page copie pièce identité','ausweis kopie layout','copia documento a4','cópia documento a4','نسخ الهوية a4','ترتيب نسخة الهوية'
  ],
  'e-sign-pdf':[
    'pdf签名','电子签名','pdf盖章','骑缝章','sign pdf','e sign pdf','stamp pdf','pdf 署名','pdf 서명',
    'signer pdf','pdf unterschreiben','firmar pdf','assinar pdf','توقيع pdf','ختم pdf'
  ]
};

const BROAD_TOOL_TERMS = [
  'pdf','图片','照片','图像','视频','音频','字幕','文件','表格','excel','ocr','邮箱','水印','二维码','证件照','卡路里','热量','签名','盖章',
  'image','photo','video','audio','subtitle','file','spreadsheet','email','watermark','qr','calorie','nutrition','signature',
  '画像','写真','動画','音声','字幕','ファイル','メール','透かし','カロリー',
  '이미지','사진','영상','오디오','자막','파일','이메일','워터마크','칼로리',
  'image','photo','vidéo','audio','sous-titre','fichier','email','filigrane','calorie',
  'bild','foto','video','audio','untertitel','datei','email','wasserzeichen','kalorien',
  'imagen','foto','vídeo','audio','subtítulo','archivo','correo','marca de agua','calorías',
  'imagem','foto','vídeo','áudio','legenda','arquivo','email','marca d agua','calorias',
  'صورة','فيديو','صوت','ترجمة','ملف','بريد','علامة مائية','سعرات','توقيع'
].map(normalizeLoose).filter(Boolean);

export function isLikelyToolQuery(rawQuery='') {
  const needle=normalizeLoose(rawQuery);
  if (!needle) return false;
  if (BROAD_TOOL_TERMS.some(term=>needle.includes(term))) return true;
  return Object.values(INTENT_ALIASES).some(list=>list.some(term=>needle.includes(normalizeLoose(term))));
}

function scoreText(needle,text,exact=100,contains=55,reverse=32){
  const hay=normalizeLoose(text);
  if(!needle||!hay)return 0;
  if(hay===needle)return exact;
  if(hay.includes(needle))return contains;
  if(needle.includes(hay)&&hay.length>=3)return reverse;
  return 0;
}

export function scoreToolIntent(item,rawQuery,localizedText=''){
  const needle=normalizeIntent(rawQuery);
  if(!needle)return 1;
  const slug=String(item.href||'').replace('/tools/','');
  let score=0;
  score=Math.max(score,scoreText(needle,slug.replaceAll('-',' '),115,70,28));
  score=Math.max(score,scoreText(needle,item.titleZh||'',125,76,45));
  score=Math.max(score,scoreText(needle,item.titleEn||'',125,76,45));
  score=Math.max(score,scoreText(needle,localizedText||'',118,72,40));
  score=Math.max(score,scoreText(needle,item.descZh||'',70,42,18));
  score=Math.max(score,scoreText(needle,item.descEn||'',70,42,18));
  for(const alias of INTENT_ALIASES[slug]||[]){
    score=Math.max(score,scoreText(needle,alias,140,92,58));
  }
  return score;
}

export function searchToolItems(items,rawQuery,category,getCategory,getLocalizedText){
  const q=String(rawQuery||'').trim();
  return items
    .filter(item=>category==='all'||getCategory(item)===category)
    .map((item,index)=>({item,index,score:q?scoreToolIntent(item,q,getLocalizedText?.(item)||''):1}))
    .filter(row=>row.score>0)
    .sort((a,b)=>b.score-a.score||a.index-b.index)
    .map(row=>row.item);
}
