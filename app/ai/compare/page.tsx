import type {Metadata} from "next";
import {latestFacts} from "../../../lib/ai-discovery/product-facts";
import {FactValue} from "../product-detail";
import Link from "next/link";
import {aiTools} from "../../../lib/ai-discovery/catalog";
import {selectedProductIds} from "../../../lib/ai-discovery/terminal-selection";
import {singleQueryValue} from "../../../lib/ai-discovery/query";
import styles from "../discovery.module.css";
import tableStyles from "../terminal.module.css";
export const metadata:Metadata={title:"哪个 AI 更适合你？｜灵犀场",alternates:{canonical:"https://lingxifield.com/ai/compare"}};
type Params={a?:string|string[];b?:string|string[];products?:string|string[]};
export default async function Compare({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams;
 const raw=typeof p.products==="string"?singleQueryValue(p.products,500).split(","):[singleQueryValue(p.a,80),singleQueryValue(p.b,80)];
 const ids=selectedProductIds(raw,aiTools.map(t=>t.slug));
 const rows=ids.map(id=>aiTools.find(t=>t.slug===id)!);

 const fields=[{label:"公司",value:(t:typeof aiTools[number])=>t.provider},...(["purpose","free","price","region","watermark","commercial","failure","refund","phone","card"] as const).map(key=>({label:({purpose:"主要用途",free:"免费额度",price:"价格与计费周期",region:"地区",watermark:"水印",commercial:"商用",failure:"失败扣费",refund:"退款",phone:"手机号",card:"信用卡"})[key],value:(t:typeof aiTools[number])=><FactValue fact={latestFacts(t.slug)?.facts[key]}/>}))];
 return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link className={styles.brand} href="/ai">LINGXIFIELD</Link><Link href="/ai">选择工具</Link></header><section className={tableStyles.workbench}><h1>哪个更适合你？</h1><p>一起比较 2–5 个工具。复制本页链接，也能把你的选择分享给别人。</p>{rows.length<2?<div className={styles.empty}><h2>先选择至少两个不同的工具</h2><Link href="/ai">选择工具 →</Link></div>:<div className={tableStyles.tableScroll} tabIndex={0} role="region" aria-label="工具对比"><table><caption className={tableStyles.srOnly}>对照查看你关心的条件</caption><thead><tr><th scope="col">你关心的条件</th>{rows.map(t=><th scope="col" key={t.slug}><Link href={"/ai/"+t.slug}>{t.name}</Link></th>)}</tr></thead><tbody>{fields.map(f=><tr key={f.label}><th scope="row">{f.label}</th>{rows.map(t=><td key={t.slug}>{f.value(t)}</td>)}</tr>)}<tr><th scope="row">去官网了解</th>{rows.map(t=><td key={t.slug}><a href={t.url} target="_blank" rel="noopener noreferrer">官方网站 ↗</a></td>)}</tr></tbody></table></div>}<aside className={tableStyles.help}><p>还拿不定主意？告诉我们用途、预算和所在地区。</p><Link href="/ai/help">请帮我选 →</Link></aside></section></div></main>;
}
