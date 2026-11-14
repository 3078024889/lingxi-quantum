"use client";
import Image from"next/image";
import Link from"next/link";
import {useState} from"react";
import{useLingxiLang,LANG_NAMES,type LingxiLang}from"@/lib/lingxi-i18n";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
import {FOOTER_UNIFIED,FOOTER_TOOL_ICONS,FOOTER_TOOL_LINKS} from "@/lib/footer-unified-copy";

const WECHAT_EXTRA:Record<LingxiLang,{more:string;search:string;ranking:string;miniapps:string}>={
 zh:{more:"微信搜一搜与排行榜账号",search:"微信搜一搜 · 灵犀场 lingxifield",ranking:"全球 SIAI 排行榜",miniapps:"微信小程序口令（可长按复制）"},
 en:{more:"WeChat search & rankings",search:"Search WeChat: 灵犀场 lingxifield",ranking:"Global SIAI rankings",miniapps:"WeChat mini-program commands (copy)"},
 ja:{more:"WeChat検索とランキング",search:"WeChatで「灵犀场 lingxifield」を検索",ranking:"グローバル SIAI ランキング",miniapps:"WeChatミニプログラム用コード"},
 ko:{more:"WeChat 검색 및 순위",search:"WeChat: 灵犀场 lingxifield 검색",ranking:"글로벌 SIAI 순위",miniapps:"WeChat 미니프로그램 명령어"},
 fr:{more:"Recherche WeChat et classement",search:"Chercher 灵犀场 lingxifield sur WeChat",ranking:"Classement SIAI mondial",miniapps:"Codes mini-programmes WeChat"},
 de:{more:"WeChat-Suche und Ranking",search:"WeChat: 灵犀场 lingxifield suchen",ranking:"Globales SIAI-Ranking",miniapps:"WeChat-Miniprogramm-Codes"},
 es:{more:"Búsqueda WeChat y clasificación",search:"Buscar 灵犀场 lingxifield en WeChat",ranking:"Ranking global SIAI",miniapps:"Códigos de miniaplicación WeChat"},
 pt:{more:"Pesquisa WeChat e ranking",search:"Buscar 灵犀场 lingxifield no WeChat",ranking:"Ranking global SIAI",miniapps:"Códigos dos miniprogramas WeChat"},
 ar:{more:"بحث WeChat وترتيب SIAI",search:"ابحث عن 灵犀场 lingxifield في WeChat",ranking:"ترتيب SIAI العالمي",miniapps:"رموز برامج WeChat الصغيرة"}
};
const FOOTER_MINIAPP_ACTIONS:Record<LingxiLang,{one:string;two:string;copied:string;copy:string}>={
 zh:{one:"灵犀场小程序",two:"10临时邮箱",copied:"已复制",copy:"复制口令"},
 en:{one:"LINGXIFIELD mini app",two:"10 Temp Mail",copied:"Copied",copy:"Copy code"},
 ja:{one:"LINGXIFIELDミニアプリ",two:"10一時メール",copied:"コピー済み",copy:"コードをコピー"},
 ko:{one:"LINGXIFIELD 미니앱",two:"10 임시 이메일",copied:"복사됨",copy:"코드 복사"},
 fr:{one:"Mini-app LINGXIFIELD",two:"10 Courrier temporaire",copied:"Copié",copy:"Copier le code"},
 de:{one:"LINGXIFIELD Mini-App",two:"10 Temporäre E-Mail",copied:"Kopiert",copy:"Code kopieren"},
 es:{one:"Miniapp LINGXIFIELD",two:"10 Correo temporal",copied:"Copiado",copy:"Copiar código"},
 pt:{one:"Miniapp LINGXIFIELD",two:"10 E-mail temporário",copied:"Copiado",copy:"Copiar código"},
 ar:{one:"تطبيق لينغشي",two:"بريد مؤقت 10",copied:"تم النسخ",copy:"نسخ الرمز"}
};
const FOOTER_GROUP_COPY:Record<LingxiLang,{title:string;qq:string;copy:string;copied:string;telegram:string}>={
 zh:{title:"群组",qq:"QQ 群",copy:"复制群号",copied:"已复制",telegram:"Telegram 群组"},
 en:{title:"Communities",qq:"QQ groups",copy:"Copy group ID",copied:"Copied",telegram:"Telegram group"},
 ja:{title:"コミュニティ",qq:"QQグループ",copy:"グループ番号をコピー",copied:"コピー済み",telegram:"Telegramグループ"},
 ko:{title:"커뮤니티",qq:"QQ 그룹",copy:"그룹 번호 복사",copied:"복사됨",telegram:"Telegram 그룹"},
 fr:{title:"Communautés",qq:"Groupes QQ",copy:"Copier le numéro",copied:"Copié",telegram:"Groupe Telegram"},
 de:{title:"Communities",qq:"QQ-Gruppen",copy:"Gruppennummer kopieren",copied:"Kopiert",telegram:"Telegram-Gruppe"},
 es:{title:"Comunidades",qq:"Grupos QQ",copy:"Copiar número",copied:"Copiado",telegram:"Grupo de Telegram"},
 pt:{title:"Comunidades",qq:"Grupos QQ",copy:"Copiar número",copied:"Copiado",telegram:"Grupo do Telegram"},
 ar:{title:"المجموعات",qq:"مجموعات QQ",copy:"نسخ رقم المجموعة",copied:"تم النسخ",telegram:"مجموعة Telegram"}
};
const FOOTER_QQ_GROUPS=["1072178710","1074475201"] as const;
const FOOTER_TELEGRAM="https://t.me/globalsiai";
const MINIAPP_COMMANDS={
 app:"#小程序://灵犀场/ktKRUjMRoEcPEsE",
 mail:"#小程序://10临时邮箱/p8AACkYNods09Rl"
} as const;
const FOOTER_QUESTION_ZH=["全球 AI 行情平台有哪些？","全球 SIAI 排行榜哪个好用？","AI / SI 工具怎么选择？","全球 AI 视频模型如何比较价格与免费额度？","PDF 在线编辑与电子签名怎么操作？","免费 AI 工具有哪些？"] as const;
const FOOTER_CHIPS:Record<LingxiLang,string[]>={
 zh:["PDF 工具","图片工具","视频工具","音频工具","文档工具","办公工具","开发工具","SASI 软件市场"],
 en:["PDF tools","Image tools","Video tools","Audio tools","Document tools","Office tools","Developer tools","SASI software market"],
 ja:["PDFツール","画像ツール","動画ツール","音声ツール","文書ツール","オフィスツール","開発ツール","SASIソフトウェア市場"],
 ko:["PDF 도구","이미지 도구","영상 도구","오디오 도구","문서 도구","사무 도구","개발 도구","SASI 소프트웨어 마켓"],
 fr:["Outils PDF","Images","Vidéo","Audio","Documents","Bureautique","Développement","Marché logiciel SASI"],
 de:["PDF-Tools","Bild-Tools","Video-Tools","Audio-Tools","Dokumente","Büro","Entwicklung","SASI-Softwaremarkt"],
 es:["PDF","Imágenes","Vídeo","Audio","Documentos","Ofimática","Desarrollo","Mercado de software SASI"],
 pt:["PDF","Imagens","Vídeo","Áudio","Documentos","Escritório","Desenvolvimento","Mercado de software SASI"],
 ar:["أدوات PDF","الصور","الفيديو","الصوت","المستندات","المكتب","التطوير","سوق برامج SASI"]
};
const FOOTER_CHIP_URLS=["/tools?q=PDF","/tools?q=图片","/tools?q=视频","/tools?q=音频","/tools?q=文档","/tools?q=办公","/tools?q=开发","/sasi"] as const;
/** Owner-supplied public account / share links (2026-11-04). Short-video links are share entries, not verified profile landing URLs. */
const channels=[
 {label:"快手",tone:"#ff611a",short:"快手",mark:"快",href:"https://v.kuaishou.com/n71hSlT9",kind:"share"},
 {label:"抖音",tone:"#17171f",short:"抖音",mark:"抖",href:"https://v.douyin.com/bE0vjWQZ_eY/",kind:"share"},
 {label:"哔哩哔哩",tone:"#00a1d6",short:"B站",mark:"哔",href:"https://b23.tv/Bmcx90F",kind:"profile"},
 {label:"小红书",tone:"#e42d32",short:"小红书",mark:"红",href:"https://xhslink.cn/o/5sPTjCC9kWe",kind:"profile"},
 {label:"X",tone:"#111827",short:"X",mark:"𝕏",href:"https://x.com/lingxifieldsasi",kind:"profile"},
 {label:"YouTube",tone:"#e62117",short:"YT",mark:"▶",href:"https://youtube.com/@lingxifield",kind:"profile"},
 {label:"Facebook",tone:"#0866ff",short:"FB",mark:"f",href:"https://www.facebook.com/share/19SgJhdxtL/",kind:"share"},
 {label:"Instagram",tone:"#c13584",short:"IG",mark:"◎",href:"https://www.instagram.com/lingxifield/",kind:"profile"},
 {label:"TikTok",tone:"#111827",short:"TK",mark:"♪",href:"https://www.tiktok.com/@lingxifield.com",kind:"profile"},
 {label:"微博",tone:"#ea232c",short:"微博",mark:"微",href:"https://weibo.com/u/4003799090",kind:"profile"}
] as const;

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

type LinkLabels={rankings:string;rankSub:string;sasi:string;seller:string;delivery:string;tools:string;account:string;terms:string;privacy:string;about:string;free:string;contacts:string;pdf:string;ocr:string;video:string;temp:string;all:string;brandLead:string};
const FOOTER_LINKS:Record<LingxiLang,LinkLabels>={
 zh:{rankings:"发现全球 SI/AI",rankSub:"全球 SIAI 排行榜",sasi:"SASI 软件市场",seller:"开发者卖家服务",delivery:"软件授权与交付",tools:"免费在线工具",account:"平台与账户",terms:"使用条款",privacy:"隐私政策",about:"关于灵犀场",free:"每日免费体验",contacts:"关注与联系",pdf:"PDF 编辑与签名",ocr:"图片与 OCR 识别",video:"视频字幕与音频",temp:"临时邮箱与隐私",all:"全部在线工具",brandLead:"比较全球 SI/AI 模型、价格与免费额度；浏览 SASI 软件商品和源码授权，或使用在线工具处理文件。"},
 en:{rankings:"Discover AI",rankSub:"Global AI rankings",sasi:"SASI Software Marketplace",seller:"Seller services",delivery:"Licensing & delivery",tools:"Free online tools",account:"About & account",terms:"Terms",privacy:"Privacy",about:"About us",free:"Daily free trial",contacts:"Stay connected",pdf:"PDF editor & signatures",ocr:"Images & OCR",video:"Video & audio",temp:"Temporary email & privacy",all:"All online tools",brandLead:"Compare global SI/AI models, prices and free allowances. Browse SASI software and source licenses, or process files with online tools."},
 ja:{rankings:"世界のAIを探す",rankSub:"AIツールランキング",sasi:"SASIソフトウェア市場",seller:"出品者サービス",delivery:"ライセンスと納品",tools:"無料オンラインツール",account:"会社・アカウント",terms:"利用規約",privacy:"プライバシー",about:"LINGXIFIELDについて",free:"毎日の無料体験",contacts:"お問い合わせ",pdf:"PDF編集と署名",ocr:"画像とOCR",video:"動画・音声",temp:"一時メールとプライバシー",all:"すべてのツール",brandLead:"世界のSI/AIモデル、価格、無料枠を比較。SASIでソフトウェアとソースライセンスを確認し、オンラインツールでファイルを処理できます。"},
 ko:{rankings:"글로벌 AI 발견",rankSub:"AI 도구 순위",sasi:"SASI 소프트웨어 마켓",seller:"판매자 서비스",delivery:"라이선스 및 전달",tools:"무료 온라인 도구",account:"소개 및 계정",terms:"약관",privacy:"개인정보",about:"소개",free:"매일 무료 체험",contacts:"연락처",pdf:"PDF 편집과 서명",ocr:"이미지와 OCR",video:"영상 및 오디오",temp:"임시 이메일 및 개인정보",all:"전체 도구",brandLead:"글로벌 SI/AI 모델, 가격과 무료 한도를 비교하세요. SASI에서 소프트웨어와 소스 라이선스를 확인하고 온라인 도구로 파일을 처리할 수 있습니다."},
 fr:{rankings:"Découvrir l'IA",rankSub:"Classement IA",sasi:"Marché logiciel SASI",seller:"Services vendeurs",delivery:"Licences et livraison",tools:"Outils gratuits",account:"À propos et compte",terms:"Conditions",privacy:"Confidentialité",about:"À propos",free:"Essai gratuit quotidien",contacts:"Nous suivre",pdf:"PDF et signatures",ocr:"Images et OCR",video:"Vidéo et audio",temp:"E-mail temporaire",all:"Tous les outils",brandLead:"Comparez modèles SI/IA, prix et quotas gratuits. Parcourez les logiciels et licences source SASI ou traitez vos fichiers avec les outils en ligne."},
 de:{rankings:"KI entdecken",rankSub:"KI-Tool-Rankings",sasi:"SASI-Softwaremarkt",seller:"Verkäuferbereich",delivery:"Lizenzen und Lieferung",tools:"Kostenlose Online-Tools",account:"Info und Konto",terms:"AGB",privacy:"Datenschutz",about:"Über uns",free:"Täglich gratis testen",contacts:"Kontakt",pdf:"PDF und Signaturen",ocr:"Bilder und OCR",video:"Video und Audio",temp:"Temporäre E-Mail",all:"Alle Online-Tools",brandLead:"Vergleiche SI/KI-Modelle, Preise und Gratis-Kontingente. Entdecke SASI-Software und Quellcode-Lizenzen oder bearbeite Dateien mit Online-Tools."},
 es:{rankings:"Descubrir IA",rankSub:"Ranking de herramientas",sasi:"Mercado de software SASI",seller:"Servicios para vendedores",delivery:"Licencias y entrega",tools:"Herramientas gratis",account:"Información y cuenta",terms:"Términos",privacy:"Privacidad",about:"Acerca de",free:"Prueba gratis diaria",contacts:"Contacto",pdf:"PDF y firmas",ocr:"Imágenes y OCR",video:"Vídeo y audio",temp:"Correo temporal",all:"Todas las herramientas",brandLead:"Compara modelos SI/IA, precios y límites gratuitos. Explora software y licencias SASI o procesa archivos con herramientas online."},
 pt:{rankings:"Descobrir IA",rankSub:"Ranking de ferramentas",sasi:"Mercado de software SASI",seller:"Serviços para vendedores",delivery:"Licenças e entrega",tools:"Ferramentas grátis",account:"Sobre e conta",terms:"Termos",privacy:"Privacidade",about:"Sobre nós",free:"Teste diário grátis",contacts:"Contato",pdf:"PDF e assinaturas",ocr:"Imagens e OCR",video:"Vídeo e áudio",temp:"E-mail temporário",all:"Todas as ferramentas",brandLead:"Compare modelos SI/IA, preços e limites gratuitos. Explore software e licenças SASI ou processe arquivos com ferramentas online."},
 ar:{rankings:"اكتشف أدوات الذكاء",rankSub:"تصنيف أدوات الذكاء",sasi:"سوق برامج SASI",seller:"خدمات البائعين",delivery:"التراخيص والتسليم",tools:"أدوات مجانية",account:"عن الموقع والحساب",terms:"الشروط",privacy:"الخصوصية",about:"من نحن",free:"تجربة مجانية يومية",contacts:"تواصل معنا",pdf:"PDF والتوقيع",ocr:"الصور وOCR",video:"الفيديو والصوت",temp:"بريد مؤقت",all:"كل الأدوات",brandLead:"قارن نماذج SI/AI والأسعار والحصص المجانية. استعرض برامج SASI وتراخيص المصدر أو عالج الملفات باستخدام الأدوات عبر الإنترنت."}
};
const FOOTER_BRAND_SHORT:Record<LingxiLang,string>={
  zh:"全球 SI / AI / SIAI 排行榜、SASI 软件市场与 100+ 在线实用工具。",
  en:"Global SI / AI / SIAI rankings, the SASI software marketplace and 100+ online utilities.",
  ja:"世界のSI・AI・SIAIランキング、SASIソフトウェア市場、100以上のオンラインツール。",
  ko:"글로벌 SI / AI / SIAI 순위, SASI 소프트웨어 마켓 및 100개 이상의 온라인 도구.",
  fr:"Classements mondiaux SI/IA/SIAI, marché logiciel SASI et plus de 100 outils en ligne.",
  de:"Globale SI/KI/SIAI-Rankings, SASI-Softwaremarkt und über 100 Online-Tools.",
  es:"Ranking mundial SI/IA/SIAI, mercado de software SASI y más de 100 herramientas en línea.",
  pt:"Ranking global SI/IA/SIAI, mercado de software SASI e mais de 100 ferramentas online.",
  ar:"تصنيفات SI وAI وSIAI العالمية وسوق برامج SASI وأكثر من 100 أداة عبر الإنترنت."
};

export default function Footer({compact=false}:{compact?:boolean}={}){
 const{t,lang,setLang}=useLingxiLang();
 const c=FOOTER_LINKS[lang]??FOOTER_LINKS.en;
 const discovery=SIAI_DISCOVERY[lang];
 const overview=FOOTER_UNIFIED[lang];
 const [copiedMiniapp,setCopiedMiniapp]=useState<"app"|"mail"|null>(null);
 const [copiedQQGroup,setCopiedQQGroup]=useState<string|null>(null);
 async function copyQQGroup(number:string){
  try{await navigator.clipboard.writeText(number);setCopiedQQGroup(number);}
  catch{window.prompt(FOOTER_GROUP_COPY[lang].copy,number);}
 }
 async function copyMiniapp(kind:"app"|"mail"){
  try{await navigator.clipboard.writeText(MINIAPP_COMMANDS[kind]);setCopiedMiniapp(kind);}
  catch{window.prompt(WECHAT_EXTRA[lang].miniapps,MINIAPP_COMMANDS[kind]);}
 }
 const showcase=(<section className="lx-footer-unified lx-footer-v3-showcase" lang={lang==="zh"?"zh-CN":lang} aria-label={overview.headline}>
   <header className="lx-footer-unified-head"><h2>{overview.headline}</h2><p>{overview.intro}</p></header>
   <div className="lx-footer-unified-columns">
    <section className="lx-footer-market" aria-label={overview.headline}>
     <ul>{overview.marketPoints.map(point=><li key={point}><span className="lx-footer-v3-check" aria-hidden="true">✓</span><span>{point}</span></li>)}</ul>
    </section>
    <section className="lx-footer-tools">
     <h3><Link href="/tools">{overview.toolsTitle}</Link></h3>
     <nav className="lx-footer-tool-chips" aria-label={overview.toolsTitle}>{FOOTER_CHIPS[lang].map((label,i)=><Link href={FOOTER_CHIP_URLS[i]} key={label}><span className="lx-footer-v3-chip-icon" aria-hidden="true">{["📕","🖼️","▶","♫","📄","▣","⌘","✦"][i]}</span><span>{label}</span></Link>)}</nav>
    </section>
    <nav className="lx-footer-search-list" aria-label={overview.searchTitle}>
     <h3>{overview.searchTitle}</h3>
     <ol>{discovery.topics.map((topic,i)=><li key={topic.q}><Link href={"/siai#siai-search-ranking-"+i}><span className="lx-footer-search-number">{String(i+1).padStart(2,"0")}</span>{lang==="zh"?FOOTER_QUESTION_ZH[i]:topic.q}</Link></li>)}</ol>
    </nav>
   </div>
   <nav className="lx-footer-v3-toolstrip" aria-label={overview.toolsTitle}>
    {overview.toolCategories.map((item,i)=><Link href={FOOTER_TOOL_LINKS[i]} key={item.title}><span className="lx-footer-v3-toolstrip-icon" aria-hidden="true">{FOOTER_TOOL_ICONS[i]}</span><span><strong>{item.title}</strong><small>{item.description}</small></span></Link>)}
   </nav>
  </section>
);
 return <footer className="lx11-footer lx-branded-footer lx-footer-v3 lx-footer-v4" id="wechat" dir={lang==="ar"?"rtl":"ltr"}>
  {compact?<details className="lx-footer-directory"><summary>{overview.headline}</summary>{showcase}</details>:showcase}
  <div className="lx-footer-v3-sasi">
   <div><strong>✨ {overview.sasiTitle}</strong><span>{overview.sasiDescription}</span></div>
   <Link href="/sasi">{c.sasi} ↗</Link>
  </div>
  <div className="lx11-footer-grid lx-footer-v3-nav lx-footer-v4-nav">
   <section className="lx11-footer-brand">
    <Link className="lx11-footer-logo" href="/" aria-label="LINGXIFIELD"><Image src="/images/lingxifield-logo.png" alt="" width={70} height={70}/><div><b>灵犀场 LINGXIFIELD</b></div></Link>
    <p className="lx-footer-brand-intro">{FOOTER_BRAND_SHORT[lang]}</p>
    <nav className="lx-footer-brand-social" aria-label={lang==="zh"?"官方社交平台与分享入口":"Official social and sharing links"}>{channels.map(channel=><a href={channel.href} key={channel.label} target="_blank" rel="noopener noreferrer" title={channel.label+(channel.kind==="share"?(lang==="zh"?" · 分享链接":" · shared link"):"")} aria-label={channel.label+(channel.kind==="share"?(lang==="zh"?"作品分享":" shared content"):"")}><span className="lx-footer-social-symbol" style={{color:channel.tone}} aria-hidden="true">{channel.mark}</span><span className="lx-footer-social-caption">{channel.short}</span></a>)}</nav>
    <section className="lx-footer-v4-groups" aria-label={FOOTER_GROUP_COPY[lang].title}>
     <h3 className="lx-footer-v4-groups-title"><span aria-hidden="true">◉</span>{FOOTER_GROUP_COPY[lang].title}</h3>
     <div className="lx-footer-v4-qq-heading">{FOOTER_GROUP_COPY[lang].qq}</div>
     <div className="lx-footer-v4-qq-groups" role="group" aria-label={FOOTER_GROUP_COPY[lang].qq}>
      {FOOTER_QQ_GROUPS.map(number=><button key={number} type="button" onClick={()=>void copyQQGroup(number)} title={FOOTER_GROUP_COPY[lang].copy+" "+number} aria-label={FOOTER_GROUP_COPY[lang].copy+" "+number}>
       <span className="lx-footer-v4-group-number" dir="ltr">{number}</span>
       <span className="lx-footer-v4-group-copy" aria-hidden="true">{copiedQQGroup===number?"✓":"⧉"}</span>
      </button>)}
     </div>
     <a className="lx-footer-v4-telegram" href={FOOTER_TELEGRAM} target="_blank" rel="noopener noreferrer" aria-label={FOOTER_GROUP_COPY[lang].telegram+" globalsiai"}>
      <span aria-hidden="true">➤</span><span>{FOOTER_GROUP_COPY[lang].telegram} · @globalsiai</span><span aria-hidden="true">↗</span>
     </a>
    </section>
   </section>
   <nav aria-label={c.rankings}>
    <b className="lx-footer-v4-heading"><span aria-hidden="true">◎</span>{c.rankings}</b>
    <Link href="/siai">{c.rankSub}</Link>
    {discovery.topics.slice(0,4).map((topic,i)=><Link key={topic.q} href={"/siai#siai-search-ranking-"+i}>{topic.q}</Link>)}
    <Link href={"/siai/claim?lang="+lang}>{lang==="zh"?"厂商认领 · 提交 SI/AI 平台":lang==="ja"?"SI/AI製品登録":lang==="ko"?"SI/AI 제품 등록":lang==="fr"?"Proposer un outil SI/IA":lang==="de"?"SI/KI-Produkt einreichen":lang==="es"?"Enviar producto SI/IA":lang==="pt"?"Enviar produto SI/IA":lang==="ar"?"تقديم منتج SI/AI":"Claim or submit SI/AI product"}</Link>
   </nav>
   <nav aria-label={c.sasi}>
    <b className="lx-footer-v4-heading"><span aria-hidden="true">✦</span>{c.sasi}</b>
     <Link href="/sasi">{c.sasi}</Link><Link href="/sasi/seller">{c.seller}</Link><Link href="/account/software">{lang==="zh"?"我的软件":lang==="ja"?"購入済みソフト":lang==="ko"?"내 소프트웨어":lang==="fr"?"Mes logiciels":lang==="de"?"Meine Software":lang==="es"?"Mi software":lang==="pt"?"Meus softwares":lang==="ar"?"برامجي":"My software"}</Link><Link href="/sasi/delivery">{c.delivery}</Link>
   </nav>
   <nav aria-label={c.tools}>
    <b className="lx-footer-v4-heading"><span aria-hidden="true">◇</span>{c.tools}</b>
    <Link href="/tools">{c.all}</Link><Link href="/tools?q=PDF">{c.pdf}</Link>
    <Link href="/tools?q=OCR">{c.ocr}</Link><Link href="/tools?q=视频">{c.video}</Link>
    <Link href="/tools?q=临时邮箱">{c.temp}</Link>
   </nav>
   <nav aria-label={c.account}>
    <b className="lx-footer-v4-heading"><span aria-hidden="true">♙</span>{c.account}</b>
    <Link href="/about">{c.about}</Link><Link href="/account">{copy[lang].account}</Link>
    <Link href="/account/orders">{copy[lang].orders}</Link><Link href="/refunds">{copy[lang].refunds}</Link>
    <Link href="/terms">{c.terms}</Link><Link href="/privacy">{c.privacy}</Link><Link href="/release">{copy[lang].release}</Link>
   </nav>
   <section className="lx-footer-v3-contact lx-footer-v4-contact" aria-label={c.contacts}>
    <b className="lx-footer-v4-heading"><span aria-hidden="true">✉</span>{c.contacts}</b>
    <a className="lx-footer-v4-email" href="mailto:business@lingxifield.com">business@lingxifield.com</a>
    <div className="lx-footer-v4-qr-grid" aria-label={WECHAT_EXTRA[lang].more}>
     <div className="lx-footer-v4-qr-card">
      <Image unoptimized loading="eager" src="/images/lingxifield-wechat-service-qr.jpg" alt={t("service")} width={100} height={100}/>
      <span>{t("service")}</span>
     </div>
     <a className="lx-footer-v4-qr-card" href="http://weixin.qq.com/r/mp/oycQCBfEPUpCrVNr93Kx" target="_blank" rel="noopener noreferrer">
      <Image unoptimized loading="eager" src="/api/public-social-qr?kind=ranking" alt={WECHAT_EXTRA[lang].ranking} width={100} height={100}/>
      <span>{WECHAT_EXTRA[lang].ranking}</span>
     </a>
     <div className="lx-footer-v4-qr-card">
      <Image unoptimized loading="eager" src="/images/miniapp-qrcode.png" alt={t("miniapp")} width={100} height={100}/>
      <span>{t("miniapp")}</span>
     </div>
     <a className="lx-footer-v4-qr-card" href="http://weixin.qq.com/r/mp/_yAoMCzEYnEdrWhT93Xp" target="_blank" rel="noopener noreferrer">
      <Image unoptimized loading="eager" src="/api/public-social-qr?kind=search" alt={WECHAT_EXTRA[lang].search} width={100} height={100}/>
      <span>{WECHAT_EXTRA[lang].search}</span>
     </a>
    </div>
    <div className="lx-footer-v4-miniapp-actions" role="group" aria-label={WECHAT_EXTRA[lang].miniapps}>
     {(["app","mail"] as const).map(kind=><button type="button" key={kind} onClick={()=>void copyMiniapp(kind)}
       title={WECHAT_EXTRA[lang].miniapps+": "+MINIAPP_COMMANDS[kind]}
       aria-label={FOOTER_MINIAPP_ACTIONS[lang].copy+" "+FOOTER_MINIAPP_ACTIONS[lang][kind==="app"?"one":"two"]}>
       <span aria-hidden="true">{copiedMiniapp===kind?"✓":"▣"}</span>
       {copiedMiniapp===kind?FOOTER_MINIAPP_ACTIONS[lang].copied:FOOTER_MINIAPP_ACTIONS[lang][kind==="app"?"one":"two"]}
      </button>)}
    </div>
   </section>
  </div>
  <div className="lx11-footer-legal"><span>© {new Date().getFullYear()} 灵犀场 LINGXIFIELD</span>
   <label className="lx-footer-language"><span aria-hidden="true">🌐</span><select value={lang} aria-label={t("language")} onChange={e=>setLang(e.target.value as LingxiLang)}>{(Object.keys(LANG_NAMES) as LingxiLang[]).map(k=><option value={k} key={k}>{LANG_NAMES[k]}</option>)}</select></label>
   <Link href="/terms">{t("terms")}</Link><Link href="/privacy">{t("privacy")}</Link>
   <Link href="/refunds">{t("refunds")}</Link><Link href="/legal/sasi">{t("sasiRules")}</Link>
   <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer noopener">湘ICP备2026031465号 ↗</a>
  </div>
 </footer>;
}
