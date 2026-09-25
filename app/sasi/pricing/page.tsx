import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import {CREDIT_PACKS} from "@/lib/sasi/catalog";
import {usdBalanceProducts} from "@/lib/usd-products";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"SASI 创作余额｜灵犀场",
  description:"SASI 创作余额支持人民币充值与 PayPal 美元充值。人民币与美元分别记账，按真实创作使用结算。",
  alternates:{canonical:"/sasi/pricing"},
};

const P={
  starter:<LxText zh="轻量体验" en="Starter" ja="ライト体験" ko="가벼운 체험" fr="Découverte" de="Einstieg" es="Inicio" pt="Início" ar="بداية"/>,
  creative:<LxText zh="创作启程" en="Creative Start" ja="制作スタート" ko="창작 시작" fr="Départ créatif" de="Kreativstart" es="Inicio creativo" pt="Início criativo" ar="بداية الإبداع"/>,
  single:<LxText zh="单次制作" en="Single Production" ja="単発制作" ko="단일 제작" fr="Production unique" de="Einzelproduktion" es="Producción única" pt="Produção única" ar="إنتاج واحد"/>,
  flow:<LxText zh="持续制作" en="Studio Flow" ja="継続制作" ko="지속 제작" fr="Production continue" de="Fortlaufende Produktion" es="Producción continua" pt="Produção contínua" ar="إنتاج مستمر"/>,
  series:<LxText zh="系列起步" en="Series Start" ja="シリーズ開始" ko="시리즈 시작" fr="Début de série" de="Serienstart" es="Inicio de serie" pt="Início de série" ar="بداية سلسلة"/>,
  reserve:<LxText zh="工作室储备" en="Studio Reserve" ja="スタジオ予備" ko="스튜디오 예비" fr="Réserve studio" de="Studioreserve" es="Reserva de estudio" pt="Reserva de estúdio" ar="احتياطي الاستوديو"/>,
  production:<LxText zh="系列制作" en="Series Production" ja="シリーズ制作" ko="시리즈 제작" fr="Production de série" de="Serienproduktion" es="Producción de serie" pt="Produção de série" ar="إنتاج سلسلة"/>,
  long:<LxText zh="长期制作" en="Long Production" ja="長期制作" ko="장기 제작" fr="Production longue" de="Langzeitproduktion" es="Producción a largo plazo" pt="Produção de longo prazo" ar="إنتاج طويل الأمد"/>,
  major:<LxText zh="大型项目" en="Major Production" ja="大型制作" ko="대형 프로젝트" fr="Production majeure" de="Großproduktion" es="Producción mayor" pt="Produção de grande porte" ar="إنتاج كبير"/>
};
const packLabel=(id:string)=>id==="sasi-balance-10"?P.starter:id==="sasi-credit-entry"?P.creative:id==="sasi-balance-50"?P.single:id==="sasi-credit-studio"?P.flow:id==="sasi-balance-200"?P.series:id==="sasi-credit-reserve"?P.reserve:id==="sasi-balance-1000"?P.production:id==="sasi-balance-2000"?P.long:P.major;

export default function Page(){
  const usd=usdBalanceProducts.filter(x=>x.wallet==="sasi");
  return <><Nav/><main className="mx-auto max-w-6xl px-6 py-16 pt-28">
    <section className="max-w-3xl">
      <div className="lx-page-title-line"><LingxiMiniIcon name="sasi" size="title"/><p className="text-sm text-[var(--lx-faint)]"><LxText zh="SASI · 创作余额" en="SASI · Creation Balance" ja="SASI · 制作残高" ko="SASI · 창작 잔액" fr="SASI · Solde création" de="SASI · Erstellungsguthaben" es="SASI · Saldo de creación" pt="SASI · Saldo de criação" ar="SASI · رصيد الإنشاء"/></p></div>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]"><LxText zh="按你习惯的币种充值，余额各自保留。" en="Top up in the currency you use, and keep each balance separate." ja="使いやすい通貨でチャージし、残高は通貨ごとに保持。" ko="익숙한 통화로 충전하고 잔액은 통화별로 따로 유지하세요." fr="Rechargez dans la devise qui vous convient, chaque solde reste séparé." de="In Ihrer bevorzugten Währung aufladen; jedes Guthaben bleibt getrennt." es="Recarga en la moneda que prefieras y mantén cada saldo separado." pt="Recarregue na moeda que preferir e mantenha cada saldo separado." ar="اشحن بالعملة التي تفضّلها واحتفظ بكل رصيد منفصلًا."/></h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><LxText zh="国内支付可充值人民币余额；PayPal 可充值美元余额。充值什么币种，就保留什么币种，不会自动换算。" en="WeChat Pay and Alipay fund CNY; PayPal funds USD. Your top-up stays in the currency you paid." ja="WeChat Pay / Alipay は CNY、PayPal は USD。チャージした通貨のまま残高に保持されます。" ko="WeChat Pay / Alipay는 CNY, PayPal은 USD로 충전되며 결제한 통화 그대로 유지됩니다." fr="WeChat Pay et Alipay alimentent le CNY, PayPal le USD. La recharge reste dans la devise payée." de="WeChat Pay und Alipay laden CNY auf, PayPal USD. Die Aufladung bleibt in der bezahlten Währung." es="WeChat Pay y Alipay cargan CNY; PayPal carga USD. La recarga se mantiene en la moneda pagada." pt="WeChat Pay e Alipay carregam CNY; PayPal carrega USD. A recarga permanece na moeda paga." ar="يشحن WeChat Pay وAlipay رصيد CNY، بينما يشحن PayPal رصيد USD، ويبقى المبلغ بالعملة التي دفعتها."/></p>
    </section>

    <section className="mt-10 lx-pricing-section">
      <h2 className="text-xl font-semibold text-[var(--lx-ink)]"><LxText zh="人民币余额" en="CNY balance" ja="CNY 残高" ko="CNY 잔액" fr="Solde CNY" de="CNY-Guthaben" es="Saldo CNY" pt="Saldo CNY" ar="رصيد CNY"/></h2>
      <p className="mt-2 text-sm text-[var(--lx-muted)]"><LxText zh="使用微信或支付宝充值。" en="Top up with WeChat Pay or Alipay." ja="WeChat Pay または Alipay でチャージ。" ko="WeChat Pay 또는 Alipay로 충전." fr="Rechargez avec WeChat Pay ou Alipay." de="Mit WeChat Pay oder Alipay aufladen." es="Recarga con WeChat Pay o Alipay." pt="Recarregue com WeChat Pay ou Alipay." ar="اشحن عبر WeChat Pay أو Alipay."/></p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CREDIT_PACKS.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-pricing-card">
          <h3 className="text-2xl font-semibold text-[var(--lx-ink)]">¥{pack.priceRmb.toLocaleString("zh-CN")}</h3>
          <p className="mt-2 text-sm text-[var(--lx-muted)]">{packLabel(pack.id)}</p>
          <Link href={`/checkout?productId=${encodeURIComponent(pack.id)}&redirect=/sasi/pricing`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm text-[var(--lx-ink)]">WeChat / Alipay →</Link>
        </article>)}
      </div>
    </section>

    <section className="mt-12 lx-pricing-section">
      <h2 className="text-xl font-semibold text-[var(--lx-ink)]"><LxText zh="美元余额" en="USD balance" ja="USD 残高" ko="USD 잔액" fr="Solde USD" de="USD-Guthaben" es="Saldo USD" pt="Saldo USD" ar="رصيد USD"/></h2>
      <p className="mt-2 text-sm text-[var(--lx-muted)]"><LxText zh="使用 PayPal 直接充值 USD 余额。" en="Top up your USD balance directly with PayPal." ja="PayPal で USD 残高を直接チャージ。" ko="PayPal로 USD 잔액을 바로 충전하세요." fr="Rechargez directement votre solde USD avec PayPal." de="USD-Guthaben direkt mit PayPal aufladen." es="Recarga directamente tu saldo USD con PayPal." pt="Recarregue diretamente seu saldo USD com PayPal." ar="اشحن رصيد USD مباشرة عبر PayPal."/></p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usd.map(pack=><article key={pack.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-pricing-card">
          <h3 className="text-2xl font-semibold text-[var(--lx-ink)]">${pack.amountUsd.toLocaleString("en-US",{minimumFractionDigits:2})}</h3>
          <p className="mt-2 text-sm text-[var(--lx-muted)]"><LxText zh="到账" en="Added balance" ja="反映額" ko="충전 잔액" fr="Solde ajouté" de="Gutgeschrieben" es="Saldo añadido" pt="Saldo adicionado" ar="الرصيد المضاف"/> ${pack.amountUsd.toLocaleString("en-US",{minimumFractionDigits:2})} USD</p>
          <Link href={`/checkout-usd?productId=${encodeURIComponent(pack.id)}`} className="mt-5 block rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-center text-sm font-medium text-[var(--lx-ink)]">PayPal →</Link>
        </article>)}
      </div>
    </section>

    <section className="mt-12 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
      <h2 className="text-base font-semibold text-[var(--lx-ink)]"><LxText zh="没用完，也不必勉强用掉。" en="Unused balance can stay unused." ja="使い切る必要はありません。" ko="남은 잔액을 억지로 쓸 필요는 없습니다." fr="Vous n’avez pas à dépenser le solde restant." de="Restguthaben muss nicht aufgebraucht werden." es="No tienes que gastar el saldo restante." pt="Você não precisa gastar o saldo restante." ar="لا تحتاج إلى إنفاق الرصيد المتبقي."/></h2>
      <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]"><LxText zh="未使用的真实充值本金可按原支付渠道申请退回。赠送额度、邀请奖励和已经产生服务成本的部分不计入可退本金。" en="Unused paid principal can be requested back through the original payment method. Bonus credit, referral rewards and already-consumed service costs are excluded." ja="未使用の実入金元本は元の支払い方法への返金申請ができます。特典、紹介報酬、すでに発生した利用分は対象外です。" ko="사용하지 않은 실제 충전 원금은 원 결제수단으로 환불 신청할 수 있습니다. 보너스, 추천 보상, 이미 발생한 사용 비용은 제외됩니다." fr="Le principal payé et non utilisé peut être remboursé via le moyen de paiement d’origine. Bonus, récompenses et coûts déjà consommés sont exclus." de="Nicht genutztes eingezahltes Kapital kann über die ursprüngliche Zahlungsart zurückerstattet werden. Bonusguthaben, Empfehlungen und bereits verbrauchte Leistungen sind ausgeschlossen." es="El principal pagado y no utilizado puede devolverse al método original. Se excluyen bonificaciones, recompensas y costes ya consumidos." pt="O principal pago e não utilizado pode ser devolvido ao método original. Bônus, recompensas e custos já consumidos ficam de fora." ar="يمكن طلب استرداد أصل المبلغ المدفوع وغير المستخدم عبر وسيلة الدفع الأصلية. لا تشمل المكافآت أو مكافآت الدعوة أو تكاليف الخدمة المستهلكة."/></p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm"><Link href="/account/withdrawals"><LxText zh="余额退款" en="Balance refund" ja="残高返金" ko="잔액 환불" fr="Remboursement" de="Rückerstattung" es="Reembolso" pt="Reembolso" ar="استرداد الرصيد"/> →</Link><Link href="/refunds"><LxText zh="退款说明" en="Refund policy" ja="返金ルール" ko="환불 정책" fr="Règles de remboursement" de="Rückerstattungsregeln" es="Política de reembolso" pt="Política de reembolso" ar="سياسة الاسترداد"/> →</Link></div>
    </section>
  </main><Footer/></>;
}
