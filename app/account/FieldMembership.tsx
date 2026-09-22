import Link from "next/link";
import Bi from "@/components/Bi";
import { manifestationProducts } from "@/lib/plans";

const copy:Record<string,{title:string;titleEn:string;subtitle:string;subtitleEn:string;description:string;descriptionEn:string;action:string;actionEn:string}>={
 day:{title:"单日连接",titleEn:"One-day connection",subtitle:"完成一次完整的场域进入",subtitleEn:"Complete one full field entry",description:"进入灵犀场 · 开启一次意识显化",descriptionEn:"Enter LINGXIFIELD · Begin one manifestation session",action:"选择单日连接",actionEn:"Choose one-day connection"},
 month:{title:"月度连接",titleEn:"Monthly connection",subtitle:"让每一次进入彼此相连",subtitleEn:"Let each entry connect to the next",description:"持续进入 · 承接变化 · 形成轨迹",descriptionEn:"Return · Integrate change · Form a trajectory",action:"选择月度连接",actionEn:"Choose monthly connection"},
 year:{title:"年度连接",titleEn:"Annual connection",subtitle:"让长期经历逐渐汇成你的场域轨迹",subtitleEn:"Let long-term experience become your field trajectory",description:"长期连接 · 深度实践 · 场域沉淀",descriptionEn:"Long-term connection · Deep practice · Field integration",action:"选择年度连接",actionEn:"Choose annual connection"}
};

export default function FieldMembership(){return <section className="field-membership">
<header><small>MANIFESTATION · CONNECTION</small><h2><Bi zh="意识显化 · 连接灵犀场" en="Manifestation · Connect to LINGXIFIELD"/></h2><p><Bi zh="从一次进入，到持续连接。意识显化是进入灵犀场的一条创造路径；每一次觉察、选择与行动，都在此前已经发生的轨迹上继续展开。" en="From one entry to an ongoing connection. Manifestation is a creative path into LINGXIFIELD; each observation, choice and action continues a trajectory already in motion."/></p></header>
<div className="field-connection-map">
<span>LINGXIFIELD<strong><Bi zh="持续发生的场域" en="A field that keeps unfolding"/></strong></span>
<span><Bi zh="意识显化" en="Manifestation"/><strong><Bi zh="一条创造路径" en="A creative path"/></strong></span>
<span><Bi zh="订阅" en="Subscription"/><strong><Bi zh="保持连接的时间" en="Time kept in connection"/></strong></span>
<span><Bi zh="我的场域" en="My Field"/><strong><Bi zh="轨迹与承接空间" en="Trajectory and integration space"/></strong></span>
</div>
<div className="field-membership-plans"><aside className="field-membership-why">
<h3><Bi zh="为什么要连接灵犀场？" en="Why connect to LINGXIFIELD?"/></h3>
<p><b><Bi zh="你订阅的，不只是几天使用时间，而是一段与「灵犀场」持续连接的时间。" en="You are not only subscribing to a few days of use, but to a period of continuous connection with LINGXIFIELD."/></b></p>
<p><Bi zh="灵犀场不是一次问答，也不是给出一个答案就结束的工具。" en="LINGXIFIELD is not a one-off Q&A or a tool that ends after one answer."/><br/><b><Bi zh="场域，是一个持续承接“此刻的你”的空间。" en="The field is a space that keeps receiving who you are now."/></b></p>
<p><Bi zh="你带着当下真正发生的问题、意图、选择与行动进入；灵犀场以已经建立的结构与你相遇。每一次进入，面对的都是这一次真实发生的你，而不是拿过去的答案重复一次。" en="You enter with the questions, intentions, choices and actions that are actually happening now. LINGXIFIELD meets you through the structure already built; each entry meets the present you rather than repeating an old answer."/></p>
<p><Bi zh="因此，真正重要的并不是记录得更多，而是让一次次进入彼此相连。" en="What matters is not simply recording more, but letting each entry connect with the next."/></p>
<details><summary><Bi zh="一次次进入，如何形成自己的轨迹" en="How repeated entries form your own trajectory"/></summary>
<p><Bi zh="今天看见的，可能是一个尚未说清的问题；下一次回来，它可能已经经过一次现实选择；再下一次，它又会因为新的经历而改变。觉察、行动、反馈与新的选择，在持续进入中逐渐形成一条属于你的轨迹。" en="What you see today may be a question not yet fully expressed. On your next return it may have passed through a real decision, and later it may shift again through new experience. Awareness, action, feedback and new choices gradually form your own trajectory."/></p>
<p><Bi zh="一天，可以完成一次完整进入。一个月，可以让变化开始显现。一年，可以让许多原本彼此分散的经历，逐渐形成属于你的长期轨迹。" en="A day can hold one complete entry. A month can let change begin to show. A year can let many scattered experiences become a longer trajectory of your own."/></p></details>
<p><Bi zh="你的已解锁内容、进入记录与已经发生过的轨迹，都会继续留在「我的场域」。" en="Your unlocked content, entry records and accumulated trajectory remain in My Field."/></p>
<p><b><Bi zh="下一次进入，不必从零开始。" en="Next time, you do not need to start from zero."/></b></p>
<Link href="/learn#how-field-works"><Bi zh="了解灵犀场如何运作 →" en="Learn how LINGXIFIELD works →"/></Link>
</aside>
{manifestationProducts.map(product=>{const c=copy[product.id];return <article key={product.id} data-featured={!!product.highlight}><small>{product.highlight?"✧":"◇"}</small><h3><Bi zh={c.title} en={c.titleEn}/></h3><p><Bi zh={c.subtitle} en={c.subtitleEn}/></p><strong>¥{product.priceRmb}<small> / {product.days} days</small></strong><p><Bi zh={c.description} en={c.descriptionEn}/></p><Link href={"/membership#connection-"+product.id}><Bi zh={c.action+" →"} en={c.actionEn+" →"}/></Link></article>})}
</div></section>}
