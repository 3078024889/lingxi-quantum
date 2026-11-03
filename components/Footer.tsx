"use client";
import {PUBLIC_FEATURE_COPY} from "@/lib/public-feature-copy";
import Image from"next/image";
import Link from"next/link";
import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";

const channels=[["微信服务号","#wechat"],["小红书","https://xhslink.cn/m/8rig9AtdDvK"],["Bilibili","https://b23.tv/VhatqCq"],["抖音","https://v.douyin.com/WG4QmhbliNk"],["X","https://x.com/lingxifield?s=11"],["YouTube","https://youtube.com/@lingxifield?si=fJss8KQIAl8NDS9X"]]as const;

type FooterCopy={name:string;slogan:string;lead:string;tools:string;toolsBody:string;sasi:string;sasiBody:string;useful:string;account:string;orders:string;withdraw:string;refunds:string;connect:string;release:string};
const copy:Record<LingxiLang,FooterCopy>={
 zh:{name:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 智能创作 · 免费在线实用工具",slogan:"100+在线实用工具＋SASI创作。",lead:"AI 工具先比清楚，再决定用哪一个；PDF、图片、视频有问题，就去对应工具处理。",tools:"100+在线实用工具",toolsBody:"PDF、图片、视频音频、文件表格、格式转换、二维码、安全识别、临时邮箱、阅后即焚与隐私工具。",sasi:"SASI 多模型创作",sasiBody:"短剧视频生成、网站构建、书本、学习、科研多模型创作；9国语言，支持 CNY/USD 与微信支付、支付宝、PayPal。",useful:"常用入口",account:"我的账户",orders:"订单与任务",withdraw:"余额提现",refunds:"退款说明",connect:"连接我的智能服务",release:"版本与更新"},
 en:{name:"LINGXIFIELD",slogan:"Work with files and sources.",lead:"Work with PDFs, images, video and text. Organize sources and ask questions about them. Processing details and prices are shown before use.",tools:"Practical tools",toolsBody:"Choose a PDF, image, video or text tool, follow the steps and save your file. See each tool for processing details and prices.",sasi:"Sources and questions",sasiBody:"Short video creation, static websites, books, study and research with SASI. Nine languages, CNY/USD, WeChat Pay, Alipay and PayPal.",useful:"Useful links",account:"My account",orders:"Orders & tasks",withdraw:"Withdraw balance",refunds:"Refunds",connect:"Creative connections",release:"Release notes"},
 ja:{name:"LINGXIFIELD",slogan:"ファイルを扱い、資料を整理。",lead:"PDF・画像・動画・テキストを扱い、資料を整理して原文について質問できます。処理方法と料金は利用前に確認できます。",tools:"実用ツール",toolsBody:"PDF・画像・動画・テキストのツールを選び、手順に沿って処理して保存します。処理方法と料金は各ツールで確認できます。",sasi:"資料と質問",sasiBody:"SASIで短編動画・静的サイト・本・学習・研究を制作。9言語、CNY/USD、WeChat Pay・Alipay・PayPalに対応。",useful:"よく使う入口",account:"アカウント",orders:"注文とタスク",withdraw:"残高を引き出す",refunds:"返金案内",connect:"制作サービス接続",release:"更新情報"},
 ko:{name:"LINGXIFIELD",slogan:"파일을 처리하고 자료를 정리하세요.",lead:"PDF·이미지·영상·텍스트를 처리하고 자료를 정리해 원문에 대해 질문하세요. 처리 방식과 요금은 사용 전에 확인할 수 있습니다.",tools:"실용 도구",toolsBody:"PDF·이미지·영상·텍스트 도구를 선택하고 안내에 따라 처리한 뒤 저장하세요. 처리 방식과 요금은 각 도구에서 확인하세요.",sasi:"자료와 질문",sasiBody:"SASI로 짧은 영상, 정적 웹사이트, 책, 학습, 연구를 만드세요. 9개 언어, CNY/USD, 위챗페이, 알리페이, PayPal을 지원합니다.",useful:"자주 쓰는 메뉴",account:"내 계정",orders:"주문 및 작업",withdraw:"잔액 출금",refunds:"환불 안내",connect:"창작 서비스 연결",release:"업데이트"},
 fr:{name:"LINGXIFIELD",slogan:"Traitez vos fichiers et organisez vos sources.",lead:"Traitez PDF, images, vidéos et textes. Organisez vos sources et posez des questions à leur sujet. Les modalités et tarifs sont indiqués avant utilisation.",tools:"Outils pratiques",toolsBody:"Choisissez un outil PDF, image, vidéo ou texte, suivez les étapes et enregistrez votre fichier. Consultez les modalités et tarifs sur sa page.",sasi:"Sources et questions",sasiBody:"SASI pour les vidéos courtes, sites statiques, livres, études et recherche. Neuf langues, CNY/USD, WeChat Pay, Alipay et PayPal.",useful:"Accès utiles",account:"Mon compte",orders:"Commandes et tâches",withdraw:"Retirer le solde",refunds:"Remboursements",connect:"Connexions de création",release:"Mises à jour"},
 de:{name:"LINGXIFIELD",slogan:"Dateien bearbeiten, Quellen ordnen.",lead:"Bearbeite PDFs, Bilder, Videos und Texte. Ordne Quellen und stelle Fragen dazu. Verarbeitung und Preise werden vor der Nutzung angezeigt.",tools:"Praktische Tools",toolsBody:"Wähle ein Tool für PDF, Bilder, Video oder Text, folge den Schritten und speichere die Datei. Verarbeitung und Preise stehen auf der Tool-Seite.",sasi:"Quellen und Fragen",sasiBody:"SASI für Kurzvideos, statische Websites, Bücher, Lernen und Forschung. Neun Sprachen, CNY/USD, WeChat Pay, Alipay und PayPal.",useful:"Nützliche Links",account:"Mein Konto",orders:"Bestellungen & Aufgaben",withdraw:"Guthaben auszahlen",refunds:"Rückerstattungen",connect:"Kreativdienste verbinden",release:"Aktualisierungen"},
 es:{name:"LINGXIFIELD",slogan:"Procesa archivos y organiza fuentes.",lead:"Trabaja con PDF, imágenes, vídeos y textos. Organiza fuentes y haz preguntas sobre ellas. El tratamiento y los precios se indican antes del uso.",tools:"Herramientas prácticas",toolsBody:"Elige una herramienta para PDF, imágenes, vídeo o texto, sigue los pasos y guarda el archivo. Consulta los detalles y precios en cada herramienta.",sasi:"Fuentes y preguntas",sasiBody:"SASI para vídeos cortos, sitios estáticos, libros, estudio e investigación. Nueve idiomas, CNY/USD, WeChat Pay, Alipay y PayPal.",useful:"Accesos útiles",account:"Mi cuenta",orders:"Pedidos y tareas",withdraw:"Retirar saldo",refunds:"Reembolsos",connect:"Conexiones de creación",release:"Actualizaciones"},
 pt:{name:"LINGXIFIELD",slogan:"Processe arquivos e organize fontes.",lead:"Trabalhe com PDF, imagens, vídeos e textos. Organize fontes e faça perguntas sobre elas. O processamento e os preços são informados antes do uso.",tools:"Ferramentas práticas",toolsBody:"Escolha uma ferramenta para PDF, imagens, vídeo ou texto, siga as etapas e salve o arquivo. Consulte os detalhes e preços na página da ferramenta.",sasi:"Fontes e perguntas",sasiBody:"SASI para vídeos curtos, sites estáticos, livros, estudo e pesquisa. Nove idiomas, CNY/USD, WeChat Pay, Alipay e PayPal.",useful:"Acessos úteis",account:"Minha conta",orders:"Pedidos e tarefas",withdraw:"Sacar saldo",refunds:"Reembolsos",connect:"Conexões de criação",release:"Atualizações"},
 ar:{name:"LINGXIFIELD",slogan:"عالج الملفات ونظّم المصادر.",lead:"عالج ملفات PDF والصور والفيديو والنصوص، ونظّم المصادر واطرح أسئلة عنها. تُعرض طريقة المعالجة والأسعار قبل الاستخدام.",tools:"أدوات عملية",toolsBody:"اختر أداة لملفات PDF أو الصور أو الفيديو أو النصوص، واتبع الخطوات واحفظ الملف. راجع طريقة المعالجة والأسعار في صفحة الأداة.",sasi:"المصادر والأسئلة",sasiBody:"SASI لإنشاء الفيديوهات القصيرة والمواقع الثابتة والكتب والدراسة والبحث. تسع لغات وCNY/USD والدفع عبر WeChat Pay وAlipay وPayPal.",useful:"روابط مفيدة",account:"حسابي",orders:"الطلبات والمهام",withdraw:"سحب الرصيد",refunds:"الاسترداد",connect:"اتصالات خدمات الإبداع",release:"التحديثات"}
};

type LinkLabels={rankings:string;rankSub:string;sasi:string;tools:string;account:string;terms:string;privacy:string;about:string;free:string;contacts:string;drama:string;website:string;books:string;learning:string;research:string;pdf:string;ocr:string;video:string;temp:string;all:string;brandLead:string};
const FOOTER_LINKS:Record<LingxiLang,LinkLabels>={
 zh:{rankings:"发现全球 SI/AI",rankSub:"全球 SIAI 排行榜",sasi:"SASI 智能创作",tools:"免费在线工具",account:"平台与账户",terms:"使用条款",privacy:"隐私政策",about:"关于灵犀场",free:"每日免费体验",contacts:"关注与联系",drama:"SI/AI 短剧生成",website:"AI 网站构建",books:"书本智能问答",learning:"学习智能体",research:"科研智能体",pdf:"PDF 编辑与签名",ocr:"图片与 OCR 识别",video:"视频字幕与音频",temp:"临时邮箱与隐私",all:"全部在线工具",brandLead:"AI 工具哪个好用？这里比功能、免费额度与价格；需要创作或处理文件，继续用 SASI 和在线工具。"},
 en:{rankings:"Discover AI",rankSub:"Global AI rankings",sasi:"SASI creation",tools:"Free online tools",account:"About & account",terms:"Terms",privacy:"Privacy",about:"About us",free:"Daily free trial",contacts:"Stay connected",drama:"AI short dramas",website:"Website builder",books:"Book Q&A",learning:"Learning SASI",research:"Research SASI",pdf:"PDF editor & signatures",ocr:"Images & OCR",video:"Video & audio",temp:"Temporary email & privacy",all:"All online tools",brandLead:"Global AI tool rankings · SASI creation · Free online utilities"},
 ja:{rankings:"世界のAIを探す",rankSub:"AIツールランキング",sasi:"SASI創作",tools:"無料オンラインツール",account:"会社・アカウント",terms:"利用規約",privacy:"プライバシー",about:"LINGXIFIELDについて",free:"毎日の無料体験",contacts:"お問い合わせ",drama:"AI短編ドラマ",website:"Webサイト作成",books:"書籍への質問",learning:"学習SASI",research:"研究SASI",pdf:"PDF編集と署名",ocr:"画像とOCR",video:"動画・音声",temp:"一時メールとプライバシー",all:"すべてのツール",brandLead:"世界のAIツール比較 · SASI創作 · 無料オンラインツール"},
 ko:{rankings:"글로벌 AI 발견",rankSub:"AI 도구 순위",sasi:"SASI 창작",tools:"무료 온라인 도구",account:"소개 및 계정",terms:"약관",privacy:"개인정보",about:"소개",free:"매일 무료 체험",contacts:"연락처",drama:"AI 숏드라마",website:"웹사이트 제작",books:"책 질문",learning:"학습 SASI",research:"연구 SASI",pdf:"PDF 편집과 서명",ocr:"이미지와 OCR",video:"영상 및 오디오",temp:"임시 이메일 및 개인정보",all:"전체 도구",brandLead:"글로벌 AI 도구 비교 · SASI 창작 · 무료 온라인 도구"},
 fr:{rankings:"Découvrir l'IA",rankSub:"Classement IA",sasi:"Création SASI",tools:"Outils gratuits",account:"À propos et compte",terms:"Conditions",privacy:"Confidentialité",about:"À propos",free:"Essai gratuit quotidien",contacts:"Nous suivre",drama:"Mini-séries IA",website:"Créer un site",books:"Questions sur les livres",learning:"SASI Études",research:"SASI Recherche",pdf:"PDF et signatures",ocr:"Images et OCR",video:"Vidéo et audio",temp:"E-mail temporaire",all:"Tous les outils",brandLead:"Classement mondial IA · Création SASI · Outils gratuits en ligne"},
 de:{rankings:"KI entdecken",rankSub:"KI-Tool-Rankings",sasi:"SASI-Kreation",tools:"Kostenlose Online-Tools",account:"Info und Konto",terms:"AGB",privacy:"Datenschutz",about:"Über uns",free:"Täglich gratis testen",contacts:"Kontakt",drama:"KI-Kurzdramen",website:"Website erstellen",books:"Bücher befragen",learning:"Lern-SASI",research:"Forschungs-SASI",pdf:"PDF und Signaturen",ocr:"Bilder und OCR",video:"Video und Audio",temp:"Temporäre E-Mail",all:"Alle Online-Tools",brandLead:"Globale KI-Tool-Vergleiche · SASI-Kreation · Kostenlose Online-Tools"},
 es:{rankings:"Descubrir IA",rankSub:"Ranking de herramientas",sasi:"Creación SASI",tools:"Herramientas gratis",account:"Información y cuenta",terms:"Términos",privacy:"Privacidad",about:"Acerca de",free:"Prueba gratis diaria",contacts:"Contacto",drama:"Minidramas IA",website:"Crear sitios",books:"Preguntas sobre libros",learning:"SASI Aprendizaje",research:"SASI Investigación",pdf:"PDF y firmas",ocr:"Imágenes y OCR",video:"Vídeo y audio",temp:"Correo temporal",all:"Todas las herramientas",brandLead:"Ranking global IA · Creación SASI · Herramientas online gratis"},
 pt:{rankings:"Descobrir IA",rankSub:"Ranking de ferramentas",sasi:"Criação SASI",tools:"Ferramentas grátis",account:"Sobre e conta",terms:"Termos",privacy:"Privacidade",about:"Sobre nós",free:"Teste diário grátis",contacts:"Contato",drama:"Minidramas IA",website:"Criar sites",books:"Perguntas sobre livros",learning:"SASI Aprendizagem",research:"SASI Pesquisa",pdf:"PDF e assinaturas",ocr:"Imagens e OCR",video:"Vídeo e áudio",temp:"E-mail temporário",all:"Todas as ferramentas",brandLead:"Ranking global IA · Criação SASI · Ferramentas online grátis"},
 ar:{rankings:"اكتشف أدوات الذكاء",rankSub:"تصنيف أدوات الذكاء",sasi:"إبداع SASI",tools:"أدوات مجانية",account:"عن الموقع والحساب",terms:"الشروط",privacy:"الخصوصية",about:"من نحن",free:"تجربة مجانية يومية",contacts:"تواصل معنا",drama:"دراما قصيرة",website:"إنشاء المواقع",books:"أسئلة الكتب",learning:"SASI للتعلّم",research:"SASI للبحث",pdf:"PDF والتوقيع",ocr:"الصور وOCR",video:"الفيديو والصوت",temp:"بريد مؤقت",all:"كل الأدوات",brandLead:"مقارنة أدوات الذكاء · إبداع SASI · أدوات مجانية"}
};

const FOOTER_MARKET_DETAIL:Record<LingxiLang,[string,string,string]>={
 zh:["功能与模型对比","免费额度与价格","地区、付款与商用条件"],
 en:["Features and models","Free tiers and prices","Regions, payment and licenses"],
 ja:["機能とモデル比較","無料枠と料金","地域・決済・商用条件"],
 ko:["기능·모델 비교","무료 한도·가격","지역·결제·상업적 이용"],
 fr:["Fonctions et modèles","Offres gratuites et tarifs","Régions, paiement et licence"],
 de:["Funktionen und Modelle","Gratis-Tarife und Preise","Regionen, Zahlungen und Lizenzen"],
 es:["Funciones y modelos","Planes gratis y precios","Regiones, pagos y licencias"],
 pt:["Recursos e modelos","Planos grátis e preços","Regiões, pagamentos e licenças"],
 ar:["الوظائف والنماذج","الخطط المجانية والأسعار","المناطق والدفع والتراخيص"]
};

export default function Footer(){
 const{t,lang}=useLingxiLang();
 const c=FOOTER_LINKS[lang]??FOOTER_LINKS.en;
 const discovery=SIAI_DISCOVERY[lang];
 const [modelLink,freeLink,regionLink]=FOOTER_MARKET_DETAIL[lang];
 return <footer className="lx11-footer lx-branded-footer" id="wechat" dir={lang==="ar"?"rtl":"ltr"}>
  <div className="lx11-footer-grid">
   <section className="lx11-footer-brand">
    <Link className="lx11-footer-logo" href="/" aria-label="LINGXIFIELD"><Image src="/images/lingxifield-logo.png" alt="" width={46} height={46}/><div><b>灵犀场 LINGXIFIELD</b></div></Link>
    <p className="text-sm leading-6">{c.brandLead}</p>
    <div className="lx-footer-trio">{discovery.trio.map(item=><span key={item}>{item}</span>)}</div>
    <p><a href="https://lingxifield.com" rel="noopener noreferrer">lingxifield.com</a> · <span>lingxifield.cn</span></p>
   </section>
   <nav aria-label={c.rankings}>
    <b>{c.rankings}</b>
    <Link href="/siai">{c.rankSub}</Link>
    <Link href="/siai">{modelLink}</Link>
    <Link href="/siai">{freeLink}</Link>
    <Link href="/siai">{regionLink}</Link>
    <Link href={"/siai/claim?lang="+lang}>{lang==="zh"?"厂商认领 · 提交 SI/AI 平台":lang==="ja"?"SI/AI製品登録":lang==="ko"?"SI/AI 제품 등록":lang==="fr"?"Proposer un outil SI/IA":lang==="de"?"SI/KI-Produkt einreichen":lang==="es"?"Enviar producto SI/IA":lang==="pt"?"Enviar produto SI/IA":lang==="ar"?"تقديم منتج SI/AI":"Claim or submit SI/AI product"}</Link>
   </nav>
   <nav aria-label={c.sasi}>
    <b>{c.sasi}</b>
    <Link href="/sasi">{c.sasi}</Link><Link href="/sasi/drama">{c.drama}</Link><Link href="/sasi/build">{c.website}</Link>
    <Link href="/ai-knowledge">{c.books}</Link><Link href="/ai-learning">{c.learning}</Link><Link href="/ai-research">{c.research}</Link>
   </nav>
   <nav aria-label={c.tools}>
    <b>{c.tools}</b>
    <Link href="/tools">{c.all}</Link><Link href="/tools?q=PDF">{c.pdf}</Link>
    <Link href="/tools?q=OCR">{c.ocr}</Link><Link href="/tools?q=视频">{c.video}</Link>
    <Link href="/tools?q=临时邮箱">{c.temp}</Link>
   </nav>
   <nav aria-label={c.account}>
    <b>{c.account}</b>
    <Link href="/about">{c.about}</Link><Link href="/account">{copy[lang].account}</Link>
    <Link href="/account/orders">{copy[lang].orders}</Link><Link href="/refunds">{copy[lang].refunds}</Link>
    <Link href="/terms">{c.terms}</Link><Link href="/privacy">{c.privacy}</Link><Link href="/release">{copy[lang].release}</Link>
   </nav>
  </div>
  <nav className="mx-auto mb-5 max-w-7xl rounded-xl border border-[var(--lx-line)] px-5 py-4" aria-label={discovery.footerTitle}>
   <h2 className="mb-2 font-semibold">{discovery.footerTitle}</h2>
   <p lang={lang==="zh"?"zh-CN":lang} className="mb-2 text-sm leading-7">{lang==="zh"?"灵犀场 LINGXIFIELD 汇集全球AI行情平台、全球AI排行榜、全球SI排行榜、全球SI行情平台、全球SIAI行情平台和全球SIAI排行榜。比较全球SI/AI公司、模型、工具的功能、免费额度、官方价格、地区可用、支付方式与商用条件；未核实的资料会明确标注。":PUBLIC_FEATURE_COPY[lang].description}</p>
   {lang!=="en"&&<p lang="en" className="mb-3 text-sm leading-7 text-[var(--lx-muted)]">LINGXIFIELD is a global AI market information and SIAI rankings directory. Compare AI and SI tools, model capabilities, published prices, free tiers, regional access, payments and commercial terms using links to publisher sources.</p>}
   <p className="mb-3 text-xs text-[var(--lx-muted)]">{discovery.footerNote}</p>
   <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">{discovery.topics.map(v=>v.q).map((label,i)=><Link key={label} href={"/#siai-search-home-"+i} className="underline underline-offset-4">{label}</Link>)}{discovery.extras.map(label=><Link key={label} href="/siai" className="underline underline-offset-4">{label}</Link>)}</div>
  </nav>
  <div className="lx-footer-social-strip">
   <div><b>{c.contacts}</b><div className="lx11-footer-social">
     {channels.map(([label,href])=>{const localized=label==="微信服务号"&&lang!=="zh"?"WeChat":label;return href.startsWith("#")?<a key={label} href={href}>{localized}</a>:<a key={label} href={href} target="_blank" rel="noreferrer noopener">{localized} ↗</a>})}
    <a href="mailto:business@lingxifield.com">business@lingxifield.com</a>
   </div></div>
   <div className="lx-footer-qr-row">
    <div><Image src="/images/lingxifield-wechat-service-qr.jpg" alt="WeChat Service" width={56} height={56}/><span>{t("service")}</span></div>
    <div><Image src="/images/miniapp-qrcode.png" alt="Miniapp" width={56} height={56}/><span>{t("miniapp")}</span></div>
   </div>
  </div>
  <div className="lx11-footer-legal"><span>© {new Date().getFullYear()} 灵犀场 LINGXIFIELD</span>
   <Link href="/terms">{t("terms")}</Link><Link href="/privacy">{t("privacy")}</Link>
   <Link href="/refunds">{t("refunds")}</Link><Link href="/legal/sasi">{t("sasiRules")}</Link>
   <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer noopener">湘ICP备2026031465号 ↗</a>
  </div>
 </footer>;
}
