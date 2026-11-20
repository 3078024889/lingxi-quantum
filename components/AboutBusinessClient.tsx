"use client";
import Link from "next/link";
import {useLingxiLang, type LingxiLang} from "@/lib/lingxi-i18n";

type AboutCopy={heading:string;intro:string;toolsTitle:string;toolsBody:string;toolsAction:string;softwareTitle:string;softwareBody:string;softwareAction:string;rankingTitle:string;rankingBody:string;rankingAction:string;serviceTitle:string;serviceBody:string;terms:string;refunds:string;privacy:string;contact:string};
const COPY:Record<LingxiLang,AboutCopy>={
  "zh": {
    "heading": "灵犀场，让数字工作更直接",
    "intro": "灵犀场 LINGXIFIELD 提供实用工具、全球 SIAI 模型比较和 SASI 智能软件作品服务。",
    "toolsTitle": "实用工具与 ToolPass",
    "toolsBody": "PDF、图片、视频、文档等 100+ 实用工具。会员期限、费用及权益均在购买前展示。",
    "toolsAction": "查看工具包",
    "softwareTitle": "SASI 智能软件",
    "softwareBody": "展示经审核的软件作品、功能、价格与授权范围。开发者可申请发布，购买与交付以实际开放的支付方式为准。",
    "softwareAction": "浏览软件作品",
    "rankingTitle": "全球 SIAI 排行榜",
    "rankingBody": "对比模型能力、免费额度、价格、地区支持与商用规则。",
    "rankingAction": "查看排行榜",
    "serviceTitle": "购买与客户支持",
    "serviceBody": "所有收费项目在提交支付前说明价格、内容与交付方式。退款、使用条款和隐私政策均可查阅。",
    "terms": "服务条款",
    "refunds": "退款与结算",
    "privacy": "隐私政策",
    "contact": "联系我们"
  },
  "en": {
    "heading": "Practical digital work, made simpler",
    "intro": "LINGXIFIELD provides practical tools, global SIAI model comparisons, and the SASI software marketplace.",
    "toolsTitle": "Practical tools & ToolPass",
    "toolsBody": "Over 100 PDF, image, video, and document tools. Membership duration, pricing, and benefits are shown before purchase.",
    "toolsAction": "View ToolPass",
    "softwareTitle": "SASI software",
    "softwareBody": "Explore reviewed software with clear features, prices and licensing. Developers may submit products; payment and delivery follow the methods currently available.",
    "softwareAction": "Explore software",
    "rankingTitle": "Global SIAI rankings",
    "rankingBody": "Compare model capabilities, free allowances, pricing, regional access, and commercial rights.",
    "rankingAction": "Explore rankings",
    "serviceTitle": "Purchases & support",
    "serviceBody": "Prices, deliverables, and access terms are shown before payment. Refund, service, and privacy information is available.",
    "terms": "Terms of service",
    "refunds": "Refunds & settlement",
    "privacy": "Privacy policy",
    "contact": "Contact us"
  },
  "ja": {
    "heading": "もっとシンプルなデジタル作業へ",
    "intro": "LINGXIFIELDは便利なツール、世界のSIAIモデル比較、SASIソフトウェア作品を提供します。",
    "toolsTitle": "実用ツールとToolPass",
    "toolsBody": "PDF・画像・動画・文書など100種類以上。利用期間、料金、特典を購入前に確認できます。",
    "toolsAction": "ToolPassを見る",
    "softwareTitle": "SASIソフトウェア",
    "softwareBody": "審査済みソフトウェアの機能、価格、ライセンスを確認。開発者は作品を申請でき、決済と配信は利用可能な方法に従います。",
    "softwareAction": "ソフトウェアを見る",
    "rankingTitle": "世界のSIAIランキング",
    "rankingBody": "モデル性能、無料枠、料金、地域対応、商用条件を比較します。",
    "rankingAction": "ランキングを見る",
    "serviceTitle": "購入とサポート",
    "serviceBody": "価格、提供内容、利用条件は支払い前に表示。返金、利用規約、プライバシー情報も確認できます。",
    "terms": "利用規約",
    "refunds": "返金と精算",
    "privacy": "プライバシー",
    "contact": "お問い合わせ"
  },
  "ko": {
    "heading": "더 간편한 디지털 작업",
    "intro": "LINGXIFIELD는 실용 도구, 글로벌 SIAI 모델 비교, SASI 소프트웨어 서비스를 제공합니다.",
    "toolsTitle": "실용 도구 및 ToolPass",
    "toolsBody": "PDF, 이미지, 동영상, 문서 등 100개 이상의 도구. 이용 기간과 가격, 혜택을 구매 전에 확인할 수 있습니다.",
    "toolsAction": "ToolPass 보기",
    "softwareTitle": "SASI 소프트웨어",
    "softwareBody": "심사를 거친 소프트웨어의 기능, 가격 및 라이선스를 확인하세요. 개발자 등록이 가능하며 결제와 전달은 이용 가능한 방식에 따릅니다.",
    "softwareAction": "소프트웨어 보기",
    "rankingTitle": "글로벌 SIAI 순위",
    "rankingBody": "모델 성능, 무료 사용량, 가격, 지역 지원 및 상업적 이용 조건을 비교합니다.",
    "rankingAction": "순위 보기",
    "serviceTitle": "구매 및 지원",
    "serviceBody": "결제 전에 가격, 제공 내용과 이용 조건을 안내합니다. 환불, 약관 및 개인정보 처리방침도 확인할 수 있습니다.",
    "terms": "이용 약관",
    "refunds": "환불 및 정산",
    "privacy": "개인정보 처리방침",
    "contact": "문의하기"
  },
  "fr": {
    "heading": "Le travail numérique, en plus simple",
    "intro": "LINGXIFIELD propose des outils pratiques, un comparateur mondial de modèles SIAI et des logiciels SASI.",
    "toolsTitle": "Outils pratiques et ToolPass",
    "toolsBody": "Plus de 100 outils PDF, image, vidéo et document. Durées, tarifs et avantages sont présentés avant l'achat.",
    "toolsAction": "Voir ToolPass",
    "softwareTitle": "Logiciels SASI",
    "softwareBody": "Découvrez des logiciels vérifiés, leurs fonctions, prix et licences. Les développeurs peuvent proposer des produits ; les paiements dépendent des moyens disponibles.",
    "softwareAction": "Voir les logiciels",
    "rankingTitle": "Classement mondial SIAI",
    "rankingBody": "Comparez les capacités, quotas gratuits, tarifs, régions et licences commerciales des modèles.",
    "rankingAction": "Voir le classement",
    "serviceTitle": "Achats et assistance",
    "serviceBody": "Tarifs, contenus et conditions d'accès sont précisés avant paiement. Consultez aussi les remboursements, conditions et données privées.",
    "terms": "Conditions d'utilisation",
    "refunds": "Remboursements",
    "privacy": "Confidentialité",
    "contact": "Nous contacter"
  },
  "de": {
    "heading": "Digitale Arbeit einfacher machen",
    "intro": "LINGXIFIELD bietet praktische Tools, globale SIAI-Modellvergleiche und SASI-Software.",
    "toolsTitle": "Praktische Tools und ToolPass",
    "toolsBody": "Über 100 PDF-, Bild-, Video- und Dokumenttools. Laufzeit, Preise und Leistungen werden vor dem Kauf angezeigt.",
    "toolsAction": "ToolPass ansehen",
    "softwareTitle": "SASI-Software",
    "softwareBody": "Geprüfte Software mit klaren Funktionen, Preisen und Lizenzen. Entwickler können Produkte einreichen; Zahlung und Lieferung richten sich nach verfügbaren Verfahren.",
    "softwareAction": "Software ansehen",
    "rankingTitle": "Globales SIAI-Ranking",
    "rankingBody": "Modellfähigkeiten, Gratisvolumen, Preise, Regionen und gewerbliche Rechte vergleichen.",
    "rankingAction": "Ranking ansehen",
    "serviceTitle": "Kauf und Support",
    "serviceBody": "Preise, Leistungen und Zugangsbedingungen erscheinen vor der Zahlung. Rückerstattung, AGB und Datenschutz sind einsehbar.",
    "terms": "Nutzungsbedingungen",
    "refunds": "Rückerstattungen",
    "privacy": "Datenschutz",
    "contact": "Kontakt"
  },
  "es": {
    "heading": "Trabajo digital, más sencillo",
    "intro": "LINGXIFIELD ofrece herramientas prácticas, comparaciones globales de modelos SIAI y software SASI.",
    "toolsTitle": "Herramientas y ToolPass",
    "toolsBody": "Más de 100 herramientas para PDF, imágenes, vídeos y documentos. Duración, precios y ventajas se muestran antes de comprar.",
    "toolsAction": "Ver ToolPass",
    "softwareTitle": "Software SASI",
    "softwareBody": "Software revisado con funciones, precios y licencias claras. Los desarrolladores pueden proponer productos; pagos y entregas dependen de los métodos disponibles.",
    "softwareAction": "Explorar software",
    "rankingTitle": "Clasificación global SIAI",
    "rankingBody": "Compara capacidades, cuotas gratuitas, precios, regiones y derechos comerciales de los modelos.",
    "rankingAction": "Ver clasificación",
    "serviceTitle": "Compras y asistencia",
    "serviceBody": "Los precios, productos y condiciones aparecen antes del pago. Consulta reembolsos, términos y privacidad.",
    "terms": "Condiciones de servicio",
    "refunds": "Reembolsos",
    "privacy": "Privacidad",
    "contact": "Contacto"
  },
  "pt": {
    "heading": "Trabalho digital mais simples",
    "intro": "A LINGXIFIELD oferece ferramentas práticas, comparações globais de modelos SIAI e software SASI.",
    "toolsTitle": "Ferramentas e ToolPass",
    "toolsBody": "Mais de 100 ferramentas para PDF, imagens, vídeos e documentos. Duração, preços e benefícios aparecem antes da compra.",
    "toolsAction": "Ver ToolPass",
    "softwareTitle": "Software SASI",
    "softwareBody": "Programas revisados com funções, preços e licenças claras. Desenvolvedores podem enviar produtos; pagamentos e entregas seguem os métodos disponíveis.",
    "softwareAction": "Explorar software",
    "rankingTitle": "Ranking global SIAI",
    "rankingBody": "Compare capacidades, cotas gratuitas, preços, regiões e direitos comerciais de modelos.",
    "rankingAction": "Ver ranking",
    "serviceTitle": "Compras e suporte",
    "serviceBody": "Preços, entregas e condições são informados antes do pagamento. Consulte reembolsos, termos e privacidade.",
    "terms": "Termos de serviço",
    "refunds": "Reembolsos",
    "privacy": "Privacidade",
    "contact": "Contato"
  },
  "ar": {
    "heading": "عمل رقمي أبسط وأكثر وضوحاً",
    "intro": "توفر LINGXIFIELD أدوات عملية ومقارنات عالمية لنماذج SIAI وبرامج SASI.",
    "toolsTitle": "الأدوات العملية وToolPass",
    "toolsBody": "أكثر من 100 أداة لملفات PDF والصور والفيديو والمستندات. تظهر المدة والأسعار والمزايا قبل الشراء.",
    "toolsAction": "عرض ToolPass",
    "softwareTitle": "برامج SASI",
    "softwareBody": "استكشف البرامج التي تمت مراجعتها مع توضيح الميزات والأسعار والتراخيص. يمكن للمطورين تقديم منتجات وتخضع المدفوعات والتسليم للطرق المتاحة.",
    "softwareAction": "تصفح البرامج",
    "rankingTitle": "تصنيفات SIAI العالمية",
    "rankingBody": "قارن قدرات النماذج والحصص المجانية والأسعار والتوفر الإقليمي وحقوق الاستخدام التجاري.",
    "rankingAction": "عرض التصنيفات",
    "serviceTitle": "المشتريات والدعم",
    "serviceBody": "تُعرض الأسعار والمحتويات وشروط الوصول قبل الدفع. تتوفر سياسات الاسترداد والخدمة والخصوصية.",
    "terms": "شروط الخدمة",
    "refunds": "الاسترداد والتسوية",
    "privacy": "الخصوصية",
    "contact": "اتصل بنا"
  }
};

export default function AboutBusinessClient(){
 const {lang}=useLingxiLang();
 const c=COPY[lang]||COPY.en;
 const cards=[
  {name:c.toolsTitle,body:c.toolsBody,href:"/tools/pass",cta:c.toolsAction},
  {name:c.softwareTitle,body:c.softwareBody,href:"/sasi/marketplace",cta:c.softwareAction},
  {name:c.rankingTitle,body:c.rankingBody,href:"/siai",cta:c.rankingAction},
 ];
 return <main className="lx11-page" dir={lang==="ar"?"rtl":"ltr"}>
  <div className="lx11-wrap py-16 sm:py-20">
   <section className="max-w-4xl">
    <p className="lx11-kicker">LINGXIFIELD</p>
    <h1 className="mt-4 font-display text-4xl font-light text-[var(--lx-ink)] sm:text-5xl">{c.heading}</h1>
    <p className="mt-6 text-lg leading-9 text-[var(--lx-muted)]">{c.intro}</p>
   </section>
   <section className="mt-14 grid gap-5 md:grid-cols-3">
    {cards.map(card=><article key={card.href} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7">
     <h2 className="font-display text-2xl text-[var(--lx-ink)]">{card.name}</h2>
     <p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">{card.body}</p>
     <Link href={card.href} className="mt-5 inline-block text-sm font-semibold">{card.cta}</Link>
    </article>)}
   </section>
   <section className="mt-14 rounded-2xl border border-[var(--lx-line)] p-7">
    <h2 className="font-display text-2xl text-[var(--lx-ink)]">{c.serviceTitle}</h2>
    <p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">{c.serviceBody}</p>
    <nav aria-label={c.serviceTitle} className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
     <Link href="/terms">{c.terms}</Link>
     <Link href="/refunds">{c.refunds}</Link>
     <Link href="/privacy">{c.privacy}</Link>
    </nav>
   </section>
   <section className="mt-10 text-sm leading-7 text-[var(--lx-muted)]">
    <p>{c.contact}: <a href="mailto:support@lingxifield.com">support@lingxifield.com</a></p>
   </section>
  </div>
 </main>;
}
