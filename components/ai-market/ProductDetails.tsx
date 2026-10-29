'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
type Claim={value:string;sourceUrl:string;sourceName:string;checkedAt:string};
type Product={id:string;name:string;officialUrl:string|null;sourceUrl:string|null;fields:Record<string,Claim>;conflictingFields:string[];hasUnverifiedFields:boolean};
export default function ProductDetails({id}:{id:string}){
 const [item,setItem]=useState<Product|null>(null);const [error,setError]=useState('');
 useEffect(()=>{let live=true;fetch('/api/ai-market/products/'+encodeURIComponent(id),{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error(String(r.status));return r.json() as Promise<Product>}).then(d=>{if(live)setItem(d)}).catch(()=>{if(live)setError('当前无法取得已核验的产品资料。')});return()=>{live=false}},[id]);
 return <main style={{maxWidth:900,margin:'0 auto',padding:'40px 18px 90px',fontFamily:'system-ui',color:'#14253c'}}>
  <Link href="/ai-market">← 返回 AI 工具搜索</Link>
  {error?<p role="status">{error}</p>:!item?<p role="status">正在查询资料…</p>:<>
    <h1 style={{fontSize:'clamp(28px,5vw,42px)',margin:'24px 0 8px'}}>{item.name}</h1>
    <p style={{color:'#61738f'}}>仅显示有人工核验记录的资料；缺少证据的字段不推测。</p>
    {item.officialUrl?<p><a href={item.officialUrl} rel="noopener noreferrer" target="_blank">打开官方网站</a></p>:null}
    <section style={{display:'grid',gap:12,marginTop:24}}>
      {Object.entries(item.fields).map(([key,c])=><article key={key} style={{padding:18,border:'1px solid #d9e2ee',borderRadius:14}}>
        <h2 style={{fontSize:16,margin:'0 0 8px'}}>{key.replaceAll('_',' ')}</h2>
        <p style={{margin:'0 0 8px'}}>{c.value}</p>
        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">查看原始证据：{c.sourceName}</a>
      </article>)}
    </section>
    {Object.keys(item.fields).length===0?<p>暂无可公开展示的已核验产品资料。</p>:null}
    {item.conflictingFields.length?<p>以下信息因不同来源冲突而暂不展示：{item.conflictingFields.join('、')}</p>:null}
    <p style={{fontSize:13,color:'#64748b',marginTop:26}}>免费额度、价格、中国大陆可用性和用户反馈等，均须依据具体产品的最新来源进行核实。</p>
  </>}
 </main>;
}
