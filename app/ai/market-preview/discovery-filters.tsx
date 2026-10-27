"use client";
import {useState} from "react";
import Link from "next/link";
import {marketComparisonUrl} from "../../../lib/ai-discovery/market-discovery";
type Model={id:string;name:string};
export default function MarketSelection({models}:{models:Model[]}){
 const [ids,setIds]=useState<string[]>([]);
 const toggle=(id:string)=>setIds(old=>old.includes(id)?old.filter(x=>x!==id):old.length<4?[...old,id]:old);
 return <div style={{margin:"14px 0 22px",border:"1px solid #dfe3e8",borderRadius:12,padding:14,background:"#fff"}}>
 <strong>Compare models ({ids.length}/4)</strong>
 <p style={{fontSize:13,color:"#56657a"}}>Select up to four models from the current results. This selection stays in your browser.</p>
 <div style={{display:"flex",flexWrap:"wrap",gap:8,maxHeight:200,overflowY:"auto"}}>
 {models.map(m=><label key={m.id} style={{display:"flex",alignItems:"center",gap:5,border:"1px solid #e1e5e9",borderRadius:8,padding:"7px 10px",fontSize:12}}>
 <input type="checkbox" checked={ids.includes(m.id)} disabled={ids.length>=4&&!ids.includes(m.id)} onChange={()=>toggle(m.id)}/><span>{m.name}</span></label>)}
 </div>
 {ids.length>=2?<p><Link href={marketComparisonUrl(ids)}>Compare {ids.length} selected models →</Link></p>:<p role="status" style={{fontSize:12}}>Choose at least two models to open the workload cost comparison.</p>}
 </div>;
}
