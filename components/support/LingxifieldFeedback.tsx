"use client";
import{useEffect,useState}from"react";
import{createClient}from"@/lib/supabase/client";
export default function LingxifieldFeedback(){
 const[open,setOpen]=useState(false),[message,setMessage]=useState(""),[sent,setSent]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{const h=()=>setOpen(true);window.addEventListener("lingxifield:feedback",h);return()=>window.removeEventListener("lingxifield:feedback",h)},[]);
 async function submit(){
  if(message.trim().length<3)return;setBusy(true);
  try{
   const supabase=createClient();const{data:{session}}=await supabase.auth.getSession();const token=session?.access_token||"";
   const r=await fetch("/api/support/tickets",{method:"POST",headers:{"content-type":"application/json",...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify({message,pageUrl:location.href,route:location.pathname,viewport:{w:innerWidth,h:innerHeight}})});
   if(r.ok){setSent(true);setMessage("")}else if(r.status===401){location.href="/account?next="+encodeURIComponent(location.pathname)+"&support=1"}
  }finally{setBusy(false)}
 }
 return <><button aria-label="告诉我们遇到的问题" onClick={()=>setOpen(true)} style={{position:"fixed",right:18,bottom:18,zIndex:80,border:"1px solid rgba(150,125,70,.22)",borderRadius:999,padding:"10px 15px",background:"rgba(255,255,255,.92)",boxShadow:"0 12px 42px rgba(20,20,20,.12)",backdropFilter:"blur(14px)",fontWeight:650}}>✦ 告诉我们</button>
 {open&&<div role="dialog" aria-modal="true" style={{position:"fixed",inset:0,zIndex:100,background:"rgba(12,12,12,.24)",display:"grid",placeItems:"center",padding:18}} onMouseDown={e=>{if(e.currentTarget===e.target)setOpen(false)}}>
  <section style={{width:"min(520px,100%)",borderRadius:28,background:"#fff",padding:"28px",boxShadow:"0 28px 90px rgba(0,0,0,.18)"}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:16}}><div><small style={{opacity:.5}}>LINGXIFIELD CARE</small><h2 style={{margin:"6px 0 8px",fontSize:25}}>哪里没有按你期待的工作？</h2></div><button onClick={()=>setOpen(false)} aria-label="关闭" style={{border:0,background:"transparent",fontSize:22}}>×</button></div>
   {sent?<div style={{padding:"28px 0 10px",lineHeight:1.8}}><b>已收到 ✓</b><p style={{opacity:.66}}>这条留言已经保存，我们可以据此继续定位和修复。</p></div>:<>
    <p style={{opacity:.62,lineHeight:1.7}}>直接告诉我们发生了什么。当前页面和版本会一起带上，不需要你重复解释。</p>
    <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="例如：上传 PDF 后没有出现预览；我点击下载没有反应……" style={{width:"100%",minHeight:140,resize:"vertical",border:"1px solid #ddd",borderRadius:18,padding:16,font:"inherit",boxSizing:"border-box"}}/>
    <button disabled={busy||message.trim().length<3} onClick={submit} style={{marginTop:14,width:"100%",border:0,borderRadius:16,padding:"14px 18px",background:"#151515",color:"#fff",fontWeight:700}}>{busy?"正在发送…":"发送给灵犀场"}</button>
   </>}
  </section>
 </div>}</>
}