import type {LingxiLang} from "./lingxi-i18n";
export type SiaiDiscoveryTopic={q:string;home:string;rank:string};
export type SiaiDiscoveryCopy={hero:string;homeTitle:string;homeIntro:string;rankTitle:string;rankIntro:string;footerTitle:string;footerNote:string;trio:string[];extras:string[];topics:SiaiDiscoveryTopic[]};
/** Localized search-intent answers. Each displayed keyword has distinct, factual copy. */
export const SIAI_DISCOVERY:Record<LingxiLang,SiaiDiscoveryCopy>={
  "zh": {
    "hero": "全球AI行情平台 · 全球AI排行榜 · 全球SI排行榜 · 全球SI行情平台 · 全球SIAI行情平台 · 全球SIAI排行榜",
    "homeTitle": "全球 AI / SI 工具怎么选？按任务比较六类产品",
    "homeIntro": "从写作、编程、图片、视频到模型 API，按功能、价格、免费额度与地区找到适合自己的 AI 工具。",
    "rankTitle": "全球 SIAI 工具功能、价格与免费额度对比",
    "rankIntro": "查看产品能完成什么任务，比较代表模型、套餐价格、免费使用次数、地区可用性、付款方式及商用条件。",
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
        "rank": "查看 AI 软件订阅价格、免费视频额度、视频积分和模型 API 费用，快速找到适合预算的产品。"
      },
      {
        "q": "全球AI排行榜",
        "home": "选 AI 不必只看名气。先按写作、研究、编程、图片和视频任务筛选，再比较真实限制。",
        "rank": "按写作、办公、图片、视频、编程和研究等用途筛选产品，比较功能特色与使用步骤。"
      },
      {
        "q": "全球SI排行榜",
        "home": "搜索 SI 或 AI 都可以找到灵犀场的全球工具目录；同一款工具只保留一份产品档案。",
        "rank": "比较长文理解、代码辅助、多模态识别和工具调用等能力，按具体任务选择智能工具。"
      },
      {
        "q": "全球SI行情平台",
        "home": "想知道一款工具在香港、内地或海外能不能用？先核对官方地区条款与付款方式。",
        "rank": "根据所在地查看产品的使用地区、支付方式和商用条件，了解不同方案适合谁。"
      },
      {
        "q": "全球SIAI行情平台",
        "home": "从通用助手到图像、视频、语音和模型 API，集中了解用途、免费方案及一次任务的可能成本。",
        "rank": "对比智能助手、图像、视频、语音和开发者 API，查看套餐、积分与单次任务成本。"
      },
      {
        "q": "全球SIAI排行榜",
        "home": "灵犀场 LINGXIFIELD 汇集全球 SI/AI 产品档案，点开来源与官网再决定用哪个。",
        "rank": "浏览新手友好工具、创意制作产品和开发者平台，一键查看功能详情并进入厂商官网。"
      }
    ]
  },
  "en": {
    "hero": "Global AI tool rankings · SI directory · SIAI market guide",
    "homeTitle": "Six ways to find the right global SI/AI tool",
    "homeIntro": "Explore AI tools for writing, coding, images, video and model APIs. Compare features, free plans, pricing and availability.",
    "rankTitle": "Global SIAI market information: compare by real task",
    "rankIntro": "Find what each product does, its models, plans, free allowances, regional access, payment options and commercial terms.",
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
        "rank": "Compare subscriptions, free usage, video credits and API pricing to choose tools for your budget."
      },
      {
        "q": "Global AI tool rankings",
        "home": "Find tools for writing, coding, research, images and video based on the task you need to finish.",
        "rank": "Browse tools for writing, office tasks, research, image generation, video and coding, then compare their strengths."
      },
      {
        "q": "Global SI directory",
        "home": "Search for SI or AI and reach the same source-linked catalog without duplicate product listings.",
        "rank": "Explore long-document analysis, coding assistance, multimodal understanding and tool integrations."
      },
      {
        "q": "Global SI market guide",
        "home": "Check regional rules and payment rails before relying on a service abroad or at home.",
        "rank": "Check regional availability, payment methods and licensing before choosing a plan."
      },
      {
        "q": "Global SIAI market platform",
        "home": "Browse model APIs, creative subscriptions and free tiers with clearer cost boundaries.",
        "rank": "Compare assistants, creative tools and developer APIs with the right pricing units for each task."
      },
      {
        "q": "Global SIAI rankings",
        "home": "LINGXIFIELD links product features, sources and publisher information to official sites.",
        "rank": "Browse beginner-friendly products, creative platforms and APIs, then visit their official websites."
      }
    ]
  },
  "ja": {
    "hero": "世界のAIツール比較 · SIツール一覧 · SIAI市場ガイド",
    "homeTitle": "世界のSI/AIツールを探す6つの質問",
    "homeIntro": "文章、開発、画像、動画、モデルAPIから、機能・無料枠・価格・地域条件で適切なツールを探せます。",
    "rankTitle": "世界のSIAIツール情報を目的別に比較",
    "rankIntro": "できること、モデル、プラン料金、無料枠、利用地域、決済方法、商用条件を比較できます。",
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
        "rank": "月額料金、無料枠、動画クレジット、モデルAPI料金を比べ、予算に合う製品を選びます。"
      },
      {
        "q": "世界のAIツールランキング",
        "home": "文章、研究、開発、画像、動画などの目的別にツールを探せます。",
        "rank": "文章、研究、画像、動画、開発などの目的別に製品を探し、特徴と使い方を比べます。"
      },
      {
        "q": "世界のSIツール一覧",
        "home": "SIやAIで検索しても同じ製品情報と公式リンクを探せます。",
        "rank": "長文理解、コーディング支援、マルチモーダル処理、外部ツール連携を確認します。"
      },
      {
        "q": "世界のSI製品情報",
        "home": "地域ごとの提供条件と決済手段を事前に確認しましょう。",
        "rank": "利用地域、決済方法、商用ライセンスを確認してプランを選びます。"
      },
      {
        "q": "世界のSIAI市場ガイド",
        "home": "AIモデルAPI、動画制作、無料プランの特徴を比較します。",
        "rank": "AIアシスタント、画像・動画・音声生成、開発者APIの料金体系を比較します。"
      },
      {
        "q": "世界のSIAIランキング",
        "home": "LINGXIFIELDで各製品の情報源、会社概要、公式サイトを確認できます。",
        "rank": "初心者向け、創作向け、開発者向けの製品を探し、公式サイトを開きます。"
      }
    ]
  },
  "ko": {
    "hero": "글로벌 AI 도구 비교 · SI 도구 목록 · SIAI 시장 안내",
    "homeTitle": "글로벌 SI/AI 도구를 찾는 여섯 가지 질문",
    "homeIntro": "글쓰기, 코딩, 이미지, 동영상과 모델 API를 기능, 무료 한도, 가격 및 지역별로 비교하세요.",
    "rankTitle": "글로벌 SIAI 정보를 작업별로 비교",
    "rankIntro": "제품 기능, 모델, 요금제, 무료 이용량, 지원 지역, 결제와 상업적 이용 조건을 확인하세요.",
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
        "rank": "구독료, 무료 이용량, 동영상 크레딧과 모델 API 비용을 비교합니다."
      },
      {
        "q": "글로벌 AI 도구 순위",
        "home": "글쓰기, 연구, 코딩, 이미지, 영상 작업에 맞는 도구를 찾아보세요.",
        "rank": "글쓰기, 사무, 연구, 이미지, 동영상, 코딩 작업에 맞는 도구를 찾아봅니다."
      },
      {
        "q": "글로벌 SI 도구 목록",
        "home": "SI 또는 AI 검색어로 같은 공식 출처 기반 도구 목록에 접근하세요.",
        "rank": "긴 문서 이해, 코딩 지원, 멀티모달 기능과 도구 연동을 살펴봅니다."
      },
      {
        "q": "글로벌 SI 시장 안내",
        "home": "거주 지역 이용 조건과 결제 방식을 먼저 확인하세요.",
        "rank": "지역별 제공 여부, 결제 방법, 상업용 사용 조건을 비교합니다."
      },
      {
        "q": "글로벌 SIAI 시장 정보",
        "home": "모델 API, 영상 제작, 무료 플랜과 비용을 비교하세요.",
        "rank": "AI 어시스턴트, 이미지·동영상·음성 제작과 개발 API 비용을 비교합니다."
      },
      {
        "q": "글로벌 SIAI 랭킹",
        "home": "LINGXIFIELD에서 제품 기능, 회사 정보와 공식 출처를 확인할 수 있습니다.",
        "rank": "초보자용 및 제작·개발 도구를 살펴보고 공식 웹사이트로 이동합니다."
      }
    ]
  },
  "fr": {
    "hero": "Comparateur IA mondial · Répertoire SI · Marché SIAI",
    "homeTitle": "Six recherches pour choisir votre outil SI/IA",
    "homeIntro": "Trouvez des outils pour écrire, coder, créer des images, des vidéos ou utiliser une API selon les fonctions, prix et offres gratuites.",
    "rankTitle": "Marché SIAI : réponses selon votre usage",
    "rankIntro": "Comparez les capacités, modèles, abonnements, quotas gratuits, régions, paiements et conditions commerciales.",
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
        "rank": "Comparez abonnements, quotas gratuits, crédits vidéo et prix des API selon votre budget."
      },
      {
        "q": "Classement mondial des outils IA",
        "home": "Choisissez des outils pour la rédaction, la recherche, le code, l’image ou la vidéo.",
        "rank": "Recherchez des outils pour la rédaction, la bureautique, les études, l'image, la vidéo ou le code."
      },
      {
        "q": "Répertoire mondial SI",
        "home": "Les recherches SI et IA mènent au même catalogue de produits avec sources officielles.",
        "rank": "Découvrez l'analyse de longs documents, l'assistance au code et les fonctions multimodales."
      },
      {
        "q": "Guide mondial du marché SI",
        "home": "Vérifiez les conditions d’accès régionales et les moyens de paiement.",
        "rank": "Vérifiez les pays disponibles, les moyens de paiement et les licences commerciales."
      },
      {
        "q": "Marché mondial SIAI",
        "home": "Comparez API de modèles, abonnements créatifs et offres gratuites.",
        "rank": "Comparez assistants, outils créatifs et API selon leurs unités de facturation."
      },
      {
        "q": "Classement mondial SIAI",
        "home": "LINGXIFIELD rassemble les caractéristiques, entreprises et liens officiels des produits.",
        "rank": "Trouvez des outils pour débutants, créateurs et développeurs, puis ouvrez le site officiel."
      }
    ]
  },
  "de": {
    "hero": "KI-Tools weltweit · SI-Verzeichnis · SIAI-Marktübersicht",
    "homeTitle": "Sechs Suchfragen zum passenden SI/KI-Tool",
    "homeIntro": "Finde KI-Tools für Texte, Code, Bilder, Videos und Modell-APIs nach Funktionen, Gratisplänen, Preisen und Region.",
    "rankTitle": "Globaler SIAI-Markt: Antworten nach Aufgabe",
    "rankIntro": "Vergleiche Aufgaben, Modelle, Tarife, kostenlose Kontingente, Regionen, Zahlungen und kommerzielle Nutzungsrechte.",
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
        "rank": "Abos, Gratis-Kontingente, Videocredits und API-Kosten passend zum Budget vergleichen."
      },
      {
        "q": "Globales KI-Tool-Ranking",
        "home": "Finden Sie passende Werkzeuge für Texte, Recherche, Code, Bilder und Videos.",
        "rank": "Tools für Schreiben, Büroarbeit, Forschung, Bilder, Videos und Programmierung finden."
      },
      {
        "q": "Globales SI-Verzeichnis",
        "home": "Mit SI oder KI finden Sie denselben quellengestützten Produktkatalog.",
        "rank": "Langtext-Verständnis, Programmierhilfe, multimodale Funktionen und Integrationen vergleichen."
      },
      {
        "q": "Globaler SI-Marktüberblick",
        "home": "Prüfen Sie regionale Nutzungsbedingungen und Zahlungsmethoden.",
        "rank": "Verfügbarkeit nach Region, Zahlungsmethoden und kommerzielle Lizenzbedingungen prüfen."
      },
      {
        "q": "Globale SIAI-Marktinformationen",
        "home": "Vergleichen Sie Modell-APIs, Kreativ-Abos und kostenlose Einstiege.",
        "rank": "Assistenten, Bild-, Video- und Sprachtools sowie APIs nach Kostenmodellen vergleichen."
      },
      {
        "q": "Globales SIAI-Ranking",
        "home": "LINGXIFIELD zeigt Produktmerkmale, Anbieter und offizielle Quellen.",
        "rank": "Einsteiger-, Kreativ- und Entwicklertools entdecken und direkt zur Herstellerseite wechseln."
      }
    ]
  },
  "es": {
    "hero": "Herramientas IA globales · Directorio SI · Mercado SIAI",
    "homeTitle": "Seis preguntas para elegir una herramienta SI/IA",
    "homeIntro": "Encuentra herramientas para escribir, programar, crear imágenes o vídeos y usar API según funciones, precios y planes gratis.",
    "rankTitle": "Mercado SIAI: respuestas para cada tarea",
    "rankIntro": "Compara capacidades, modelos, precios, cuotas gratuitas, disponibilidad regional, pagos y condiciones comerciales.",
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
        "rank": "Compara suscripciones, usos gratuitos, créditos de vídeo y tarifas de API según tu presupuesto."
      },
      {
        "q": "Ranking global de herramientas IA",
        "home": "Elija según su tarea: escritura, investigación, programación, imagen o vídeo.",
        "rank": "Busca herramientas de escritura, oficina, investigación, imágenes, vídeos y programación."
      },
      {
        "q": "Directorio global SI",
        "home": "Las búsquedas SI e IA llevan al mismo catálogo con fuentes oficiales.",
        "rank": "Explora análisis de documentos largos, programación asistida y funciones multimodales."
      },
      {
        "q": "Guía del mercado SI",
        "home": "Revise condiciones regionales y métodos de pago antes de suscribirse.",
        "rank": "Consulta las regiones disponibles, los métodos de pago y las licencias comerciales."
      },
      {
        "q": "Plataforma global SIAI",
        "home": "Compare API de modelos, suscripciones creativas y opciones gratuitas.",
        "rank": "Compara asistentes, herramientas creativas y API según su forma de facturación."
      },
      {
        "q": "Ranking global SIAI",
        "home": "LINGXIFIELD reúne características, empresas y fuentes oficiales.",
        "rank": "Descubre herramientas para principiantes, creadores y desarrolladores y accede a su web oficial."
      }
    ]
  },
  "pt": {
    "hero": "Ferramentas IA globais · Diretório SI · Mercado SIAI",
    "homeTitle": "Seis perguntas para escolher ferramentas SI/IA",
    "homeIntro": "Encontre ferramentas para texto, código, imagem, vídeo e APIs por função, preço, plano gratuito e região.",
    "rankTitle": "Mercado SIAI: respostas por tarefa",
    "rankIntro": "Compare recursos, modelos, assinaturas, limites gratuitos, regiões, pagamentos e condições comerciais.",
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
        "rank": "Compare assinaturas, cotas gratuitas, créditos de vídeo e preços de API conforme seu orçamento."
      },
      {
        "q": "Ranking global de ferramentas IA",
        "home": "Escolha por tarefa: texto, pesquisa, código, imagens e vídeo.",
        "rank": "Busque ferramentas de escrita, escritório, pesquisa, imagens, vídeo e programação."
      },
      {
        "q": "Diretório global SI",
        "home": "Pesquisas por SI ou IA levam ao mesmo catálogo com fontes oficiais.",
        "rank": "Veja análise de documentos longos, assistência de código e recursos multimodais."
      },
      {
        "q": "Guia do mercado SI",
        "home": "Confira condições regionais de acesso e opções de pagamento.",
        "rank": "Consulte disponibilidade regional, meios de pagamento e direitos comerciais."
      },
      {
        "q": "Plataforma global SIAI",
        "home": "Compare APIs de modelos, assinaturas criativas e planos gratuitos.",
        "rank": "Compare assistentes, criação de imagem, vídeo, áudio e APIs com custos separados."
      },
      {
        "q": "Ranking global SIAI",
        "home": "LINGXIFIELD reúne recursos, empresas e referências oficiais.",
        "rank": "Encontre ferramentas para iniciantes, criadores e desenvolvedores e acesse o site oficial."
      }
    ]
  },
  "ar": {
    "hero": "دليل أدوات AI العالمي · دليل SI · سوق SIAI",
    "homeTitle": "ستة أسئلة لاختيار أدوات SI/AI",
    "homeIntro": "اعثر على أدوات للكتابة والبرمجة والصور والفيديو وواجهات النماذج حسب الوظائف والأسعار والحصص المجانية والمنطقة.",
    "rankTitle": "معلومات سوق SIAI حسب المهمة",
    "rankIntro": "قارن القدرات والنماذج والاشتراكات والحصص المجانية والمناطق وطرق الدفع وشروط الاستخدام التجاري.",
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
        "rank": "قارن الاشتراكات والحصص المجانية وأرصدة الفيديو وأسعار واجهات النماذج وفق ميزانيتك."
      },
      {
        "q": "تصنيف أدوات الذكاء الاصطناعي عالميًا",
        "home": "اختر أدوات الكتابة والبحث والبرمجة والصور والفيديو حسب المهمة.",
        "rank": "ابحث عن أدوات الكتابة والمكتب والبحث والصور والفيديو والبرمجة."
      },
      {
        "q": "دليل أدوات SI العالمي",
        "home": "يصل البحث عن SI أو AI إلى دليل واحد بروابط ومصادر رسمية.",
        "rank": "اكتشف فهم المستندات الطويلة ومساعدة البرمجة والوسائط المتعددة وتكامل الأدوات."
      },
      {
        "q": "دليل سوق SI العالمي",
        "home": "تحقق من شروط الدول وطرق الدفع قبل الاعتماد على الخدمة.",
        "rank": "تحقق من المناطق المتاحة ووسائل الدفع وشروط الاستخدام التجاري."
      },
      {
        "q": "منصة سوق SIAI العالمية",
        "home": "قارن واجهات النماذج والخطط الإبداعية والحصص المجانية.",
        "rank": "قارن المساعدات وأدوات الصور والفيديو والصوت وواجهات المطورين وأساليب التسعير."
      },
      {
        "q": "تصنيف SIAI العالمي",
        "home": "يعرض LINGXIFIELD خصائص المنتجات والشركات والمصادر الرسمية.",
        "rank": "اكتشف أدوات المبتدئين والمبدعين والمطورين وانتقل إلى مواقع الناشرين الرسمية."
      }
    ]
  }
};
