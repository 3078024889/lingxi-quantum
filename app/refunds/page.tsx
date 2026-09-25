import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata={title:"退款与结算 | 灵犀场 LINGXIFIELD",alternates:{canonical:"/refunds"}};

export default function RefundsPage(){return <><Nav/><main className="lx11-page lx-legal-page"><div className="lx-legal-wrap"><div className="lx-legal-card">
<h1 className="font-display text-4xl font-light text-[var(--lx-ink)]"><Bi zh="退款与结算" en="Refunds & Settlement"/></h1>
<p className="lx-legal-meta"><Bi zh="最后更新：2026年9月" en="Last updated: September 2026"/></p>
<div className="mt-10 space-y-8 text-base leading-8 text-[var(--lx-muted)]">
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="1. 适用范围" en="1. Scope"/></h2><p className="mt-3"><Bi zh="本政策适用于当前提供的 AI 余额、SASI 创作余额、按次付费工具与其他明确标价的软件数字服务。" en="This policy applies to current AI Balance, SASI Creation Balance, per-use tools and other clearly priced digital software services."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="2. 余额提现" en="2. Balance Withdrawals"/></h2><p className="mt-3"><Bi zh="不再使用服务时，可以申请把尚未消耗的真实充值本金退回原支付方式。灵犀场会先确认这笔充值确实属于你的账户、且这部分金额还没有被使用，再发起退款。" en="If you stop using the service, unused paid principal may be returned to the original payment method. LINGXIFIELD first confirms that the top-up belongs to your account and that the requested amount has not been used, then sends the refund."/></p><p className="mt-3"><Link href="/account/withdrawals" className="underline"><Bi zh="进入余额提现" en="Open balance withdrawals"/></Link></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="3. 不可提现余额" en="3. Non-withdrawable Balance"/></h2><p className="mt-3"><Bi zh="赠送额度、邀请奖励、补偿额度、已经消耗的充值本金，以及正在任务中冻结或已实际结算的金额不能提现为现金。" en="Promotional credits, referral rewards, compensation credits, consumed principal, and funds reserved or settled for active work cannot be withdrawn as cash."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="4. 支付渠道处理" en="4. Provider Processing"/></h2><p className="mt-3"><Bi zh="退款只退回原支付方式和原支付币种。如果支付平台还在处理中，这笔金额会继续保持为“退款处理中”，不会因为网络延迟而重复退款。" en="Refunds return only to the original payment method and currency. If the payment service is still processing the refund, the amount remains marked as pending and is not refunded twice because of a network delay."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="5. 其他退款" en="5. Other Refunds"/></h2><p className="mt-3"><Bi zh="重复扣款、未经授权支付、支付成功但权益未到账或平台技术故障等非余额提现问题，可发送注册邮箱、订单号与说明至 support@lingxifield.com。" en="For duplicate charges, unauthorized payments, missing entitlements, or platform faults outside the balance-withdrawal flow, send your registered email, order number and details to support@lingxifield.com."/></p></section>
</div></div></div></main><Footer/></>;}
