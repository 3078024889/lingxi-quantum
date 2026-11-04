"use client";
import Image from"next/image";
import Link from"next/link";
import{useLingxiLang,LANG_NAMES,type LingxiLang}from"@/lib/lingxi-i18n";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
import {FOOTER_UNIFIED,FOOTER_TOOL_ICONS,FOOTER_TOOL_LINKS} from "@/lib/footer-unified-copy";

const FOOTER_QUESTION_ZH=["全球 AI 行情平台有哪些？","全球 SIAI 排行榜哪个好用？","AI / SI 工具怎么选择？","视频生成、短剧生成费用是多少？","PDF 在线编辑与电子签名怎么操作？","免费 AI 工具有哪些？"] as const;
const FOOTER_CHIPS:Record<LingxiLang,string[]>={
 zh:["PDF 工具","图片工具","视频工具","音频工具","文档工具","办公工具","开发工具","AI 创作"],
 en:["PDF tools","Image tools","Video tools","Audio tools","Document tools","Office tools","Developer tools","SI/AI creation"],
 ja:["PDFツール","画像ツール","動画ツール","音声ツール","文書ツール","オフィスツール","開発ツール","AI創作"],
 ko:["PDF 도구","이미지 도구","영상 도구","오디오 도구","문서 도구","사무 도구","개발 도구","AI 창작"],
 fr:["Outils PDF","Images","Vidéo","Audio","Documents","Bureautique","Développement","Création IA"],
 de:["PDF-Tools","Bild-Tools","Video-Tools","Audio-Tools","Dokumente","Büro","Entwicklung","KI-Kreation"],
 es:["PDF","Imágenes","Vídeo","Audio","Documentos","Ofimática","Desarrollo","Creación IA"],
 pt:["PDF","Imagens","Vídeo","Áudio","Documentos","Escritório","Desenvolvimento","Criação IA"],
 ar:["أدوات PDF","الصور","الفيديو","الصوت","المستندات","المكتب","التطوير","إنشاء AI"]
};
const FOOTER_CHIP_URLS=["/tools?q=PDF","/tools?q=图片","/tools?q=视频","/tools?q=音频","/tools?q=文档","/tools?q=办公","/tools?q=开发","/sasi"] as const;
const channels=[["微信服务号","#wechat"],["小红书","https://xhslink.cn/m/8rig9AtdDvK"],["Bilibili","https://b23.tv/VhatqCq"],["抖音","https://v.douyin.com/WG4QmhbliNk"],["X","https://x.com/lingxifield?s=11"],["YouTube","https://youtube.com/@lingxifield?si=fJss8KQIAl8NDS9X"]]as const;

type FooterCopy={account:string;orders:string;refunds:string;release:string};
const copy:Record<LingxiLang,FooterCopy>={
 zh:{account:"我的账户",orders:"订单与任务",refunds:"退款说明",release:"版本与更新"},
 en:{account:"My account",orders:"Orders & tasks",refunds:"Refunds",release:"Release notes"},
 ja:{account:"アカウント",orders:"注文とタスク",refunds:"返金案内",release:"更新情報"},
 ko:{account:"내 계정",orders:"주문 및 작업",refunds:"환불 안내",release:"업데이트"},
 fr:{account:"Mon compte",orders:"Commandes et tâches",refunds:"Remboursements",release:"Mises à jour"},
 de:{account:"Mein Konto",orders:"Bestellungen & Aufgaben",refunds:"Rückerstattungen",release:"Aktualisierungen"},
 es:{account:"Mi cuenta",orders:"Pedidos y tareas",refunds:"Reembolsos",release:"Actualizaciones"},
 pt:{account:"Minha conta",orders:"Pedidos e tarefas",refunds:"Reembolsos",release:"Atualizações"},
 ar:{account:"حسابي",orders:"الطلبات والمهام",refunds:"الاسترداد",release:"التحديثات"}
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

const FOOTER_BRAND_SHORT:Record<LingxiLang,string>={
 zh:"全球 SI / AI / SIAI 工具行情、排行榜、SASI 智能创作与 100+ 在线实用工具。",
 en:"Global SI / AI / SIAI rankings, SASI creation and 100+ online utilities.",
 ja:"世界のSI・AI・SIAIランキング、SASI創作、100以上のオンラインツール。",
 ko:"글로벌 SI / AI / SIAI 순위, SASI 창작과 100개 이상의 온라인 도구.",
 fr:"Classements mondiaux SI/IA/SIAI, création SASI et plus de 100 outils en ligne.",
 de:"Globale SI/KI/SIAI-Rankings, SASI-Kreation und über 100 Online-Tools.",
 es:"Ranking mundial SI/IA/SIAI, creación SASI y más de 100 herramientas en línea.",
 pt:"Ranking global SI/IA/SIAI, criação SASI e mais de 100 ferramentas online.",
 ar:"تصنيفات SI وAI وSIAI العالمية وإبداع SASI وأكثر من 100 أداة عبر الإنترنت."
};

export default function Footer(){
 const{t,lang,setLang}=useLingxiLang();
 const c=FOOTER_LINKS[lang]??FOOTER_LINKS.en;
 const discovery=SIAI_DISCOVERY[lang];
 const overview=FOOTER_UNIFIED[lang];
 return <footer className="lx11-footer lx-branded-footer" id="wechat" dir={lang==="ar"?"rtl":"ltr"}>
  <div className="lx11-footer-grid">
   <section className="lx11-footer-brand">
    <Link className="lx11-footer-logo" href="/" aria-label="LINGXIFIELD"><Image src="/images/lingxifield-logo.png" alt="" width={46} height={46}/><div><b>灵犀场 LINGXIFIELD</b></div></Link>
    <p className="lx-footer-brand-intro">{FOOTER_BRAND_SHORT[lang]}</p>
    <div className="lx-footer-brand-social">{channels.filter(([label])=>["小红书","X","YouTube"].includes(label)).map(([label,href])=><a href={href} key={label} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
   </section>
   <nav aria-label={c.rankings}>
    <b>{c.rankings}</b>
    <Link href="/siai">{c.rankSub}</Link>
    {discovery.topics.map((topic,i)=><Link key={topic.q} href={"/siai#siai-search-ranking-"+i}>{topic.q}</Link>)}
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
  <section className="lx-footer-unified" lang={lang==="zh"?"zh-CN":lang} aria-label={overview.headline}>
   <header className="lx-footer-unified-head">
    <h2>{overview.headline}</h2>
    <p>{overview.intro}</p>
   </header>
   <div className="lx-footer-unified-columns">
    <section className="lx-footer-market" aria-label={overview.headline}>
     <ul>{overview.marketPoints.map(point=><li key={point}><span aria-hidden="true">🔹</span><span>{point}</span></li>)}</ul>
    </section>
    <section className="lx-footer-tools">
     <h3><Link href="/tools">{overview.toolsTitle}</Link></h3>
     <nav className="lx-footer-tool-chips" aria-label={overview.toolsTitle}>{FOOTER_CHIPS[lang].map((label,i)=><Link href={FOOTER_CHIP_URLS[i]} key={label}>{label}</Link>)}</nav>
     <div className="lx-footer-tools-list">
      {overview.toolCategories.map((item,i)=><p key={item.title}><Link href={FOOTER_TOOL_LINKS[i]}><strong><span aria-hidden="true">{FOOTER_TOOL_ICONS[i]}</span> {item.title}：</strong></Link><span>{item.description}</span></p>)}
     </div>
    </section>
    <nav className="lx-footer-search-list" aria-label={overview.searchTitle}>
     <h3>{overview.searchTitle}</h3>
     <ol>{discovery.topics.map((topic,i)=><li key={topic.q}><Link href={"/siai#siai-search-ranking-"+i}><span className="lx-footer-search-number">{String(i+1).padStart(2,"0")}｜</span>{lang==="zh"?FOOTER_QUESTION_ZH[i]:topic.q}</Link></li>)}</ol>
    </nav>
   </div>
   <div className="lx-footer-unified-secondary">
    <section className="lx-footer-sasi">
     <h3><Link href="/sasi">{overview.sasiTitle}</Link></h3>
     <p>{overview.sasiDescription}</p>
    </section>
   </div>
   <div className="lx-footer-unified-close">
    <h3>{overview.closingTitle}</h3>
    <p>{overview.closingDescription}</p>
   </div>
  </section>
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
   <label className="lx-footer-language"><span aria-hidden="true">🌐</span><select value={lang} aria-label={t("language")} onChange={e=>setLang(e.target.value as LingxiLang)}>{(Object.keys(LANG_NAMES) as LingxiLang[]).map(k=><option value={k} key={k}>{LANG_NAMES[k]}</option>)}</select></label>
   <Link href="/terms">{t("terms")}</Link><Link href="/privacy">{t("privacy")}</Link>
   <Link href="/refunds">{t("refunds")}</Link><Link href="/legal/sasi">{t("sasiRules")}</Link>
   <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer noopener">湘ICP备2026031465号 ↗</a>
  </div>
 </footer>;
}
