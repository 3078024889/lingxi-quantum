'use client';
import {useCallback,useEffect,useState} from 'react';
type Item={id:string;category:string;nickname:string;body:string;product_id:string|null;locale:string;created_at:string};
const CATEGORY:Record<string,string>={tool_experience:'AI 工具体验',site_experience:'网站体验',bug:'BUG 报告',suggestion:'功能建议',correction:'信息纠错'};
export default function FeedbackModeration(){
 const [email,setEmail]=useState('business@lingxifield.com');
 const [password,setPassword]=useState('');
 const [authorized,setAuthorized]=useState<boolean|null>(null);
 const [items,setItems]=useState<Item[]>([]);
 const [working,setWorking]=useState('');
 const [error,setError]=useState('');
 const [notes,setNotes]=useState<Record<string,string>>({});
 const load=useCallback(async()=>{
  const r=await fetch('/api/v1/admin/feedback',{credentials:'same-origin',cache:'no-store'});
  if(!r.ok){setAuthorized(false);setItems([]);return;}
  const data=await r.json();setItems(Array.isArray(data.items)?data.items:[]);setAuthorized(true);
 },[]);
 useEffect(()=>{load().catch(()=>setAuthorized(false));},[load]);
 async function login(e:React.FormEvent){
  e.preventDefault();setWorking('login');setError('');
  try{
   const r=await fetch('/api/v1/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},
    credentials:'same-origin',body:JSON.stringify({email,password})});
   if(!r.ok)throw new Error(r.status===403?'账户未取得审核权限。':'登录失败，请检查账户和密码。');
   setPassword('');await load();
  }catch(e){setError(e instanceof Error?e.message:'登录失败');}
  finally{setWorking('');}
 }
 async function decide(item:Item,decision:'approved'|'rejected'){
  if(working)return;setWorking(item.id);setError('');
  try{
   const r=await fetch('/api/v1/admin/feedback',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:item.id,decision,reason:notes[item.id]||''})});
   if(!r.ok)throw new Error('审核未成功，请检查权限或刷新队列。');
   await load();
  }catch(e){setError(e instanceof Error?e.message:'审核失败');}
  finally{setWorking('');}
 }
 async function logout(){
  setError('');
  try{await fetch('/api/v1/admin/session',{method:'DELETE',credentials:'same-origin'});}
  finally{setAuthorized(false);setItems([]);setPassword('');}
 }
 return <main className="feedbackAdminPage">
  <a href="/">← 灵犀场首页</a>
  <header><h1>全球 AI/SI 行情 · 真实反馈审核</h1>
   <p>独立于厂商认领和客观排名。只能由平台已授权审核员批准公开；所有处理保存不可篡改的数据库审核记录。</p></header>
  {authorized===null?<p role="status">正在核对安全会话…</p>:null}
  {authorized===false?<form className="feedbackAdminLogin" onSubmit={login}>
   <h2>平台审核员安全登录</h2>
   <label>已授权邮箱<input required type="email" value={email} autoComplete="username"
     onChange={e=>setEmail(e.target.value)}/></label>
   <label>密码<input required type="password" minLength={6} value={password} autoComplete="current-password"
     onChange={e=>setPassword(e.target.value)}/></label>
   <button disabled={working==='login'} type="submit">{working==='login'?'验证中…':'登录并检查权限'}</button>
   <p>仅已验证的业务管理账号有权审核。登录令牌保存在 HttpOnly、Secure、SameSite=Strict Cookie，不会放在浏览器本地存储。</p>
  </form>:null}
  {authorized&&<div className="feedbackAdminControls"><h2>待审核 {items.length} 条</h2>
    <button onClick={()=>load().catch(()=>setError('刷新失败'))}>刷新审核队列</button><button onClick={logout}>退出登录</button></div>}
  {error&&<p role="alert" className="visitorFeedbackError">{error}</p>}
  {authorized&&items.length===0&&<p>当前没有待审信息。</p>}
  {authorized&&items.map(item=><article className="feedbackAdminItem" key={item.id}>
   <div className="feedbackAdminMeta"><strong>{item.nickname}</strong><span>{CATEGORY[item.category]||item.category}</span>
    <span>{item.product_id?'产品：'+item.product_id:'网站总体'}</span>
    <span>{item.locale} · {new Date(item.created_at).toLocaleString('zh-CN')}</span></div>
   <p>{item.body}</p>
   <label>审核备注（不公开）<textarea value={notes[item.id]||''}
     maxLength={500} rows={2} onChange={e=>setNotes(o=>({...o,[item.id]:e.target.value}))}/></label>
   <div className="feedbackAdminActions">
    <button disabled={Boolean(working)} onClick={()=>decide(item,'approved')}>核验通过 · 公开展示</button>
    <button disabled={Boolean(working)} onClick={()=>decide(item,'rejected')}>驳回 · 不公开</button>
   </div>
  </article>)}
 </main>;
}
