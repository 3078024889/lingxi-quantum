"use client";
import {Fragment,useEffect,useState} from "react";
import Link from "next/link";
import type {AITool} from "../../lib/ai-discovery/catalog";
import {selectTerminalRows,selectedProductIds,compareProductHref,terminalCategories,categoryMatches} from "../../lib/ai-discovery/terminal-selection";
import {latestFacts,questionFields,factLabels} from "../../lib/ai-discovery/product-facts";
import ProductDetail,{FactValue} from "./product-detail";
import styles from "./terminal.module.css";
const storageKey="lingxifield.ai.favorites.v1";
const columnNames:Record<string,string>={Company:"公司",Free:"免费额度",Price:"价格",Region:"地区",Trend:"趋势"};
const optionalColumns=Object.keys(columnNames);
export default function TerminalWorkbench({tools,initialQuery="",initialCategory=""}:{tools:AITool[];initialQuery?:string;initialCategory?:string}){
 const [query,setQuery]=useState(initialQuery),[category,setCategory]=useState(initialCategory),[sort,setSort]=useState("updated");
 const [expanded,setExpanded]=useState<string[]>([]),[selection,setSelection]=useState<string[]>([]),[favorites,setFavorites]=useState<string[]>([]);
 const [onlyFavorites,setOnlyFavorites]=useState(false),[columns,setColumns]=useState(["Free","Price","Region","Trend"]),[notice,setNotice]=useState("");
 useEffect(()=>{try{setFavorites(selectedProductIds(JSON.parse(localStorage.getItem(storageKey)||"[]"),tools.map(t=>t.slug),500));}catch{setNotice("暂时无法读取收藏。");}},[tools]);
 const rows=selectTerminalRows(tools,query,category,sort).filter(t=>!onlyFavorites||favorites.includes(t.slug));
 if(sort==="updated")rows.sort((a,b)=>(latestFacts(b.slug)?.observedAt||"").localeCompare(latestFacts(a.slug)?.observedAt||"")||a.name.localeCompare(b.name));
 const questions=questionFields(query);
 function favorite(id:string){const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];setFavorites(next);try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{setNotice("收藏仅在本次访问保留。");}}
 function toggle(id:string){setSelection(old=>old.includes(id)?old.filter(x=>x!==id):old.length<5?[...old,id]:old);}
 function expand(id:string){setExpanded(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
 const controls=(t:AITool,mode:string)=><div className={styles.rowActions}><button aria-label={`收藏 ${t.name}`} aria-pressed={favorites.includes(t.slug)} onClick={()=>favorite(t.slug)}>{favorites.includes(t.slug)?"★":"☆"}</button><button aria-expanded={expanded.includes(t.slug)} aria-controls={`details-${mode}-${t.slug}`} onClick={()=>expand(t.slug)}>{expanded.includes(t.slug)?"收起":"详情"}</button><label><input type="checkbox" aria-label={`比较 ${t.name}`} checked={selection.includes(t.slug)} disabled={!selection.includes(t.slug)&&selection.length>=5} onChange={()=>toggle(t.slug)}/>比较</label></div>;
 const value=(t:AITool,c:string)=>{const f=latestFacts(t.slug)?.facts;return c==="Company"?t.provider:c==="Trend"?<span title="历史数据不足，暂不计算涨跌">—</span>:<FactValue compact fact={f?.[c==="Free"?"free":c==="Price"?"price":"region"]}/>;};
 const answers=(t:AITool)=>questions.length?<div className={styles.answers}>{questions.map(key=><p key={key}><strong>{factLabels[key]}：</strong><FactValue fact={latestFacts(t.slug)?.facts[key]}/></p>)}</div>:null;
 return <section className={styles.workbench} aria-label="全球 AI 工具">
 <form className={styles.search} onSubmit={e=>e.preventDefault()}><label htmlFor="market-search">全球 AI 工具，一搜就懂</label><div><input id="market-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入工具名称，或问：Pika 免费额度每天恢复吗？" maxLength={100}/><button type="submit">搜索</button></div></form>
 <div className={styles.categoryTabs} aria-label="按用途选择"><button aria-pressed={!category} onClick={()=>setCategory("")}>全部</button>{Object.entries(terminalCategories).filter(([key])=>tools.some(t=>categoryMatches(t,key))).map(([key,label])=><button key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}>{label}</button>)}</div>
 <div className={styles.marketHead}><h2>全球 AI 产品行情 <small>{rows.length} 个产品</small></h2><div className={styles.toolbar}><label><span className={styles.srOnly}>排列方式</span><select aria-label="排列方式" value={sort} onChange={e=>setSort(e.target.value)}><option value="updated">资料已更新优先</option><option value="name">按名称</option><option value="vendor">按公司</option></select></label><label><input type="checkbox" checked={onlyFavorites} onChange={e=>setOnlyFavorites(e.target.checked)}/>收藏</label><details><summary>显示列</summary>{optionalColumns.map(c=><label key={c}><input type="checkbox" checked={columns.includes(c)} onChange={()=>setColumns(old=>old.includes(c)?old.filter(x=>x!==c):[...old,c])}/>{columnNames[c]}</label>)}</details></div></div>
 <p className={styles.status} role="status">{questions.length?"按你关心的条件逐项查看；待核实不代表支持。":"按资料更新时间或名称排列，不代表能力排名。"} 历史记录不足的产品暂不显示涨跌。</p>
 <div className={`${styles.tableScroll} ${styles.desktopTable}`} tabIndex={0} role="region" aria-label="工具列表"><table><caption className={styles.srOnly}>产品用途、免费额度与价格</caption><thead><tr><th scope="col">产品 / 主要用途</th>{optionalColumns.filter(c=>columns.includes(c)).map(c=><th scope="col" key={c}>{columnNames[c]}</th>)}<th scope="col">选择</th></tr></thead><tbody>{rows.map(t=><Fragment key={t.slug}><tr><th scope="row"><Link href={"/ai/"+t.slug}>{t.name}</Link><small>{latestFacts(t.slug)?.facts.purpose?.text||terminalCategories[t.category]||t.category}</small></th>{optionalColumns.filter(c=>columns.includes(c)).map(c=><td key={c}>{value(t,c)}</td>)}<td>{controls(t,"desktop")}</td></tr>{questions.length>0&&<tr><td colSpan={columns.length+2}>{answers(t)}</td></tr>}<tr id={`details-desktop-${t.slug}`} hidden={!expanded.includes(t.slug)}><td colSpan={columns.length+2} className={styles.expanded}><ProductDetail tool={t}/><Link href={"/ai/"+t.slug}>展开完整资料 →</Link></td></tr></Fragment>)}</tbody></table></div>
 <div className={styles.mobileCards}>{rows.map(t=><article key={t.slug}><h3><Link href={"/ai/"+t.slug}>{t.name}</Link></h3><p>{latestFacts(t.slug)?.facts.purpose?.text||terminalCategories[t.category]||t.category}</p><dl>{optionalColumns.filter(c=>columns.includes(c)&&c!=="Trend").map(c=><div key={c}><dt>{columnNames[c]}</dt><dd>{value(t,c)}</dd></div>)}</dl>{answers(t)}{controls(t,"mobile")}<div id={`details-mobile-${t.slug}`} hidden={!expanded.includes(t.slug)}><ProductDetail tool={t}/><Link href={"/ai/"+t.slug}>展开完整资料 →</Link></div></article>)}</div>
 {!rows.length&&<div className={styles.empty}><h2>还没找到合适的？</h2><button onClick={()=>{setQuery("");setCategory("");setOnlyFavorites(false);}}>重新选择</button> <Link href="/ai/help">告诉我们你的需求</Link></div>}
 {selection.length>0&&<div className={styles.compareBar} aria-label="已选工具"><span>已选 {selection.length}/5</span><div className={styles.selectedNames}>{selection.map(id=><button key={id} aria-label={`移除 ${tools.find(t=>t.slug===id)?.name}`} onClick={()=>toggle(id)}>{tools.find(t=>t.slug===id)?.name} ×</button>)}</div>{selection.length>=2?<Link href={compareProductHref(selection,tools.map(t=>t.slug))}>一起比较 →</Link>:<span>再选一个</span>}<button onClick={()=>setSelection([])}>清空</button></div>}
 {notice&&<p role="status">{notice}</p>}
 </section>;
}
