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
      "SASI 智能软件市场",
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
        "home": "查看 AI 软件、模型 API 和视频创作工具的套餐价格、免费额度与功能说明，按预算快速找到适用产品。",
        "rank": "查看 AI 软件订阅价格、免费视频额度、视频积分和模型 API 费用，快速找到适合预算的产品。"
      },
      {
        "q": "全球AI排行榜",
        "home": "想写文章、做演示、画图片、生成视频或编程？在这里按任务对比不同工具的特色和操作方式。",
        "rank": "按写作、办公、图片、视频、编程和研究等用途筛选产品，比较功能特色与使用步骤。"
      },
      {
        "q": "全球SI排行榜",
        "home": "需要长文分析、代码辅助或图像理解？查看不同 SI/AI 工具擅长的任务和代表模型。",
        "rank": "比较长文理解、代码辅助、多模态识别和工具调用等能力，按具体任务选择智能工具。"
      },
      {
        "q": "全球SI行情平台",
        "home": "经常在香港、内地或海外使用 AI？可按使用地区、付款方式和商用条件筛选工具。",
        "rank": "根据所在地查看产品的使用地区、支付方式和商用条件，了解不同方案适合谁。"
      },
      {
        "q": "全球SIAI行情平台",
        "home": "从聊天助手到图像、视频、语音和模型 API，一起比较可用功能、价格和免费试用方案。",
        "rank": "对比智能助手、图像、视频、语音和开发者 API，查看套餐、积分与单次任务成本。"
      },
      {
        "q": "全球SIAI排行榜",
        "home": "灵犀场汇集不同用途的全球 SI/AI 工具，选择产品后即可查看功能详情并进入厂商官网。",
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
      "SASI Intelligent Software Marketplace",
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
        "home": "Compare subscription plans, free allowances, creative tool credits and model API costs in one directory.",
        "rank": "Compare subscriptions, free usage, video credits and API pricing to choose tools for your budget."
      },
      {
        "q": "Global AI tool rankings",
        "home": "Writing, slides, images, videos or code: search tools by the task you need to finish and explore their strengths.",
        "rank": "Browse tools for writing, office tasks, research, image generation, video and coding, then compare their strengths."
      },
      {
        "q": "Global SI directory",
        "home": "Explore assistants for long documents, coding tasks, image understanding and connections to other services.",
        "rank": "Explore long-document analysis, coding assistance, multimodal understanding and tool integrations."
      },
      {
        "q": "Global SI market guide",
        "home": "Find tools available in your region and compare supported payment methods and licensing conditions.",
        "rank": "Check regional availability, payment methods and licensing before choosing a plan."
      },
      {
        "q": "Global SIAI market platform",
        "home": "Browse assistants, image and video generators, speech tools and developer APIs by features and pricing.",
        "rank": "Compare assistants, creative tools and developer APIs with the right pricing units for each task."
      },
      {
        "q": "Global SIAI rankings",
        "home": "Choose a tool that fits your work, explore its details and open the official provider website.",
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
      "SASIインテリジェントソフトウェア市場",
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
        "home": "AIソフトの月額料金、無料枠、動画制作クレジット、APIの料金をまとめて比べられます。",
        "rank": "月額料金、無料枠、動画クレジット、モデルAPI料金を比べ、予算に合う製品を選びます。"
      },
      {
        "q": "世界のAIツールランキング",
        "home": "文章、プレゼン、画像、動画、プログラミングなど、したいことから最適なツールを探せます。",
        "rank": "文章、研究、画像、動画、開発などの目的別に製品を探し、特徴と使い方を比べます。"
      },
      {
        "q": "世界のSIツール一覧",
        "home": "長文読解、コード支援、画像理解など、必要な機能に合うSI/AIモデルを比較します。",
        "rank": "長文理解、コーディング支援、マルチモーダル処理、外部ツール連携を確認します。"
      },
      {
        "q": "世界のSI製品情報",
        "home": "地域ごとの利用条件、決済方法、商用ライセンスでツールを絞り込めます。",
        "rank": "利用地域、決済方法、商用ライセンスを確認してプランを選びます。"
      },
      {
        "q": "世界のSIAI市場ガイド",
        "home": "チャット、画像、動画、音声、モデルAPIなどの機能と料金をまとめて比較できます。",
        "rank": "AIアシスタント、画像・動画・音声生成、開発者APIの料金体系を比較します。"
      },
      {
        "q": "世界のSIAIランキング",
        "home": "世界のSI/AI製品を用途別に探し、機能を確認して公式サイトへ進めます。",
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
      "SASI 지능형 소프트웨어 마켓",
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
        "home": "AI 구독 요금, 무료 한도, 동영상 크레딧, 모델 API 사용료를 한곳에서 비교합니다.",
        "rank": "구독료, 무료 이용량, 동영상 크레딧과 모델 API 비용을 비교합니다."
      },
      {
        "q": "글로벌 AI 도구 순위",
        "home": "글쓰기, 발표 자료, 이미지, 동영상, 코딩 등 필요한 작업으로 도구를 찾아보세요.",
        "rank": "글쓰기, 사무, 연구, 이미지, 동영상, 코딩 작업에 맞는 도구를 찾아봅니다."
      },
      {
        "q": "글로벌 SI 도구 목록",
        "home": "긴 문서 분석, 코딩 보조, 이미지 이해와 외부 도구 연결 기능을 살펴보세요.",
        "rank": "긴 문서 이해, 코딩 지원, 멀티모달 기능과 도구 연동을 살펴봅니다."
      },
      {
        "q": "글로벌 SI 시장 안내",
        "home": "사용 지역과 결제 방법, 상업적 이용 조건으로 적합한 제품을 고릅니다.",
        "rank": "지역별 제공 여부, 결제 방법, 상업용 사용 조건을 비교합니다."
      },
      {
        "q": "글로벌 SIAI 시장 정보",
        "home": "대화형 AI, 이미지, 영상, 음성 생성과 모델 API의 기능과 요금을 비교합니다.",
        "rank": "AI 어시스턴트, 이미지·동영상·음성 제작과 개발 API 비용을 비교합니다."
      },
      {
        "q": "글로벌 SIAI 랭킹",
        "home": "글로벌 SI/AI 도구의 기능을 살펴보고 원하는 제품의 공식 웹사이트를 방문하세요.",
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
      "Marché de logiciels intelligents SASI",
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
        "home": "Comparez les abonnements IA, les quotas gratuits, les crédits vidéo et les tarifs API au même endroit.",
        "rank": "Comparez abonnements, quotas gratuits, crédits vidéo et prix des API selon votre budget."
      },
      {
        "q": "Classement mondial des outils IA",
        "home": "Pour rédiger, créer des présentations, des images, des vidéos ou du code, cherchez par tâche.",
        "rank": "Recherchez des outils pour la rédaction, la bureautique, les études, l'image, la vidéo ou le code."
      },
      {
        "q": "Répertoire mondial SI",
        "home": "Comparez l'analyse de documents longs, l'assistance au code, la vision et les intégrations.",
        "rank": "Découvrez l'analyse de longs documents, l'assistance au code et les fonctions multimodales."
      },
      {
        "q": "Guide mondial du marché SI",
        "home": "Choisissez selon votre région, les moyens de paiement et les licences d'utilisation commerciale.",
        "rank": "Vérifiez les pays disponibles, les moyens de paiement et les licences commerciales."
      },
      {
        "q": "Marché mondial SIAI",
        "home": "Parcourez assistants, générateurs d'images, vidéo et voix, ainsi que les API de modèles.",
        "rank": "Comparez assistants, outils créatifs et API selon leurs unités de facturation."
      },
      {
        "q": "Classement mondial SIAI",
        "home": "Découvrez des outils SI/IA pour chaque tâche, consultez leurs fonctions et ouvrez leur site officiel.",
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
      "SASI-Markt für intelligente Software",
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
        "home": "Vergleiche KI-Abos, kostenlose Kontingente, Videocredits und Modell-API-Kosten an einem Ort.",
        "rank": "Abos, Gratis-Kontingente, Videocredits und API-Kosten passend zum Budget vergleichen."
      },
      {
        "q": "Globales KI-Tool-Ranking",
        "home": "Finde passende Tools für Texte, Präsentationen, Bilder, Videos und Code direkt nach Aufgabe.",
        "rank": "Tools für Schreiben, Büroarbeit, Forschung, Bilder, Videos und Programmierung finden."
      },
      {
        "q": "Globales SI-Verzeichnis",
        "home": "Entdecke Langtextanalyse, Programmierhilfe, Bilderkennung und Integrationen.",
        "rank": "Langtext-Verständnis, Programmierhilfe, multimodale Funktionen und Integrationen vergleichen."
      },
      {
        "q": "Globaler SI-Marktüberblick",
        "home": "Filtere Dienste nach Region, Zahlungsart und kommerziellen Nutzungsrechten.",
        "rank": "Verfügbarkeit nach Region, Zahlungsmethoden und kommerzielle Lizenzbedingungen prüfen."
      },
      {
        "q": "Globale SIAI-Marktinformationen",
        "home": "Vergleiche Assistenten, Bild-, Video- und Sprachgeneratoren sowie Entwickler-APIs.",
        "rank": "Assistenten, Bild-, Video- und Sprachtools sowie APIs nach Kostenmodellen vergleichen."
      },
      {
        "q": "Globales SIAI-Ranking",
        "home": "Durchsuche internationale SI/KI-Tools nach Funktion und öffne die offizielle Produktwebsite.",
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
      "Mercado de software inteligente SASI",
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
        "home": "Compara suscripciones de IA, cuotas gratuitas, créditos de vídeo y tarifas de API en un mismo lugar.",
        "rank": "Compara suscripciones, usos gratuitos, créditos de vídeo y tarifas de API según tu presupuesto."
      },
      {
        "q": "Ranking global de herramientas IA",
        "home": "Busca herramientas para escribir, presentar, crear imágenes o vídeos y programar según tu tarea.",
        "rank": "Busca herramientas de escritura, oficina, investigación, imágenes, vídeos y programación."
      },
      {
        "q": "Directorio global SI",
        "home": "Explora lectura de documentos largos, ayuda con código, comprensión de imágenes e integraciones.",
        "rank": "Explora análisis de documentos largos, programación asistida y funciones multimodales."
      },
      {
        "q": "Guía del mercado SI",
        "home": "Filtra por país, formas de pago y permisos para usar los resultados comercialmente.",
        "rank": "Consulta las regiones disponibles, los métodos de pago y las licencias comerciales."
      },
      {
        "q": "Plataforma global SIAI",
        "home": "Compara asistentes, generadores de imágenes, vídeo, voz y plataformas de API para modelos.",
        "rank": "Compara asistentes, herramientas creativas y API según su forma de facturación."
      },
      {
        "q": "Ranking global SIAI",
        "home": "Descubre productos SI/IA por función, consulta sus detalles y abre el sitio oficial del proveedor.",
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
      "Mercado de software inteligente SASI",
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
        "home": "Compare assinaturas de IA, limites gratuitos, créditos de vídeo e preços de API em um só lugar.",
        "rank": "Compare assinaturas, cotas gratuitas, créditos de vídeo e preços de API conforme seu orçamento."
      },
      {
        "q": "Ranking global de ferramentas IA",
        "home": "Encontre ferramentas para textos, apresentações, imagens, vídeos e código conforme sua tarefa.",
        "rank": "Busque ferramentas de escrita, escritório, pesquisa, imagens, vídeo e programação."
      },
      {
        "q": "Diretório global SI",
        "home": "Veja análise de documentos longos, suporte à programação, imagens e integração de ferramentas.",
        "rank": "Veja análise de documentos longos, assistência de código e recursos multimodais."
      },
      {
        "q": "Guia do mercado SI",
        "home": "Filtre por região, formas de pagamento e condições de uso comercial.",
        "rank": "Consulte disponibilidade regional, meios de pagamento e direitos comerciais."
      },
      {
        "q": "Plataforma global SIAI",
        "home": "Compare assistentes, geradores de imagens, vídeo, voz e plataformas de APIs de modelos.",
        "rank": "Compare assistentes, criação de imagem, vídeo, áudio e APIs com custos separados."
      },
      {
        "q": "Ranking global SIAI",
        "home": "Explore ferramentas SI/IA por função, confira os detalhes e acesse o site oficial do produto.",
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
      "سوق برامج SASI الذكية",
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
        "home": "قارن اشتراكات الذكاء الاصطناعي والحصص المجانية وأرصدة الفيديو وأسعار واجهات النماذج في مكان واحد.",
        "rank": "قارن الاشتراكات والحصص المجانية وأرصدة الفيديو وأسعار واجهات النماذج وفق ميزانيتك."
      },
      {
        "q": "تصنيف أدوات الذكاء الاصطناعي عالميًا",
        "home": "اعثر على أدوات الكتابة والعروض التقديمية والصور والفيديو والبرمجة حسب المهمة المطلوبة.",
        "rank": "ابحث عن أدوات الكتابة والمكتب والبحث والصور والفيديو والبرمجة."
      },
      {
        "q": "دليل أدوات SI العالمي",
        "home": "استكشف تحليل المستندات الطويلة ومساعدة البرمجة وفهم الصور وتكامل الأدوات الخارجية.",
        "rank": "اكتشف فهم المستندات الطويلة ومساعدة البرمجة والوسائط المتعددة وتكامل الأدوات."
      },
      {
        "q": "دليل سوق SI العالمي",
        "home": "اختر الأدوات حسب المنطقة وطرق الدفع وحقوق الاستخدام التجاري المتاحة.",
        "rank": "تحقق من المناطق المتاحة ووسائل الدفع وشروط الاستخدام التجاري."
      },
      {
        "q": "منصة سوق SIAI العالمية",
        "home": "قارن المساعدات ومولدات الصور والفيديو والصوت ومنصات واجهات النماذج وتكاليفها.",
        "rank": "قارن المساعدات وأدوات الصور والفيديو والصوت وواجهات المطورين وأساليب التسعير."
      },
      {
        "q": "تصنيف SIAI العالمي",
        "home": "تصفح أدوات SI/AI العالمية حسب الوظيفة واطلع على التفاصيل وانتقل إلى الموقع الرسمي للمنتج.",
        "rank": "اكتشف أدوات المبتدئين والمبدعين والمطورين وانتقل إلى مواقع الناشرين الرسمية."
      }
    ]
  }
};
