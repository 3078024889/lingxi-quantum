"use client";
import {Fragment,useEffect,useState} from "react";
import Link from "next/link";
import type {AITool} from "../../lib/ai-discovery/catalog";
import {selectTerminalRows,selectedProductIds,compareProductHref} from "../../lib/ai-discovery/terminal-selection";
import InformationStatus from "./information-status";
import styles from "./terminal.module.css";
const storageKey="lingxifield.ai.favorites.v1";
const columnNames:Record<string,string>={Company:"公司",Category:"分类",Price:"价格",Free:"免费怎么用",Region:"所在地区能用吗"};
const optionalColumns=Object.keys(columnNames);
const categories:Record<string,string>={Assistants:"综合助手",Research:"搜索研究",Coding:"编程与建站",Video:"视频",Design:"图片与设计",Audio:"音频与音乐",Documents:"文档办公",Automation:"自动化"};
const tagNames:Record<string,string>={writing:"写作",research:"查资料",coding:"编程",study:"学习",video:"制作视频",image:"图片处理",design:"设计",audio:"音频处理",music:"音乐创作",automation:"自动化",documents:"文档处理",website:"建站",search:"搜索",translation:"翻译",presentation:"制作演示文稿"};
const tasks=[{label:"做视频",query:"video"},{label:"画图设计",query:"design"},{label:"写代码",query:"coding"},{label:"查资料",query:"research"},{label:"做音乐",query:"music"}];
export default function TerminalWorkbench({tools,initialQuery="",initialCategory=""}:{tools:AITool[];initialQuery?:string;initialCategory?:string}){
 const [query,setQuery]=useState(initialQuery),[category,setCategory]=useState(initialCategory),[sort,setSort]=useState("name");
 const [expanded,setExpanded]=useState<string[]>([]),[selection,setSelection]=useState<string[]>([]),[favorites,setFavorites]=useState<string[]>([]);
 const [onlyFavorites,setOnlyFavorites]=useState(false),[columns,setColumns]=useState([...optionalColumns]),[notice,setNotice]=useState("");
 useEffect(()=>{try{setFavorites(selectedProductIds(JSON.parse(localStorage.getItem(storageKey)||"[]"),tools.map(t=>t.slug),500));}catch{setNotice("暂时无法读取收藏，你仍然可以查找工具。");}},[tools]);
 const rows=selectTerminalRows(tools,query,category,sort).filter(t=>!onlyFavorites||favorites.includes(t.slug));
 function favorite(id:string){const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];setFavorites(next);try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{setNotice("这次可以查看收藏，关闭页面后可能无法保留。");}}
 function reset(){setQuery("");setCategory("");setOnlyFavorites(false);}
 return <section className={styles.workbench} aria-label="全球 AI 工具">
 <form className={styles.search} onSubmit={e=>e.preventDefault()}><label htmlFor="market-search">想让 AI 帮你做什么？</label><p>先找用途，再比较价格和使用条件，选适合自己的工具。</p><div><input id="market-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索工具或用途，例如：视频、写代码、查资料" maxLength={100}/><button type="submit">找工具</button></div><div className={styles.suggestions}><span>试试：</span>{tasks.map(t=><button key={t.query} type="button" onClick={()=>{setQuery(t.label);setCategory("");setOnlyFavorites(false);}}>{t.label}</button>)}</div></form>
 <h2>全球 AI 产品行情</h2>
 <div className={styles.categoryTabs} aria-label="按用途选择"><button aria-pressed={!category} onClick={()=>setCategory("")}>全部</button>{Object.entries(categories).map(([key,label])=><button key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}>{label}</button>)}</div>
 <div className={styles.toolbar}><label>排列方式 <select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">按名称</option><option value="vendor">按公司</option><option value="category">按分类</option></select></label><label><input type="checkbox" checked={onlyFavorites} onChange={e=>setOnlyFavorites(e.target.checked)}/> 只看收藏</label><details><summary>选择显示内容</summary>{optionalColumns.map(c=><label key={c}><input type="checkbox" checked={columns.includes(c)} onChange={()=>setColumns(old=>old.includes(c)?old.filter(x=>x!==c):[...old,c])}/>{columnNames[c]}</label>)}</details></div>
 <p className={styles.status} role="status">找到 {rows.length} 个工具 · 可以展开了解，也可以选几个一起比较。</p>
 <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="工具列表"><table><caption className={styles.srOnly}>选择工具，了解用途和使用条件</caption><thead><tr><th scope="col">收藏</th><th scope="col">产品 / 用途</th>{optionalColumns.filter(c=>columns.includes(c)).map(c=><th scope="col" key={c}>{columnNames[c]}</th>)}<th scope="col">比较</th></tr></thead><tbody>{rows.map(t=><Fragment key={t.slug}><tr><td><button aria-label={`收藏 ${t.name}`} aria-pressed={favorites.includes(t.slug)} onClick={()=>favorite(t.slug)}>{favorites.includes(t.slug)?"★":"☆"}</button></td><th scope="row"><Link href={"/ai/"+t.slug}>{t.name}</Link><small>{categories[t.category]||t.category}</small><button aria-expanded={expanded.includes(t.slug)} aria-controls={"details-"+t.slug} onClick={()=>setExpanded(old=>old.includes(t.slug)?old.filter(x=>x!==t.slug):[...old,t.slug])}>{expanded.includes(t.slug)?"收起":"了解怎么用"}</button></th>{columns.includes("Company")&&<td>{t.provider}</td>}{columns.includes("Category")&&<td>{categories[t.category]||t.category}</td>}{columns.includes("Price")&&<td><a href={t.url} target="_blank" rel="noopener noreferrer">查看官网价格 ↗</a></td>}{columns.includes("Free")&&<td>免费额度待确认</td>}{columns.includes("Region")&&<td>请先确认所在地区</td>}<td><input type="checkbox" aria-label={`比较 ${t.name}`} checked={selection.includes(t.slug)} disabled={!selection.includes(t.slug)&&selection.length>=5} onChange={()=>setSelection(old=>old.includes(t.slug)?old.filter(x=>x!==t.slug):old.length<5?[...old,t.slug]:old)}/></td></tr><tr id={"details-"+t.slug} hidden={!expanded.includes(t.slug)}><td colSpan={columns.length+3} className={styles.expanded}><h3>{t.name} 能帮你做什么？</h3><p>{t.tags.map(tag=>tagNames[tag]).filter(Boolean).join("、") || categories[t.category]}。具体支持的功能和套餐请查看官方介绍。</p><InformationStatus product={t.name}/><a href={t.url} target="_blank" rel="noopener noreferrer">去官网使用 ↗</a> · <Link href={"/ai/"+t.slug}>查看完整介绍</Link> · <Link href="/ai/help">请帮我选</Link></td></tr></Fragment>)}</tbody></table></div>
 {!rows.length&&<div className={styles.empty}><h2>还没找到合适的？</h2><p>换一个用途或工具名称试试，也可以告诉我们你想完成什么。</p><button onClick={reset}>重新选择</button> <Link href="/ai/help">请帮我找工具</Link></div>}
 {selection.length>0&&<div className={styles.compareBar}><span>已选 {selection.length} 个，最多可选 5 个</span>{selection.length>=2?<Link href={compareProductHref(selection,tools.map(t=>t.slug))}>一起比较 →</Link>:<span>再选一个就能比较</span>}<button onClick={()=>setSelection([])}>清空选择</button></div>}
 {notice&&<p role="status">{notice}</p>}
 <aside className={styles.help}><div><strong>不确定哪个适合你？</strong><p>告诉我们用途、预算和所在地区，帮助你缩小选择范围。有关产品扣费、退款或账号的问题，请联系该产品官方客服。</p></div><Link href="/ai/help">获取帮助 →</Link></aside>
 </section>;
}

