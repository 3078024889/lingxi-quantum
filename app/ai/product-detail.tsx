import Link from "next/link";
import type {AITool} from "../../lib/ai-discovery/catalog";
import {latestFacts,productHistory,isStale,factLabels,type ProductFact,type FactKey} from "../../lib/ai-discovery/product-facts";
import {vendorEnquiryHref} from "../../lib/ai-discovery/evidence-status";
import styles from "./terminal.module.css";
export function FactValue({fact,compact=false}:{fact?:ProductFact;compact?:boolean}){
 if(!fact)return <span className={styles.muted}>待核实</span>;
 return <span>{fact.text} <a href={fact.source} target="_blank" rel="noopener noreferrer" title={`${fact.scope} · 查阅于 ${fact.checkedAt}`}>来源 ↗</a>{!compact&&<small>{fact.scope} · 查阅于 {fact.checkedAt}{isStale(fact,new Date().toISOString())?" · 资料待更新":""}</small>}</span>;
}
export default function ProductDetail({tool}:{tool:AITool}){
 const snapshot=latestFacts(tool.slug);const facts=snapshot?.facts||{};const history=productHistory(tool.slug);
 const fields=(keys:FactKey[])=> <dl>{keys.map(key=><div key={key}><dt>{factLabels[key]}</dt><dd><FactValue fact={facts[key]}/></dd></div>)}</dl>;
 return <div className={styles.details}>
  <section><h3>公司与入口</h3><p>{tool.provider}</p><p>公司成立时间、法律主体：待核实</p><a href={tool.url} target="_blank" rel="noopener noreferrer">去官网使用 ↗</a></section>
  <section><h3>功能与模型</h3>{fields(["purpose","models"])}</section>
  <section><h3>免费与收费</h3>{fields(["free","price","failure","refund"])}</section>
  <section><h3>使用条件</h3>{fields(["region","phone","card","watermark","commercial"])}</section>
  <section><h3>实际使用情况</h3><p>暂无可展示的用户使用记录。上面的说明来自官方页面，不代表用户实测结果。</p><Link href="/account/support">提交使用体验</Link></section>
  <section><h3>资料与变化</h3>{history.length?<><p>已保存 {history.length} 次资料记录，暂不足以计算涨跌。</p><ul>{history.map(s=><li key={s.observedAt}>{s.observedAt} · {Object.keys(s.facts).length} 项资料；这是记录日期，不是产品发布日期。</li>)}</ul></>:<p>暂无历史记录。</p>}</section>
  <footer><a href={vendorEnquiryHref(tool.name,"correction")}>反馈资料错误</a> · <Link href="/ai/vendors">我是厂商</Link></footer>
 </div>;
}
