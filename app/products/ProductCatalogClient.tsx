"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";
import { getProduct } from "@/lib/plans";

type Localized=Record<LingxiLang,string>;
const l=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Localized=>({zh,en,ja,ko,fr,de,es,pt,ar});
const pick=(x:Localized,lang:LingxiLang)=>x[lang]||x.en;

const COPY={
  kicker:l("灵犀场 · 产品中心","LINGXIFIELD · Product Center","LINGXIFIELD · プロダクトセンター","LINGXIFIELD · 제품 센터","LINGXIFIELD · Centre produits","LINGXIFIELD · Produktzentrum","LINGXIFIELD · Centro de productos","LINGXIFIELD · Central de produtos","LINGXIFIELD · مركز المنتجات"),
  title:l("产品中心","Product Center","プロダクトセンター","제품 센터","Centre produits","Produktzentrum","Centro de productos","Central de produtos","مركز المنتجات"),
  lead:l("充值、AI 服务、SASI 创作与数字服务，都从这里进入。先看清服务与消耗方式，再决定是否使用或购买。","Top up, use AI services, enter SASI creation, and browse digital services from one place. Review how each service works and charges before using it.","チャージ、AIサービス、SASI制作、デジタルサービスをここから利用できます。内容と消費方法を確認してから利用・購入できます。","충전, AI 서비스, SASI 제작, 디지털 서비스를 한곳에서 이용하세요. 사용 및 구매 전에 서비스와 과금 방식을 확인할 수 있습니다.","Recharge, services IA, création SASI et services numériques sont réunis ici. Consultez le fonctionnement et la facturation avant utilisation.","Aufladen, KI-Dienste, SASI-Erstellung und digitale Dienste an einem Ort. Prüfen Sie Leistung und Abrechnung vor der Nutzung.","Recarga, servicios de IA, creación SASI y servicios digitales desde un solo lugar. Revisa el funcionamiento y el cobro antes de usar.","Recarga, serviços de IA, criação SASI e serviços digitais em um só lugar. Confira funcionamento e cobrança antes de usar.","الشحن وخدمات الذكاء الاصطناعي وإنشاء SASI والخدمات الرقمية في مكان واحد. راجع طريقة الخدمة والتكلفة قبل الاستخدام."),
  recharge:l("充值入口","Recharge","チャージ","충전","Recharge","Aufladen","Recarga","Recarga","الشحن"),
  rechargeLead:l("余额只有在你主动使用对应服务时才扣除。AI 余额与 SASI 创作余额分别管理。","Balances are deducted only when you intentionally use the corresponding service. AI balance and SASI creation balance are managed separately.","残高は対象サービスを自分で使用したときだけ消費されます。AI残高とSASI制作残高は別管理です。","해당 서비스를 직접 사용할 때만 잔액이 차감됩니다. AI 잔액과 SASI 제작 잔액은 별도로 관리됩니다.","Le solde n’est débité que lorsque vous utilisez volontairement le service. Solde IA et solde de création SASI sont séparés.","Guthaben wird nur bei bewusster Nutzung des jeweiligen Dienstes abgezogen. KI- und SASI-Erstellungsguthaben werden getrennt geführt.","El saldo solo se descuenta cuando usas voluntariamente el servicio. El saldo IA y el de creación SASI se gestionan por separado.","O saldo só é descontado quando você usa o serviço de forma intencional. Saldo de IA e saldo de criação SASI são separados.","لا يُخصم الرصيد إلا عند استخدام الخدمة المقابلة بإرادتك. يُدار رصيد الذكاء الاصطناعي ورصيد إنشاء SASI بشكل منفصل."),
  aiBalance:l("AI 余额","AI Balance","AI 残高","AI 잔액","Solde IA","KI-Guthaben","Saldo IA","Saldo IA","رصيد الذكاء الاصطناعي"),
  aiBalanceLead:l("用于书本 SASI、学习 SASI、科研 SASI，以及需要托管 AI 的功能。按实际模型用量扣费。","Used by Book SASI, Learning SASI, Research SASI and hosted-AI features. Charged by actual model usage.","Book SASI、学習 SASI、研究 SASI、ホスト型AI機能で使用。実際のモデル使用量で課金されます。","Book SASI, 학습 SASI, 연구 SASI 및 호스팅 AI 기능에 사용됩니다. 실제 모델 사용량에 따라 차감됩니다.","Utilisé par Book SASI, Learning SASI, Research SASI et les fonctions IA hébergées. Facturation selon l’usage réel.","Für Book SASI, Lern-SASI, Forschungs-SASI und gehostete KI-Funktionen. Abrechnung nach tatsächlicher Nutzung.","Para Book SASI, Learning SASI, Research SASI y funciones de IA alojada. Se cobra según el uso real.","Usado por Book SASI, Learning SASI, Research SASI e recursos de IA hospedada. Cobrança pelo uso real.","يُستخدم في Book SASI وLearning SASI وResearch SASI وميزات الذكاء الاصطناعي المستضافة، مع احتساب الاستخدام الفعلي."),
  sasiBalance:l("SASI 创作余额","SASI Creation Balance","SASI 制作残高","SASI 제작 잔액","Solde de création SASI","SASI-Erstellungsguthaben","Saldo de creación SASI","Saldo de criação SASI","رصيد إنشاء SASI"),
  sasiBalanceLead:l("用于你明确确认后的 SASI 创作与生产任务。与 AI 余额分开，方便核对成本。","Used for SASI creation and production tasks you explicitly approve. Separate from AI balance for clear cost tracking.","明示的に確認したSASI制作・生産タスクに使用。AI残高とは分離されています。","명시적으로 승인한 SASI 제작·생산 작업에 사용합니다. AI 잔액과 분리됩니다.","Pour les tâches de création et de production SASI que vous approuvez explicitement, séparé du solde IA.","Für ausdrücklich bestätigte SASI-Erstellungs- und Produktionsaufgaben, getrennt vom KI-Guthaben.","Para tareas de creación y producción SASI que apruebes explícitamente, separado del saldo IA.","Para tarefas de criação e produção SASI aprovadas explicitamente, separado do saldo de IA.","لمهام إنشاء وإنتاج SASI التي توافق عليها صراحةً، بشكل منفصل عن رصيد الذكاء الاصطناعي."),
  current:l("当前余额","Current balance","現在の残高","현재 잔액","Solde actuel","Aktuelles Guthaben","Saldo actual","Saldo atual","الرصيد الحالي"),
  loginView:l("登录后查看","Sign in to view","ログインして確認","로그인 후 확인","Connectez-vous pour voir","Zum Anzeigen anmelden","Inicia sesión para ver","Entre para ver","سجّل الدخول للعرض"),
  wallet:l("进入 AI 余额","Open AI Balance","AI残高へ","AI 잔액 열기","Ouvrir le solde IA","KI-Guthaben öffnen","Abrir saldo IA","Abrir saldo IA","فتح رصيد الذكاء الاصطناعي"),
  aiServices:l("AI 服务","AI Services","AIサービス","AI 서비스","Services IA","KI-Dienste","Servicios de IA","Serviços de IA","خدمات الذكاء الاصطناعي"),
  aiServicesLead:l("同一份资料，可以按任务复杂度选择轻量、标准或高智能。三档现在不仅界面不同，模型深度、证据量、输出长度与最低扣费也会真实区分。","Choose Light, Standard or High intelligence by task complexity. The tiers now differ in reasoning depth, evidence volume, output length and minimum charge—not just appearance.","タスクの複雑さに応じて軽量・標準・高知能を選択。推論深度、証拠量、出力長、最低料金が実際に異なります。","작업 복잡도에 따라 라이트·표준·고지능을 선택하세요. 추론 깊이, 근거량, 출력 길이, 최소 차감액이 실제로 달라집니다.","Choisissez Léger, Standard ou Haute intelligence selon la complexité. Profondeur, volume de preuves, longueur et minimum facturé diffèrent réellement.","Wählen Sie Leicht, Standard oder Hohe Intelligenz. Tiefe, Belegmenge, Ausgabelänge und Mindestabrechnung unterscheiden sich tatsächlich.","Elige Ligero, Estándar o Alta inteligencia. La profundidad, evidencia, longitud y cobro mínimo son realmente distintos.","Escolha Leve, Padrão ou Alta inteligência. Profundidade, evidências, extensão e cobrança mínima são realmente diferentes.","اختر الخفيف أو القياسي أو الذكاء العالي حسب تعقيد المهمة؛ تختلف فعليًا في العمق والأدلة وطول الإجابة والحد الأدنى للتكلفة."),
  digital:l("数字服务","Digital Services","デジタルサービス","디지털 서비스","Services numériques","Digitale Dienste","Servicios digitales","Serviços digitais","الخدمات الرقمية"),
  digitalLead:l("完成服务所需资料后再进入支付。支付成功后自动解锁或生成，并保存在账户中。","Complete the required input before checkout. After payment, the service is unlocked or generated automatically and saved to your account.","必要な情報を入力してから決済へ進みます。支払い後、自動で解除または生成され、アカウントに保存されます。","필요한 정보를 입력한 뒤 결제합니다. 결제 성공 후 자동으로 활성화 또는 생성되어 계정에 저장됩니다.","Complétez les informations requises avant paiement. Après paiement, le service est activé ou généré et enregistré dans votre compte.","Füllen Sie erforderliche Angaben vor dem Checkout aus. Nach Zahlung wird der Dienst automatisch freigeschaltet oder erstellt und im Konto gespeichert.","Completa los datos requeridos antes de pagar. Tras el pago, el servicio se desbloquea o genera y se guarda en tu cuenta.","Preencha os dados necessários antes do pagamento. Depois, o serviço é liberado ou gerado e salvo na conta.","أكمل البيانات المطلوبة قبل الدفع. بعد نجاح الدفع تُفتح الخدمة أو تُنشأ تلقائيًا وتُحفظ في حسابك."),
  view:l("查看服务","View service","サービスを見る","서비스 보기","Voir le service","Dienst ansehen","Ver servicio","Ver serviço","عرض الخدمة"),
  price:l("价格","Price","料金","가격","Prix","Preis","Precio","Preço","السعر"),
  delivery:l("交付","Delivery","提供","제공","Livraison","Bereitstellung","Entrega","Entrega","التسليم"),
  reportDelivery:l("在线生成；支付成功后自动解锁，账户中可继续查看。","Generated online; unlocked after payment and available in your account.","オンライン生成。支払い後に自動解除され、アカウントから再閲覧できます。","온라인 생성. 결제 후 자동 활성화되며 계정에서 다시 볼 수 있습니다.","Généré en ligne, déverrouillé après paiement et accessible depuis votre compte.","Online erstellt, nach Zahlung freigeschaltet und im Konto abrufbar.","Generado en línea, desbloqueado tras el pago y disponible en tu cuenta.","Gerado online, liberado após o pagamento e disponível na conta.","يُنشأ عبر الإنترنت ويُفتح بعد الدفع ويمكن الرجوع إليه من الحساب."),
  accessDelivery:l("固定期限数字服务；支付后自动开通，不自动续费。","Fixed-term digital access; activated after payment with no automatic renewal.","期間固定のデジタルサービス。支払い後に開通し、自動更新はありません。","고정 기간 디지털 서비스. 결제 후 활성화되며 자동 갱신되지 않습니다.","Accès numérique à durée fixe, activé après paiement sans renouvellement automatique.","Befristeter digitaler Zugang, nach Zahlung aktiviert, ohne automatische Verlängerung.","Acceso digital por plazo fijo, activado tras el pago y sin renovación automática.","Acesso digital por prazo fixo, ativado após pagamento e sem renovação automática.","وصول رقمي لمدة محددة، يُفعّل بعد الدفع ولا يتجدد تلقائيًا."),
  policy:l("订单、退款与服务规则","Orders, refunds & service rules","注文・返金・サービス規則","주문·환불·서비스 규정","Commandes, remboursements et règles","Bestellungen, Rückerstattungen & Regeln","Pedidos, reembolsos y reglas","Pedidos, reembolsos e regras","الطلبات والاسترداد وقواعد الخدمة"),
};

const DIGITAL=[
  ["life-map-report","/life-map",l("生命图谱完整报告","Full Life Map Report","生命図 完全レポート","생명 지도 전체 보고서","Rapport complet de carte de vie","Vollständiger Lebenskarte-Bericht","Informe completo de mapa vital","Relatório completo de mapa de vida","تقرير خريطة الحياة الكامل"),"report"],
  ["relationship-resonance","/relationship",l("关系共振图谱","Relationship Resonance Map","関係共鳴マップ","관계 공명 지도","Carte de résonance relationnelle","Beziehungsresonanz-Karte","Mapa de resonancia relacional","Mapa de ressonância relacional","خريطة رنين العلاقات"),"report"],
  ["qian-reading","/qian",l("生命灵签 · 场域解读","Life Oracle · Field Reading","生命オラクル · フィールド解読","생명 오라클 · 필드 리딩","Oracle de vie · Lecture du champ","Lebensorakel · Felddeutung","Oráculo de vida · Lectura de campo","Oráculo da vida · Leitura de campo","أوراكل الحياة · قراءة المجال"),"report"],
  ["tarot-reading","/mirror",l("量子生命镜像 · 深度解读","Quantum Life Mirror · Deep Reading","量子生命ミラー · 深層解読","양자 생명 거울 · 심층 해석","Miroir quantique de vie · Lecture approfondie","Quanten-Lebensspiegel · Tiefendeutung","Espejo cuántico de vida · Lectura profunda","Espelho quântico da vida · Leitura profunda","مرآة الحياة الكمية · قراءة عميقة"),"report"],
  ["resilience-report","/resilience",l("生命韧性指数 · 完整档案","Life Resilience Index · Full Archive","生命レジリエンス指数 · 完全アーカイブ","생명 회복탄력성 지수 · 전체 아카이브","Indice de résilience de vie · Archive complète","Lebensresilienz-Index · Vollständiges Archiv","Índice de resiliencia vital · Archivo completo","Índice de resiliência da vida · Arquivo completo","مؤشر مرونة الحياة · الأرشيف الكامل"),"report"],
  ["romance-report","/romance",l("桃花磁场指数 · 完整档案","Romance Resonance Index · Full Archive","恋愛磁場指数 · 完全アーカイブ","연애 공명 지수 · 전체 아카이브","Indice de résonance romantique · Archive complète","Romanzresonanz-Index · Vollständiges Archiv","Índice de resonancia romántica · Archivo completo","Índice de ressonância romântica · Arquivo completo","مؤشر الرنين العاطفي · الأرشيف الكامل"),"report"],
  ["daily-tide-report","/daily",l("今日潮汐 · 深度报告","Today’s Tide · Deep Report","今日の潮流 · 詳細レポート","오늘의 흐름 · 심층 보고서","Marée du jour · Rapport approfondi","Tagesrhythmus · Tiefenbericht","Marea de hoy · Informe profundo","Maré de hoje · Relatório profundo","مدّ اليوم · تقرير متعمق"),"report"],
  ["wealth-report","/wealth",l("财富创造地图 · 完整档案","Wealth Creation Map · Full Archive","富の創造マップ · 完全アーカイブ","부 창조 지도 · 전체 아카이브","Carte de création de richesse · Archive complète","Wohlstands-Schöpfungskarte · Vollständiges Archiv","Mapa de creación de riqueza · Archivo completo","Mapa de criação de riqueza · Arquivo completo","خريطة صنع الثروة · الأرشيف الكامل"),"report"],
  ["day","/membership#manifestation",l("一念显化 · 单日体验","Manifestation · One-Day Pass","顕現 · 1日体験","현현 · 1일 이용권","Manifestation · Pass 1 jour","Manifestation · Tagespass","Manifestación · Pase de un día","Manifestação · Passe de um dia","التجلّي · دخول ليوم واحد"),"access"],
  ["month","/membership#manifestation",l("一念显化 · 月度服务","Manifestation · Monthly","顕現 · 月間","현현 · 월간","Manifestation · Mensuel","Manifestation · Monatlich","Manifestación · Mensual","Manifestação · Mensal","التجلّي · شهري"),"access"],
  ["year","/membership#manifestation",l("一念显化 · 年度服务","Manifestation · Yearly","顕現 · 年間","현현 · 연간","Manifestation · Annuel","Manifestation · Jährlich","Manifestación · Anual","Manifestação · Anual","التجلّي · سنوي"),"access"],
] as const;

const AI_SERVICES=[
  {href:"/ai-knowledge",code:"BK",title:l("书本 SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI","Book SASI"),desc:l("把书本与资料变成可以持续追问的知识工作区。","Turn books and sources into a knowledge workspace you can keep questioning.","本や資料を継続して質問できる知識ワークスペースへ。","책과 자료를 계속 질문할 수 있는 지식 작업 공간으로 바꿉니다.","Transformez livres et sources en espace de connaissances interrogeable.","Bücher und Quellen werden zu einem weiter befragbaren Wissensraum.","Convierte libros y fuentes en un espacio de conocimiento consultable.","Transforme livros e fontes em um espaço de conhecimento consultável.","حوّل الكتب والمصادر إلى مساحة معرفة يمكن مواصلة سؤالها.")},
  {href:"/ai-learning",code:"ST",title:l("学习 SASI","Learning SASI","学習 SASI","학습 SASI","Learning SASI","Lern-SASI","Learning SASI","Learning SASI","Learning SASI"),desc:l("用于教材、笔记、复习与理解，基于原文证据回答。","For textbooks, notes, revision and understanding, grounded in source evidence.","教材・ノート・復習・理解のために、原文証拠に基づいて回答します。","교재, 노트, 복습, 이해를 위해 원문 근거에 기반해 답합니다.","Pour manuels, notes, révisions et compréhension, avec preuves du texte source.","Für Lehrbücher, Notizen, Wiederholung und Verständnis auf Basis von Quellbelegen.","Para libros, notas, repaso y comprensión con evidencia de la fuente.","Para livros, notas, revisão e compreensão com evidências da fonte.","للكتب والملاحظات والمراجعة والفهم اعتمادًا على أدلة المصدر.")},
  {href:"/ai-research",code:"RS",title:l("科研 SASI","Research SASI","研究 SASI","연구 SASI","Research SASI","Forschungs-SASI","Research SASI","Research SASI","Research SASI"),desc:l("用于论文、研究笔记、多资料比较与更深的证据推理。","For papers, research notes, source comparison and deeper evidence reasoning.","論文、研究ノート、資料比較、より深い証拠推論に。","논문, 연구 노트, 자료 비교, 더 깊은 근거 추론에 사용합니다.","Pour articles, notes de recherche, comparaison de sources et raisonnement approfondi.","Für Papers, Forschungsnotizen, Quellenvergleich und tiefere Begründung.","Para artículos, notas de investigación, comparación de fuentes y razonamiento profundo.","Para artigos, notas de pesquisa, comparação de fontes e raciocínio profundo.","للأبحاث والملاحظات ومقارنة المصادر والاستدلال الأعمق.")},
];

export default function ProductCatalogClient(){
  const {lang}=useLingxiLang();
  const t=(k:keyof typeof COPY)=>pick(COPY[k],lang);
  const [wallet,setWallet]=useState<number|null>(null);
  const [walletState,setWalletState]=useState<"loading"|"ready"|"login">("loading");

  useEffect(()=>{
    let alive=true;
    fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{
      const d=await r.json().catch(()=>({}));
      if(!alive)return;
      if(r.ok){setWallet(Number(d.balanceRmb||0));setWalletState("ready")}
      else setWalletState("login");
    }).catch(()=>{if(alive)setWalletState("login")});
    return()=>{alive=false};
  },[]);

  return <main className="lx11-page lx-products-page lx-product-center-v141">
    <div className="lx11-wrap">
      <section className="lx-pc-hero">
        <div>
          <p className="lx11-kicker">{t("kicker")}</p>
          <h1>{t("title")}</h1>
          <p>{t("lead")}</p>
        </div>
        <div className="lx-pc-hero-actions">
          <Link className="is-primary" href="/ai-wallet">{t("recharge")}</Link>
          <Link href="/account/orders">{pick(l("我的订单","My Orders","注文履歴","내 주문","Mes commandes","Meine Bestellungen","Mis pedidos","Meus pedidos","طلباتي"),lang)}</Link>
        </div>
      </section>

      <section className="lx-pc-recharge">
        <div className="lx-pc-section-head">
          <div><span>01</span><h2>{t("recharge")}</h2></div>
          <p>{t("rechargeLead")}</p>
        </div>
        <div className="lx-pc-recharge-grid">
          <article className="lx-pc-balance-card is-ai">
            <div className="lx-pc-card-head"><span>AI BALANCE</span><b>{t("aiBalance")}</b></div>
            <p>{t("aiBalanceLead")}</p>
            <div className="lx-pc-current">
              <span>{t("current")}</span>
              <strong>{walletState==="ready"&&wallet!==null?`¥${wallet.toFixed(2)}`:t("loginView")}</strong>
            </div>
            <div className="lx-pc-topups">
              {[10,30,50,100].map(n=><Link key={n} href={`/checkout?productId=ai-balance-${n}&redirect=/products`}>¥{n}</Link>)}
            </div>
            <Link className="lx-pc-text-link" href="/ai-wallet">{t("wallet")} →</Link>
          </article>

          <article className="lx-pc-balance-card">
            <div className="lx-pc-card-head"><span>SASI PRODUCTION</span><b>{t("sasiBalance")}</b></div>
            <p>{t("sasiBalanceLead")}</p>
            <div className="lx-pc-current">
              <span>{pick(l("按任务确认后使用","Used after task approval","タスク確認後に使用","작업 승인 후 사용","Utilisé après validation","Nach Aufgabenbestätigung","Se usa tras aprobación","Usado após aprovação","يُستخدم بعد الموافقة على المهمة"),lang)}</span>
              <strong>SASI</strong>
            </div>
            <div className="lx-pc-topups">
              {[20,50,100,500].map(n=><Link key={n} href={`/checkout?productId=${n===20?"sasi-credit-entry":n===50?"sasi-balance-50":n===100?"sasi-credit-studio":"sasi-credit-reserve"}&redirect=/products`}>¥{n}</Link>)}
            </div>
            <Link className="lx-pc-text-link" href="/sasi">{pick(l("进入 SASI 创作","Open SASI creation","SASI制作へ","SASI 제작 열기","Ouvrir la création SASI","SASI-Erstellung öffnen","Abrir creación SASI","Abrir criação SASI","فتح إنشاء SASI"),lang)} →</Link>
          </article>
        </div>
      </section>

      <section className="lx-pc-section">
        <div className="lx-pc-section-head">
          <div><span>02</span><h2>{t("aiServices")}</h2></div>
          <p>{t("aiServicesLead")}</p>
        </div>
        <div className="lx-pc-ai-grid">
          {AI_SERVICES.map(item=><Link href={item.href} key={item.href} className="lx-pc-ai-card">
            <span>{item.code}</span>
            <div><h3>{pick(item.title,lang)}</h3><p>{pick(item.desc,lang)}</p></div>
            <div className="lx-pc-tier-line"><b>{pick(l("轻量","Light","軽量","라이트","Léger","Leicht","Ligero","Leve","خفيف"),lang)} 1×</b><b>{pick(l("标准","Standard","標準","표준","Standard","Standard","Estándar","Padrão","قياسي"),lang)} 2×</b><b>{pick(l("高智能","High","高知能","고지능","Haute","Hoch","Alta","Alta","عالٍ"),lang)} 5×</b></div>
          </Link>)}
        </div>
      </section>

      <section className="lx-pc-section">
        <div className="lx-pc-section-head">
          <div><span>03</span><h2>{t("digital")}</h2></div>
          <p>{t("digitalLead")}</p>
        </div>
        <div className="lx-products-grid lx-pc-digital-grid">
          {DIGITAL.map(([id,href,name,kind])=>{
            const p=getProduct(id);if(!p)return null;
            return <article key={id} className="lx-product-card">
              <div className="lx-product-card-top">
                <div><small>DIGITAL SERVICE</small><h3>{pick(name,lang)}</h3></div>
                <strong>¥{p.priceRmb}</strong>
              </div>
              <p>{lang==="zh"?p.note:p.noteEn}</p>
              <dl>
                <div><dt>{t("price")}</dt><dd>¥{p.priceRmb}</dd></div>
                <div><dt>{t("delivery")}</dt><dd>{kind==="access"?t("accessDelivery"):t("reportDelivery")}</dd></div>
              </dl>
              <Link href={href}>{t("view")} →</Link>
            </article>;
          })}
        </div>
      </section>

      <aside className="lx-products-policy lx-pc-policy">
        <h2>{t("policy")}</h2>
        <div>
          <Link href="/account/orders">{pick(l("我的订单","Orders","注文履歴","내 주문","Commandes","Bestellungen","Pedidos","Pedidos","الطلبات"),lang)}</Link>
          <Link href="/refunds">{pick(l("充值与退款","Refunds","チャージと返金","충전 및 환불","Remboursements","Rückerstattungen","Reembolsos","Reembolsos","الاسترداد"),lang)}</Link>
          <Link href="/terms">{pick(l("用户服务协议","Terms","利用規約","이용약관","Conditions","Nutzungsbedingungen","Términos","Termos","الشروط"),lang)}</Link>
          <Link href="/privacy">{pick(l("隐私政策","Privacy","プライバシー","개인정보","Confidentialité","Datenschutz","Privacidad","Privacidade","الخصوصية"),lang)}</Link>
        </div>
      </aside>
    </div>
  </main>;
}
