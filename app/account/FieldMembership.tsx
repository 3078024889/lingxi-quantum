import Link from "next/link";
import Bi from "@/components/Bi";
import { manifestationProducts } from "@/lib/plans";

export default function FieldMembership() {
  return <section className="field-membership">
    <header><small>MANIFESTATION · MEMBERSHIP</small><h2><Bi zh="意识显化 · 订阅入口" en="Manifestation · Membership" /></h2><p><Bi zh="从觉察走向创造，让练习持续进入生活。已有记录留在我的场域，订阅内容从意识显化进入。" en="Bring awareness into action and daily practice. Existing records stay in My Field; membership opens through Manifestation." /></p></header>
    <div>{manifestationProducts.map(product => <article key={product.id} data-featured={!!product.highlight}><small>{product.highlight ? "✧" : "◇"}</small><h3><Bi zh={product.name} en={product.nameEn} /></h3><p><Bi zh={product.note} en={product.noteEn} /></p><strong>¥{product.priceRmb}<small> / {product.days}<Bi zh="天" en=" days" /></small></strong><p><Bi zh="意图记录 · 现实行动 · 反馈复盘" en="Intentions · Actions · Reflection" /></p><Link href="/membership"><Bi zh="查看方案与订阅" en="View plans and subscribe" /> →</Link></article>)}</div>
    <Link href="/live-as"><Bi zh="进入意识显化，了解完整练习路径 →" en="Explore the full Manifestation practice →" /></Link>
  </section>;
}
