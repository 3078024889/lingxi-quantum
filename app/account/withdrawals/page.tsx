import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BalanceWithdrawalPanel from "@/components/BalanceWithdrawalPanel";
import Link from "next/link";
import LxText from "@/components/LxText";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

export const dynamic="force-dynamic";
export const metadata={title:"余额提现 | 灵犀场 LINGXIFIELD",robots:{index:false,follow:false}};

export default function WithdrawalsPage(){
 return <><Nav/><main className="mx-auto max-w-3xl px-6 py-20 lx-account-subpage text-[var(--lx-ink)]">
  <div className="flex items-start justify-between gap-4 lx-header-inline-stack"><div>
   <div className="lx-page-title-line"><LingxiMiniIcon name="refund" size="title"/><p className="text-sm tracking-[.18em] text-[var(--lx-faint)]"><LxText zh="灵犀场 · 我的账户" en="LINGXIFIELD · My Account" ja="LINGXIFIELD · マイアカウント" ko="LINGXIFIELD · 내 계정" fr="LINGXIFIELD · Mon compte" de="LINGXIFIELD · Mein Konto" es="LINGXIFIELD · Mi cuenta" pt="LINGXIFIELD · Minha conta" ar="LINGXIFIELD · حسابي"/></p></div>
   <h1 className="mt-3 text-3xl font-semibold"><LxText zh="余额提现" en="Balance withdrawal" ja="残高の払い戻し" ko="잔액 인출" fr="Retrait du solde" de="Guthaben auszahlen" es="Retiro de saldo" pt="Saque do saldo" ar="سحب الرصيد"/></h1>
  </div><Link href="/account" className="lx-tool-back text-[var(--lx-muted)]">← <LxText zh="返回账户" en="Back to account" ja="アカウントへ戻る" ko="계정으로 돌아가기" fr="Retour au compte" de="Zurück zum Konto" es="Volver a la cuenta" pt="Voltar à conta" ar="العودة إلى الحساب"/></Link></div>
  <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><LxText zh="将未使用的可提现余额退回原支付方式。" en="Return eligible unused balance to the original payment method." ja="未使用の対象残高を元の支払い方法へ戻します。" ko="사용하지 않은 인출 가능 잔액을 원 결제수단으로 돌려드립니다." fr="Renvoyez le solde éligible non utilisé vers le moyen de paiement d’origine." de="Ungenutztes auszahlbares Guthaben wird an die ursprüngliche Zahlungsart zurückgegeben." es="Devuelve el saldo elegible no utilizado al método de pago original." pt="Devolva o saldo elegível não utilizado ao método de pagamento original." ar="أعد الرصيد المؤهل غير المستخدم إلى وسيلة الدفع الأصلية."/></p>
  <div className="mt-10"><BalanceWithdrawalPanel/></div>
 </main><Footer/></>;
}
