import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AccountNotificationsPanel from "@/components/AccountNotificationsPanel";
import Link from "next/link";
export const dynamic="force-dynamic";
export const metadata={title:"消息与公告 | 灵犀场 LINGXIFIELD",robots:{index:false,follow:false}};
export default function Page(){return <><Nav/><main className="mx-auto max-w-3xl px-6 py-20 text-[var(--lx-ink)]"><div className="flex items-start justify-between gap-4"><div><p className="text-sm tracking-[.18em] text-[var(--lx-faint)]">灵犀场 · 我的账户</p><h1 className="mt-3 text-3xl font-semibold">消息与公告</h1></div><Link href="/account" className="text-[var(--lx-muted)]">← 返回账户</Link></div><p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">充值到账、提现进度、退款结果和灵犀场版本更新都会出现在这里。</p><div className="mt-10"><AccountNotificationsPanel/></div></main><Footer/></>;}
