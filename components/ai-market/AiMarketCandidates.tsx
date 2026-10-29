'use client';
import {useEffect,useState} from 'react';
type Item={candidate_key:string;source_url:string;kind:string;display_name:string;publisher:string;verification_status:string;last_seen_at:string};
export default function AiMarketCandidates(){
 const [filter,setFilter]=useState('candidate');
 const [search,setSearch]=useState('');
 const [query,setQuery]=useState('');
 const [page,setPage]=useState(1);
 const [records,setRecords]=useState<Item[]>([]);
 const [total,setTotal]=useState(0);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  let active=true;
  const controller=new AbortController();
  setLoading(true);setError('');
  const p=new URLSearchParams({status:filter,search:query,page:String(page),limit:'20'});
  fetch('/api/ai-market/candidates?'+p.toString(),{cache:'no-store',credentials:'same-origin',signal:controller.signal})
   .then(async res=>{if(!res.ok)throw new Error(res.status===503?'候选数据库尚未迁移或暂不可用':res.status===403?'管理员权限验证失败':'数据读取失败');return res.json();})
   .then(payload=>{if(active){setRecords(Array.isArray(payload.records)?payload.records:[]);setTotal(payload.total||0);}})
   .catch(err=>{if(active&&!controller.signal.aborted){setRecords([]);setTotal(0);setError(err.message);}})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;controller.abort();};
 },[filter,query,page]);
 return <section style={{marginTop:20,padding:20,border:'1px solid #dbe4f2',borderRadius:14,background:'#fff'}}>
   <h2 style={{fontSize:20,margin:'0 0 8px'}}>真实来源候选数据</h2>
   <p style={{fontSize:13,color:'#64748b'}}>仅管理员可见。这里的模型仓库和 Spaces 是候选来源，不代表已核验产品或真实市场排名。</p>
   <form onSubmit={e=>{e.preventDefault();setPage(1);setQuery(search.trim());}} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
    <input aria-label="搜索候选记录" value={search} maxLength={80} onChange={e=>setSearch(e.target.value)} placeholder="模型名称或发布者" style={{padding:10,flex:'1 1 230px',border:'1px solid #cbd5e1',borderRadius:8}}/>
    <select aria-label="核验状态" value={filter} onChange={e=>{setFilter(e.target.value);setPage(1);}} style={{padding:10,border:'1px solid #cbd5e1',borderRadius:8}}>
      <option value="candidate">待核验</option><option value="verified">已核验</option><option value="rejected">已拒绝</option><option value="all">全部</option>
    </select>
    <button type="submit" style={{padding:'10px 18px',background:'#155eef',color:'#fff',border:0,borderRadius:8}}>搜索</button>
   </form>
   {loading?<p role="status">正在读取候选数据…</p>:error?<p role="status" style={{color:'#a44235'}}>{error}</p>:<>
    <p style={{fontSize:13,color:'#64748b'}}>符合条件的候选记录：{total} 条</p>
    {records.length===0?<p>暂无数据。请先完成数据库迁移和候选数据导入。</p>:
      <div style={{display:'grid',gap:9}}>{records.map(item=><article key={item.candidate_key} style={{border:'1px solid #e2e8f0',borderRadius:10,padding:13}}>
       <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
        <strong>{item.display_name}</strong><span style={{fontSize:12,color:'#64748b'}}>{item.verification_status==='verified'?'已核验':item.verification_status==='rejected'?'已拒绝':'待核验'}</span>
       </div>
       <p style={{fontSize:12,color:'#64748b',margin:'6px 0'}}>{item.publisher} · {item.kind==='model_repository'?'模型仓库':'Spaces 应用'} · 最近发现：{item.last_seen_at?.slice(0,10)||'未知'}</p>
       <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{fontSize:13,overflowWrap:'anywhere'}}>官方来源 ↗</a>
      </article>)}</div>}
    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:16}}>
     <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>上一页</button><span>第 {page} 页</span><button disabled={page*20>=total} onClick={()=>setPage(p=>p+1)}>下一页</button>
    </div>
   </>}
 </section>;
}
