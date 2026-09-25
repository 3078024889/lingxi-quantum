export const dynamic = "force-dynamic";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";
import SignOutButton from "./SignOutButton";
import SwitchAccountButton from "./SwitchAccountButton";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountButton from "./DeleteAccountButton";
import AccountProfileCard from "@/components/AccountProfileCard";
import Bi from "@/components/Bi";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const metadata = { title: "我的账户 | 灵犀场 LINGXIFIELD" };

export default async function AccountPage({ searchParams }: { searchParams?: { next?: string; auth_error?: string; mode?: string } }) {
  const requestedNext = typeof searchParams?.next === "string" ? searchParams.next : null;
  const afterAuthPath = requestedNext
    && requestedNext.startsWith("/")
    && !requestedNext.startsWith("//")
    && !requestedNext.includes("\\")
    && requestedNext.length <= 512
      ? requestedNext
      : "/products";

  const authError=typeof searchParams?.auth_error==="string"?searchParams.auth_error:"";
  const initialMode=searchParams?.mode==="signup"?"signup":"signin";

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
      <section className="mx-auto max-w-3xl px-6 py-20">
        {user ? <>
          <AccountProfileCard email={user.email || ""} initialName={String(user.user_metadata?.display_name || user.email?.split("@")[0] || "LINGXI")} />
          <div className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7">
            <p className="text-xs uppercase tracking-[.2em] text-[var(--lx-faint)]"><Bi zh="我的账户" en="My Account"/></p>
            <h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]"><Bi zh="欢迎回来" en="Welcome back"/></h1>
            <p className="mt-3 text-sm text-[var(--lx-muted)]">{user.email}</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/products" className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="products" size="title"/><b><Bi zh="产品中心" en="Product Center"/></b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh="从正在做的事继续，不必重新找入口" en="Continue the work you already started without hunting for the right entry again."/></p></Link>
            <Link href="/account/orders" className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="orders" size="title"/><b><Bi zh="订单与使用记录" en="Paid Tasks"/></b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh={`已支付订单：${paidOrderCount ?? "—"}`} en={`Paid orders: ${paidOrderCount ?? "—"}`}/></p></Link>
            <Link href="/ai-wallet" className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="wallet" size="title"/><b>AI Balance</b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh="查看人民币 / 美元余额，需要时再充值" en="View CNY / USD balances and top up only when needed."/></p></Link>
            <Link href="/sasi" className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="sasi" size="title"/><b>SASI</b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh="继续短剧、资料与创作任务" en="Continue drama, source and creation work."/></p></Link>
            <Link href="/account/withdrawals" className="lx-account-entry rounded-2xl border border-[var(--lx-line)] p-5"><LingxiMiniIcon name="refund" size="title"/><b><Bi zh="余额退款" en="Balance refund"/></b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh="没用完的真实充值本金可原路退回" en="Unused paid principal can return to the original payment method."/></p></Link>
          </div>

          <div className="mt-8 space-y-3">
            <ChangePasswordForm/>
            <SwitchAccountButton/>
            <SignOutButton/>
            <DeleteAccountButton/>
          </div>
        </> : <div className="mx-auto max-w-md rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 text-center">
          <p className="text-xs uppercase tracking-[.2em] text-[var(--lx-faint)]"><Bi zh="账户" en="Account"/></p>
          <h1 className="mt-4 font-display text-3xl text-[var(--lx-ink)]"><Bi zh="登录灵犀场" en="Sign in to LINGXIFIELD"/></h1>
          <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><Bi zh="登录后查看余额、任务、订单与创作记录。" en="Sign in to view balances, tasks, orders and creation records."/></p>
          <div className="mt-8"><LoginForm afterAuthPath={afterAuthPath} initialMode={initialMode} serverError={authError}/></div>
        </div>}
      </section>
    </main>
    <Footer/>
  </>;
}
