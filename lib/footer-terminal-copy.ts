import type {LingxiLang} from "./lingxi-i18n";

export const FOOTER_NAV_ANCHORS=[
 "/siai",
 "/siai#siai-search-ranking-1",
 "/siai#siai-search-ranking-2",
 "/siai#siai-search-ranking-0",
 "/siai#siai-search-ranking-3",
 "/siai#siai-search-ranking-4"
] as const;
export const FOOTER_TOOL_TARGETS=[
 "/tools?q=PDF","/tools?q=图片","/tools?q=视频","/tools?q=音频",
 "/tools?q=文档","/tools?q=Excel","/tools?q=JSON","/sasi"
] as const;
export const FOOTER_QUESTION_TARGETS=[
 "/siai#siai-search-ranking-0","/siai#siai-ranking-data",
 "/siai#siai-filter-panel","/siai#siai-cost-calculator",
 "/tools?q=PDF","/tools"
] as const;
export const FOOTER_TOOL_ICONS_COMPACT=["📄","🖼️","🎬","🎵","📋","📊","⚙️","✨"] as const;

type FooterTerminalCopy={brand:string;discover:readonly string[];tools:readonly string[];questions:readonly string[];strength:string;search:string};
export const FOOTER_TERMINAL:Record<LingxiLang,FooterTerminalCopy>={
 zh:{brand:"全球 SI / AI / SIAI 工具行情、排行榜、SASI 智能创作与 100+ 在线实用工具。",
 discover:["全球 SIAI 排行榜","全球 AI 排行榜","全球 SI 排行榜","全球 AI 行情平台","全球 SI 行情平台","全球 SIAI 行情平台"],
 tools:["PDF 工具","图片工具","视频工具","音频工具","文档工具","办公工具","开发工具","AI 创作"],
 questions:["全球 AI 行情平台有哪些？","全球 SIAI 排行榜哪个好用？","AI / SI 工具怎么选择？","视频生成、短剧生成费用是多少？","PDF 在线编辑与电子签名怎么操作？","免费 AI 工具有哪些？"],
 strength:"全球 SIAI 工具平台 · 核心优势",search:"大家还会搜索"},
 en:{brand:"Global SI / AI / SIAI tools, rankings, SASI creation and 100+ practical online tools.",
 discover:["Global SIAI ranking","Global AI ranking","Global SI ranking","Global AI tools directory","Global SI tools directory","Global SIAI directory"],
 tools:["PDF tools","Image tools","Video tools","Audio tools","Document tools","Office tools","Developer tools","AI creation"],
 questions:["Which global AI tool directories are available?","Which SIAI ranking is useful?","How do I choose AI or SI tools?","What do video and short-film generation cost?","How can I edit and sign PDFs online?","Which AI tools offer free plans?"],
 strength:"Global SIAI · Core strengths",search:"People also search"},
 ja:{brand:"世界のSI・AI・SIAIツール、ランキング、SASI創作、100以上のオンラインツール。",
 discover:["世界のSIAIランキング","世界のAIランキング","世界のSIランキング","世界のAI情報","世界のSI情報","世界のSIAI情報"],
 tools:["PDFツール","画像ツール","動画ツール","音声ツール","文書ツール","オフィスツール","開発ツール","AI創作"],
 questions:["世界のAIツール情報はどこで探せる？","おすすめのSIAIランキングは？","AI・SIツールの選び方は？","動画と短編制作の費用は？","PDF編集と電子署名の方法は？","無料AIツールには何がある？"],
 strength:"世界のSIAI・主な強み",search:"関連する検索"},
 ko:{brand:"글로벌 SI·AI·SIAI 도구, 순위, SASI 창작 및 100개 이상의 온라인 도구.",
 discover:["글로벌 SIAI 순위","글로벌 AI 순위","글로벌 SI 순위","글로벌 AI 도구 정보","글로벌 SI 도구 정보","글로벌 SIAI 정보"],
 tools:["PDF 도구","이미지 도구","영상 도구","음성 도구","문서 도구","오피스 도구","개발 도구","AI 창작"],
 questions:["글로벌 AI 정보는 어디서 찾나요?","어떤 SIAI 순위가 유용한가요?","AI·SI 도구는 어떻게 고르나요?","영상·단편 제작 비용은?","온라인 PDF 편집과 서명 방법은?","무료 AI 도구에는 무엇이 있나요?"],
 strength:"글로벌 SIAI · 핵심 장점",search:"함께 검색하는 질문"},
 fr:{brand:"Outils SI/IA/SIAI mondiaux, classements, création SASI et plus de 100 utilitaires.",
 discover:["Classement SIAI mondial","Classement IA mondial","Classement SI mondial","Annuaire IA mondial","Annuaire SI mondial","Annuaire SIAI mondial"],
 tools:["Outils PDF","Images","Vidéo","Audio","Documents","Bureautique","Développement","Création IA"],
 questions:["Où trouver les outils IA mondiaux ?","Quel classement SIAI utiliser ?","Comment choisir un outil IA ou SI ?","Combien coûte la génération vidéo ?","Comment modifier et signer un PDF ?","Quels outils IA sont gratuits ?"],
 strength:"SIAI mondial · Points forts",search:"Recherches fréquentes"},
 de:{brand:"Globale SI-/KI-/SIAI-Tools, Rankings, SASI-Kreation und über 100 Online-Werkzeuge.",
 discover:["Weltweites SIAI-Ranking","Weltweites KI-Ranking","Weltweites SI-Ranking","Weltweite KI-Tools","Weltweite SI-Tools","Weltweite SIAI-Tools"],
 tools:["PDF-Tools","Bild-Tools","Video-Tools","Audio-Tools","Dokumente","Büro-Tools","Entwickler-Tools","KI-Kreation"],
 questions:["Wo finde ich weltweite KI-Tools?","Welches SIAI-Ranking hilft?","Wie wähle ich KI-/SI-Tools?","Was kostet die Videogenerierung?","Wie kann ich PDFs online signieren?","Welche KI-Tools sind kostenlos?"],
 strength:"Globales SIAI · Stärken",search:"Häufige Suchanfragen"},
 es:{brand:"Herramientas SI/IA/SIAI, rankings mundiales, creación SASI y más de 100 utilidades.",
 discover:["Ranking SIAI global","Ranking IA global","Ranking SI global","Herramientas IA globales","Herramientas SI globales","Herramientas SIAI globales"],
 tools:["Herramientas PDF","Imágenes","Vídeo","Audio","Documentos","Ofimática","Desarrollo","Creación IA"],
 questions:["¿Dónde comparar herramientas IA?","¿Qué ranking SIAI elegir?","¿Cómo elegir herramientas IA o SI?","¿Cuánto cuesta generar vídeo?","¿Cómo editar y firmar un PDF?","¿Qué herramientas IA son gratuitas?"],
 strength:"SIAI global · Ventajas",search:"También se busca"},
 pt:{brand:"Ferramentas globais SI/IA/SIAI, rankings, criação SASI e mais de 100 utilitários.",
 discover:["Ranking SIAI global","Ranking IA global","Ranking SI global","Ferramentas IA globais","Ferramentas SI globais","Ferramentas SIAI globais"],
 tools:["Ferramentas PDF","Imagens","Vídeo","Áudio","Documentos","Escritório","Desenvolvimento","Criação IA"],
 questions:["Onde comparar ferramentas IA?","Qual ranking SIAI escolher?","Como escolher ferramentas IA ou SI?","Quanto custa criar vídeos?","Como editar e assinar PDFs?","Quais ferramentas IA são gratuitas?"],
 strength:"SIAI global · Vantagens",search:"Pesquisas frequentes"},
 ar:{brand:"أدوات وتصنيفات SI وAI وSIAI العالمية وإبداع SASI وأكثر من 100 أداة عبر الإنترنت.",
 discover:["تصنيف SIAI العالمي","تصنيف AI العالمي","تصنيف SI العالمي","دليل AI العالمي","دليل SI العالمي","دليل SIAI العالمي"],
 tools:["أدوات PDF","الصور","الفيديو","الصوت","المستندات","المكتب","المطورين","إبداع AI"],
 questions:["أين أجد أدوات AI العالمية؟","ما أفضل تصنيف SIAI؟","كيف أختار أدوات AI أو SI؟","كم تكلفة إنشاء الفيديو؟","كيف أحرر وأوقع ملفات PDF؟","ما أدوات AI المجانية؟"],
 strength:"SIAI العالمي · أبرز المزايا",search:"عمليات بحث أخرى"}
};
