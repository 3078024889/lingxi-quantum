import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata={title:"退款与结算 | 灵犀场 LINGXIFIELD",alternates:{canonical:"/refunds"}};

export default function RefundsPage(){return <><Nav/><main className="lx11-page lx-legal-page"><div className="lx-legal-wrap"><div className="lx-legal-card">
<h1 className="font-display text-4xl font-light text-[var(--lx-ink)]"><Bi zh="退款与结算" en="Refunds & Settlement"/></h1>
<p className="lx-legal-meta"><Bi zh="最后更新：2026年9月" en="Last updated: September 2026"/></p>
<div className="mt-10 space-y-8 text-base leading-8 text-[var(--lx-muted)]">
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="1. 适用范围" en="1. Scope"/></h2><p className="mt-3"><Bi zh="本政策适用于当前提供的 AI 余额、SASI 创作余额、按次付费工具与其他明确标价的软件数字服务。" en="This policy applies to current AI Balance, SASI Creation Balance, per-use tools and other clearly priced digital software services."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="2. 可申请退款" en="2. Refundable Cases"/></h2><p className="mt-3"><Bi zh="重复扣款、未经授权支付、支付成功但余额或权益未到账、平台技术故障导致已购买服务无法提供时，可以联系我们核对并处理。" en="Contact us for duplicate charges, unauthorized payments, paid balances or entitlements not credited, or platform faults that prevent a purchased service from being delivered."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="3. 余额与已消耗服务" en="3. Balances & Consumed Services"/></h2><p className="mt-3"><Bi zh="AI/SASI 余额的退款以未消耗充值本金和实际结算记录为依据；已经实际使用的模型、生成或第三方处理成本通常不能按未使用部分计算。" en="AI/SASI balance refunds are based on unused refundable principal and actual settlement records. Model, generation or third-party processing already consumed is generally not treated as unused balance."/></p></section>
<section><h2 className="font-display text-xl text-[var(--lx-ink)]"><Bi zh="4. 申请方式" en="4. How to Request"/></h2><p className="mt-3"><Bi zh="发送注册邮箱、订单号与问题说明至 support@lingxifield.com。我们会核对支付与实际交付记录后处理。" en="Send your registered email, order number and issue description to support@lingxifield.com. We review payment and actual delivery records before processing."/></p></section>
</div></div></div></main><Footer/></>;}
