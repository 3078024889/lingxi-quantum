import type {LingxiLang} from "@/lib/lingxi-i18n";
const COPY={
  "add": {
    "zh": "添加",
    "en": "Add",
    "ja": "追加",
    "ko": "추가",
    "fr": "Ajouter",
    "de": "Hinzufügen",
    "es": "Añadir",
    "pt": "Adicionar",
    "ar": "إضافة"
  },
  "files": {
    "zh": "添加照片和文件",
    "en": "Add photos and files",
    "ja": "写真とファイルを追加",
    "ko": "사진 및 파일 추가",
    "fr": "Ajouter des photos et fichiers",
    "de": "Fotos und Dateien hinzufügen",
    "es": "Añadir fotos y archivos",
    "pt": "Adicionar fotos e arquivos",
    "ar": "إضافة صور وملفات"
  },
  "depth": {
    "zh": "回答方式",
    "en": "Response depth",
    "ja": "回答の詳しさ",
    "ko": "답변 깊이",
    "fr": "Détail de la réponse",
    "de": "Antworttiefe",
    "es": "Detalle de la respuesta",
    "pt": "Detalhe da resposta",
    "ar": "تفصيل الإجابة"
  },
  "connect": {
    "zh": "连接我的智能服务",
    "en": "Connect my AI service",
    "ja": "AIサービスを接続",
    "ko": "내 AI 서비스 연결",
    "fr": "Connecter mon service IA",
    "de": "Meinen KI-Dienst verbinden",
    "es": "Conectar mi servicio de IA",
    "pt": "Conectar meu serviço de IA",
    "ar": "ربط خدمة الذكاء الخاصة بي"
  },
  "tools": {
    "zh": "连接工具",
    "en": "Connect tools",
    "ja": "ツールを接続",
    "ko": "도구 연결",
    "fr": "Connecter des outils",
    "de": "Werkzeuge verbinden",
    "es": "Conectar herramientas",
    "pt": "Conectar ferramentas",
    "ar": "ربط الأدوات"
  },
  "pending": {
    "zh": "待识别",
    "en": "Not read yet",
    "ja": "読み取り待ち",
    "ko": "아직 읽지 않음",
    "fr": "Pas encore lu",
    "de": "Noch nicht gelesen",
    "es": "Pendiente de lectura",
    "pt": "Ainda não lido",
    "ar": "لم يُقرأ بعد"
  },
  "feedbackSaved": {
    "zh": "已记录，谢谢你的反馈。",
    "en": "Saved. Thank you for your feedback.",
    "ja": "記録しました。ご意見ありがとうございます。",
    "ko": "저장했습니다. 의견 감사합니다.",
    "fr": "Enregistré. Merci pour votre avis.",
    "de": "Gespeichert. Danke für dein Feedback.",
    "es": "Guardado. Gracias por tu opinión.",
    "pt": "Salvo. Obrigado pelo seu comentário.",
    "ar": "تم الحفظ. شكرًا لملاحظاتك."
  },
  "feedbackFailed": {
    "zh": "未能发送，请稍后重试。",
    "en": "Could not send. Please try again later.",
    "ja": "送信できませんでした。後で再試行してください。",
    "ko": "전송하지 못했습니다. 잠시 후 다시 시도하세요.",
    "fr": "Envoi impossible. Réessayez plus tard.",
    "de": "Senden fehlgeschlagen. Bitte später erneut versuchen.",
    "es": "No se pudo enviar. Inténtalo más tarde.",
    "pt": "Não foi possível enviar. Tente mais tarde.",
    "ar": "تعذر الإرسال. حاول لاحقًا."
  },
  "added": {
    "zh": "已加入 {n} 份资料。",
    "en": "Added {n} sources.",
    "ja": "資料を{n}件追加しました。",
    "ko": "자료 {n}개를 추가했습니다.",
    "fr": "{n} sources ajoutées.",
    "de": "{n} Quellen hinzugefügt.",
    "es": "Se añadieron {n} fuentes.",
    "pt": "{n} fontes adicionadas.",
    "ar": "تمت إضافة {n} مصادر."
  },
  "batch": {
    "zh": "文件总大小超过 {n} MB，请分批加入。",
    "en": "Files exceed {n} MB. Add them in smaller batches.",
    "ja": "合計{n} MBを超えています。分けて追加してください。",
    "ko": "총 {n} MB를 넘습니다. 나누어 추가하세요.",
    "fr": "Les fichiers dépassent {n} Mo. Ajoutez-les en plusieurs fois.",
    "de": "Dateien überschreiten {n} MB. Bitte in kleineren Gruppen hinzufügen.",
    "es": "Los archivos superan {n} MB. Añádelos en grupos más pequeños.",
    "pt": "Os arquivos excedem {n} MB. Adicione em grupos menores.",
    "ar": "تتجاوز الملفات {n} ميغابايت. أضفها على دفعات أصغر."
  },
  "legacy": {
    "zh": "请将这个文件另存为 {format}，再添加。",
    "en": "Save this file as {format}, then add it.",
    "ja": "このファイルを{format}で保存してから追加してください。",
    "ko": "이 파일을 {format}로 저장한 후 추가하세요.",
    "fr": "Enregistrez ce fichier en {format}, puis ajoutez-le.",
    "de": "Datei als {format} speichern und erneut hinzufügen.",
    "es": "Guarda este archivo como {format} y vuelve a añadirlo.",
    "pt": "Salve este arquivo como {format} e adicione novamente.",
    "ar": "احفظ هذا الملف بصيغة {format} ثم أضفه."
  },
  "media": {
    "zh": "文件已加入。请先用文字识别或转文字工具提取内容，再回来提问。",
    "en": "File added. Extract its text with an OCR or transcription tool, then return to ask questions.",
    "ja": "追加しました。文字認識や文字起こしで内容を取り出してから質問してください。",
    "ko": "파일을 추가했습니다. 문자 인식이나 음성 변환 도구로 텍스트를 추출한 후 질문하세요.",
    "fr": "Fichier ajouté. Extrayez le texte avec un outil OCR ou de transcription, puis revenez poser vos questions.",
    "de": "Datei hinzugefügt. Text mit OCR oder Transkription extrahieren und dann Fragen stellen.",
    "es": "Archivo añadido. Extrae el texto con OCR o transcripción y vuelve a preguntar.",
    "pt": "Arquivo adicionado. Extraia o texto com OCR ou transcrição e volte para perguntar.",
    "ar": "تمت إضافة الملف. استخرج نصه بأداة التعرف أو التفريغ ثم عد لطرح الأسئلة."
  },
  "noEvidence": {
    "zh": "没有找到相关内容。请添加资料或粘贴原文后再问。",
    "en": "No relevant text found. Add sources or paste the original text and ask again.",
    "ja": "関連する内容がありません。資料や原文を追加して再度質問してください。",
    "ko": "관련 내용을 찾지 못했습니다. 자료나 원문을 추가한 후 다시 질문하세요.",
    "fr": "Aucun texte pertinent. Ajoutez des sources ou collez le texte original et réessayez.",
    "de": "Kein passender Text gefunden. Quellen hinzufügen oder Originaltext einfügen und erneut fragen.",
    "es": "No se encontró texto relevante. Añade fuentes o pega el original y vuelve a preguntar.",
    "pt": "Nenhum texto relevante. Adicione fontes ou cole o original e pergunte novamente.",
    "ar": "لم يُعثر على نص مناسب. أضف مصادر أو ألصق النص الأصلي ثم اسأل مجددًا."
  },
  "pasted": {
    "zh": "粘贴的内容",
    "en": "Pasted content",
    "ja": "貼り付けた内容",
    "ko": "붙여넣은 내용",
    "fr": "Contenu collé",
    "de": "Eingefügter Inhalt",
    "es": "Contenido pegado",
    "pt": "Conteúdo colado",
    "ar": "المحتوى الملصق"
  },
  "remove": {
    "zh": "删除这份资料？",
    "en": "Delete this source?",
    "ja": "この資料を削除しますか？",
    "ko": "이 자료를 삭제할까요?",
    "fr": "Supprimer cette source ?",
    "de": "Diese Quelle löschen?",
    "es": "¿Eliminar esta fuente?",
    "pt": "Excluir esta fonte?",
    "ar": "هل تريد حذف هذا المصدر؟"
  }
} as const;
export function knowledgeActionText(lang:LingxiLang,key:keyof typeof COPY,vars:Record<string,string|number>={}){let text:string=COPY[key][lang];for(const [key,value] of Object.entries(vars))text=text.replaceAll(`{${key}}`,String(value));return text}
