import Link from "next/link";
import { manifestationProducts } from "@/lib/plans";
const copy: Record<string,{title:string;subtitle:string;description:string;action:string}>={
 day:{title:"单日连接",subtitle:"完成一次完整的场域进入",description:"进入灵犀场 · 开启一次意识显化",action:"选择单日连接"},
 month:{title:"月度连接",subtitle:"让每一次进入彼此相连",description:"持续进入 · 承接变化 · 形成轨迹",action:"选择月度连接"},
 year:{title:"年度连接",subtitle:"让长期经历逐渐汇成你的场域轨迹",description:"长期连接 · 深度实践 · 场域沉淀",action:"选择年度连接"}
};
export default function FieldMembership(){return <section className="field-membership">
<header><small>MANIFESTATION · CONNECTION</small><h2>意识显化 · 连接灵犀场</h2><p>从一次进入，到持续连接。意识显化是进入灵犀场的一条创造路径；每一次觉察、选择与行动，都在此前已经发生的轨迹上继续展开。</p></header>
<div className="field-connection-map"><span>灵犀场<strong>持续发生的场域</strong></span><span>意识显化<strong>一条创造路径</strong></span><span>订阅<strong>保持连接的时间</strong></span><span>我的场域<strong>轨迹与承接空间</strong></span></div>
<div className="field-membership-plans"><aside className="field-membership-why"><h3>为什么要连接灵犀场？</h3>
<p><b>你订阅的，不只是几天使用时间，而是一段与「灵犀场」持续连接的时间。</b></p>
<p>灵犀场不是一次问答，也不是给出一个答案就结束的工具。<br/><b>场域，是一个持续承接“此刻的你”的空间。</b></p>
<p>你带着当下真正发生的问题、意图、选择与行动进入；灵犀场以已经建立的结构与你相遇。每一次进入，面对的都是这一次真实发生的你，而不是拿过去的答案重复一次。</p>
<p>因此，真正重要的并不是记录得更多，而是<b>让一次次进入彼此相连。</b></p>
<details><summary>一次次进入，如何形成自己的轨迹</summary><p>今天看见的，可能是一个尚未说清的问题；下一次回来，它可能已经经过一次现实选择；再下一次，它又会因为新的经历而改变。觉察、行动、反馈与新的选择，在持续进入中逐渐形成一条属于你的轨迹。</p><p>一天，可以完成一次完整进入。<br/>一个月，可以让变化开始显现。<br/>一年，可以让许多原本彼此分散的经历，逐渐形成属于你的长期轨迹。</p></details>
<p>你的已解锁内容、进入记录与已经发生过的轨迹，都会继续留在「我的场域」。</p><p><b>下一次进入，不必从零开始。</b></p><Link href="/learn#how-field-works">了解灵犀场如何运作 →</Link></aside>
{manifestationProducts.map(product=>{const c=copy[product.id];return <article key={product.id} data-featured={!!product.highlight}><small>{product.highlight?"✧":"◇"}</small><h3>{c.title}</h3><p>{c.subtitle}</p><strong>¥{product.priceRmb}<small> / {product.days}天</small></strong><p>{c.description}</p><Link href={"/membership#connection-"+product.id}>{c.action} →</Link></article>})}</div></section>}
