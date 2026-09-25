import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BalanceWithdrawalPanel from "@/components/BalanceWithdrawalPanel";
import Link from "next/link";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

export const dynamic="force-dynamic";
export const metadata={
  title:"余额退款 | 灵犀场 LINGXIFIELD",
  robots:{index:false,follow:false},
};

export default function WithdrawalsPage(){
  return <><Nav/><main className="mx-auto max-w-3xl px-6 py-20">
    <div className="flex items-start justify-between gap-4 lx-header-inline-stack"><div><div className="lx-page-title-line"><LingxiMiniIcon name="refund" size="title"/><p className="text-sm tracking-[.18em] opacity-60">灵犀场 · 我的账户</p></div>
    <h1 className="mt-3 text-3xl font-semibold">余额提现</h1></div><Link href="/account" className="lx-tool-back">← 返回账户</Link></div>
    <p className="mt-4 text-sm leading-7 opacity-70">如果暂时不再使用灵犀场，可以把还没有用掉的真实充值本金退回原来的支付方式。赠送额度、邀请奖励和已经使用的部分不属于可退本金。</p>
    <div className="mt-10"><BalanceWithdrawalPanel/></div>
  </main><Footer/></>;
}
