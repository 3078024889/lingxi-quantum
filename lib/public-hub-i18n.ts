import type { LingxiLang } from "@/lib/lingxi-i18n";

const COPY:Record<string,Record<LingxiLang,string>>={
  "灵犀场 · 一念即达 · 一念显化": {
    "zh": "灵犀场 · 一念即达 · 一念显化",
    "en": "LINGXIFIELD · One thought, one path",
    "ja": "LINGXIFIELD · 一念から到達へ",
    "ko": "LINGXIFIELD · 한 생각, 한 경로",
    "fr": "LINGXIFIELD · Une idée, un chemin",
    "de": "LINGXIFIELD · Ein Gedanke, ein Weg",
    "es": "LINGXIFIELD · Una idea, un camino",
    "pt": "LINGXIFIELD · Uma ideia, um caminho",
    "ar": "LINGXIFIELD · فكرة واحدة، طريق واحد"
  },
  "你今天想解决什么？": {
    "zh": "你今天想解决什么？",
    "en": "What do you want to solve today?",
    "ja": "今日は何を解決したいですか？",
    "ko": "오늘 무엇을 해결하고 싶나요?",
    "fr": "Que voulez-vous résoudre aujourd’hui ?",
    "de": "Was möchten Sie heute lösen?",
    "es": "¿Qué quieres resolver hoy?",
    "pt": "O que você quer resolver hoje?",
    "ar": "ما الذي تريد حله اليوم؟"
  },
  "不用懂 OCR、FFmpeg 或 EXIF。直接说你要的结果。": {
    "zh": "不用懂 OCR、FFmpeg 或 EXIF。直接说你要的结果。",
    "en": "You do not need to know OCR, FFmpeg or EXIF. Just describe the result you want.",
    "ja": "OCR、FFmpeg、EXIFを知る必要はありません。欲しい結果をそのまま伝えてください。",
    "ko": "OCR, FFmpeg, EXIF를 몰라도 됩니다. 원하는 결과를 바로 말하세요.",
    "fr": "Pas besoin de connaître OCR, FFmpeg ou EXIF. Décrivez simplement le résultat souhaité.",
    "de": "Sie müssen OCR, FFmpeg oder EXIF nicht kennen. Beschreiben Sie einfach das gewünschte Ergebnis.",
    "es": "No necesitas conocer OCR, FFmpeg ni EXIF. Describe el resultado que quieres.",
    "pt": "Você não precisa conhecer OCR, FFmpeg ou EXIF. Basta dizer o resultado desejado.",
    "ar": "لا تحتاج إلى معرفة OCR أو FFmpeg أو EXIF. صف النتيجة التي تريدها مباشرة."
  },
  "比如：这个 PDF 我要改名字、加公章，再加骑缝章……": {
    "zh": "比如：这个 PDF 我要改名字、加公章，再加骑缝章……",
    "en": "For example: edit a name in this PDF, add an authorized stamp, then add a page-edge seal…",
    "ja": "例：このPDFの名前を変更し、許可された印章と契印を追加したい…",
    "ko": "예: 이 PDF의 이름을 바꾸고 승인된 도장과 간인을 추가하고 싶어요…",
    "fr": "Ex. : modifier un nom dans ce PDF, ajouter un cachet autorisé puis un sceau de chevauchement…",
    "de": "Zum Beispiel: Namen in diesem PDF ändern, einen autorisierten Stempel und anschließend einen Seitenrandstempel hinzufügen…",
    "es": "Ej.: cambiar un nombre en este PDF, añadir un sello autorizado y luego un sello entre páginas…",
    "pt": "Ex.: alterar um nome neste PDF, adicionar um carimbo autorizado e depois um selo entre páginas…",
    "ar": "مثال: تعديل اسم في ملف PDF وإضافة ختم مصرح به ثم ختم ممتد بين الصفحات…"
  },
  "发送": {
    "zh": "发送",
    "en": "Send",
    "ja": "送信",
    "ko": "전송",
    "fr": "Envoyer",
    "de": "Senden",
    "es": "Enviar",
    "pt": "Enviar",
    "ar": "إرسال"
  },
  "帮我处理": {
    "zh": "帮我处理",
    "en": "Find a tool",
    "ja": "ツールを探す",
    "ko": "도구 찾기",
    "fr": "Trouver un outil",
    "de": "Werkzeug finden",
    "es": "Buscar herramienta",
    "pt": "Encontrar ferramenta",
    "ar": "العثور على أداة"
  },
  "我找到了": {
    "zh": "我找到了",
    "en": "I found",
    "ja": "見つかった入口：",
    "ko": "찾은 실행 경로:",
    "fr": "J’ai trouvé",
    "de": "Gefunden:",
    "es": "Encontré",
    "pt": "Encontrei",
    "ar": "وجدت"
  },
  "个能执行的入口。最相关的排在前面。": {
    "zh": "个能执行的入口。最相关的排在前面。",
    "en": "executable options. The most relevant are first.",
    "ja": "件の実行可能な入口があります。関連度の高い順です。",
    "ko": "개의 실행 가능한 경로가 있습니다. 관련도가 높은 순입니다.",
    "fr": "options exécutables. Les plus pertinentes sont en premier.",
    "de": "ausführbare Optionen. Die relevantesten stehen zuerst.",
    "es": "opciones ejecutables. Las más relevantes aparecen primero.",
    "pt": "opções executáveis. As mais relevantes aparecem primeiro.",
    "ar": "خيارات قابلة للتنفيذ. الأكثر صلة يظهر أولًا."
  },
  "🔥 大家都在用": {
    "zh": "🔥 大家都在用",
    "en": "🔥 Popular now",
    "ja": "🔥 よく使われています",
    "ko": "🔥 많이 사용하는 도구",
    "fr": "🔥 Populaires",
    "de": "🔥 Beliebt",
    "es": "🔥 Populares",
    "pt": "🔥 Populares",
    "ar": "🔥 الأكثر استخدامًا"
  },
  "最近使用": {
    "zh": "最近使用",
    "en": "Recently used",
    "ja": "最近使用",
    "ko": "최근 사용",
    "fr": "Utilisés récemment",
    "de": "Zuletzt verwendet",
    "es": "Usados recientemente",
    "pt": "Usados recentemente",
    "ar": "المستخدمة مؤخرًا"
  },
  "收藏": {
    "zh": "收藏",
    "en": "Favorites",
    "ja": "お気に入り",
    "ko": "즐겨찾기",
    "fr": "Favoris",
    "de": "Favoriten",
    "es": "Favoritos",
    "pt": "Favoritos",
    "ar": "المفضلة"
  },
  "搜索结果": {
    "zh": "搜索结果",
    "en": "Search results",
    "ja": "検索結果",
    "ko": "검색 결과",
    "fr": "Résultats de recherche",
    "de": "Suchergebnisse",
    "es": "Resultados de búsqueda",
    "pt": "Resultados da pesquisa",
    "ar": "نتائج البحث"
  },
  "个": {
    "zh": "个",
    "en": "items",
    "ja": "件",
    "ko": "개",
    "fr": "éléments",
    "de": "Elemente",
    "es": "elementos",
    "pt": "itens",
    "ar": "عناصر"
  },
  "暂时没有真实可执行的匹配项。这个关键词应记录到“未命中搜索”，作为下一批需求。": {
    "zh": "暂时没有真实可执行的匹配项。这个关键词应记录到“未命中搜索”，作为下一批需求。",
    "en": "No genuinely executable match yet. This query should be recorded as an unmet search for future tool development.",
    "ja": "現時点で実行可能な一致項目はありません。この検索語は未対応ニーズとして記録されます。",
    "ko": "현재 실제 실행 가능한 일치 항목이 없습니다. 이 검색어는 미충족 수요로 기록됩니다.",
    "fr": "Aucune correspondance réellement exécutable pour le moment. Cette recherche doit être enregistrée comme besoin non couvert.",
    "de": "Derzeit gibt es keine wirklich ausführbare Übereinstimmung. Diese Suche sollte als ungedeckter Bedarf erfasst werden.",
    "es": "Aún no hay una coincidencia realmente ejecutable. Esta búsqueda debe registrarse como necesidad no cubierta.",
    "pt": "Ainda não há uma correspondência realmente executável. Esta busca deve ser registrada como necessidade não atendida.",
    "ar": "لا توجد مطابقة قابلة للتنفيذ فعليًا بعد. ينبغي تسجيل هذا البحث كاحتياج غير ملبّى."
  },
  "本地处理，不上传文件": {
    "zh": "本地处理，不上传文件",
    "en": "Local processing; file is not uploaded",
    "ja": "ローカル処理・ファイルはアップロードしません",
    "ko": "로컬 처리 · 파일 업로드 안 함",
    "fr": "Traitement local, fichier non envoyé",
    "de": "Lokale Verarbeitung; Datei wird nicht hochgeladen",
    "es": "Procesamiento local; el archivo no se sube",
    "pt": "Processamento local; o arquivo não é enviado",
    "ar": "معالجة محلية؛ لا يتم رفع الملف"
  },
  "不知道该选哪个？把文件丢进来": {
    "zh": "不知道该选哪个？把文件丢进来",
    "en": "Not sure which tool to use? Drop the file here",
    "ja": "どのツールか迷ったら、ファイルをここへ",
    "ko": "어떤 도구인지 모르겠다면 파일을 놓으세요",
    "fr": "Vous hésitez ? Déposez le fichier ici",
    "de": "Unsicher welches Werkzeug? Datei hier ablegen",
    "es": "¿No sabes cuál elegir? Suelta el archivo aquí",
    "pt": "Não sabe qual escolher? Solte o arquivo aqui",
    "ar": "لست متأكدًا من الأداة؟ أسقط الملف هنا"
  },
  "我先看文件类型，再只给你能真正执行的操作。": {
    "zh": "我先看文件类型，再只给你能真正执行的操作。",
    "en": "I will check the file type first and only show actions that can actually run.",
    "ja": "まずファイル形式を確認し、本当に実行できる操作だけを表示します。",
    "ko": "먼저 파일 형식을 확인하고 실제 실행 가능한 작업만 보여드립니다.",
    "fr": "Je vérifie d’abord le type de fichier puis n’affiche que les actions réellement exécutables.",
    "de": "Ich prüfe zuerst den Dateityp und zeige nur tatsächlich ausführbare Aktionen.",
    "es": "Primero reviso el tipo de archivo y solo muestro acciones que realmente pueden ejecutarse.",
    "pt": "Primeiro verifico o tipo do arquivo e mostro apenas ações realmente executáveis.",
    "ar": "سأتحقق أولًا من نوع الملف وأعرض فقط العمليات القابلة للتنفيذ فعليًا."
  },
  "选择文件": {
    "zh": "选择文件",
    "en": "Choose file",
    "ja": "ファイルを選択",
    "ko": "파일 선택",
    "fr": "Choisir un fichier",
    "de": "Datei auswählen",
    "es": "Elegir archivo",
    "pt": "Escolher arquivo",
    "ar": "اختر ملفًا"
  },
  "拖一个文件到这里": {
    "zh": "拖一个文件到这里",
    "en": "Drop a file here",
    "ja": "ここにファイルをドロップ",
    "ko": "여기에 파일 놓기",
    "fr": "Déposez un fichier ici",
    "de": "Datei hier ablegen",
    "es": "Suelta un archivo aquí",
    "pt": "Solte um arquivo aqui",
    "ar": "أسقط ملفًا هنا"
  },
  "暂时没有适合这个文件类型的本地处理入口。我不会给你假按钮。": {
    "zh": "暂时没有适合这个文件类型的本地处理入口。我不会给你假按钮。",
    "en": "There is no local tool for this file type yet. I will not show a fake button.",
    "ja": "このファイル形式に対応するローカル処理はまだありません。偽のボタンは表示しません。",
    "ko": "이 파일 형식에 맞는 로컬 도구는 아직 없습니다. 가짜 버튼은 표시하지 않습니다.",
    "fr": "Aucun outil local adapté à ce type de fichier pour le moment. Aucun faux bouton ne sera affiché.",
    "de": "Für diesen Dateityp gibt es noch kein lokales Werkzeug. Es wird kein Schein-Button angezeigt.",
    "es": "Todavía no hay una herramienta local adecuada para este tipo de archivo. No se mostrará un botón falso.",
    "pt": "Ainda não há uma ferramenta local adequada para esse tipo de arquivo. Não exibiremos um botão falso.",
    "ar": "لا توجد أداة محلية مناسبة لهذا النوع من الملفات بعد. لن نعرض زرًا وهميًا."
  },
  "SASI 创作能力 · 待上线": {
    "zh": "SASI 创作能力 · 待上线",
    "en": "SASI creation · Coming soon",
    "ja": "SASI制作 · 近日公開",
    "ko": "SASI 제작 · 출시 예정",
    "fr": "Création SASI · Bientôt",
    "de": "SASI-Erstellung · Demnächst",
    "es": "Creación SASI · Próximamente",
    "pt": "Criação SASI · Em breve",
    "ar": "إنشاء SASI · قريبًا"
  },
  "先写下一个念头，或带来一份资料。": {
    "zh": "先写下一个念头，或带来一份资料。",
    "en": "Add a thought or an attachment first.",
    "ja": "まずアイデアを書くか、資料を添付してください。",
    "ko": "먼저 생각을 적거나 자료를 첨부하세요.",
    "fr": "Ajoutez d’abord une idée ou une pièce jointe.",
    "de": "Fügen Sie zuerst einen Gedanken oder Anhang hinzu.",
    "es": "Añade primero una idea o un archivo.",
    "pt": "Adicione primeiro uma ideia ou um anexo.",
    "ar": "أضف فكرة أو مرفقًا أولًا."
  },
  "SASI 创作生产能力正在接入中，当前不会跳回旧版工作台。研究资料入口已经可用；模型/API 可从「连接」进入。": {
    "zh": "SASI 创作生产能力正在接入中，当前不会跳回旧版工作台。研究资料入口已经可用；模型/API 可从「连接」进入。",
    "en": "SASI production is still being integrated. This entry will not send you back to the old workspace. Research is available now; model/API setup is under Connections.",
    "ja": "SASI制作機能は接続中です。旧ワークスペースには戻りません。研究機能は利用可能で、モデル/API設定は「接続」から行えます。",
    "ko": "SASI 제작 기능은 연결 중입니다. 이전 작업공간으로 돌아가지 않습니다. 연구 기능은 사용 가능하며 모델/API 설정은 연결에서 할 수 있습니다.",
    "fr": "La production SASI est encore en cours d’intégration. Cette entrée ne renvoie pas vers l’ancien espace. La recherche est disponible ; les modèles/API se configurent dans Connexions.",
    "de": "Die SASI-Produktion wird noch integriert. Dieser Einstieg führt nicht zum alten Workspace zurück. Forschung ist verfügbar; Modell/API-Einstellungen finden Sie unter Verbindungen.",
    "es": "La producción SASI sigue integrándose. Esta entrada no volverá al espacio antiguo. La investigación ya está disponible; los modelos/API se configuran en Conexiones.",
    "pt": "A produção SASI ainda está sendo integrada. Esta entrada não volta ao espaço antigo. A pesquisa já está disponível; modelos/APIs ficam em Conexões.",
    "ar": "لا تزال قدرات إنتاج SASI قيد الدمج. لن يعيدك هذا المدخل إلى مساحة العمل القديمة. البحث متاح الآن، وإعداد النماذج/API موجود في الاتصالات."
  },
  "只保留一个公开创作台。未接好的生产能力全部收回后台。": {
    "zh": "只保留一个公开创作台。未接好的生产能力全部收回后台。",
    "en": "One public creation desk only. Unfinished production flows stay backstage.",
    "ja": "公開制作デスクは1つだけ。未完成の制作フローはバックエンドに留めます。",
    "ko": "공개 제작 데스크는 하나만 유지합니다. 미완성 제작 흐름은 백스테이지에 둡니다.",
    "fr": "Un seul espace public de création. Les flux inachevés restent en coulisses.",
    "de": "Nur ein öffentlicher Erstellungsbereich. Unfertige Produktionsabläufe bleiben im Hintergrund.",
    "es": "Solo un espacio público de creación. Los flujos inacabados permanecen entre bastidores.",
    "pt": "Apenas uma área pública de criação. Fluxos inacabados ficam nos bastidores.",
    "ar": "مساحة إنشاء عامة واحدة فقط. تبقى مسارات الإنتاج غير المكتملة في الخلفية."
  },
  "待上线": {
    "zh": "待上线",
    "en": "Coming soon",
    "ja": "近日公開",
    "ko": "출시 예정",
    "fr": "Bientôt",
    "de": "Demnächst",
    "es": "Próximamente",
    "pt": "Em breve",
    "ar": "قريبًا"
  },
  "科研资料已经可以直接进入。": {
    "zh": "科研资料已经可以直接进入。",
    "en": "Research workspace is available now.",
    "ja": "研究ワークスペースは現在利用できます。",
    "ko": "연구 작업공간은 지금 사용할 수 있습니다.",
    "fr": "L’espace de recherche est disponible maintenant.",
    "de": "Der Forschungsbereich ist jetzt verfügbar.",
    "es": "El espacio de investigación ya está disponible.",
    "pt": "O espaço de pesquisa já está disponível.",
    "ar": "مساحة البحث متاحة الآن."
  },
  "只有真正要接模型或外部服务时才打开连接页，不再把复杂配置塞进创作主界面。": {
    "zh": "只有真正要接模型或外部服务时才打开连接页，不再把复杂配置塞进创作主界面。",
    "en": "Open setup only when you actually need an external model or service.",
    "ja": "外部モデルやサービスが本当に必要な時だけ接続ページを開きます。複雑な設定は制作画面に置きません。",
    "ko": "외부 모델이나 서비스가 실제로 필요할 때만 연결 페이지를 엽니다. 복잡한 설정은 제작 화면에 넣지 않습니다.",
    "fr": "Ouvrez la configuration seulement lorsqu’un modèle ou service externe est réellement nécessaire. Les réglages complexes restent hors de l’interface de création.",
    "de": "Öffnen Sie die Einrichtung nur, wenn wirklich ein externes Modell oder ein externer Dienst benötigt wird. Komplexe Einstellungen bleiben außerhalb der Erstellungsoberfläche.",
    "es": "Abre la configuración solo cuando realmente necesites un modelo o servicio externo. La configuración compleja queda fuera de la interfaz de creación.",
    "pt": "Abra a configuração apenas quando realmente precisar de um modelo ou serviço externo. Configurações complexas ficam fora da interface de criação.",
    "ar": "افتح صفحة الإعداد فقط عند الحاجة الفعلية إلى نموذج أو خدمة خارجية. تبقى الإعدادات المعقدة خارج واجهة الإنشاء."
  },
  "漫剧、短剧与分镜创作": {
    "zh": "漫剧、短剧与分镜创作",
    "en": "Drama, storyboards and visual production",
    "ja": "アニメドラマ・短編・絵コンテ制作",
    "ko": "漫劇·숏드라마·스토리보드 제작",
    "fr": "Drama, storyboards et production visuelle",
    "de": "Drama, Storyboards und visuelle Produktion",
    "es": "Drama, storyboards y producción visual",
    "pt": "Drama, storyboards e produção visual",
    "ar": "دراما ولوحات قصصية وإنتاج بصري"
  },
  "AI 导演与镜头编排": {
    "zh": "AI 导演与镜头编排",
    "en": "AI directing and shot orchestration",
    "ja": "AI監督とショット構成",
    "ko": "AI 연출 및 샷 오케스트레이션",
    "fr": "Réalisation IA et orchestration des plans",
    "de": "KI-Regie und Shot-Orchestrierung",
    "es": "Dirección IA y orquestación de planos",
    "pt": "Direção IA e orquestração de planos",
    "ar": "إخراج بالذكاء الاصطناعي وتنسيق اللقطات"
  },
  "需求、代码与部署": {
    "zh": "需求、代码与部署",
    "en": "Product, code and deployment",
    "ja": "要件・コード・デプロイ",
    "ko": "요구사항·코드·배포",
    "fr": "Produit, code et déploiement",
    "de": "Produkt, Code und Deployment",
    "es": "Producto, código y despliegue",
    "pt": "Produto, código e implantação",
    "ar": "المنتج والشفرة والنشر"
  },
  "一键视频生成": {
    "zh": "一键视频生成",
    "en": "One-click AI video",
    "ja": "ワンクリックAI動画生成",
    "ko": "원클릭 AI 비디오 생성",
    "fr": "Vidéo IA en un clic",
    "de": "KI-Video mit einem Klick",
    "es": "Vídeo IA con un clic",
    "pt": "Vídeo IA com um clique",
    "ar": "فيديو بالذكاء الاصطناعي بنقرة واحدة"
  }
};

export function publicHubText(lang:LingxiLang,zh:string,en:string){return COPY[zh]?.[lang] ?? (lang==="zh"?zh:en);}
