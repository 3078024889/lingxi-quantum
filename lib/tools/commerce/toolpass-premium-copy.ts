/** Customer-facing premium ToolPass translations; pricing and payment readiness remain authoritative server data. */
type ToolPassLocale="ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
const index:Record<ToolPassLocale,number>={ja:0,ko:1,fr:2,de:3,es:4,pt:5,ar:6};
const TABLE:Record<string,readonly string[]> = Object.freeze({
 "Wallet balance": [
  "ウォレット残高",
  "지갑 잔액",
  "Solde du portefeuille",
  "Wallet-Guthaben",
  "Saldo de cartera",
  "Saldo da carteira",
  "رصيد المحفظة"
 ],
 "WeChat Pay": [
  "WeChat Pay",
  "위챗페이",
  "WeChat Pay",
  "WeChat Pay",
  "WeChat Pay",
  "WeChat Pay",
  "وي تشات باي"
 ],
 "Alipay": [
  "Alipay",
  "알리페이",
  "Alipay",
  "Alipay",
  "Alipay",
  "Alipay",
  "علي باي"
 ],
 "This payment option is currently unavailable.": [
  "この支払い方法は現在利用できません。",
  "현재 이 결제 수단을 이용할 수 없습니다.",
  "Ce moyen de paiement est indisponible.",
  "Diese Zahlungsart ist derzeit nicht verfügbar.",
  "Este método de pago no está disponible.",
  "Esta forma de pagamento está indisponível.",
  "طريقة الدفع هذه غير متاحة حالياً."
 ],
 "Unlock 100+ practical tools. One membership, more possibilities.": [
  "100以上の便利なツールをまとめて利用。ひとつの会員プランで効率化。",
  "100개 이상의 실용 도구를 하나의 멤버십으로 이용하세요.",
  "Plus de 100 outils pratiques. Un seul abonnement pour en profiter.",
  "Über 100 praktische Werkzeuge. Eine Mitgliedschaft, viele Möglichkeiten.",
  "Más de 100 herramientas prácticas con una sola membresía.",
  "Mais de 100 ferramentas práticas em uma única assinatura.",
  "أكثر من 100 أداة عملية باشتراك واحد."
 ],
 "100+ practical tools": [
  "100以上の実用ツール",
  "100개 이상의 실용 도구",
  "Plus de 100 outils pratiques",
  "Über 100 praktische Tools",
  "Más de 100 herramientas",
  "Mais de 100 ferramentas",
  "أكثر من 100 أداة عملية"
 ],
 "All in one place": [
  "ひとつの場所で利用",
  "한곳에서 이용",
  "Tout au même endroit",
  "Alles an einem Ort",
  "Todo en un solo lugar",
  "Tudo em um só lugar",
  "كلها في مكان واحد"
 ],
 "Always evolving": [
  "継続的に更新",
  "지속 업데이트",
  "Toujours enrichi",
  "Wird ständig erweitert",
  "En constante evolución",
  "Sempre evoluindo",
  "تحديثات مستمرة"
 ],
 "New tools included": [
  "新しいツールも対象",
  "새 도구 포함",
  "Nouveaux outils inclus",
  "Neue Tools inklusive",
  "Incluye herramientas nuevas",
  "Novas ferramentas incluídas",
  "يشمل الأدوات الجديدة"
 ],
 "More value": [
  "高いコストパフォーマンス",
  "더 높은 가성비",
  "Plus de valeur",
  "Mehr fürs Geld",
  "Más valor",
  "Mais vantagens",
  "قيمة أفضل"
 ],
 "Built for work and everyday tasks": [
  "仕事・創作・日常に対応",
  "업무·창작·일상에 적합",
  "Pour le travail, la création et le quotidien",
  "Für Arbeit, Kreativität und Alltag",
  "Para trabajo, creación y tareas cotidianas",
  "Para trabalho, criação e tarefas do dia a dia",
  "للعمل والإبداع والمهام اليومية"
 ],
 "tools": [
  "ツール",
  "도구",
  "outils",
  "Tools",
  "herramientas",
  "ferramentas",
  "أدوات"
 ],
 "ToolPass plans": [
  "ToolPassプラン",
  "ToolPass 요금제",
  "Offres ToolPass",
  "ToolPass-Tarife",
  "Planes ToolPass",
  "Planos ToolPass",
  "باقات ToolPass"
 ],
 "♛ Most popular": [
  "♛ 人気プラン",
  "♛ 인기 플랜",
  "♛ Le plus populaire",
  "♛ Besonders beliebt",
  "♛ Más popular",
  "♛ Mais popular",
  "♛ الأكثر طلباً"
 ],
 "New tools always included": [
  "新しいツールも自動追加",
  "새 도구 자동 포함",
  "Nouveaux outils toujours inclus",
  "Neue Tools stets inklusive",
  "Nuevas herramientas siempre incluidas",
  "Novas ferramentas sempre incluídas",
  "يشمل الأدوات الجديدة تلقائياً"
 ],
 "Instant access after verified purchase": [
  "購入確認後すぐに利用可能",
  "결제 확인 후 즉시 이용",
  "Accès immédiat après paiement vérifié",
  "Sofortiger Zugang nach bestätigter Zahlung",
  "Acceso inmediato tras confirmar la compra",
  "Acesso imediato após a compra confirmada",
  "استخدام فوري بعد تأكيد الشراء"
 ],
 "Membership and updates": [
  "会員情報と更新",
  "멤버십 및 업데이트",
  "Abonnement et actualités",
  "Mitgliedschaft und Neuigkeiten",
  "Membresía y novedades",
  "Assinatura e novidades",
  "العضوية والتحديثات"
 ],
 "Balance & top up": [
  "残高とチャージ",
  "잔액 및 충전",
  "Solde et rechargement",
  "Guthaben und Aufladung",
  "Saldo y recarga",
  "Saldo e recarga",
  "الرصيد والشحن"
 ],
 "Use your verified account funds for eligible purchases": [
  "確認済みの残高で対象サービスを購入",
  "인증된 계정 잔액으로 대상 서비스 결제",
  "Utilisez votre solde vérifié pour les achats éligibles",
  "Geprüftes Guthaben für berechtigte Käufe nutzen",
  "Use el saldo verificado para compras admitidas",
  "Use o saldo verificado para compras elegíveis",
  "استخدم رصيد الحساب الموثق للمشتريات المؤهلة"
 ],
 "Top up & details": [
  "チャージと明細",
  "충전 및 내역",
  "Recharger et consulter",
  "Aufladen und Details",
  "Recarga y detalles",
  "Recarga e detalhes",
  "الشحن والتفاصيل"
 ],
 "Account balance": [
  "アカウント残高",
  "계정 잔액",
  "Solde du compte",
  "Kontostand",
  "Saldo de cuenta",
  "Saldo da conta",
  "رصيد الحساب"
 ],
 "Sign in to view your actual balance": [
  "ログインすると実際の残高を確認できます",
  "로그인 후 실제 잔액을 확인하세요",
  "Connectez-vous pour consulter votre solde réel",
  "Anmelden, um das tatsächliche Guthaben zu sehen",
  "Inicie sesión para ver el saldo real",
  "Entre para ver seu saldo real",
  "سجّل الدخول لعرض الرصيد الفعلي"
 ],
 "Top up": [
  "チャージ",
  "충전",
  "Recharger",
  "Aufladen",
  "Recargar",
  "Recarregar",
  "شحن"
 ],
 "Orders": [
  "注文履歴",
  "주문",
  "Commandes",
  "Bestellungen",
  "Pedidos",
  "Pedidos",
  "الطلبات"
 ],
 "All funds, receipts and entitlements reflect verified account records.": [
  "残高・入金・利用権は認証済みのアカウント記録に基づきます。",
  "잔액·영수증·이용 권한은 검증된 계정 기록을 기준으로 합니다.",
  "Soldes, reçus et droits reposent sur les données vérifiées.",
  "Guthaben, Belege und Rechte basieren auf geprüften Kontodaten.",
  "Saldos, recibos y derechos reflejan registros verificados.",
  "Saldos, comprovantes e direitos seguem registros verificados.",
  "تعتمد الأرصدة والإيصالات والصلاحيات على سجلات الحساب الموثقة."
 ],
 "Announcements": [
  "お知らせ",
  "공지사항",
  "Annonces",
  "Ankündigungen",
  "Anuncios",
  "Avisos",
  "الإعلانات"
 ],
 "Updates, new tools and service notices": [
  "更新・新ツール・サービス情報",
  "업데이트·신규 도구·서비스 소식",
  "Mises à jour, outils et annonces de service",
  "Updates, neue Tools und Servicehinweise",
  "Novedades, herramientas y avisos de servicio",
  "Atualizações, ferramentas e avisos de serviço",
  "تحديثات وأدوات جديدة وإشعارات الخدمة"
 ],
 "View all": [
  "すべて見る",
  "전체 보기",
  "Tout voir",
  "Alle ansehen",
  "Ver todo",
  "Ver tudo",
  "عرض الكل"
 ],
 "NEWS": [
  "更新情報",
  "업데이트",
  "ACTUALITÉS",
  "NEU",
  "NOVEDADES",
  "NOVIDADES",
  "جديد"
 ],
 "Visit announcements for platform updates.": [
  "最新情報はお知らせをご覧ください。",
  "플랫폼 소식은 공지사항에서 확인하세요.",
  "Consultez les annonces pour les nouveautés.",
  "Aktuelle Plattformmeldungen stehen unter Ankündigungen.",
  "Consulte anuncios para conocer las novedades.",
  "Consulte os avisos para novidades.",
  "تابع الإعلانات للاطلاع على تحديثات المنصة."
 ],
 "Confirm purchase": [
  "購入を確認",
  "구매 확인",
  "Confirmer l’achat",
  "Kauf bestätigen",
  "Confirmar compra",
  "Confirmar compra",
  "تأكيد الشراء"
 ],
 "Close": [
  "閉じる",
  "닫기",
  "Fermer",
  "Schließen",
  "Cerrar",
  "Fechar",
  "إغلاق"
 ],
 "ToolPass membership": [
  "ToolPass会員",
  "ToolPass 멤버십",
  "Abonnement ToolPass",
  "ToolPass-Mitgliedschaft",
  "Membresía ToolPass",
  "Assinatura ToolPass",
  "عضوية ToolPass"
 ],
 "All 100+ practical tools and new additions": [
  "100以上のツールと今後の新機能が対象",
  "100개 이상의 도구와 신규 도구 포함",
  "Plus de 100 outils et leurs nouveautés",
  "Über 100 Tools und neue Ergänzungen",
  "Más de 100 herramientas y futuras novedades",
  "Mais de 100 ferramentas e novas adições",
  "أكثر من 100 أداة وجميع الإضافات الجديدة"
 ],
 "Choose payment method": [
  "支払い方法を選択",
  "결제 수단 선택",
  "Choisir un moyen de paiement",
  "Zahlungsart auswählen",
  "Elegir método de pago",
  "Escolher forma de pagamento",
  "اختر طريقة الدفع"
 ],
 "Balance": [
  "残高",
  "잔액",
  "Solde",
  "Guthaben",
  "Saldo",
  "Saldo",
  "الرصيد"
 ],
 "Available": [
  "利用可能",
  "이용 가능",
  "Disponible",
  "Verfügbar",
  "Disponible",
  "Disponível",
  "متاح"
 ],
 "Unavailable": [
  "利用不可",
  "사용 불가",
  "Indisponible",
  "Nicht verfügbar",
  "No disponible",
  "Indisponível",
  "غير متاح"
 ],
 "Pay in USD": [
  "米ドルで支払う",
  "미국 달러로 결제",
  "Payer en USD",
  "In USD bezahlen",
  "Pagar en USD",
  "Pagar em USD",
  "الدفع بالدولار"
 ],
 "Total": [
  "合計金額",
  "총 결제 금액",
  "Total à payer",
  "Gesamtbetrag",
  "Total a pagar",
  "Total a pagar",
  "المبلغ الإجمالي"
 ],
 "Pay now": [
  "今すぐ支払う",
  "지금 결제",
  "Payer maintenant",
  "Jetzt bezahlen",
  "Pagar ahora",
  "Pagar agora",
  "ادفع الآن"
 ],
 "Payment methods open after merchant verification.": [
  "加盟店認証が完了すると支払い方法が利用可能になります。",
  "가맹점 인증 후 결제 수단이 열립니다.",
  "Paiements disponibles après validation du marchand.",
  "Zahlungsarten nach Händlerprüfung verfügbar.",
  "Los métodos se habilitarán tras verificar al comerciante.",
  "Formas de pagamento liberadas após verificação do comerciante.",
  "تُتاح طرق الدفع بعد التحقق من التاجر."
 ],
 "View balance & top up": [
  "残高確認・チャージ",
  "잔액 조회 및 충전",
  "Voir le solde et recharger",
  "Guthaben ansehen und aufladen",
  "Ver saldo y recargar",
  "Ver saldo e recarregar",
  "عرض الرصيد والشحن"
 ],
 "Try it for a week": [
  "7日間お試し",
  "7일 체험",
  "Essayer une semaine",
  "Eine Woche testen",
  "Probar una semana",
  "Experimente por uma semana",
  "جرّب لمدة أسبوع"
 ],
 "Access all tools": [
  "全ツールを利用",
  "전체 도구 이용",
  "Accéder à tous les outils",
  "Alle Tools nutzen",
  "Acceder a todas las herramientas",
  "Acesse todas as ferramentas",
  "استخدم جميع الأدوات"
 ],
 "Even better value": [
  "さらにお得",
  "더욱 합리적인 가격",
  "Encore plus avantageux",
  "Noch günstiger",
  "Más ahorro",
  "Economia ainda maior",
  "توفير أكبر"
 ],
 "Ideal for long-term use": [
  "長期利用に最適",
  "장기 이용에 적합",
  "Idéal à long terme",
  "Ideal für die langfristige Nutzung",
  "Ideal para uso prolongado",
  "Ideal para uso prolongado",
  "مثالي للاستخدام الطويل"
 ]
});
export function toolPassUiText(lang:string,zh:string,en:string):string{
 if(lang==="zh")return zh;
 if(lang==="en")return en;
 const idx=index[lang as ToolPassLocale];
 const v=TABLE[en]?.[idx];
 return typeof v==="string"&&v.trim()?v:en;
}
export const TOOLPASS_PREMIUM_LOCALE_KEYS=Object.freeze(Object.keys(TABLE));
