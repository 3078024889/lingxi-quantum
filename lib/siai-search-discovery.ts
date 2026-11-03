import type {LingxiLang} from "./lingxi-i18n";
export type SiaiDiscoveryTopic={q:string;home:string;rank:string};
export type SiaiDiscoveryCopy={hero:string;homeTitle:string;homeIntro:string;rankTitle:string;rankIntro:string;footerTitle:string;footerNote:string;trio:string[];extras:string[];topics:SiaiDiscoveryTopic[]};
/** Localized search-intent answers. Each displayed keyword has distinct, factual copy. */
export const SIAI_DISCOVERY:Record<LingxiLang,SiaiDiscoveryCopy>={
  "zh": {
    "hero": "全球AI行情平台 · 全球AI排行榜 · 全球SI排行榜 · 全球SI行情平台 · 全球SIAI行情平台 · 全球SIAI排行榜",
    "homeTitle": "全球 AI 与 SI 工具怎么选？六个真实搜索问题，一处找到答案",
    "homeIntro": "搜索全球 AI 排行榜、全球 SI 行情或全球 SIAI 排行榜，都能在灵犀场比较产品。不是股票行情，也不把成立年份当能力名次。",
    "rankTitle": "全球 SI AI 工具行情：从搜索问题到官方资料",
    "rankIntro": "不同搜索说法指向同一个全球 SIAI 产品目录。按用途、价格、免费额度、地区和官方来源判断，未证实项目不冒充实测。",
    "footerTitle": "全球 AI / SI / SIAI 行情与排行榜搜索入口",
    "footerNote": "按问题进入工具比较目录；产品价格、地区、商用授权请查看官方来源。",
    "trio": [
      "全球 SIAI 排行榜",
      "SASI 智能创作",
      "100+ 在线实用工具"
    ],
    "extras": [
      "全球AI工具排行榜",
      "AI模型价格对比",
      "免费AI工具排行榜",
      "AI工具哪个好用",
      "AI视频生成平台对比"
    ],
    "topics": [
      {
        "q": "全球AI行情平台",
        "home": "想看全球 AI 公司和产品的最新行情？把官网功能、会员价格、免费额度与使用限制放在同一处比较。",
        "rank": "这里的行情指产品与收费信息，不是股票价格或实时成交量；每条资料附来源，费用以厂商最新结算为准。"
      },
      {
        "q": "全球AI排行榜",
        "home": "选 AI 不必只看名气。先按写作、研究、编程、图片和视频任务筛选，再比较真实限制。",
        "rank": "序号不是能力评测名次；可按成立时间、名称及领域查看，尚未完成实测的项目有明显标注。"
      },
      {
        "q": "全球SI排行榜",
        "home": "搜索 SI 或 AI 都可以找到灵犀场的全球工具目录；同一款工具只保留一份产品档案。",
        "rank": "SI 是本平台兼容的搜索表达；不把它写成行业统一官方分类，实际能力按模型和任务说明。"
      },
      {
        "q": "全球SI行情平台",
        "home": "想知道一款工具在香港、内地或海外能不能用？先核对官方地区条款与付款方式。",
        "rank": "受限地区说明不等于已逐国证实可注册、付费和使用；缺少证据的项目如实标明。"
      },
      {
        "q": "全球SIAI行情平台",
        "home": "从通用助手到图像、视频、语音和模型 API，集中了解用途、免费方案及一次任务的可能成本。",
        "rank": "网页版会员、视频积分和开发者 API 属于不同计费口径，比较时分开查看，不混算。"
      },
      {
        "q": "全球SIAI排行榜",
        "home": "灵犀场 LINGXIFIELD 汇集全球 SI/AI 产品档案，点开来源与官网再决定用哪个。",
        "rank": "本页有已收录资料与新增研究预览；厂商归属、上市状态、商用许可和模型限制分别呈现。"
      }
    ]
  },
  "en": {
    "hero": "Global AI tool rankings · SI directory · SIAI market guide",
    "homeTitle": "Six ways to find the right global SI/AI tool",
    "homeIntro": "Explore sources and prices, free limits and features; a product directory, not a stock market ticker.",
    "rankTitle": "Global SIAI market information: compare by real task",
    "rankIntro": "Different search phrases lead to one source-linked directory; unknowns and untested previews stay labeled.",
    "footerTitle": "Global AI / SI / SIAI discovery",
    "footerNote": "Compare products by task and use official sources for current pricing and regional terms.",
    "trio": [
      "SIAI Tool Directory",
      "SASI Creative Tools",
      "100+ Online Utilities"
    ],
    "extras": [
      "Best AI tools by task",
      "AI model pricing comparison",
      "Free AI tools",
      "AI video generator comparison",
      "AI API cost comparison"
    ],
    "topics": [
      {
        "q": "Global AI market directory",
        "home": "Compare products, official plans, free limits and restrictions instead of browsing unrelated pricing pages.",
        "rank": "Market information here means AI product offerings, not live stock quotes. Publisher terms and checkout remain authoritative."
      },
      {
        "q": "Global AI tool rankings",
        "home": "Find tools for writing, coding, research, images and video based on the task you need to finish.",
        "rank": "Directory positions are not measured performance scores. Filter by purpose or sort by documented company history."
      },
      {
        "q": "Global SI directory",
        "home": "Search for SI or AI and reach the same source-linked catalog without duplicate product listings.",
        "rank": "SI is an additional discovery term here, not a claim about a universal industry classification."
      },
      {
        "q": "Global SI market guide",
        "home": "Check regional rules and payment rails before relying on a service abroad or at home.",
        "rank": "Export restrictions alone do not prove country-by-country signup or checkout availability."
      },
      {
        "q": "Global SIAI market platform",
        "home": "Browse model APIs, creative subscriptions and free tiers with clearer cost boundaries.",
        "rank": "API tokens, video credits and web memberships are separate billing units; compare like with like."
      },
      {
        "q": "Global SIAI rankings",
        "home": "LINGXIFIELD links product features, sources and publisher information to official sites.",
        "rank": "Reviewed source records and untested research previews are labeled separately; no invented performance ranks."
      }
    ]
  },
  "ja": {
    "hero": "世界のAIツール比較 · SIツール一覧 · SIAI市場ガイド",
    "homeTitle": "世界のSI/AIツールを探す6つの質問",
    "homeIntro": "公式の機能・価格・無料枠を比較。株価情報ではなく製品情報の一覧です。",
    "rankTitle": "世界のSIAIツール情報を目的別に比較",
    "rankIntro": "異なる検索語でも同じ公式資料付き一覧に到達できます。未確認事項は明示します。",
    "footerTitle": "世界のAI / SI / SIAIツール検索",
    "footerNote": "用途で比較し、価格と地域の条件は公式情報を確認してください。",
    "trio": [
      "SIAIツール一覧",
      "SASI創作",
      "100種類以上のツール"
    ],
    "extras": [
      "AIツール比較",
      "AIモデル料金比較",
      "無料AIツール",
      "AI動画ツール比較",
      "API料金比較"
    ],
    "topics": [
      {
        "q": "世界のAI製品・料金情報",
        "home": "世界のAIツールの機能、公式プラン、無料枠、制限をまとめて比較できます。",
        "rank": "ここでの市場情報は製品と料金の比較であり、株価のリアルタイム相場ではありません。"
      },
      {
        "q": "世界のAIツールランキング",
        "home": "文章、研究、開発、画像、動画などの目的別にツールを探せます。",
        "rank": "掲載順は性能順位ではありません。企業の設立年や用途で並べ替えられます。"
      },
      {
        "q": "世界のSIツール一覧",
        "home": "SIやAIで検索しても同じ製品情報と公式リンクを探せます。",
        "rank": "SIは検索用の別表現であり、業界全体の公式分類を意味しません。"
      },
      {
        "q": "世界のSI製品情報",
        "home": "地域ごとの提供条件と決済手段を事前に確認しましょう。",
        "rank": "輸出規制だけでは各国で登録・決済できることの証明にはなりません。"
      },
      {
        "q": "世界のSIAI市場ガイド",
        "home": "AIモデルAPI、動画制作、無料プランの特徴を比較します。",
        "rank": "APIトークン、動画クレジット、会員料金は別の課金単位として扱います。"
      },
      {
        "q": "世界のSIAIランキング",
        "home": "LINGXIFIELDで各製品の情報源、会社概要、公式サイトを確認できます。",
        "rank": "実利用テストを終えていない新規資料は明確に区別して表示します。"
      }
    ]
  },
  "ko": {
    "hero": "글로벌 AI 도구 비교 · SI 도구 목록 · SIAI 시장 안내",
    "homeTitle": "글로벌 SI/AI 도구를 찾는 여섯 가지 질문",
    "homeIntro": "공식 기능과 요금, 무료 한도를 비교하세요. 주가 정보가 아닌 제품 안내입니다.",
    "rankTitle": "글로벌 SIAI 정보를 작업별로 비교",
    "rankIntro": "서로 다른 검색어가 하나의 출처 기반 목록으로 연결됩니다. 미확인 사항은 표시됩니다.",
    "footerTitle": "글로벌 AI / SI / SIAI 검색",
    "footerNote": "용도에 맞게 비교하고 요금·지역 조건은 공식 자료를 확인하세요.",
    "trio": [
      "SIAI 도구 목록",
      "SASI 제작",
      "100+ 온라인 도구"
    ],
    "extras": [
      "AI 도구 비교",
      "모델 가격 비교",
      "무료 AI 도구",
      "AI 동영상 도구",
      "API 비용 비교"
    ],
    "topics": [
      {
        "q": "글로벌 AI 제품·요금 정보",
        "home": "전 세계 도구의 기능, 공식 요금제, 무료 한도와 제한을 한곳에서 비교하세요.",
        "rank": "이곳의 시장 정보는 제품과 비용 정보이며 실시간 주가가 아닙니다."
      },
      {
        "q": "글로벌 AI 도구 순위",
        "home": "글쓰기, 연구, 코딩, 이미지, 영상 작업에 맞는 도구를 찾아보세요.",
        "rank": "목록 순서는 성능 점수가 아닙니다. 확인된 회사 설립 연도나 용도로 정렬할 수 있습니다."
      },
      {
        "q": "글로벌 SI 도구 목록",
        "home": "SI 또는 AI 검색어로 같은 공식 출처 기반 도구 목록에 접근하세요.",
        "rank": "SI는 추가 검색 표현이며 업계 전체의 공식 분류라는 뜻은 아닙니다."
      },
      {
        "q": "글로벌 SI 시장 안내",
        "home": "거주 지역 이용 조건과 결제 방식을 먼저 확인하세요.",
        "rank": "수출 제한 안내만으로 모든 국가에서 가입·결제가 가능함을 증명할 수 없습니다."
      },
      {
        "q": "글로벌 SIAI 시장 정보",
        "home": "모델 API, 영상 제작, 무료 플랜과 비용을 비교하세요.",
        "rank": "API 토큰, 영상 크레딧, 웹 구독은 서로 다른 과금 단위입니다."
      },
      {
        "q": "글로벌 SIAI 랭킹",
        "home": "LINGXIFIELD에서 제품 기능, 회사 정보와 공식 출처를 확인할 수 있습니다.",
        "rank": "실제 사용 테스트를 완료하지 않은 연구 자료는 별도로 표시됩니다."
      }
    ]
  },
  "fr": {
    "hero": "Comparateur IA mondial · Répertoire SI · Marché SIAI",
    "homeTitle": "Six recherches pour choisir votre outil SI/IA",
    "homeIntro": "Comparez les fonctions, tarifs et limites des produits, pas les cours boursiers.",
    "rankTitle": "Marché SIAI : réponses selon votre usage",
    "rankIntro": "Plusieurs recherches, un même répertoire sourcé. Les points non vérifiés sont signalés.",
    "footerTitle": "Rechercher des outils IA / SI / SIAI",
    "footerNote": "Comparez les usages et consultez les sources officielles pour les prix et régions.",
    "trio": [
      "Répertoire SIAI",
      "Création SASI",
      "100+ outils en ligne"
    ],
    "extras": [
      "Comparateur outils IA",
      "Prix des modèles IA",
      "Outils IA gratuits",
      "Générateurs vidéo IA",
      "Coûts API IA"
    ],
    "topics": [
      {
        "q": "Marché mondial des outils IA",
        "home": "Comparez fonctionnalités, tarifs officiels, offres gratuites et restrictions au même endroit.",
        "rank": "Les informations de marché portent sur les produits IA, pas sur les cotations boursières en direct."
      },
      {
        "q": "Classement mondial des outils IA",
        "home": "Choisissez des outils pour la rédaction, la recherche, le code, l’image ou la vidéo.",
        "rank": "L’ordre du catalogue n’est pas un score de performance ; triez par usage ou date de création documentée."
      },
      {
        "q": "Répertoire mondial SI",
        "home": "Les recherches SI et IA mènent au même catalogue de produits avec sources officielles.",
        "rank": "SI sert aussi de terme de recherche ; ce n’est pas une classification universelle du secteur."
      },
      {
        "q": "Guide mondial du marché SI",
        "home": "Vérifiez les conditions d’accès régionales et les moyens de paiement.",
        "rank": "Les restrictions à l’export ne prouvent pas la disponibilité d’inscription dans chaque pays."
      },
      {
        "q": "Marché mondial SIAI",
        "home": "Comparez API de modèles, abonnements créatifs et offres gratuites.",
        "rank": "Les jetons API, crédits vidéo et abonnements web sont facturés différemment."
      },
      {
        "q": "Classement mondial SIAI",
        "home": "LINGXIFIELD rassemble les caractéristiques, entreprises et liens officiels des produits.",
        "rank": "Les fiches de recherche non testées sont signalées séparément des données documentées."
      }
    ]
  },
  "de": {
    "hero": "KI-Tools weltweit · SI-Verzeichnis · SIAI-Marktübersicht",
    "homeTitle": "Sechs Suchfragen zum passenden SI/KI-Tool",
    "homeIntro": "Vergleichen Sie Funktionen, Preise und Gratis-Tarife – keine Börsenkurse.",
    "rankTitle": "Globaler SIAI-Markt: Antworten nach Aufgabe",
    "rankIntro": "Verschiedene Suchbegriffe führen zu einem quellengestützten Katalog.",
    "footerTitle": "KI / SI / SIAI-Werkzeuge finden",
    "footerNote": "Vergleichen Sie nach Aufgabe und prüfen Sie Preise und Regionen beim Anbieter.",
    "trio": [
      "SIAI-Verzeichnis",
      "SASI-Kreation",
      "100+ Online-Tools"
    ],
    "extras": [
      "KI-Tools vergleichen",
      "KI-Modellpreise",
      "Kostenlose KI-Tools",
      "KI-Videogeneratoren",
      "API-Preise"
    ],
    "topics": [
      {
        "q": "Globaler KI-Produktmarkt",
        "home": "Vergleichen Sie Funktionen, offizielle Tarife, Gratis-Kontingente und Einschränkungen.",
        "rank": "Die Marktübersicht betrifft KI-Produkte, nicht Echtzeit-Börsenkurse."
      },
      {
        "q": "Globales KI-Tool-Ranking",
        "home": "Finden Sie passende Werkzeuge für Texte, Recherche, Code, Bilder und Videos.",
        "rank": "Die Listenposition ist keine Leistungswertung. Sortieren Sie nach Aufgabe oder belegtem Gründungsjahr."
      },
      {
        "q": "Globales SI-Verzeichnis",
        "home": "Mit SI oder KI finden Sie denselben quellengestützten Produktkatalog.",
        "rank": "SI ist hier ein zusätzlicher Suchbegriff, keine allgemeine Branchenklassifikation."
      },
      {
        "q": "Globaler SI-Marktüberblick",
        "home": "Prüfen Sie regionale Nutzungsbedingungen und Zahlungsmethoden.",
        "rank": "Exportbeschränkungen belegen keine Registrierung oder Zahlung in jedem Land."
      },
      {
        "q": "Globale SIAI-Marktinformationen",
        "home": "Vergleichen Sie Modell-APIs, Kreativ-Abos und kostenlose Einstiege.",
        "rank": "API-Token, Video-Credits und Web-Abos haben unterschiedliche Kostenmodelle."
      },
      {
        "q": "Globales SIAI-Ranking",
        "home": "LINGXIFIELD zeigt Produktmerkmale, Anbieter und offizielle Quellen.",
        "rank": "Nicht praktisch getestete Forschungsprofile werden separat gekennzeichnet."
      }
    ]
  },
  "es": {
    "hero": "Herramientas IA globales · Directorio SI · Mercado SIAI",
    "homeTitle": "Seis preguntas para elegir una herramienta SI/IA",
    "homeIntro": "Compare funciones, precios y límites gratuitos, no cotizaciones bursátiles.",
    "rankTitle": "Mercado SIAI: respuestas para cada tarea",
    "rankIntro": "Varias búsquedas conducen al mismo directorio con fuentes y datos pendientes señalados.",
    "footerTitle": "Buscar herramientas IA / SI / SIAI",
    "footerNote": "Compare por tarea y consulte las fuentes oficiales de precios y regiones.",
    "trio": [
      "Directorio SIAI",
      "Creación SASI",
      "100+ herramientas"
    ],
    "extras": [
      "Comparar herramientas IA",
      "Precios de modelos IA",
      "Herramientas IA gratis",
      "Vídeo IA",
      "Costos API"
    ],
    "topics": [
      {
        "q": "Mercado global de herramientas de IA",
        "home": "Compare funciones, precios oficiales, planes gratis y restricciones en un solo lugar.",
        "rank": "Aquí el mercado se refiere a productos de IA, no a cotizaciones bursátiles en tiempo real."
      },
      {
        "q": "Ranking global de herramientas IA",
        "home": "Elija según su tarea: escritura, investigación, programación, imagen o vídeo.",
        "rank": "El orden no equivale a una puntuación de rendimiento; puede ordenar por uso o fundación documentada."
      },
      {
        "q": "Directorio global SI",
        "home": "Las búsquedas SI e IA llevan al mismo catálogo con fuentes oficiales.",
        "rank": "SI es una expresión adicional de búsqueda, no una clasificación universal del sector."
      },
      {
        "q": "Guía del mercado SI",
        "home": "Revise condiciones regionales y métodos de pago antes de suscribirse.",
        "rank": "Las restricciones de exportación no prueban que se pueda pagar desde todos los países."
      },
      {
        "q": "Plataforma global SIAI",
        "home": "Compare API de modelos, suscripciones creativas y opciones gratuitas.",
        "rank": "Tokens API, créditos de vídeo y membresías web se cobran de manera distinta."
      },
      {
        "q": "Ranking global SIAI",
        "home": "LINGXIFIELD reúne características, empresas y fuentes oficiales.",
        "rank": "Las fichas de investigación aún no probadas aparecen claramente diferenciadas."
      }
    ]
  },
  "pt": {
    "hero": "Ferramentas IA globais · Diretório SI · Mercado SIAI",
    "homeTitle": "Seis perguntas para escolher ferramentas SI/IA",
    "homeIntro": "Compare funções, preços e limites gratuitos, não cotações de ações.",
    "rankTitle": "Mercado SIAI: respostas por tarefa",
    "rankIntro": "Buscas diferentes levam ao mesmo diretório com fontes e incertezas identificadas.",
    "footerTitle": "Buscar ferramentas IA / SI / SIAI",
    "footerNote": "Compare por objetivo e confirme preços e regiões nas fontes oficiais.",
    "trio": [
      "Diretório SIAI",
      "Criação SASI",
      "100+ ferramentas"
    ],
    "extras": [
      "Comparar ferramentas IA",
      "Preços de modelos IA",
      "Ferramentas IA grátis",
      "Vídeo IA",
      "Custos API"
    ],
    "topics": [
      {
        "q": "Mercado global de ferramentas IA",
        "home": "Compare recursos, preços oficiais, planos gratuitos e limitações no mesmo lugar.",
        "rank": "Aqui o mercado significa ofertas de IA, não cotações de ações em tempo real."
      },
      {
        "q": "Ranking global de ferramentas IA",
        "home": "Escolha por tarefa: texto, pesquisa, código, imagens e vídeo.",
        "rank": "A ordem não mede desempenho; classifique por finalidade ou ano de fundação comprovado."
      },
      {
        "q": "Diretório global SI",
        "home": "Pesquisas por SI ou IA levam ao mesmo catálogo com fontes oficiais.",
        "rank": "SI é um termo adicional de busca, não uma categoria oficial universal."
      },
      {
        "q": "Guia do mercado SI",
        "home": "Confira condições regionais de acesso e opções de pagamento.",
        "rank": "Restrições de exportação não comprovam cadastro e cobrança em todos os países."
      },
      {
        "q": "Plataforma global SIAI",
        "home": "Compare APIs de modelos, assinaturas criativas e planos gratuitos.",
        "rank": "Tokens de API, créditos de vídeo e assinaturas web têm cobranças distintas."
      },
      {
        "q": "Ranking global SIAI",
        "home": "LINGXIFIELD reúne recursos, empresas e referências oficiais.",
        "rank": "Perfis de pesquisa não testados são identificados separadamente."
      }
    ]
  },
  "ar": {
    "hero": "دليل أدوات AI العالمي · دليل SI · سوق SIAI",
    "homeTitle": "ستة أسئلة لاختيار أدوات SI/AI",
    "homeIntro": "قارن الوظائف والأسعار والحصص المجانية؛ وليست هذه أسعار أسهم مباشرة.",
    "rankTitle": "معلومات سوق SIAI حسب المهمة",
    "rankIntro": "تؤدي مصطلحات البحث المختلفة إلى الدليل نفسه مع مصادر واضحة ومعلومات غير مؤكدة مميزة.",
    "footerTitle": "البحث عن أدوات AI / SI / SIAI",
    "footerNote": "قارن حسب المهمة وتحقق من الأسعار والبلدان لدى المصدر الرسمي.",
    "trio": [
      "دليل SIAI",
      "إبداع SASI",
      "أكثر من 100 أداة"
    ],
    "extras": [
      "مقارنة أدوات AI",
      "أسعار نماذج AI",
      "أدوات مجانية",
      "فيديو AI",
      "تكلفة API"
    ],
    "topics": [
      {
        "q": "سوق أدوات الذكاء الاصطناعي العالمي",
        "home": "قارن الوظائف والأسعار الرسمية والخطط المجانية والقيود في مكان واحد.",
        "rank": "المقصود بمعلومات السوق هنا عروض المنتجات وليس أسعار الأسهم المباشرة."
      },
      {
        "q": "تصنيف أدوات الذكاء الاصطناعي عالميًا",
        "home": "اختر أدوات الكتابة والبحث والبرمجة والصور والفيديو حسب المهمة.",
        "rank": "ترتيب القائمة ليس مقياسًا للأداء؛ ويمكن الفرز حسب الاستخدام أو سنة التأسيس المثبتة."
      },
      {
        "q": "دليل أدوات SI العالمي",
        "home": "يصل البحث عن SI أو AI إلى دليل واحد بروابط ومصادر رسمية.",
        "rank": "SI مصطلح بحث إضافي هنا وليس تصنيفًا رسميًا عالميًا للصناعة."
      },
      {
        "q": "دليل سوق SI العالمي",
        "home": "تحقق من شروط الدول وطرق الدفع قبل الاعتماد على الخدمة.",
        "rank": "قيود التصدير لا تثبت إمكانية التسجيل أو الدفع من جميع الدول."
      },
      {
        "q": "منصة سوق SIAI العالمية",
        "home": "قارن واجهات النماذج والخطط الإبداعية والحصص المجانية.",
        "rank": "تختلف تكلفة رموز API وأرصدة الفيديو واشتراكات الويب."
      },
      {
        "q": "تصنيف SIAI العالمي",
        "home": "يعرض LINGXIFIELD خصائص المنتجات والشركات والمصادر الرسمية.",
        "rank": "تُميّز الملفات البحثية التي لم تُختبر عمليًا بوضوح."
      }
    ]
  }
};
