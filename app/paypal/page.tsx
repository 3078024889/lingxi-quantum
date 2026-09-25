import type {Metadata} from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import PaypalHelp from "@/components/PaypalHelp";
import {usdBalanceProducts} from "@/lib/usd-products";

export const metadata:Metadata={
  title:"PayPal USD Payments | LINGXIFIELD 灵犀场",
  description:"Use PayPal to top up USD balances for LINGXIFIELD AI and SASI creation services. USD stays USD and is credited at face value after verified payment.",
  alternates:{canonical:"/paypal"},
  openGraph:{title:"PayPal USD Payments | LINGXIFIELD",description:"Pay with PayPal for AI and SASI creation services on LINGXIFIELD.",url:"https://lingxifield.com/paypal",siteName:"LINGXIFIELD",type:"website"},
  robots:{index:true,follow:true},
};

const faq=[
  {q:"What can I pay for with PayPal on LINGXIFIELD?",a:"PayPal can be used to top up USD balances for AI and SASI creation services, including AI processing and supported creation tasks."},
  {q:"Is the USD balance converted into CNY?",a:"No. A verified PayPal USD payment is credited to the USD balance at face value."},
  {q:"What if my PayPal account uses another currency?",a:"PayPal handles any supported currency conversion on its own checkout page. LINGXIFIELD verifies the USD amount of the order."},
  {q:"Can unused paid principal be refunded?",a:"Unused paid principal may be returned to the original payment method according to LINGXIFIELD's refund rules."},
];

export default function Page(){
  const ai=usdBalanceProducts.filter(x=>x.wallet==="ai").slice(0,4);
  const sasi=usdBalanceProducts.filter(x=>x.wallet==="sasi").slice(0,4);
  const schema={"@context":"https://schema.org","@type":"WebPage",name:"PayPal USD Payments | LINGXIFIELD",url:"https://lingxifield.com/paypal",description:"PayPal USD payments for LINGXIFIELD AI and SASI creation services.",mainEntity:{"@type":"FAQPage",mainEntity:faq.map(item=>({"@type":"Question",name:item.q,acceptedAnswer:{"@type":"Answer",text:item.a}}))}};

  return <><Nav/><main className="mx-auto max-w-6xl px-6 py-16 pt-28">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <section className="max-w-3xl">
      <p className="text-sm text-[var(--lx-faint)]">PayPal · USD</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]"><LxText zh="用 PayPal 直接充值美元余额。" en="Top up your USD balance with PayPal." ja="PayPalでUSD残高をチャージ。" ko="PayPal로 USD 잔액을 충전하세요." fr="Rechargez votre solde USD avec PayPal." de="Laden Sie Ihr USD-Guthaben mit PayPal auf." es="Recarga tu saldo USD con PayPal." pt="Recarregue o seu saldo em USD com PayPal." ar="اشحن رصيد USD عبر PayPal."/></h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><LxText zh="PayPal 可用于灵犀场的 AI 与 SASI 创作服务。选择美元金额后进入 PayPal 完成付款，确认成功后同额 USD 进入对应余额。" en="Use PayPal for LINGXIFIELD AI and SASI creation services. Choose a USD amount, complete payment on PayPal, and the verified amount is credited to the matching USD balance." ja="LINGXIFIELDのAI・SASI制作サービスでPayPalをご利用いただけます。USD金額を選び、PayPalで支払いを完了すると、確認済み金額がUSD残高に反映されます。" ko="LINGXIFIELD의 AI 및 SASI 제작 서비스에서 PayPal을 사용할 수 있습니다. USD 금액을 선택해 PayPal에서 결제를 완료하면 확인된 금액이 USD 잔액에 반영됩니다." fr="Utilisez PayPal pour les services IA et SASI de LINGXIFIELD. Choisissez un montant en USD, terminez le paiement sur PayPal et le montant vérifié est crédité sur le solde USD correspondant." de="Nutzen Sie PayPal für AI- und SASI-Kreativdienste von LINGXIFIELD. Wählen Sie einen USD-Betrag, schließen Sie die Zahlung bei PayPal ab und der bestätigte Betrag wird dem passenden USD-Guthaben gutgeschrieben." es="Usa PayPal para los servicios de IA y SASI de LINGXIFIELD. Elige un importe en USD, completa el pago en PayPal y el importe verificado se acredita en el saldo USD correspondiente." pt="Use o PayPal nos serviços de IA e SASI da LINGXIFIELD. Escolha um valor em USD, conclua o pagamento no PayPal e o valor confirmado é creditado no saldo USD correspondente." ar="استخدم PayPal لخدمات الذكاء الاصطناعي وSASI في LINGXIFIELD. اختر مبلغًا بالدولار وأكمل الدفع عبر PayPal ليُضاف المبلغ المؤكد إلى رصيد USD المناسب."/></p>
    </section>

    <section className="mt-10 grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
        <h2 className="text-xl font-semibold"><LxText zh="AI 美元余额" en="AI USD balance" ja="AI USD残高" ko="AI USD 잔액" fr="Solde IA en USD" de="AI-USD-Guthaben" es="Saldo IA en USD" pt="Saldo de IA em USD" ar="رصيد AI بالدولار"/></h2>
        <div className="mt-5 grid grid-cols-2 gap-3">{ai.map(p=><Link key={p.id} href={`/checkout-usd?productId=${p.id}`} className="rounded-2xl border border-[var(--lx-line)] p-4 hover:border-[var(--lx-line-strong)]"><b className="text-lg">${p.amountUsd.toFixed(2)}</b><span className="mt-2 block text-sm text-[var(--lx-muted)]">PayPal →</span></Link>)}</div>
      </div>
      <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
        <h2 className="text-xl font-semibold"><LxText zh="SASI 创作美元余额" en="SASI creation USD balance" ja="SASI制作 USD残高" ko="SASI 제작 USD 잔액" fr="Solde de création SASI en USD" de="SASI-Kreativguthaben in USD" es="Saldo SASI en USD" pt="Saldo de criação SASI em USD" ar="رصيد إنشاء SASI بالدولار"/></h2>
        <div className="mt-5 grid grid-cols-2 gap-3">{sasi.map(p=><Link key={p.id} href={`/checkout-usd?productId=${p.id}`} className="rounded-2xl border border-[var(--lx-line)] p-4 hover:border-[var(--lx-line-strong)]"><b className="text-lg">${p.amountUsd.toFixed(2)}</b><span className="mt-2 block text-sm text-[var(--lx-muted)]">PayPal →</span></Link>)}</div>
      </div>
    </section>
    <div className="mt-8"><PaypalHelp/></div>
  </main><Footer/></>;
}
