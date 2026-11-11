"use client";
import Link from "next/link";
import type {SeoLocale} from "@/lib/seo/global-seo";
import {useLingxiLang} from "@/lib/lingxi-i18n";

type Question = {q:string;a:string;href:string;link:string};
type Content = {eyebrow:string;title:string;intro:string;questions:Question[];explore:string;create:string;tools:string};
const FAQ:Record<SeoLocale,Content>={
 zh:{
  eyebrow:"把问题交给灵犀场，先找到能用的答案",
  title:"AI 怎么选、免费能用多少、生成作品要花多少钱？",
  intro:"先看要完成的事，再看功能、免费额度、价格、地区和商用条件。每个问题都有对应入口，查完就能继续操作。",
  questions:[
   {q:"ChatGPT、Claude、Gemini 这些 AI，到底选哪个？",a:"写文章、处理长文件、写代码、看图片，需要的能力不同。先选任务，再比较各工具的代表模型、擅长功能、免费额度、付费套餐和地区限制；别只看名字和热度。",href:"/siai",link:"按实际任务比较 AI"},
   {q:"哪个 AI 工具免费？免费额度用完会怎样？",a:"有的按次数，有的按积分，有的限制可选模型或输出清晰度。找到工具后，先看免费能做什么，再看升级套餐和超额费用，免得做到一半才发现需要付费。",href:"/siai",link:"比较免费额度与收费方式"},
   {q:"AI 视频生成 10 秒多少钱？720p、1080p、4K 怎么算？",a:"先确认平台按秒、按积分还是按套餐扣费，再选模型、时长和清晰度。能算到单次任务成本，才方便比较。各平台以当前公布的价格和实际计费规则为准。",href:"/siai",link:"查看视频模型价格"},
   {q:"AI 生成的视频有水印吗？能拿去商用吗？",a:"免费版与付费版的水印、下载清晰度和授权条件可能不同。比较时要同时看套餐、模型及商用说明，不要把“能下载”直接当成“能商用”。",href:"/siai",link:"查看商用条件与限制"},
   {q:"有些 AI 工具在我所在地区打不开，哪里能先查？",a:"在排行榜查看主要可用地区、登录方式和付款渠道，再进入官网确认具体功能。地区、订阅方式和模型开放范围会随平台政策变化。",href:"/siai",link:"比较地区与付款方式"},
{q:"SASI 软件市场有哪些商品？",a:"SASI 面向成品软件与数字产品交易，可浏览 MT5 EA、交易指标、自动化程序、桌面软件和源码授权。商品功能、版本、价格与授权范围以详情页为准。",href:"/sasi",link:"浏览 SASI 软件市场"},
{q:"开发者如何在 SASI 发布软件？",a:"进入卖家服务，提交资料并确认协议后创建商品草稿，上传 ZIP 软件包与商品图片。商品需通过安全检查和平台审核后才会公开上架。",href:"/sasi/seller",link:"打开开发者卖家服务"},
   {q:"PDF 合并、拆分、压缩，要安装软件吗？",a:"打开在线 PDF 工具，选中对应任务，上传文件并按顺序处理。合并后检查页序，拆分后检查页数，压缩后核对文字和图片是否清晰。",href:"/tools?q=PDF",link:"查找 PDF 工具"},
   {q:"扫描版 PDF 不能选中文字，怎么提取内容？",a:"扫描件里的字可能只是图片。先用 OCR 识别并导出文字，再逐段校对数字、日期和专有名词。文字识别与在原 PDF 上直接修改是两种不同的任务。",href:"/tools?q=OCR",link:"打开文字识别工具"},
   {q:"图片太大上传不了，或者 HEIC 照片打不开怎么办？",a:"先确认文件格式，再选图片压缩或格式转换。需要发邮件或上传平台时，可转成 JPG、PNG 等常见格式；转换后确认方向、尺寸和清晰度。",href:"/tools?q=图片",link:"查找图片处理工具"},
{q:"购买软件后如何获取源码和授权？",a:"支付渠道完成回调验签、订单状态和金额核验后，系统按订单授权发放交付权益。下载方式、源码范围、版本与售后条件以商品详情和订单交付说明为准。",href:"/sasi/delivery",link:"查看软件授权与交付规则"},
   {q:"PDF 太大，怎么压缩后还能看清？",a:"先确认文件主要是文字还是扫描图片。进入 PDF 压缩工具选择文件并处理；下载后检查页数、表格和细小文字，再决定是否需要调整压缩强度。",href:"/tools?q=PDF压缩",link:"使用 PDF 压缩工具"},
   {q:"临时邮箱和阅后即焚分别能做什么？",a:"临时邮箱适合不想暴露常用邮箱的临时场景；阅后即焚适合限时查看信息。不要用临时邮箱接收重要账号的恢复邮件，也不要把一次性分享当作无法截屏的保密保证。",href:"/tools?q=临时邮箱",link:"查看隐私工具"},
   {q:"AI 工具价格、免费额度和商用条件在哪里比较？",a:"进入全球 SIAI 排行榜，按任务查看不同工具的功能、套餐价格、免费额度、可用地区和商用条件，并可直接访问厂商官网。",href:"/siai",link:"比较 AI 工具价格与功能"},
  ],explore:"去全球 SIAI 排行榜选 AI",create:"浏览 SASI 软件市场",tools:"打开免费在线实用工具"
 },
 en:{
  eyebrow:"Answers for real tasks",title:"Choose the right AI, compare costs, and get things done",
  intro:"Start with your task, compare what each tool offers, then choose what fits.",
  questions:[
   {q:"How do I choose the right AI tool?",a:"Start with your task: research, coding, images, video or local models. Compare capabilities, prices, free limits, regional access and payment options.",href:"/siai",link:"Compare AI tools by task"},
   {q:"Which AI tools have a free plan?",a:"Free tiers may limit usage, resolution, models or commercial rights. Compare each offer and its limits before paying.",href:"/siai",link:"Compare free plans and prices"},
{q:"Where can I browse software and source-code licenses?",a:"SASI is a marketplace for finished software, MT5 EAs, trading indicators, automation tools and source licenses. Product pages define versions, compatibility, prices and license scope.",href:"/sasi",link:"Browse SASI software"},
   {q:"Can I edit PDFs, convert images or transcribe video online?",a:"Browse online utilities by file type or task to find PDF, OCR, media, subtitle and privacy tools.",href:"/tools",link:"Browse online tools"},
  ],explore:"Explore SIAI rankings",create:"Browse SASI software",tools:"Use online tools"
 },
 ja:{
  eyebrow:"用途から探す回答",title:"AIの選び方、料金比較、作品制作まで",
  intro:"やりたいことから選び、機能、料金、無料枠、利用地域を比較しましょう。",
  questions:[
   {q:"自分に合うAIツールはどう選ぶ？",a:"文章・研究・コード・画像・動画など用途を決め、機能と料金、無料枠、地域を比較します。",href:"/siai",link:"AIツールを比較"},
   {q:"無料で試せるAIツールは？",a:"無料枠には回数・画質・モデル・商用条件の制限があります。各プランを比較してください。",href:"/siai",link:"無料枠と料金"},
{q:"ソフトウェアやソースライセンスはどこで確認できますか？",a:"SASIでは完成ソフト、MT5 EA、取引インジケーター、自動化ツール、ソースライセンスを閲覧できます。対応環境、価格、バージョン、権利範囲は商品ページで確認できます。",href:"/sasi",link:"SASIソフトウェア市場を見る"},
   {q:"PDF編集や画像変換、動画文字起こしは？",a:"オンラインツールをファイル形式や用途で検索できます。",href:"/tools",link:"オンラインツール"},
  ],explore:"SIAIランキング",create:"SASIソフトウェア市場を見る",tools:"ツールを使う"
 },
 ko:{
  eyebrow:"실제 작업을 위한 답변",title:"AI 선택부터 비용 비교와 제작까지",
  intro:"해야 할 작업을 정하고 기능, 가격, 무료 한도, 지원 지역을 비교하세요.",
  questions:[
   {q:"나에게 맞는 AI 도구는 어떻게 고르나요?",a:"글쓰기, 연구, 코딩, 이미지, 영상 등 작업별로 기능과 비용, 무료 한도, 지원 지역을 비교하세요.",href:"/siai",link:"AI 도구 비교"},
   {q:"무료로 써볼 수 있는 AI가 있나요?",a:"무료 플랜은 횟수, 해상도, 모델 또는 상업적 이용에 제한이 있을 수 있습니다.",href:"/siai",link:"무료 한도와 가격"},
{q:"소프트웨어와 소스 라이선스는 어디서 확인할 수 있나요?",a:"SASI에서 완성형 소프트웨어, MT5 EA, 거래 지표, 자동화 도구와 소스 라이선스를 살펴볼 수 있습니다. 버전, 호환 환경, 가격과 권한 범위는 상품 페이지에 표시됩니다.",href:"/sasi",link:"SASI 소프트웨어 마켓 보기"},
   {q:"PDF, 이미지, 영상 자막 도구는 어디 있나요?",a:"온라인 도구에서 파일 유형 또는 작업으로 검색하세요.",href:"/tools",link:"온라인 도구"},
  ],explore:"SIAI 순위",create:"SASI 소프트웨어 마켓 보기",tools:"온라인 도구"
 },
 fr:{
  eyebrow:"Réponses à vos besoins",title:"Choisir une IA, comparer les tarifs et créer",
  intro:"Partez de votre tâche, puis comparez les fonctionnalités et conditions.",
  questions:[
   {q:"Comment choisir le bon outil IA ?",a:"Comparez les fonctions, les prix, les offres gratuites et la disponibilité selon votre besoin.",href:"/siai",link:"Comparer les outils IA"},
   {q:"Quels outils IA proposent un accès gratuit ?",a:"Les offres gratuites peuvent limiter les usages, la qualité, les modèles ou les droits commerciaux.",href:"/siai",link:"Comparer les offres"},
{q:"Où consulter des logiciels et des licences de code source ?",a:"SASI propose des logiciels prêts à l’emploi, des EA MT5, des indicateurs, des outils d’automatisation et des licences source. Les versions, prix, compatibilités et droits sont précisés sur chaque fiche.",href:"/sasi",link:"Parcourir le marché SASI"},
   {q:"Où modifier des PDF ou convertir des images ?",a:"Recherchez les outils PDF, OCR, vidéo et audio par tâche.",href:"/tools",link:"Outils en ligne"},
  ],explore:"Classement SIAI",create:"Parcourir le marché SASI",tools:"Outils en ligne"
 },
 de:{
  eyebrow:"Antworten für echte Aufgaben",title:"KI wählen, Preise vergleichen, Projekte umsetzen",
  intro:"Beginne mit deinem Ziel und vergleiche Funktionen und Nutzungsbedingungen.",
  questions:[
   {q:"Welches KI-Tool passt zu mir?",a:"Vergleiche Funktionen, Kosten, Gratis-Kontingente und regionale Verfügbarkeit nach Aufgabe.",href:"/siai",link:"KI-Tools vergleichen"},
   {q:"Welche KI-Tools kann man kostenlos testen?",a:"Gratis-Tarife können Nutzung, Auflösung, Modelle oder kommerzielle Rechte begrenzen.",href:"/siai",link:"Gratis-Tarife vergleichen"},
{q:"Wo finde ich Software und Quellcode-Lizenzen?",a:"SASI bietet fertige Software, MT5-EAs, Handelsindikatoren, Automatisierungstools und Quellcode-Lizenzen. Versionen, Kompatibilität, Preise und Rechte stehen in den jeweiligen Produktdetails.",href:"/sasi",link:"SASI-Softwaremarkt öffnen"},
   {q:"Wo kann ich PDFs oder Bilder bearbeiten?",a:"Suche Online-Werkzeuge nach Dateityp und Aufgabe.",href:"/tools",link:"Online-Tools"},
  ],explore:"SIAI-Ranking",create:"SASI-Softwaremarkt öffnen",tools:"Online-Tools"
 },
 es:{
  eyebrow:"Respuestas para tareas reales",title:"Elige una IA, compara precios y empieza a crear",
  intro:"Empieza por tu tarea y compara prestaciones, precios y condiciones.",
  questions:[
   {q:"¿Cómo elegir la herramienta IA adecuada?",a:"Compara funciones, precios, planes gratuitos y regiones según tu objetivo.",href:"/siai",link:"Comparar herramientas IA"},
   {q:"¿Qué herramientas IA tienen plan gratuito?",a:"Los planes gratis pueden limitar usos, resolución, modelos o derechos comerciales.",href:"/siai",link:"Comparar planes gratis"},
{q:"¿Dónde puedo consultar software y licencias de código fuente?",a:"SASI reúne software terminado, EA de MT5, indicadores, herramientas de automatización y licencias de código fuente. Cada ficha detalla versiones, compatibilidad, precios y alcance de la licencia.",href:"/sasi",link:"Explorar el mercado SASI"},
   {q:"¿Dónde editar PDF o convertir imágenes?",a:"Busca utilidades PDF, OCR, vídeo y audio por tarea.",href:"/tools",link:"Herramientas online"},
  ],explore:"Ranking SIAI",create:"Explorar el mercado SASI",tools:"Herramientas online"
 },
 pt:{
  eyebrow:"Respostas para tarefas reais",title:"Escolha a IA, compare preços e comece a criar",
  intro:"Comece pela sua tarefa e compare funções, preços e condições.",
  questions:[
   {q:"Como escolher a ferramenta de IA certa?",a:"Compare recursos, preços, opções grátis e disponibilidade por tarefa.",href:"/siai",link:"Comparar ferramentas IA"},
   {q:"Quais ferramentas de IA têm plano grátis?",a:"Planos gratuitos podem limitar uso, resolução, modelos ou direitos comerciais.",href:"/siai",link:"Comparar opções grátis"},
{q:"Onde posso consultar software e licenças de código-fonte?",a:"O SASI reúne software pronto, EAs MT5, indicadores, ferramentas de automação e licenças de código-fonte. Cada página informa versões, compatibilidade, preços e escopo da licença.",href:"/sasi",link:"Explorar o mercado SASI"},
   {q:"Onde editar PDFs ou converter imagens?",a:"Busque utilitários de PDF, OCR, vídeo e áudio por tarefa.",href:"/tools",link:"Ferramentas online"},
  ],explore:"Ranking SIAI",create:"Explorar o mercado SASI",tools:"Ferramentas online"
 },
 ar:{
  eyebrow:"إجابات لاحتياجاتك",title:"اختر أداة الذكاء الاصطناعي وقارن الأسعار وابدأ",
  intro:"ابدأ بالمهمة ثم قارن الميزات والأسعار وشروط الاستخدام.",
  questions:[
   {q:"كيف أختار أداة الذكاء الاصطناعي المناسبة؟",a:"قارن الوظائف والأسعار والخطط المجانية والمناطق وفق المهمة التي تريد إنجازها.",href:"/siai",link:"مقارنة أدوات الذكاء الاصطناعي"},
   {q:"ما الأدوات التي توفر تجربة مجانية؟",a:"قد تقيّد الخطط المجانية عدد الاستخدامات أو الدقة أو النماذج أو الحقوق التجارية.",href:"/siai",link:"مقارنة الخطط المجانية"},
{q:"أين يمكن استعراض البرامج وتراخيص الشيفرة المصدرية؟",a:"يوفر SASI برامج جاهزة ومستشاري MT5 ومؤشرات تداول وأدوات أتمتة وتراخيص للشيفرة المصدرية. توضح صفحة كل منتج الإصدارات والتوافق والسعر ونطاق الترخيص.",href:"/sasi",link:"استعرض سوق برامج SASI"},
   {q:"أين يمكن تعديل PDF أو تحويل الصور؟",a:"ابحث عن أدوات PDF والصور والفيديو والصوت حسب المهمة.",href:"/tools",link:"الأدوات عبر الإنترنت"},
  ],explore:"تصنيف SIAI",create:"استعرض سوق برامج SASI",tools:"الأدوات عبر الإنترنت"
 }
};


type HomeExtra={servicesHeading:string;servicesText:string;services:string[];toolsHeading:string;toolsText:string;tools:string[];stepsHeading:string;steps:string[];vendorHeading:string;vendorText:string;vendorAction:string};
const HOME_EXTRA:Record<SeoLocale,HomeExtra>={
  "zh": {
    "servicesHeading": "02｜SASI 软件市场",
    "servicesText": "浏览成品软件、MT5 EA、交易指标与源码授权；开发者可申请入驻并发布软件。商品经过安全检查和平台审核，付款核验后按订单授权交付。",
    "services": ["浏览软件与源码授权","开发者申请入驻并发布软件","查看付款核验与自动交付规则","查看软件授权与卖家协议"],
    "toolsHeading": "03｜免费在线实用工具",
    "toolsText": "文件就在眼前，不必为一个小操作安装一堆软件。按具体任务打开工具；部分高级功能收费时会在操作前展示。",
    "tools": [
      "PDF：编辑、合并、压缩、签名和 OCR",
      "图片：HEIC 转换、OCR、压缩和长图拼接",
      "视频与音频：字幕、提取音频、录音转文字",
      "文件表格：CSV/Excel 转换、内容比较和格式化",
      "隐私与日常：临时邮箱、阅后即焚和二维码"
    ],
    "stepsHeading": "05｜不只是找到工具，还要知道怎么用",
    "steps": [
      "说出问题：要比较 AI、做视频、修改文件还是处理图片？",
      "找到功能：查看真实功能、免费额度、费用、地区和使用限制。",
      "开始操作：进入对应工具，生成或处理完成后核对结果。"
    ],
    "vendorHeading": "06｜全球 AI 厂商与产品合作",
    "vendorText": "产品更新了模型、价格或使用条件？厂商可通过商务邮箱提交资料、更正信息并咨询展示合作。提交资料不等于自动获得排名或修改公开信息。",
    "vendorAction": "提交产品资料或咨询合作"
  },
  "en": {
    "servicesHeading": "02 | SASI Software Marketplace",
    "servicesText": "Browse finished software, MT5 EAs, trading indicators and source licenses. Developers can apply to publish products. Listings are reviewed, and delivery follows verified payment and order authorization.",
    "services": ["Browse software and source licenses","Apply to publish software","Review verified-payment delivery","Read software and seller terms"],
    "toolsHeading": "03 | Free online utilities",
    "toolsText": "Find the file task you need without installing extra software. Check charges before paid steps.",
    "tools": [
      "PDF: edit, merge, compress, sign and OCR",
      "Images: HEIC conversion, OCR and compression",
      "Video and audio: subtitles, extraction and transcription",
      "Spreadsheets: CSV/Excel conversions and comparisons",
      "Privacy: temporary email and single-view sharing"
    ],
    "stepsHeading": "05 | From a problem to an outcome",
    "steps": [
      "Describe your task or question",
      "Compare functions, limits, prices and regions",
      "Open the tool and verify the output"
    ],
    "vendorHeading": "06 | AI companies and developers",
    "vendorText": "Have an official product update or a correction? Send your sources to our business contact. Submissions do not guarantee ranking changes.",
    "vendorAction": "Send product information"
  },
  "ja": {
    "servicesHeading": "02｜SASIソフトウェア市場",
    "servicesText": "完成ソフト、MT5 EA、取引インジケーター、ソースライセンスを閲覧できます。開発者は出品を申請できます。審査後に掲載し、決済確認と注文認証後に納品します。",
    "services": ["ソフトウェアとソースライセンス","開発者として出品を申請","決済確認後の納品ルール","ソフトウェア・販売者規約"],
    "toolsHeading": "03｜無料オンラインツール",
    "toolsText": "PDF、画像、動画、表計算やプライバシーの作業を目的別に探せます。",
    "tools": [
      "PDF編集・署名・OCR",
      "画像変換と圧縮",
      "動画・音声処理",
      "表計算とファイル変換",
      "一時メールとプライバシー"
    ],
    "stepsHeading": "05｜3つのステップ",
    "steps": [
      "解決したいことを入力",
      "機能・料金・制限を比較",
      "ツールを開き結果を確認"
    ],
    "vendorHeading": "06｜AI企業・開発者の皆様へ",
    "vendorText": "公式情報の更新や訂正はメールで資料とともにお送りください。順位の変更は保証されません。",
    "vendorAction": "製品情報を送る"
  },
  "ko": {
    "servicesHeading": "02｜SASI 소프트웨어 마켓",
    "servicesText": "완성형 소프트웨어, MT5 EA, 거래 지표와 소스 라이선스를 살펴보세요. 개발자는 상품 등록을 신청할 수 있습니다. 심사 후 공개되며 결제 검증과 주문 권한 확인 뒤 전달됩니다.",
    "services": ["소프트웨어 및 소스 라이선스","개발자 판매자 신청","결제 검증 및 전달 규칙","소프트웨어·판매자 약관"],
    "toolsHeading": "03｜무료 온라인 도구",
    "toolsText": "PDF, 이미지, 영상, 표와 개인정보 도구를 작업별로 찾으세요.",
    "tools": [
      "PDF 편집과 서명",
      "이미지 변환과 압축",
      "영상과 오디오 처리",
      "표와 파일 변환",
      "임시 이메일과 개인정보"
    ],
    "stepsHeading": "05｜세 단계로 시작",
    "steps": [
      "해결하려는 문제를 설명",
      "기능·가격·제한 비교",
      "도구를 열고 결과 확인"
    ],
    "vendorHeading": "06｜AI 기업과 개발자",
    "vendorText": "공식 제품 변경 사항과 정정 자료를 이메일로 제출하세요. 순위 변경을 보장하지 않습니다.",
    "vendorAction": "제품 정보 보내기"
  },
  "fr": {
    "servicesHeading": "02 | Marché de logiciels SASI",
    "servicesText": "Parcourez logiciels, EA MT5, indicateurs et licences source. Les développeurs peuvent demander à publier leurs produits. Les annonces sont examinées et la livraison suit la vérification du paiement et de la commande.",
    "services": ["Logiciels et licences source","Demander l’accès vendeur","Règles de livraison après paiement","Conditions logiciel et vendeur"],
    "toolsHeading": "03 | Outils gratuits en ligne",
    "toolsText": "Trouvez les fonctions PDF, image, vidéo, tableur et confidentialité.",
    "tools": [
      "PDF, signature et OCR",
      "Images et conversions",
      "Vidéo et audio",
      "Tableurs et fichiers",
      "E-mail temporaire et confidentialité"
    ],
    "stepsHeading": "05 | Trois étapes",
    "steps": [
      "Décrivez votre besoin",
      "Comparez fonctions, prix et limites",
      "Ouvrez l’outil et vérifiez le résultat"
    ],
    "vendorHeading": "06 | Éditeurs et développeurs IA",
    "vendorText": "Envoyez les mises à jour officielles et corrections par e-mail. Une soumission ne garantit aucun changement de classement.",
    "vendorAction": "Envoyer des informations"
  },
  "de": {
    "servicesHeading": "02 | SASI-Softwaremarkt",
    "servicesText": "Entdecke fertige Software, MT5-EAs, Handelsindikatoren und Quellcode-Lizenzen. Entwickler können Produkte zur Veröffentlichung einreichen. Nach Prüfung erfolgt die Lieferung nach bestätigter Zahlung und Bestellberechtigung.",
    "services": ["Software und Quellcode-Lizenzen","Als Entwickler Verkäufer werden","Lieferung nach Zahlungsprüfung","Software- und Verkäuferbedingungen"],
    "toolsHeading": "03 | Kostenlose Online-Tools",
    "toolsText": "Finde PDF-, Bild-, Video-, Tabellen- und Datenschutzfunktionen.",
    "tools": [
      "PDF, Signatur und OCR",
      "Bilder und Konvertierung",
      "Video und Audio",
      "Tabellen und Dateien",
      "Temporäre E-Mail und Datenschutz"
    ],
    "stepsHeading": "05 | In drei Schritten",
    "steps": [
      "Aufgabe beschreiben",
      "Funktionen, Preise und Limits vergleichen",
      "Tool öffnen und Ergebnis prüfen"
    ],
    "vendorHeading": "06 | KI-Anbieter und Entwickler",
    "vendorText": "Offizielle Produktänderungen oder Korrekturen bitte mit Quellen per E-Mail senden. Eine Rangänderung ist nicht garantiert.",
    "vendorAction": "Produktinformationen senden"
  },
  "es": {
    "servicesHeading": "02 | Mercado de software SASI",
    "servicesText": "Explora software terminado, EA de MT5, indicadores y licencias de código fuente. Los desarrolladores pueden solicitar publicar productos. Los anuncios se revisan y la entrega sigue a la verificación del pago y del pedido.",
    "services": ["Software y licencias de código fuente","Solicitar acceso de vendedor","Entrega tras verificar el pago","Condiciones de software y vendedor"],
    "toolsHeading": "03 | Herramientas online gratis",
    "toolsText": "Encuentra herramientas PDF, imagen, vídeo, hojas de cálculo y privacidad.",
    "tools": [
      "PDF, firma y OCR",
      "Imágenes y conversión",
      "Vídeo y audio",
      "Hojas de cálculo y archivos",
      "Correo temporal y privacidad"
    ],
    "stepsHeading": "05 | Tres pasos",
    "steps": [
      "Describe tu necesidad",
      "Compara funciones, precios y límites",
      "Abre la herramienta y comprueba el resultado"
    ],
    "vendorHeading": "06 | Empresas y desarrolladores IA",
    "vendorText": "Envía las novedades y correcciones oficiales con fuentes por correo. Enviar datos no garantiza cambios en el ranking.",
    "vendorAction": "Enviar información del producto"
  },
  "pt": {
    "servicesHeading": "02 | Mercado de software SASI",
    "servicesText": "Explore software pronto, EAs MT5, indicadores e licenças de código-fonte. Desenvolvedores podem solicitar a publicação de produtos. Os anúncios passam por revisão e a entrega ocorre após a verificação do pagamento e do pedido.",
    "services": ["Software e licenças de código-fonte","Solicitar acesso de vendedor","Entrega após validação do pagamento","Termos de software e vendedor"],
    "toolsHeading": "03 | Ferramentas online grátis",
    "toolsText": "Encontre ferramentas de PDF, imagem, vídeo, planilhas e privacidade.",
    "tools": [
      "PDF, assinatura e OCR",
      "Imagens e conversão",
      "Vídeo e áudio",
      "Planilhas e arquivos",
      "E-mail temporário e privacidade"
    ],
    "stepsHeading": "05 | Três passos",
    "steps": [
      "Descreva sua tarefa",
      "Compare recursos, preços e limites",
      "Abra a ferramenta e confira o resultado"
    ],
    "vendorHeading": "06 | Empresas e desenvolvedores de IA",
    "vendorText": "Envie atualizações e correções oficiais com fontes por e-mail. O envio não garante mudança na classificação.",
    "vendorAction": "Enviar dados do produto"
  },
  "ar": {
    "servicesHeading": "02 | سوق برامج SASI",
    "servicesText": "استعرض البرامج الجاهزة ومستشاري MT5 ومؤشرات التداول وتراخيص الشيفرة المصدرية. يمكن للمطورين طلب نشر منتجاتهم. تخضع القوائم للمراجعة ويتم التسليم بعد التحقق من الدفع وصلاحية الطلب.",
    "services": ["البرامج وتراخيص الشيفرة المصدرية","التقديم كبائع ومطور","قواعد التسليم بعد التحقق من الدفع","شروط البرامج والبائعين"],
    "toolsHeading": "03 | أدوات مجانية عبر الإنترنت",
    "toolsText": "ابحث عن أدوات PDF والصور والفيديو والجداول والخصوصية حسب المهمة.",
    "tools": [
      "PDF والتوقيع وOCR",
      "الصور والتحويل",
      "الفيديو والصوت",
      "الجداول والملفات",
      "البريد المؤقت والخصوصية"
    ],
    "stepsHeading": "05 | ثلاث خطوات",
    "steps": [
      "اشرح ما تريد إنجازه",
      "قارن الوظائف والأسعار والقيود",
      "افتح الأداة وتحقق من النتيجة"
    ],
    "vendorHeading": "06 | شركات ومطورو الذكاء الاصطناعي",
    "vendorText": "أرسل تحديثات المنتج والتصحيحات الرسمية مع مصادرها بالبريد الإلكتروني. لا يضمن الإرسال تغيير الترتيب.",
    "vendorAction": "إرسال معلومات المنتج"
  }
};
const SASI_MARKET_PATHS=["/sasi","/sasi/seller","/sasi/delivery","/legal/sasi"] as const;
const TOOL_PATHS=["/tools?q=PDF","/tools?q=图片","/tools?q=视频","/tools?q=CSV","/tools?q=临时邮箱"] as const;

export default function HomeSeoAnswers({locale:initialLocale}:{locale:SeoLocale}){
 const {lang}=useLingxiLang();
 const locale=(lang||initialLocale) as SeoLocale;
 const copy=FAQ[locale]||FAQ.zh;
 const extra=HOME_EXTRA[locale]||HOME_EXTRA.zh;
 return <section className="lx-seo-answers" aria-labelledby="lx-seo-title" lang={locale==="zh"?"zh-CN":locale} dir={locale==="ar"?"rtl":"ltr"}>
  <div className="lx-seo-answers-head">
   <p className="lx-seo-eyebrow">{copy.eyebrow}</p>
   <h2 id="lx-seo-title">{copy.title}</h2><p>{copy.intro}</p>
  </div>
  <section className="lx-seo-extra" aria-labelledby="lx-seo-market">
   <h2 id="lx-seo-market">{extra.servicesHeading}</h2><p>{extra.servicesText}</p>
   <div className="lx-seo-action-grid">{extra.services.map((text,i)=><Link key={SASI_MARKET_PATHS[i]} href={SASI_MARKET_PATHS[i]} className="lx-seo-action">{text} <span aria-hidden="true">→</span></Link>)}</div>
  </section>
  <section className="lx-seo-extra" aria-labelledby="lx-seo-tools">
   <h2 id="lx-seo-tools">{extra.toolsHeading}</h2><p>{extra.toolsText}</p>
   <div className="lx-seo-action-grid">{extra.tools.map((text,i)=><Link key={TOOL_PATHS[i]} href={TOOL_PATHS[i]} className="lx-seo-action">{text} <span aria-hidden="true">→</span></Link>)}</div>
  </section>
  <div className="lx-seo-question-grid">
   {copy.questions.map((item)=>(
    <article className="lx-seo-question" key={item.q}>
     <h3>{item.q}</h3><p>{item.a}</p>
     <Link href={item.href}>{item.link} <span aria-hidden="true">→</span></Link>
    </article>
   ))}
  </div>
  <section className="lx-seo-extra" aria-labelledby="lx-seo-steps">
   <h2 id="lx-seo-steps">{extra.stepsHeading}</h2>
   <ol className="lx-seo-steps">{extra.steps.map((step,i)=><li key={step}><strong>{String(i+1).padStart(2,"0")}</strong><span>{step}</span></li>)}</ol>
  </section>
  <section className="lx-seo-vendor" aria-labelledby="lx-seo-vendor">
   <h2 id="lx-seo-vendor">{extra.vendorHeading}</h2><p>{extra.vendorText}</p>
   <a href="mailto:business@lingxifield.com?subject=SIAI%20product%20information">{extra.vendorAction} →</a>
  </section>
  <nav className="lx-seo-answers-links" aria-label="LINGXIFIELD">
   <Link href="/siai">{copy.explore}</Link><Link href="/sasi">{copy.create}</Link><Link href="/tools">{copy.tools}</Link>
  </nav>
 </section>
}
