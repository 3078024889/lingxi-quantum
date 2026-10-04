import type { LingxiLang } from "@/lib/lingxi-i18n";

const COPY:Record<string,Record<LingxiLang,string>>={
  "返回实用工具":{"zh":"返回实用工具","en":"Back to tools","ja":"ツール一覧へ戻る","ko":"도구로 돌아가기","fr":"Retour aux outils","de":"Zurück zu den Werkzeugen","es":"Volver a herramientas","pt":"Voltar às ferramentas","ar":"العودة إلى الأدوات"},
  "灵犀场 · 实用工具": {
    "zh": "灵犀场 · 实用工具",
    "en": "LINGXIFIELD · Practical tools",
    "ja": "LINGXIFIELD · 実用ツール",
    "ko": "LINGXIFIELD · 실용 도구",
    "fr": "LINGXIFIELD · Outils pratiques",
    "de": "LINGXIFIELD · Praktische Werkzeuge",
    "es": "LINGXIFIELD · Herramientas prácticas",
    "pt": "LINGXIFIELD · Ferramentas práticas",
    "ar": "LINGXIFIELD · أدوات عملية"
  },
  "灵犀场 · 在线工具": {
    "zh": "灵犀场 · 在线工具",
    "en": "LINGXIFIELD · Tools",
    "ja": "LINGXIFIELD · オンラインツール",
    "ko": "LINGXIFIELD · 온라인 도구",
    "fr": "LINGXIFIELD · Outils",
    "de": "LINGXIFIELD · Werkzeuge",
    "es": "LINGXIFIELD · Herramientas",
    "pt": "LINGXIFIELD · Ferramentas",
    "ar": "LINGXIFIELD · الأدوات"
  },
  "简短技术说明": {
    "zh": "简短技术说明",
    "en": "Technical note",
    "ja": "技術メモ",
    "ko": "기술 설명",
    "fr": "Note technique",
    "de": "Technischer Hinweis",
    "es": "Nota técnica",
    "pt": "Nota técnica",
    "ar": "ملاحظة تقنية"
  },
  "隐私说明": {
    "zh": "隐私说明",
    "en": "Privacy",
    "ja": "プライバシー",
    "ko": "개인정보",
    "fr": "Confidentialité",
    "de": "Datenschutz",
    "es": "Privacidad",
    "pt": "Privacidade",
    "ar": "الخصوصية"
  },
  "本工具默认在您的浏览器本地完成处理。文件不会上传到灵犀场；刷新或关闭页面后，当前文件会从本次页面中释放。": {
    "zh": "本工具默认在您的浏览器本地完成处理。文件不会上传到灵犀场；刷新或关闭页面后，当前文件会从本次页面中释放。",
    "en": "This tool processes files in your browser by default. Files are not uploaded to LINGXIFIELD and are released from the current page when you refresh or close it.",
    "ja": "このツールは既定でブラウザ内で処理します。ファイルはLINGXIFIELDへ送信されず、更新またはページを閉じると現在のページから解放されます。",
    "ko": "이 도구는 기본적으로 브라우저에서 처리됩니다. 파일은 LINGXIFIELD로 업로드되지 않으며 새로고침하거나 페이지를 닫으면 현재 페이지에서 해제됩니다.",
    "fr": "Cet outil traite les fichiers dans votre navigateur par défaut. Ils ne sont pas envoyés à LINGXIFIELD et sont libérés de la page lorsque vous l’actualisez ou la fermez.",
    "de": "Dieses Werkzeug verarbeitet Dateien standardmäßig im Browser. Sie werden nicht an LINGXIFIELD gesendet und beim Aktualisieren oder Schließen der Seite freigegeben.",
    "es": "Esta herramienta procesa los archivos en tu navegador por defecto. No se envían a LINGXIFIELD y se liberan de la página al actualizarla o cerrarla.",
    "pt": "Esta ferramenta processa os arquivos no navegador por padrão. Eles não são enviados à LINGXIFIELD e são liberados da página ao atualizar ou fechar.",
    "ar": "تعالج هذه الأداة الملفات داخل المتصفح افتراضيًا. لا تُرسل الملفات إلى LINGXIFIELD وتُزال من الصفحة الحالية عند تحديثها أو إغلاقها."
  },
  "浏览器本地处理 · 文件不上传服务器": {
    "zh": "浏览器本地处理 · 文件不上传服务器",
    "en": "Processed in your browser · files never leave your device",
    "ja": "ブラウザ内処理 · ファイルは端末外へ送信されません",
    "ko": "브라우저 로컬 처리 · 파일은 기기를 떠나지 않습니다",
    "fr": "Traitement dans le navigateur · les fichiers restent sur votre appareil",
    "de": "Im Browser verarbeitet · Dateien verlassen Ihr Gerät nicht",
    "es": "Procesado en el navegador · los archivos no salen de tu dispositivo",
    "pt": "Processado no navegador · os arquivos não saem do dispositivo",
    "ar": "معالجة داخل المتصفح · الملفات لا تغادر جهازك"
  },
  "此功能需上传服务器处理，结束后自动删除": {
    "zh": "此功能需上传服务器处理，结束后自动删除",
    "en": "This feature uploads to the server; files are deleted after processing",
    "ja": "この機能はサーバー処理のためアップロードが必要で、処理後に自動削除されます",
    "ko": "이 기능은 서버 처리를 위해 업로드되며 처리 후 자동 삭제됩니다",
    "fr": "Cette fonction envoie le fichier au serveur ; il est supprimé après traitement",
    "de": "Diese Funktion lädt zum Server hoch; Dateien werden nach der Verarbeitung gelöscht",
    "es": "Esta función sube el archivo al servidor y lo elimina tras procesarlo",
    "pt": "Esta função envia o arquivo ao servidor e o exclui após o processamento",
    "ar": "تتطلب هذه الميزة رفع الملف إلى الخادم ويُحذف بعد المعالجة"
  },
  "相关工具": {
    "zh": "相关工具",
    "en": "Related tools",
    "ja": "関連ツール",
    "ko": "관련 도구",
    "fr": "Outils associés",
    "de": "Verwandte Werkzeuge",
    "es": "Herramientas relacionadas",
    "pt": "Ferramentas relacionadas",
    "ar": "أدوات ذات صلة"
  },
  "常见问题": {
    "zh": "常见问题",
    "en": "Frequently Asked Questions",
    "ja": "よくある質問",
    "ko": "자주 묻는 질문",
    "fr": "Questions fréquentes",
    "de": "Häufige Fragen",
    "es": "Preguntas frecuentes",
    "pt": "Perguntas frequentes",
    "ar": "الأسئلة الشائعة"
  },
  "文件会上传到服务器吗？": {
    "zh": "文件会上传到服务器吗？",
    "en": "Are files uploaded to the server?",
    "ja": "ファイルはサーバーにアップロードされますか？",
    "ko": "파일이 서버에 업로드되나요?",
    "fr": "Les fichiers sont-ils envoyés au serveur ?",
    "de": "Werden Dateien auf den Server hochgeladen?",
    "es": "¿Se suben los archivos al servidor?",
    "pt": "Os arquivos são enviados ao servidor?",
    "ar": "هل يتم رفع الملفات إلى الخادم؟"
  },
  "本批已上线工具默认全部在浏览器本地处理，文件不上传灵犀场服务器。": {
    "zh": "本批已上线工具默认全部在浏览器本地处理，文件不上传灵犀场服务器。",
    "en": "Live tools in this batch process files in your browser by default; nothing is uploaded to LINGXIFIELD servers.",
    "ja": "このバッチで公開済みのツールは既定でブラウザ内処理を行い、ファイルをLINGXIFIELDのサーバーへ送信しません。",
    "ko": "이번 배치의 사용 가능한 도구는 기본적으로 브라우저에서 처리되며 파일을 LINGXIFIELD 서버에 업로드하지 않습니다.",
    "fr": "Les outils actifs de ce lot traitent les fichiers dans le navigateur par défaut ; rien n’est envoyé aux serveurs LINGXIFIELD.",
    "de": "Die aktiven Werkzeuge dieses Pakets verarbeiten Dateien standardmäßig im Browser; nichts wird auf LINGXIFIELD-Server hochgeladen.",
    "es": "Las herramientas activas de este lote procesan los archivos en el navegador por defecto; no se sube nada a los servidores de LINGXIFIELD.",
    "pt": "As ferramentas ativas deste lote processam os arquivos no navegador por padrão; nada é enviado aos servidores da LINGXIFIELD.",
    "ar": "تعالج الأدوات المتاحة في هذه الدفعة الملفات داخل المتصفح افتراضيًا ولا يتم رفع شيء إلى خوادم LINGXIFIELD."
  },
  "处理失败怎么办？": {
    "zh": "处理失败怎么办？",
    "en": "What if processing fails?",
    "ja": "処理に失敗した場合は？",
    "ko": "처리에 실패하면 어떻게 하나요?",
    "fr": "Que faire si le traitement échoue ?",
    "de": "Was tun, wenn die Verarbeitung fehlschlägt?",
    "es": "¿Qué hago si falla el procesamiento?",
    "pt": "E se o processamento falhar?",
    "ar": "ماذا أفعل إذا فشلت المعالجة؟"
  },
  "页面会说明原因与可尝试的解决办法（例如文件过大、格式不支持、浏览器过旧）。不会只显示「处理失败」。": {
    "zh": "页面会说明原因与可尝试的解决办法（例如文件过大、格式不支持、浏览器过旧）。不会只显示「处理失败」。",
    "en": "The page explains why and what to try next (size limits, unsupported format, outdated browser). We never show only “failed”.",
    "ja": "ページには原因と対処方法（ファイルサイズ、非対応形式、古いブラウザなど）が表示されます。「失敗」だけでは終わりません。",
    "ko": "페이지에서 원인과 해결 방법(파일 크기, 지원하지 않는 형식, 오래된 브라우저 등)을 안내합니다. 단순히 '실패'만 표시하지 않습니다.",
    "fr": "La page explique la cause et les solutions possibles (taille, format non pris en charge, navigateur ancien). Elle n’affiche pas seulement « échec ».",
    "de": "Die Seite erklärt Ursache und mögliche Schritte (Dateigröße, nicht unterstütztes Format, veralteter Browser) und zeigt nicht nur „fehlgeschlagen“.",
    "es": "La página explica la causa y qué probar después (tamaño, formato no compatible, navegador antiguo), no solo «falló».",
    "pt": "A página explica a causa e o que tentar depois (tamanho, formato incompatível, navegador antigo), não apenas “falhou”.",
    "ar": "توضح الصفحة السبب وما يمكن تجربته لاحقًا مثل حجم الملف أو الصيغة غير المدعومة أو المتصفح القديم، ولا تعرض كلمة «فشل» فقط."
  },
  "为什么压不到目标大小？": {
    "zh": "为什么压不到目标大小？",
    "en": "Why can’t it reach the target size?",
    "ja": "なぜ目標サイズまで圧縮できないのですか？",
    "ko": "왜 목표 크기까지 줄어들지 않나요?",
    "fr": "Pourquoi la taille cible n’est-elle pas atteinte ?",
    "de": "Warum wird die Zielgröße nicht erreicht?",
    "es": "¿Por qué no alcanza el tamaño objetivo?",
    "pt": "Por que não chega ao tamanho alvo?",
    "ar": "لماذا لا يصل إلى الحجم المستهدف؟"
  },
  "当图片分辨率与细节信息量过大时，即使降低质量也会超过目标。工具会尽量逼近且优先不超限；若仍超限，会如实说明。": {
    "zh": "当图片分辨率与细节信息量过大时，即使降低质量也会超过目标。工具会尽量逼近且优先不超限；若仍超限，会如实说明。",
    "en": "Very large or detailed images may still exceed the target even at low quality. We approach the limit honestly and prefer never exceeding it when possible.",
    "ja": "解像度や細部が多い画像は、品質を下げても目標を超えることがあります。可能な限り目標へ近づけ、超過する場合は明示します。",
    "ko": "해상도와 세부 정보가 많은 이미지는 품질을 낮춰도 목표를 초과할 수 있습니다. 가능한 한 목표에 가깝게 맞추며 초과 시 그대로 안내합니다.",
    "fr": "Les images très grandes ou détaillées peuvent dépasser la cible même à faible qualité. L’outil s’en approche au mieux et signale honnêtement tout dépassement.",
    "de": "Sehr große oder detailreiche Bilder können selbst bei niedriger Qualität über dem Ziel bleiben. Das Werkzeug nähert sich ehrlich an und weist auf Überschreitungen hin.",
    "es": "Las imágenes grandes o detalladas pueden superar el objetivo incluso con baja calidad. La herramienta se acerca al límite y avisa si lo supera.",
    "pt": "Imagens grandes ou detalhadas podem ultrapassar o alvo mesmo com baixa qualidade. A ferramenta se aproxima do limite e informa se ultrapassar.",
    "ar": "قد تتجاوز الصور الكبيرة أو كثيرة التفاصيل الحجم المستهدف حتى مع خفض الجودة. تقترب الأداة من الحد وتوضح بصدق إذا بقي الحجم أعلى."
  },
  "处理会尽量在当前设备完成，只在需要时加载必要能力，不影响其他页面使用。": {
    "zh": "处理会尽量在当前设备完成，只在需要时加载必要能力，不影响其他页面使用。",
    "en": "Processing stays on your device whenever possible, and only the capabilities needed for this task are loaded.",
    "ja": "処理は可能な限り端末内で行い、この作業に必要な機能だけを読み込みます。",
    "ko": "가능한 처리는 현재 기기에서 진행하며 이 작업에 필요한 기능만 불러옵니다.",
    "fr": "Le traitement reste sur votre appareil autant que possible et seules les fonctions nécessaires sont chargées.",
    "de": "Die Verarbeitung bleibt nach Möglichkeit auf Ihrem Gerät; geladen wird nur, was für diese Aufgabe nötig ist.",
    "es": "El procesamiento permanece en tu dispositivo siempre que sea posible y solo se carga lo necesario.",
    "pt": "O processamento permanece no seu dispositivo sempre que possível e apenas o necessário é carregado.",
    "ar": "تتم المعالجة على جهازك كلما أمكن، ولا يتم تحميل سوى ما تحتاجه هذه المهمة."
  }
};

export function toolShellText(lang:LingxiLang,zh:string,en:string){return COPY[zh]?.[lang] ?? (lang==="zh"?zh:en);}
