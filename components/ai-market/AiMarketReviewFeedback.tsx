'use client';
import { useEffect, useState } from 'react';
type RecordItem = {id:string;category:string;decision:string;note:string;created_at:string};
const types=[['design','页面设计'],['data','数据与证据'],['localization','九语言'],['commerce','收费商业'],['security','安全权限'],['release','发布验收']] as const;
export default function AiMarketReviewFeedback({revision}:{revision:string}) {
 const [category,setCategory]=useState('design');
 const [decision,setDecision]=useState('feedback');
 const [note,setNote]=useState('');
 const [records,setRecords]=useState<RecordItem[]>([]);
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
  let live=true;
  fetch('/api/ai-market/review-feedback?revision='+encodeURIComponent(revision),{cache:'no-store'})
   .then(async r=>{if(!r.ok)throw new Error('审核数据库尚未启用');return r.json();})
   .then(x=>{if(live)setRecords(Array.isArray(x.records)?x.records:[]);})
   .catch(e=>{if(live)setMessage(e.message);});
  return ()=>{live=false;};
 },[revision]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/ai-market/review-feedback',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,category,decision,note})});
   if(!r.ok){const x=await r.json().catch(()=>({}));throw new Error(x.error||'提交失败');}
   const x=await r.json();
   setRecords(v=>[{id:x.saved.id,category,decision,note,created_at:x.saved.created_at},...v].slice(0,100));
   setNote('');setMessage('意见已保存，仅用于内部审查，不会自动发布。');
  }catch(err){setMessage(err instanceof Error?err.message:'提交失败');}
  finally{setBusy(false);}
 }
 return <section style={{marginTop:20,padding:22,border:'1px solid #dae4f3',borderRadius:14,background:'#fff'}}>
  <h2 style={{fontSize:20,margin:'0 0 8px'}}>版本修改意见</h2>
  <p style={{fontSize:13,color:'#64748b'}}>意见按当前修订保存，需先完成审核表迁移。此处没有上线批准操作。</p>
  <form onSubmit={submit} style={{display:'grid',gap:12,maxWidth:820}}>
   <label>审查领域 <select aria-label="审查领域" value={category} onChange={e=>setCategory(e.target.value)} style={{padding:10,marginLeft:10,border:'1px solid #cbd5e1',borderRadius:7}}>
     {types.map(([value,title])=><option key={value} value={value}>{title}</option>)}
   </select></label>
   <label>意见类型 <select aria-label="意见类型" value={decision} onChange={e=>setDecision(e.target.value)} style={{padding:10,marginLeft:10,border:'1px solid #cbd5e1',borderRadius:7}}>
     <option value="feedback">提出建议</option><option value="request_changes">要求修改</option><option value="acknowledged">已审阅</option>
   </select></label>
   <textarea aria-label="修改意见" required minLength={3} maxLength={2000} rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="写出需要修改的位置、问题及期望结果" style={{padding:12,border:'1px solid #cbd5e1',borderRadius:8}}/>
   <button disabled={busy||note.trim().length<3} type="submit" style={{justifySelf:'start',padding:'11px 20px',color:'#fff',background:'#155eef',border:0,borderRadius:9,opacity:busy?.6:1}}>{busy?'提交中…':'保存审查意见'}</button>
  </form>
  {message&&<p role="status" style={{color:'#596c86'}}>{message}</p>}
  <h3 style={{fontSize:16,marginTop:24}}>本版本历史意见（最近 100 条）</h3>
  {records.length===0?<p style={{color:'#64748b'}}>暂无可读取的审核记录。</p>:<ul style={{paddingLeft:20}}>{records.map(x=><li key={x.id} style={{marginBottom:12}}><strong>{x.category} · {x.decision}</strong> <small>{x.created_at}</small><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',margin:'5px 0'}}>{x.note}</p></li>)}</ul>}
 </section>;
}
