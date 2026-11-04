import type {LingxiLang} from "./lingxi-i18n";

/** One user-facing footer summary shared by every LINGXIFIELD main-site route.
 * Search labels come from SIAI_DISCOVERY to preserve the six nine-language SEO queries.
 * Do not claim tools or provider delivery have been end-to-end certified here.
 */
export type FooterUnifiedCopy={
 headline:string;
 intro:string;
 marketPoints:readonly string[];
 toolsTitle:string;
 toolCategories:readonly {title:string;description:string}[];
 sasiTitle:string;
 sasiDescription:string;
 searchTitle:string;
 closingTitle:string;
 closingDescription:string;
};
export const FOOTER_TOOL_ICONS=["📄","🖼️","🎬","📊","🔐","🍎"] as const;
export const FOOTER_TOOL_LINKS=["/tools?q=PDF","/tools?q=图片","/tools?q=视频","/tools?q=Excel","/tools?q=隐私","/tools?q=卡路里"] as const;

export const FOOTER_UNIFIED:Record<LingxiLang,FooterUnifiedCopy>={
 zh:{
  headline:"🌍 全球SIAI排行榜｜全球SI AI工具行情平台",
  intro:"持续收录全球SI、AI公司、模型与工具，支持搜索、分类筛选、横向对比，持续更新官方资料。",
  marketPoints:[
   "核心功能、模型能力、擅长领域",
   "免费额度、真实价格、套餐限制",
   "地区可用、付款方式、商用授权",
   "厂商资料、官方证据与信息更新",
   "视频、短剧制作成本及积分费用计算",
   "API Token调用费用估算与模型成本对比",
   "按领域、任务、免费方案及付款方式筛选"
  ],
  toolsTitle:"🧰 100+在线实用工具",
  toolCategories:[
   {title:"PDF",description:"编辑、合并、拆分、压缩、OCR、电子签名、盖章、脱敏、格式转换。"},
   {title:"图片",description:"压缩、去水印、翻译、证件照、换底色、长图拼接、格式转换。"},
   {title:"视频音频",description:"压缩、裁剪、去水印、倒放、字幕制作、配音、提取音频、降噪。"},
   {title:"文件表格",description:"Excel、CSV、JSON、XML转换、文本对比、文件整理。"},
   {title:"隐私工具",description:"临时邮箱、阅后即焚、隐私清理、文件加密。"},
   {title:"日常工具",description:"食物卡路里识别、二维码及更多实用功能。"}
  ],
  sasiTitle:"✨ SASI全球多模型智能创作",
  sasiDescription:"短剧、视频、网站、书籍、学习、科研等智能创作方向，支持九种语言，持续完善。",
  searchTitle:"🔍 大家还会搜：",
  closingTitle:"💎 灵犀场 LINGXIFIELD",
  closingDescription:"全球SIAI工具行情查询、视频与API成本对比、SASI智能创作、100+在线实用工具，一站式使用。"
 },
 en:{
  headline:"🌍 Global SIAI Rankings | Global SI AI Tools Directory",
  intro:"Explore worldwide SI and AI companies, models and tools. Search, filter, compare and follow regularly updated publisher sources.",
  marketPoints:[
   "Core features, model capabilities and strengths",
   "Free allowances, published prices and plan limits",
   "Regional availability, payment methods and commercial rights",
   "Publisher information, official evidence and updates",
   "Video and short-film production and credit cost estimates",
   "API token usage estimates and model cost comparisons",
   "Filters for domain, task, free plans and payment methods"
  ],
  toolsTitle:"🧰 100+ Online Utility Tools",
  toolCategories:[
   {title:"PDF",description:"Edit, merge, split, compress, OCR, e-sign, stamp, redact and convert."},
   {title:"Images",description:"Compress, remove watermarks, translate, prepare ID photos, change backgrounds, stitch and convert."},
   {title:"Video & audio",description:"Compress, trim, remove watermarks, reverse, subtitle, dub, extract audio and denoise."},
   {title:"Files & spreadsheets",description:"Convert Excel, CSV, JSON and XML; compare text and organize files."},
   {title:"Privacy tools",description:"Temporary email, self-destructing messages, privacy cleanup and file encryption."},
   {title:"Everyday tools",description:"Food calorie recognition, QR codes and more practical utilities."}
  ],
  sasiTitle:"✨ SASI Global Multi-Model Creative Studio",
  sasiDescription:"Intelligent creation for short films, videos, websites, books, learning and research. Nine languages, with ongoing improvements.",
  searchTitle:"🔍 More searches:",
  closingTitle:"💎 LINGXIFIELD",
  closingDescription:"Global SIAI directory, video and API cost comparisons, SASI creation and 100+ online utilities—all in one place."
 },
 ja:{
  headline:"🌍 世界のSIAIランキング｜SI・AIツール情報",
  intro:"世界のSI・AI企業、モデル、ツールを継続収録。検索・分類・比較と公式情報の更新に対応。",
  marketPoints:["主要機能、モデル能力、得意分野","無料枠、実際の料金、プラン制限","利用地域、決済方法、商用利用条件","提供企業、公式根拠、情報更新","動画・短編制作とクレジット費用の試算","APIトークン費用とモデル別コスト比較","分野、用途、無料プラン、支払い方法で絞り込み"],
  toolsTitle:"🧰 100以上のオンラインツール",
  toolCategories:[
   {title:"PDF",description:"編集・結合・分割・圧縮・OCR・電子署名・押印・墨消し・形式変換。"},
   {title:"画像",description:"圧縮、透かし削除、翻訳、証明写真、背景変更、画像連結、形式変換。"},
   {title:"動画・音声",description:"圧縮、トリミング、透かし削除、逆再生、字幕、吹替、音声抽出、ノイズ除去。"},
   {title:"ファイル・表計算",description:"Excel、CSV、JSON、XML変換、テキスト比較、ファイル整理。"},
   {title:"プライバシー",description:"一時メール、自動消去メッセージ、プライバシー整理、暗号化。"},
   {title:"日常ツール",description:"食事のカロリー認識、QRコードなど。"}
  ],
  sasiTitle:"✨ SASI 世界のマルチモデル創作",
  sasiDescription:"短編、動画、サイト、書籍、学習、研究向け。9言語対応で継続改善中。",
  searchTitle:"🔍 よく検索される内容：",closingTitle:"💎 LINGXIFIELD",
  closingDescription:"世界のSIAIツール情報、動画・API費用比較、SASI創作、100以上のオンラインツールを一か所で。"
 },
 ko:{
  headline:"🌍 글로벌 SIAI 순위｜SI AI 도구 정보",
  intro:"전 세계 SI·AI 기업, 모델과 도구를 지속적으로 수록하며 검색, 분류, 비교 및 공식 출처 업데이트를 제공합니다.",
  marketPoints:["주요 기능, 모델 역량 및 강점","무료 한도, 실제 가격, 요금제 제한","지역별 이용, 결제 방식, 상업적 이용","공급사 정보, 공식 근거와 업데이트","영상·단편 제작 및 크레딧 비용 계산","API 토큰 이용료 및 모델 비용 비교","분야, 작업, 무료 플랜, 결제 수단별 필터"],
  toolsTitle:"🧰 100개 이상의 온라인 실용 도구",
  toolCategories:[
   {title:"PDF",description:"편집, 병합, 분할, 압축, OCR, 전자서명, 도장, 가림 처리, 형식 변환."},
   {title:"이미지",description:"압축, 워터마크 제거, 번역, 증명사진, 배경 변경, 이미지 연결, 변환."},
   {title:"영상·음성",description:"압축, 자르기, 워터마크 제거, 역재생, 자막, 더빙, 음성 추출, 노이즈 제거."},
   {title:"파일·표",description:"Excel·CSV·JSON·XML 변환, 텍스트 비교, 파일 정리."},
   {title:"개인정보 도구",description:"임시 이메일, 자동 삭제 메시지, 개인정보 정리, 파일 암호화."},
   {title:"일상 도구",description:"음식 칼로리 인식, QR코드 등."}
  ],
  sasiTitle:"✨ SASI 글로벌 다중 모델 창작",
  sasiDescription:"단편, 영상, 웹사이트, 책, 학습 및 연구를 위한 창작. 9개 언어로 지속 개선 중.",
  searchTitle:"🔍 많이 찾는 검색어:",closingTitle:"💎 LINGXIFIELD",
  closingDescription:"글로벌 SIAI 도구 정보, 영상·API 비용 비교, SASI 창작 및 100개 이상의 온라인 도구를 한곳에서."
 },
 fr:{
  headline:"🌍 Classement mondial SIAI｜Outils SI et IA",
  intro:"Recensement continu des entreprises, modèles et outils SI/IA. Recherche, filtres, comparaisons et sources officielles mises à jour.",
  marketPoints:["Fonctions principales, capacités et spécialités des modèles","Quotas gratuits, prix réels et limites des forfaits","Disponibilité régionale, paiements et droits commerciaux","Éditeurs, preuves officielles et mises à jour","Estimation des coûts vidéo, courts-métrages et crédits","Estimation des jetons API et comparaison des modèles","Filtres par domaine, tâche, offre gratuite et paiement"],
  toolsTitle:"🧰 Plus de 100 outils en ligne",
  toolCategories:[
   {title:"PDF",description:"Modifier, fusionner, diviser, compresser, OCR, signer, tamponner, caviarder et convertir."},
   {title:"Images",description:"Compresser, retirer les filigranes, traduire, photos d’identité, fonds, assemblage et conversion."},
   {title:"Vidéo et audio",description:"Compresser, couper, retirer les filigranes, inverser, sous-titrer, doubler, extraire l’audio, réduire le bruit."},
   {title:"Fichiers et tableaux",description:"Conversions Excel, CSV, JSON, XML, comparaison de texte et organisation de fichiers."},
   {title:"Confidentialité",description:"Courriel temporaire, messages éphémères, nettoyage des données privées, chiffrement."},
   {title:"Au quotidien",description:"Reconnaissance des calories alimentaires, QR codes et autres outils."}
  ],
  sasiTitle:"✨ SASI Création mondiale multimodèle",sasiDescription:"Courts-métrages, vidéos, sites, livres, études et recherche. Neuf langues, en amélioration continue.",
  searchTitle:"🔍 Recherches fréquentes :",closingTitle:"💎 LINGXIFIELD",
  closingDescription:"Annuaire SIAI, coûts vidéo et API, création SASI et plus de 100 outils en ligne au même endroit."
 },
 de:{
  headline:"🌍 Globales SIAI-Ranking｜SI- und KI-Tools",
  intro:"Weltweite SI-/KI-Unternehmen, Modelle und Tools mit Suche, Filtern, Vergleichen und laufend aktualisierten offiziellen Quellen.",
  marketPoints:["Kernfunktionen, Modellfähigkeiten und Stärken","Gratis-Kontingente, tatsächliche Preise, Tarifgrenzen","Regionale Verfügbarkeit, Zahlungsarten, gewerbliche Nutzung","Anbieterinformationen, amtliche Quellen und Aktualisierungen","Video-, Kurzfilm- und Credit-Kostenschätzung","API-Token-Kosten und Modellvergleich","Filter nach Bereich, Aufgabe, Gratis-Tarif und Zahlung"],
  toolsTitle:"🧰 Über 100 Online-Werkzeuge",
  toolCategories:[
   {title:"PDF",description:"Bearbeiten, verbinden, teilen, komprimieren, OCR, e-Signatur, stempeln, schwärzen und konvertieren."},
   {title:"Bilder",description:"Komprimieren, Wasserzeichen entfernen, übersetzen, Passbilder, Hintergründe, verbinden und konvertieren."},
   {title:"Video & Audio",description:"Komprimieren, schneiden, Wasserzeichen entfernen, umkehren, untertiteln, vertonen, Audio extrahieren, Rauschen mindern."},
   {title:"Dateien & Tabellen",description:"Excel/CSV/JSON/XML konvertieren, Texte vergleichen und Dateien organisieren."},
   {title:"Datenschutz",description:"Temporäre E-Mail, selbstlöschende Nachrichten, Datenbereinigung, Dateiverschlüsselung."},
   {title:"Alltag",description:"Kalorienerkennung für Speisen, QR-Codes und weitere Werkzeuge."}
  ],
  sasiTitle:"✨ SASI Weltweite Multimodell-Kreation",sasiDescription:"Kurzfilme, Videos, Websites, Bücher, Lernen und Forschung. Neun Sprachen, laufend weiterentwickelt.",
  searchTitle:"🔍 Häufige Suchanfragen:",closingTitle:"💎 LINGXIFIELD",
  closingDescription:"Weltweite SIAI-Daten, Video- und API-Kosten, SASI-Kreation und über 100 Online-Tools an einem Ort."
 },
 es:{
  headline:"🌍 Ranking mundial SIAI｜Herramientas SI e IA",
  intro:"Catálogo mundial en actualización de empresas, modelos y herramientas SI/IA, con búsqueda, filtros, comparación y fuentes oficiales.",
  marketPoints:["Funciones, capacidad de modelos y especialidades","Límites gratuitos, precios reales y restricciones de planes","Disponibilidad regional, pagos y uso comercial","Información de proveedores, pruebas oficiales y cambios","Cálculo de costes de vídeo, cortos y créditos","Estimación de tokens API y comparativa de modelos","Filtros por sector, tarea, plan gratis y método de pago"],
  toolsTitle:"🧰 Más de 100 herramientas en línea",
  toolCategories:[
   {title:"PDF",description:"Editar, unir, dividir, comprimir, OCR, firmar, sellar, ocultar datos y convertir."},
   {title:"Imágenes",description:"Comprimir, quitar marcas de agua, traducir, fotos de identidad, cambiar fondos, unir y convertir."},
   {title:"Vídeo y audio",description:"Comprimir, cortar, quitar marcas, invertir, subtítulos, doblaje, extraer audio y reducir ruido."},
   {title:"Archivos y tablas",description:"Conversiones Excel, CSV, JSON, XML, comparación de texto y organización."},
   {title:"Privacidad",description:"Correo temporal, mensajes efímeros, limpieza de privacidad y cifrado."},
   {title:"Uso diario",description:"Reconocimiento de calorías, códigos QR y más."}
  ],
  sasiTitle:"✨ SASI Creación global multimodelo",sasiDescription:"Creación de cortos, vídeos, sitios, libros, aprendizaje e investigación. Nueve idiomas y mejoras continuas.",
  searchTitle:"🔍 También se busca:",closingTitle:"💎 LINGXIFIELD",
  closingDescription:"Datos globales SIAI, costes de vídeo y API, creación SASI y más de 100 herramientas en un solo lugar."
 },
 pt:{
  headline:"🌍 Ranking global SIAI｜Ferramentas SI e IA",
  intro:"Catálogo mundial de empresas, modelos e ferramentas SI/IA, com pesquisa, filtros, comparação e fontes oficiais atualizadas.",
  marketPoints:["Funções, capacidades dos modelos e especialidades","Cotas gratuitas, preços reais e limites dos planos","Disponibilidade regional, pagamentos e uso comercial","Informações dos fornecedores, provas oficiais e atualizações","Estimativas de vídeo, curtas-metragens e créditos","Custo de tokens API e comparação entre modelos","Filtros por área, tarefa, planos grátis e pagamento"],
  toolsTitle:"🧰 Mais de 100 ferramentas online",
  toolCategories:[
   {title:"PDF",description:"Editar, juntar, dividir, comprimir, OCR, assinar, carimbar, ocultar dados e converter."},
   {title:"Imagens",description:"Comprimir, remover marcas d’água, traduzir, fotos de documento, fundos, unir e converter."},
   {title:"Vídeo e áudio",description:"Comprimir, cortar, remover marcas, inverter, legendar, dublar, extrair áudio e reduzir ruído."},
   {title:"Arquivos e planilhas",description:"Converter Excel, CSV, JSON, XML, comparar texto e organizar arquivos."},
   {title:"Privacidade",description:"E-mail temporário, mensagens que desaparecem, limpeza de privacidade e criptografia."},
   {title:"Cotidiano",description:"Reconhecimento de calorias em alimentos, QR codes e mais."}
  ],
  sasiTitle:"✨ SASI Criação global multimodelo",sasiDescription:"Curtas, vídeos, sites, livros, estudo e pesquisa. Nove idiomas, com melhorias contínuas.",
  searchTitle:"🔍 Mais pesquisas:",closingTitle:"💎 LINGXIFIELD",
  closingDescription:"Dados globais SIAI, custos de vídeo e API, criação SASI e mais de 100 ferramentas online num só lugar."
 },
 ar:{
  headline:"🌍 تصنيف SIAI العالمي｜دليل أدوات SI وAI",
  intro:"فهرس متجدد لشركات ونماذج وأدوات SI وAI حول العالم مع البحث والتصفية والمقارنة ومراجع رسمية محدثة.",
  marketPoints:["الوظائف الأساسية وقدرات النماذج ومجالات التميز","الحصص المجانية والأسعار الحقيقية وحدود الباقات","المناطق المدعومة وطرق الدفع والترخيص التجاري","بيانات الشركات والأدلة الرسمية والتحديثات","تقديرات تكاليف الفيديو والأفلام القصيرة والأرصدة","تقدير تكاليف رموز API ومقارنة النماذج","التصفية حسب المجال والمهمة والخطة المجانية والدفع"],
  toolsTitle:"🧰 أكثر من 100 أداة عملية عبر الإنترنت",
  toolCategories:[
   {title:"PDF",description:"التحرير والدمج والتقسيم والضغط وOCR والتوقيع والختم وحجب البيانات والتحويل."},
   {title:"الصور",description:"الضغط وإزالة العلامات المائية والترجمة وصور الهوية وتغيير الخلفية والدمج والتحويل."},
   {title:"الفيديو والصوت",description:"الضغط والقص وإزالة العلامات والعكس والترجمة النصية والدبلجة واستخراج الصوت وإزالة الضجيج."},
   {title:"الملفات والجداول",description:"تحويل Excel وCSV وJSON وXML ومقارنة النصوص وتنظيم الملفات."},
   {title:"الخصوصية",description:"بريد مؤقت ورسائل ذاتية الحذف وتنظيف البيانات وتشفير الملفات."},
   {title:"أدوات يومية",description:"التعرف على سعرات الطعام ورموز QR والمزيد."}
  ],
  sasiTitle:"✨ SASI للإبداع العالمي متعدد النماذج",sasiDescription:"إنشاء الأفلام القصيرة والفيديو والمواقع والكتب والتعلم والبحث بتسع لغات مع تطوير مستمر.",
  searchTitle:"🔍 عمليات بحث شائعة:",closingTitle:"💎 LINGXIFIELD",
  closingDescription:"دليل SIAI العالمي ومقارنة تكاليف الفيديو وAPI وإبداع SASI وأكثر من 100 أداة عبر الإنترنت في مكان واحد."
 }
};
