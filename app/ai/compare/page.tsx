import type {Metadata} from "next";
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
 const names:Record<string,string>={Assistants:"综合助手",Research:"搜索研究",Coding:"编程与建站",Video:"视频",Design:"图片与设计",Audio:"音频与音乐",Documents:"文档办公",Automation:"自动化"};
 const fields=[{label:"公司",value:(t:typeof aiTools[number])=>t.provider},{label:"主要用途",value:(t:typeof aiTools[number])=>names[t.category]||t.category},{label:"价格与免费额度",value:()=>"待确认，请查看官网最新说明"},{label:"使用地区",value:()=>"请向官方确认所在地区能否使用"},{label:"使用体验",value:()=>"暂无独立体验记录"}];
 return <main className={styles.page}><div className={styles.shell}><header className={styles.topbar}><Link className={styles.brand} href="/ai">LINGXIFIELD</Link><Link href="/ai">选择工具</Link></header><section className={tableStyles.workbench}><h1>哪个更适合你？</h1><p>一起比较 2–5 个工具。复制本页链接，也能把你的选择分享给别人。</p>{rows.length<2?<div className={styles.empty}><h2>先选择至少两个不同的工具</h2><Link href="/ai">选择工具 →</Link></div>:<div className={tableStyles.tableScroll} tabIndex={0} role="region" aria-label="工具对比"><table><caption className={tableStyles.srOnly}>对照查看你关心的条件</caption><thead><tr><th scope="col">你关心的条件</th>{rows.map(t=><th scope="col" key={t.slug}><Link href={"/ai/"+t.slug}>{t.name}</Link></th>)}</tr></thead><tbody>{fields.map(f=><tr key={f.label}><th scope="row">{f.label}</th>{rows.map(t=><td key={t.slug}>{f.value(t)}</td>)}</tr>)}<tr><th scope="row">去官网了解</th>{rows.map(t=><td key={t.slug}><a href={t.url} target="_blank" rel="noopener noreferrer">官方网站 ↗</a></td>)}</tr></tbody></table></div>}<aside className={tableStyles.help}><p>还拿不定主意？告诉我们用途、预算和所在地区。</p><Link href="/ai/help">请帮我选 →</Link></aside></section></div></main>;
}
