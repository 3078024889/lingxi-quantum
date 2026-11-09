export const dynamic = "force-dynamic";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";
import MiniAccountLinkPanel from "./MiniAccountLinkPanel";
import AccountCenterV26 from "@/components/AccountCenterV26";
import LxText from "@/components/LxText";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const metadata = { title: "我的账户 | 灵犀场 LINGXIFIELD" };

const T={
 account:<LxText zh="我的账户" en="My Account" ja="マイアカウント" ko="내 계정" fr="Mon compte" de="Mein Konto" es="Mi cuenta" pt="Minha conta" ar="حسابي"/>,
 welcome:<LxText zh="欢迎回来" en="Welcome back" ja="おかえりなさい" ko="다시 오신 것을 환영합니다" fr="Bon retour" de="Willkommen zurück" es="Bienvenido de nuevo" pt="Bem-vindo de volta" ar="مرحبًا بعودتك"/>,
 products:<LxText zh="产品中心" en="Product Center" ja="プロダクトセンター" ko="제품 센터" fr="Centre produits" de="Produktcenter" es="Centro de productos" pt="Central de produtos" ar="مركز المنتجات"/>,
 productsDesc:<LxText zh="从正在做的事继续，不必重新找入口" en="Continue the work you already started without hunting for the right entry again." ja="いま進めている作業から、そのまま続けられます。" ko="이미 진행 중인 작업에서 바로 이어가세요." fr="Reprenez directement le travail déjà commencé, sans chercher à nouveau le bon accès." de="Setzen Sie Ihre laufende Arbeit direkt fort, ohne den Einstieg erneut suchen zu müssen." es="Continúa directamente el trabajo que ya empezaste, sin volver a buscar la entrada correcta." pt="Continue diretamente o trabalho que já começou, sem procurar a entrada novamente." ar="واصل العمل الذي بدأت به مباشرة دون البحث عن المدخل من جديد."/>,
 orders:<LxText zh="订单与使用记录" en="Orders & usage" ja="注文と利用履歴" ko="주문 및 사용 기록" fr="Commandes et utilisation" de="Bestellungen & Nutzung" es="Pedidos y uso" pt="Pedidos e uso" ar="الطلبات والاستخدام"/>,
 paid:<LxText zh="已支付订单" en="Paid orders" ja="支払い済み注文" ko="결제 완료 주문" fr="Commandes payées" de="Bezahlte Bestellungen" es="Pedidos pagados" pt="Pedidos pagos" ar="الطلبات المدفوعة"/>,
 balance:<LxText zh="余额" en="Balance" ja="残高" ko="잔액" fr="Solde" de="Guthaben" es="Saldo" pt="Saldo" ar="الرصيد"/>,
 balanceDesc:<LxText zh="查看余额，需要时再充值" en="View your balance and top up when needed." ja="残高を確認し、必要なときにチャージできます。" ko="잔액을 확인하고 필요할 때 충전하세요." fr="Consultez votre solde et rechargez si nécessaire." de="Guthaben prüfen und bei Bedarf aufladen." es="Consulta tu saldo y recarga cuando lo necesites." pt="Veja seu saldo e recarregue quando precisar." ar="اطّلع على رصيدك واشحن عند الحاجة."/>,
 refund:<LxText zh="余额提现" en="Balance withdrawal" ja="残高返金" ko="잔액 환불" fr="Remboursement du solde" de="Guthabenrückerstattung" es="Reembolso de saldo" pt="Reembolso de saldo" ar="استرداد الرصيد"/>,
 refundDesc:<LxText zh="将未使用的可提现余额退回原支付方式" en="Unused paid principal can return to the original payment method." ja="未使用の実入金元本は元の支払い方法へ返金申請できます。" ko="사용하지 않은 실제 충전 원금은 원 결제수단으로 환불할 수 있습니다." fr="Le principal payé et non utilisé peut revenir vers le moyen de paiement d’origine." de="Nicht genutztes eingezahltes Kapital kann über die ursprüngliche Zahlungsart zurückerstattet werden." es="El principal pagado y no utilizado puede devolverse al método de pago original." pt="O principal pago e não utilizado pode voltar ao método de pagamento original." ar="يمكن إعادة أصل المبلغ المدفوع وغير المستخدم إلى وسيلة الدفع الأصلية."/>,
 signKicker:<LxText zh="账户" en="Account" ja="アカウント" ko="계정" fr="Compte" de="Konto" es="Cuenta" pt="Conta" ar="الحساب"/>,
 signTitle:<LxText zh="登录灵犀场" en="Sign in to LINGXIFIELD" ja="LINGXIFIELD にログイン" ko="LINGXIFIELD 로그인" fr="Se connecter à LINGXIFIELD" de="Bei LINGXIFIELD anmelden" es="Iniciar sesión en LINGXIFIELD" pt="Entrar na LINGXIFIELD" ar="تسجيل الدخول إلى LINGXIFIELD"/>,
 signDesc:<LxText zh="登录后查看余额、任务、订单与创作记录。" en="Sign in to view balances, tasks, orders and creation records." ja="ログインすると残高、タスク、注文、制作履歴を確認できます。" ko="로그인하면 잔액, 작업, 주문, 창작 기록을 확인할 수 있습니다." fr="Connectez-vous pour consulter soldes, tâches, commandes et historique de création." de="Anmelden, um Guthaben, Aufgaben, Bestellungen und Erstellungsverlauf zu sehen." es="Inicia sesión para ver saldos, tareas, pedidos e historial de creación." pt="Entre para ver saldos, tarefas, pedidos e histórico de criação." ar="سجّل الدخول لعرض الأرصدة والمهام والطلبات وسجل الإنشاء."/>
};

export default async function AccountPage(
  props: { searchParams?: Promise<{ next?: string; auth_error?: string; mode?: string; email?: string; miniLink?: string }> }
) {
  const searchParams = await props.searchParams;
  const miniLink = typeof searchParams?.miniLink === 'string' && searchParams.miniLink.length <= 2048 ? searchParams.miniLink : '';
  const requestedNext = typeof searchParams?.next === "string" ? searchParams.next : null;
  const afterAuthPath = requestedNext
    && requestedNext.startsWith("/")
    && !requestedNext.startsWith("//")
    && !requestedNext.includes("\\")
    && requestedNext.length <= 512
      ? requestedNext
      : miniLink ? `/account?miniLink=${encodeURIComponent(miniLink)}&mini=1` : "/products";

  const authError=typeof searchParams?.auth_error==="string"?searchParams.auth_error:"";
  const initialMode=searchParams?.mode==="verify"?"verify":searchParams?.mode==="signup"?"signup":"signin";
  const initialEmail=typeof searchParams?.email==="string"?searchParams.email.slice(0,320):"";

  const supabase = isSupabasePublicConfigured() ? createClient() : null;
  const user = supabase ? await getServerUser(supabase) : null;

  let paidOrderCount:number|null=null;
  if(user&&supabase){
    const paid=await supabase.from("orders").select("id",{count:"exact",head:true}).eq("user_id",user.id).eq("status","paid");
    paidOrderCount=paid.error?null:paid.count;
  }

  return <>
    <Nav/>
    <main className="lx11-page">
      <section className={user?"lx26-account-page mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10":"mx-auto max-w-3xl px-6 py-20"}>
        {user ? <>
          {miniLink && <MiniAccountLinkPanel ticket={miniLink} accountLabel={user.email || user.phone || ""} />}
          <AccountCenterV26 email={user.email || ""} initialName={String(user.user_metadata?.display_name || user.email?.split("@")[0] || "LINGXI")} paidOrderCount={paidOrderCount}/>
        </> : <div className="mx-auto max-w-md rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 text-center">
          <p className="text-xs uppercase tracking-[.2em] text-[var(--lx-faint)]">{T.signKicker}</p>
          <h1 className="mt-4 font-display text-3xl text-[var(--lx-ink)]">{T.signTitle}</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{T.signDesc}</p>
          <div className="mt-8"><LoginForm afterAuthPath={afterAuthPath} initialMode={initialMode} serverError={authError} initialEmail={initialEmail}/></div>
        </div>}
      </section>
    </main>
    <Footer/>
  </>;
}
