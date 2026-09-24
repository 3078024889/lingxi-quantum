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
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const metadata = { title: "我的账户 | 灵犀场 LINGXIFIELD" };

export default async function AccountPage({ searchParams }: { searchParams?: { next?: string } }) {
  const requestedNext = typeof searchParams?.next === "string" ? searchParams.next : null;
  const afterAuthPath = requestedNext
    && requestedNext.startsWith("/")
    && !requestedNext.startsWith("//")
    && !requestedNext.includes("\\")
    && requestedNext.length <= 512
      ? requestedNext
      : "/products";

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
            <Link href="/products" className="rounded-2xl border border-[var(--lx-line)] p-5"><span className="lx-v143-icon">◈</span><b><Bi zh="产品中心" en="Product Center"/></b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh="AI、SASI、工具与余额入口" en="AI, SASI, tools and balances"/></p></Link>
            <Link href="/account/orders" className="rounded-2xl border border-[var(--lx-line)] p-5"><span className="lx-v143-icon">▤</span><b><Bi zh="付费任务中心" en="Paid Tasks"/></b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh={`已支付订单：${paidOrderCount ?? "—"}`} en={`Paid orders: ${paidOrderCount ?? "—"}`}/></p></Link>
            <Link href="/ai-wallet" className="rounded-2xl border border-[var(--lx-line)] p-5"><span className="lx-v143-icon">💠</span><b>AI Balance</b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh="查看余额与充值" en="View balance and top up"/></p></Link>
            <Link href="/sasi" className="rounded-2xl border border-[var(--lx-line)] p-5"><span className="lx-v143-icon">✦</span><b>SASI</b><p className="mt-2 text-sm text-[var(--lx-muted)]"><Bi zh="进入创作工作台" en="Open creation workspace"/></p></Link>
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
          <div className="mt-8"><LoginForm afterAuthPath={afterAuthPath}/></div>
        </div>}
      </section>
    </main>
    <Footer/>
  </>;
}
