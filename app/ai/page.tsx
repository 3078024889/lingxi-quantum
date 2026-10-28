import type {Metadata} from "next";
import Link from "next/link";
import {aiTools} from "../../lib/ai-discovery/catalog";
import {singleQueryValue} from "../../lib/ai-discovery/query";
import TerminalWorkbench from "./terminal-workbench";
import styles from "./discovery.module.css";
export const metadata:Metadata={title:"全球 AI 产品行情与选择｜灵犀场",description:"按用途查找 AI 工具，对比免费额度、价格和实际使用条件。",alternates:{canonical:"https://lingxifield.com/ai"}};
type Params={q?:string|string[];category?:string|string[]};
export default async function AIDiscovery({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams;
 const structured={"@context":"https://schema.org","@type":"CollectionPage",name:"Global AI Market",url:"https://lingxifield.com/ai"};
 return <main className={styles.page}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,"\\u003c")}}/><div className={styles.shell}>
 <header className={styles.topbar}><Link href="/ai" className={styles.brand}>LINGXIFIELD <span>AI</span></Link><nav aria-label="AI market"><Link href="/ai/rankings">排行榜</Link><Link href="/ai/compare">工具对比</Link><Link href="/ai/open-source">开源工具</Link></nav></header>
 <TerminalWorkbench tools={aiTools} initialQuery={singleQueryValue(p.q,100)} initialCategory={singleQueryValue(p.category,60)}/>
 <footer className={styles.footer}><Link href="/ai/sources">信息来源与排名规则</Link></footer>
 </div></main>;
}
