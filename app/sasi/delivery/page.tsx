import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata:Metadata={
 title:"SASI 软件市场｜授权、付款与自动交付规则｜灵犀场",
 description:"了解灵犀场 SASI 软件市场的商品审核、源码授权、付款核验、软件下载、安全交付与售后规则。",
 alternates:{canonical:"/sasi/delivery"}
};

const sections=[
 {title:"商品范围",body:"SASI 面向成品软件与数字产品交易，支持 MT5 EA、交易指标、自动化程序、桌面软件及其他经过审核的软件商品。具体功能、版本、价格、系统要求和授权范围以商品详情页为准。"},
 {title:"开发者入驻",body:"开发者提交卖家资料并确认平台协议后，可创建商品草稿、填写中英文说明、设置 CNY 与 USD 售价、上传软件包和商品图片。商品通过安全检查与平台审核后才会公开展示。"},
 {title:"商品文件与图片",body:"安装包按商品规则上传至私有存储。当前软件包使用 ZIP 格式，单个文件不超过 30 MB；每件商品提供 1 张主图，最多 4 张可选详情图。图片支持 PNG、JPG、WEBP，单张不超过 1 MB。"},
 {title:"付款与交付",body:"只有在支付渠道回调验签、订单状态和金额核验通过后，订单才会进入已支付状态。购买权益按订单授权发放，下载链接采用限时访问控制；未核验的支付通知不会触发软件交付。"},
 {title:"源码授权与安全",body:"源码、可执行文件、版本说明、安装指南和校验信息以商品订单及交付包为准。私有文件不公开列目录，下载权限与订单用户绑定。购买前请确认系统环境、版本兼容性和授权条款。"},
 {title:"售后与历史订单",body:"数字软件的退款、故障处理和消费者法定权益，按订单条款及销售地区适用规则处理。平台升级不会覆盖既有订单、付款凭证、交付记录或已授予的授权。卖家结算及提现状态以账户内的正式记录为准。"}
];
export default function Page(){return <><Nav/><main className="lx11-page"><div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
 <Link href="/sasi" className="text-sm text-[var(--lx-muted)] hover:underline">← 返回 SASI 软件市场</Link>
 <header className="mt-6 max-w-3xl"><p className="text-xs font-semibold tracking-[.18em] text-violet-600">SASI MARKETPLACE · DELIVERY</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--lx-ink)] sm:text-4xl">软件授权与安全交付规则</h1><p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">从商品审核、支付核验到订单授权和文件交付，关键状态均以可追溯的订单记录为准。</p></header>
 <div className="mt-8 grid gap-4 md:grid-cols-2">{sections.map((item,i)=><section key={item.title} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-6"><p className="text-xs font-semibold tracking-wider text-violet-600">0{i+1}</p><h2 className="mt-2 text-lg font-semibold text-[var(--lx-ink)]">{item.title}</h2><p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">{item.body}</p></section>)}</div>
 <div className="mt-8 flex flex-wrap gap-3"><Link href="/sasi" className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-semibold text-[var(--lx-bg)]">浏览软件商品</Link><Link href="/sasi/seller" className="rounded-xl border border-[var(--lx-line)] px-5 py-3 text-sm font-semibold">开发者卖家服务</Link><Link href="/legal/sasi" className="rounded-xl border border-[var(--lx-line)] px-5 py-3 text-sm font-semibold">查看软件协议</Link></div>
 </div></main><Footer/></>}
