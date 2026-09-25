import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BalanceWithdrawalPanel from "@/components/BalanceWithdrawalPanel";
import Link from "next/link";
import LxText from "@/components/LxText";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

export const dynamic="force-dynamic";
export const metadata={
  title:"余额退款 | 灵犀场 LINGXIFIELD",
  robots:{index:false,follow:false},
};

export default function WithdrawalsPage(){
  return <><Nav/><main className="mx-auto max-w-3xl px-6 py-20 lx-account-subpage text-[var(--lx-ink)]">
    <div className="flex items-start justify-between gap-4 lx-header-inline-stack"><div>
      <div className="lx-page-title-line"><LingxiMiniIcon name="refund" size="title"/><p className="text-sm tracking-[.18em] text-[var(--lx-faint)]"><LxText zh="灵犀场 · 我的账户" en="LINGXIFIELD · My Account" ja="LINGXIFIELD · マイアカウント" ko="LINGXIFIELD · 내 계정" fr="LINGXIFIELD · Mon compte" de="LINGXIFIELD · Mein Konto" es="LINGXIFIELD · Mi cuenta" pt="LINGXIFIELD · Minha conta" ar="LINGXIFIELD · حسابي"/></p></div>
      <h1 className="mt-3 text-3xl font-semibold"><LxText zh="余额退款" en="Balance refund" ja="残高返金" ko="잔액 환불" fr="Remboursement du solde" de="Guthabenrückerstattung" es="Reembolso de saldo" pt="Reembolso de saldo" ar="استرداد الرصيد"/></h1>
    </div><Link href="/account" className="lx-tool-back text-[var(--lx-muted)]">← <LxText zh="返回账户" en="Back to account" ja="アカウントへ戻る" ko="계정으로 돌아가기" fr="Retour au compte" de="Zurück zum Konto" es="Volver a la cuenta" pt="Voltar à conta" ar="العودة إلى الحساب"/></Link></div>
    <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><LxText
      zh="没有用掉的真实充值本金，可以申请退回原来的支付方式。赠送额度、邀请奖励和已经使用的部分不属于可退本金。"
      en="Unused paid principal can be requested back to the original payment method. Bonus credit, referral rewards and already-used amounts are not refundable principal."
      ja="未使用の実入金元本は、元の支払い方法への返金申請ができます。特典、紹介報酬、使用済み金額は返金対象の元本に含まれません。"
      ko="사용하지 않은 실제 충전 원금은 원 결제수단으로 환불 신청할 수 있습니다. 보너스, 추천 보상, 이미 사용한 금액은 환불 원금에 포함되지 않습니다."
      fr="Le principal payé et non utilisé peut être remboursé vers le moyen de paiement d’origine. Les bonus, récompenses de parrainage et montants déjà utilisés sont exclus."
      de="Nicht genutztes eingezahltes Kapital kann über die ursprüngliche Zahlungsart zurückerstattet werden. Bonusguthaben, Empfehlungsprämien und bereits genutzte Beträge sind ausgeschlossen."
      es="El principal pagado y no utilizado puede devolverse al método de pago original. Las bonificaciones, recompensas por invitación y los importes ya usados no forman parte del principal reembolsable."
      pt="O principal pago e não utilizado pode ser devolvido ao método de pagamento original. Bônus, recompensas por convite e valores já usados não fazem parte do principal reembolsável."
      ar="يمكن طلب استرداد أصل المبلغ المدفوع وغير المستخدم إلى وسيلة الدفع الأصلية. لا تشمل المبالغ القابلة للاسترداد المكافآت أو مكافآت الدعوة أو المبالغ المستخدمة بالفعل."
    /></p>
    <div className="mt-10"><BalanceWithdrawalPanel/></div>
  </main><Footer/></>;
}
