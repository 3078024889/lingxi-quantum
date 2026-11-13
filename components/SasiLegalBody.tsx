"use client";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
type Content={title:string;intro:string;back:string;sections:readonly [string,string][]};
const COPY:Record<LingxiLang,Content>={
zh:{title:"SASI 软件市场 · 规则与系统声明",intro:"以下说明适用于灵犀场的软件展示、开发者发布、购买与交付。具体订单的许可范围以商品页和购买时确认的条款为准。",back:"返回软件市场",sections:[
["服务范围","平台提供在线实用工具、全球 SIAI 排行榜及 SASI 智能软件市场。当前服务范围以公开页面和商品说明为准；历史订单、已取得的权益和售后资料仍按原规则保留。"],
["开发者权利与源码授权","卖家须有权销售所上传的软件及源码，并如实说明运行环境、第三方依赖、许可方式和使用限制。哥白尼 SI9.5 当前仅提供源码授权商品；其他卖家可依各自权利提供成品软件。"],
["付款与安全交付","提交付款前展示商品、计价币种、价格和可用渠道。只有在有效付款回执、商品文件及订单授权通过核验后才开放私有文件下载。未完成验收的支付或交付渠道不得展示为已可用。"],
["卖家服务与售后","卖家服务费和结算条件在申请勾选协议时明确展示，用户购买费用在付款确认前显示。退款、撤销及售后按适用法律、已确认的许可条款和对应订单状态处理。"],
["隐私与账户安全","账户、订单、上传文件及必要日志仅在服务、安全审计和法定义务范围内处理。非公开源码保存在受控存储中，不因商品上架而成为公共下载资源。"],
["交易软件风险","EA、指标和回测工具属于软件产品，不构成盈利承诺或投资建议。模拟账户仅提供只读观察，不开放交易、修改参数或资金操作。"]]},
en:{title:"SASI Software · Terms & Service Notice",intro:"These terms cover software discovery, developer publishing, purchases and delivery. Product-specific licensing is governed by the terms presented at checkout.",back:"Back to marketplace",sections:[
["Service scope","LINGXIFIELD offers practical tools, the global SIAI directory and the SASI software marketplace. New image, drama and video-generation tasks are retired. Existing orders, entitlements and support records remain preserved."],
["Publisher rights","Publishers must own or be licensed to distribute software and source code, and disclose system requirements, dependencies and license limitations. Copernicus SI9.5 is offered only as a source-code license; other publishers may offer finished software."],
["Payment and delivery","Products show prices, currencies and supported payment channels before confirmation. Private downloads unlock only after payment, file integrity and order entitlement are verified. Unverified channels remain disabled."],
["Seller terms and remedies","The applicable seller fee and settlement conditions appear in the seller-acceptance checkbox. Refunds and disputes follow applicable law, the accepted license and the order state."],
["Privacy and security","Account, order, uploaded-file and necessary security records are processed only for service, protection and legal obligations. Private source packages never become public merely because a listing is published."],
["Trading software risks","EAs, indicators and backtesting software do not guarantee financial results or constitute investment advice. Demo accounts permit observation only, not trading or funds access."]]},
ja:{title:"SASI ソフトウェア｜規約とサービス告知",intro:"ソフトウェアの掲載、開発者による公開、購入、引き渡しに適用されます。個別のライセンスは購入時の表示内容に従います。",back:"市場へ戻る",sections:[
["サービス範囲","実用ツール、世界 SIAI ディレクトリ、SASI ソフトウェア市場を提供します。画像・短編ドラマ・動画生成の新規依頼は終了し、過去の注文と権利は保持します。"],
["開発者の権利","販売者はソフトウェアとソースコードの販売権を持ち、動作環境、依存関係、利用許諾を明示する必要があります。SI9.5 はソースコード版のみ販売します。"],
["支払いと引き渡し","確定前に価格、通貨、利用可能な決済手段を表示します。決済、ファイル、注文権限の確認後のみ非公開ファイルを渡します。"],
["販売者規約と返金","手数料と精算条件は販売者の同意チェック時に表示します。返金等は適用法、許諾条件、注文状態に従います。"],
["プライバシー","アカウント、注文、アップロード、必要なログは業務と法的義務のために限り使用します。非公開ソースは公開されません。"],
["取引ソフトのリスク","EA や指標は利益を保証しません。デモ口座は閲覧専用で、取引や資金操作はできません。"]]},
ko:{title:"SASI 소프트웨어 · 약관 및 서비스 안내",intro:"소프트웨어 게시, 판매자 등록, 구매 및 전달에 적용됩니다. 상품별 라이선스는 결제 시 표시된 내용을 따릅니다.",back:"마켓으로 돌아가기",sections:[
["서비스 범위","실용 도구, 글로벌 SIAI 목록과 SASI 소프트웨어 마켓을 제공합니다. 이미지·드라마·동영상 신규 생성 서비스는 종료하며 기존 주문과 권리는 보존합니다."],
["개발자 권리","판매자는 소프트웨어와 소스코드에 대한 판매 권리를 보유하고 요구 사양과 라이선스 제한을 알려야 합니다. SI9.5는 소스코드 라이선스만 판매합니다."],
["결제 및 전달","확정 전에 가격, 통화, 이용 가능한 결제 수단을 표시합니다. 결제, 파일 무결성, 주문 권한을 검증한 후에만 비공개 파일을 전달합니다."],
["판매자 약관 및 환불","수수료와 정산 조건은 판매자 동의 체크박스에서 표시합니다. 환불은 관련 법률과 약관, 주문 상태에 따릅니다."],
["개인정보 및 보안","계정, 주문, 업로드와 필요한 로그는 서비스 및 법적 의무 범위에서만 처리합니다. 비공개 소스는 공개되지 않습니다."],
["거래 소프트웨어 위험","EA와 지표는 수익을 보장하지 않습니다. 데모 계좌는 읽기 전용이며 거래나 자금 이동이 불가능합니다."]]},
fr:{title:"SASI Logiciels · Conditions et informations",intro:"Ces règles couvrent les annonces, la publication, l'achat et la livraison. La licence propre à chaque produit est présentée avant le paiement.",back:"Retour au marché",sections:[
["Périmètre","LINGXIFIELD propose des outils, le répertoire SIAI et le marché SASI. Les nouvelles créations d'images, de séries courtes et de vidéos sont arrêtées. Les commandes et droits antérieurs sont conservés."],
["Droits des éditeurs","Chaque vendeur doit disposer des droits de distribution et préciser les dépendances et conditions de licence. SI9.5 est proposé uniquement avec licence du code source."],
["Paiement et livraison","Prix, devises et moyens disponibles sont affichés avant validation. Les fichiers privés ne sont transmis qu'après vérification du paiement et des droits de commande."],
["Conditions vendeur","Les frais et modalités de règlement figurent dans la case d'acceptation du vendeur. Les remboursements suivent la loi, la licence et l'état de commande."],
["Confidentialité","Seules les données nécessaires au service, à la sécurité et aux obligations légales sont traitées. Le code source privé reste protégé."],
["Risques financiers","Les EA et indicateurs ne garantissent aucun gain. Les comptes de démonstration sont uniquement consultables, sans opération ni retrait."]]},
de:{title:"SASI Software · Bedingungen und Hinweise",intro:"Diese Regeln gelten für Angebote, Veröffentlichung, Kauf und Auslieferung. Produktspezifische Lizenzen werden vor dem Kauf angezeigt.",back:"Zurück zum Markt",sections:[
["Leistungsumfang","LINGXIFIELD bietet Werkzeuge, das SIAI-Verzeichnis und den SASI-Softwaremarkt. Neue Bild-, Kurzdrama- und Videogenerierung wird eingestellt. Bestehende Bestellungen und Ansprüche bleiben erhalten."],
["Rechte der Anbieter","Verkäufer benötigen Vertriebsrechte und müssen Systemanforderungen, Abhängigkeiten und Lizenzgrenzen offenlegen. SI9.5 wird ausschließlich als Quellcode-Lizenz angeboten."],
["Zahlung und Auslieferung","Preis, Währung und verfügbare Zahlungsarten sind vor Bestätigung sichtbar. Private Dateien werden erst nach Zahlungs-, Datei- und Berechtigungsprüfung freigegeben."],
["Verkäuferbedingungen","Gebühren und Auszahlungsbedingungen stehen direkt in der Zustimmungserklärung des Verkäufers. Erstattungen richten sich nach Recht, Lizenz und Bestellstatus."],
["Datenschutz","Konto-, Bestell-, Datei- und Sicherheitsdaten werden nur im erforderlichen Umfang verarbeitet. Privater Quellcode wird nicht öffentlich."],
["Handelssoftware","EAs und Indikatoren garantieren keine Gewinne. Demokonten dienen nur der Beobachtung und erlauben keine Transaktionen."]]},
es:{title:"SASI Software · Condiciones y aviso",intro:"Estas reglas abarcan publicación, compra y entrega de software. Cada licencia se presenta antes de confirmar el pago.",back:"Volver al mercado",sections:[
["Alcance","LINGXIFIELD ofrece herramientas, el directorio SIAI y el mercado SASI. Se retiran las nuevas tareas de creación de imágenes, dramas y vídeos. Se conservan pedidos y derechos anteriores."],
["Derechos del vendedor","Cada vendedor debe tener derechos de distribución e informar de requisitos y licencias. SI9.5 solo se vende con licencia de código fuente."],
["Pago y entrega","El precio, la moneda y los medios disponibles aparecen antes de confirmar. Las descargas privadas requieren pago, archivos y permisos verificados."],
["Condiciones y reembolsos","Las tarifas y condiciones se muestran en la casilla de aceptación del vendedor. Los reembolsos siguen la ley, la licencia y el estado del pedido."],
["Privacidad","Los datos de cuenta, pedido, archivos y seguridad se usan solo en lo necesario. El código fuente privado no se hace público."],
["Riesgos de trading","Los EA e indicadores no garantizan beneficios. Las cuentas demo son de solo lectura y no permiten operar ni retirar fondos."]]},
pt:{title:"SASI Software · Termos e avisos",intro:"Regras para publicação, compra e entrega de software. A licença específica é apresentada antes da confirmação do pagamento.",back:"Voltar ao mercado",sections:[
["Serviços","LINGXIFIELD oferece ferramentas, diretório SIAI e mercado SASI. Novas tarefas de criação de imagens, dramas e vídeos são encerradas; pedidos e direitos anteriores permanecem."],
["Direitos do vendedor","O vendedor deve ter direitos de distribuição e informar requisitos e licenças. O SI9.5 é vendido apenas com licença do código-fonte."],
["Pagamento e entrega","Preço, moeda e meios disponíveis aparecem antes da confirmação. Downloads privados exigem pagamento, arquivo e autorização validados."],
["Termos e reembolsos","Taxas e condições aparecem na caixa de aceitação do vendedor. Reembolsos seguem a lei, a licença e o estado do pedido."],
["Privacidade","Dados de contas, pedidos, arquivos e segurança são tratados somente quando necessários. O código-fonte privado não é publicado."],
["Riscos de negociação","EAs e indicadores não garantem lucro. Contas de demonstração são somente para observação, sem operações ou saques."]]},
ar:{title:"برمجيات SASI · الشروط وإشعار الخدمة",intro:"تنطبق هذه الشروط على عرض البرامج ونشرها وشرائها وتسليمها. تظهر شروط ترخيص كل منتج قبل تأكيد الدفع.",back:"العودة إلى السوق",sections:[
["نطاق الخدمة","تقدم LINGXIFIELD أدوات عملية ودليل SIAI وسوق برمجيات SASI. أُوقفت مهام إنشاء الصور والدراما والفيديو الجديدة، مع الاحتفاظ بالطلبات والحقوق السابقة."],
["حقوق الناشرين","يجب امتلاك حق توزيع البرامج والشيفرة وبيان المتطلبات والاعتماديات والقيود. يُعرض SI9.5 بترخيص الشيفرة المصدرية فقط."],
["الدفع والتسليم","يظهر السعر والعملة ووسيلة الدفع المتاحة قبل التأكيد. لا يُتاح تنزيل الملف الخاص إلا بعد التحقق من الدفع وسلامة الملف وحق الطلب."],
["شروط البائع والاسترداد","تظهر الرسوم وشروط التسوية في مربع موافقة البائع. تخضع عمليات الاسترداد للقانون والترخيص وحالة الطلب."],
["الخصوصية والأمان","تُعالج بيانات الحساب والطلب والملفات والسجلات اللازمة في حدود الخدمة والالتزامات القانونية. تظل الشيفرة الخاصة غير عامة."],
["مخاطر التداول","لا تضمن برامج التداول والمؤشرات أي ربح. الحسابات التجريبية للعرض فقط ولا تسمح بالتداول أو تحريك الأموال."]]}
};
export default function SasiLegalBody(){
 const{lang}=useLingxiLang();const c=COPY[lang]??COPY.en;
 return <main className="min-h-screen bg-[var(--lx-bg)] px-5 pb-24 pt-16" dir={lang==="ar"?"rtl":undefined}>
  <article className="mx-auto max-w-4xl">
   <div className="mb-5 text-xs font-bold tracking-[.16em] text-[var(--lx-muted)]">LINGXIFIELD · SASI</div>
   <h1 className="text-3xl font-extrabold leading-tight text-[var(--lx-ink)] md:text-4xl">{c.title}</h1>
   <p className="mt-5 text-sm leading-8 text-[var(--lx-muted)]">{c.intro}</p>
   <div className="mt-8 grid gap-4">{c.sections.map(([heading,body],i)=>
    <section key={i} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
     <h2 className="text-lg font-bold text-[var(--lx-ink)]">{String(i+1).padStart(2,"0")} · {heading}</h2>
     <p className="mt-3 text-sm leading-8 text-[var(--lx-muted)]">{body}</p>
    </section>)}</div>
   <Link className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white" href="/sasi/marketplace">{c.back}</Link>
  </article>
 </main>;
}
