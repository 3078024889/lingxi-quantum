import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BalanceWithdrawalPanel from "@/components/BalanceWithdrawalPanel";

export const dynamic="force-dynamic";
export const metadata={
  title:"余额提现 | 灵犀场 LINGXIFIELD",
  robots:{index:false,follow:false},
};

export default function WithdrawalsPage(){
  return <><Nav/><main className="mx-auto max-w-3xl px-6 py-20">
    <p className="text-sm tracking-[.18em] opacity-60">LINGXIFIELD · ACCOUNT</p>
    <h1 className="mt-3 text-3xl font-semibold">余额提现</h1>
    <p className="mt-4 text-sm leading-7 opacity-70">不想继续使用时，可将尚未消耗的真实充值本金按原支付渠道退回。系统不会把赠送额度、邀请奖励或已经产生服务成本的余额提现为现金。</p>
    <div className="mt-10"><BalanceWithdrawalPanel/></div>
  </main><Footer/></>;
}
