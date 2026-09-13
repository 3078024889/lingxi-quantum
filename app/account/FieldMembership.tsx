import Link from "next/link";
import Bi from "@/components/Bi";
import { manifestationProducts } from "@/lib/plans";

export default function FieldMembership() {
  return <section className="field-membership">
    <header><small>MANIFESTATION · MEMBERSHIP</small><h2><Bi zh="意识显化 · 订阅入口" en="Manifestation · Membership" /></h2><p><Bi zh="从觉察走向创造，让练习持续进入生活。已有记录留在我的场域，订阅内容从意识显化进入。" en="Bring awareness into action and daily practice. Existing records stay in My Field; membership opens through Manifestation." /></p></header>
    <div className="field-membership-plans"><aside className="field-membership-why"><h3>为什么需要订阅？</h3><p>知道自己想改变什么之后，困难往往在于：忙起来就忘了，行动没有拆小，做过之后也没有回头看。</p><p>意识显化把意图、现实行动和反馈复盘放在同一条练习路径中。订阅为你提供一段持续使用的时间，让每天的小变化有地方记录，也让下一次选择有据可循。</p><p>从一次完整体验开始，或给自己一个月、一年的持续实践。已有订单与记录仍可在我的场域中查找。</p><Link href="/live-as">了解意识显化的练习路径 →</Link></aside>{manifestationProducts.map(product => <article key={product.id} data-featured={!!product.highlight}><small>{product.highlight ? "✧" : "◇"}</small><h3><Bi zh={product.name} en={product.nameEn} /></h3><p><Bi zh={product.note} en={product.noteEn} /></p><strong>¥{product.priceRmb}<small> / {product.days}<Bi zh="天" en=" days" /></small></strong><p><Bi zh="意图记录 · 现实行动 · 反馈复盘" en="Intentions · Actions · Reflection" /></p><Link href="/membership"><Bi zh="查看方案与订阅" en="View plans and subscribe" /> →</Link></article>)}</div>
    <Link href="/live-as"><Bi zh="进入意识显化，了解完整练习路径 →" en="Explore the full Manifestation practice →" /></Link>
  </section>;
}
