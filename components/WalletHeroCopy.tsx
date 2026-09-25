"use client";
import LxText from "@/components/LxText";

export default function WalletHeroCopy(){
  return <>
    <p className="lx11-kicker"><LxText zh="AI 余额" en="AI Balance" ja="AI 残高" ko="AI 잔액" fr="Solde IA" de="KI-Guthaben" es="Saldo IA" pt="Saldo IA" ar="رصيد الذكاء الاصطناعي"/></p>
    <h1 className="lx11-title"><LxText
      zh="不用订阅。需要时充值，用多少扣多少。"
      en="No subscription. Top up when needed and pay only for what you use."
      ja="サブスク不要。必要なときだけチャージし、使った分だけ支払います。"
      ko="구독 없이 필요할 때 충전하고 사용한 만큼만 결제하세요."
      fr="Sans abonnement. Rechargez quand vous en avez besoin et payez seulement l’usage réel."
      de="Kein Abo. Bei Bedarf aufladen und nur tatsächliche Nutzung bezahlen."
      es="Sin suscripción. Recarga cuando lo necesites y paga solo por el uso real."
      pt="Sem assinatura. Recarregue quando precisar e pague apenas pelo uso real."
      ar="بدون اشتراك. اشحن عند الحاجة وادفع فقط مقابل الاستخدام الفعلي."
    /></h1>
    <p className="lx11-lead"><LxText
      zh="人民币充值进入人民币余额，PayPal 美元充值进入美元余额。两种币种分别保留，没用完的真实充值本金继续留在你的账户里。"
      en="CNY top-ups stay in your CNY balance and PayPal USD top-ups stay in your USD balance. Both remain separate, and unused paid principal stays in your account."
      ja="人民元チャージは人民元残高に、PayPal の米ドルチャージは米ドル残高に入ります。二つの通貨は別々に保持されます。"
      ko="위안 충전은 CNY 잔액에, PayPal 달러 충전은 USD 잔액에 보관됩니다. 두 통화는 서로 분리되어 유지됩니다."
      fr="Les recharges CNY restent en CNY et les recharges PayPal en USD restent en USD. Les deux soldes restent séparés."
      de="CNY-Aufladungen bleiben im CNY-Guthaben, PayPal-USD-Aufladungen im USD-Guthaben. Beide bleiben getrennt."
      es="Las recargas en CNY permanecen en CNY y las recargas de PayPal en USD permanecen en USD. Ambos saldos se mantienen separados."
      pt="Recargas em CNY permanecem em CNY e recargas do PayPal em USD permanecem em USD. Os dois saldos ficam separados."
      ar="تبقى شحنات اليوان في رصيد CNY، وتبقى شحنات PayPal بالدولار في رصيد USD. ويظل الرصيدان منفصلين."
    /></p>
  </>;
}
