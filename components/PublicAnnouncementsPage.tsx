"use client";
import {useEffect,useMemo,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
type Item={id:string;version:string|null;titleZh:string;titleEn:string;bodyZh:string;bodyEn:string;platform:string;publishedAt:string};
type Filter="all"|"web"|"miniapp";
export default function PublicAnnouncementsPage(){
 const {lang}=useLingxiLang();
 const [items,setItems]=useState<Item[]>([]),[filter,setFilter]=useState<Filter>("all"),[error,setError]=useState(false);
 useEffect(()=>{let ok=true;fetch("/api/site-announcements",{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error("unavailable");return r.json()}).then(data=>{if(ok)setItems(Array.isArray(data.items)?data.items:[])}).catch(()=>{if(ok)setError(true)});return()=>{ok=false}},[]);
 useEffect(()=>{
  if(items.length===0)return;
  let frame=0;
  const focusAnnouncement=()=>{
   let id="";
   try{id=decodeURIComponent(window.location.hash.slice(1))}catch{return;}
   if(!id||!items.some(item=>item.id===id))return;
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    const article=document.getElementById(id);
    article?.scrollIntoView({behavior:"smooth",block:"center"});
    article?.focus({preventScroll:true});
   });
  };
  focusAnnouncement();
  window.addEventListener("hashchange",focusAnnouncement);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("hashchange",focusAnnouncement);};
 },[items]);
 const shown=useMemo(()=>items.filter(x=>filter==="all"||x.platform===filter||x.platform==="all"),[items,filter]);
 const zh=lang==="zh";
 return <main className="lx11-page" style={{minHeight:"80vh",background:"var(--lx-bg)"}}><div style={{width:"min(1024px,100%)",margin:"0 auto",padding:"22px 12px 80px"}}>
 <div style={{fontSize:11,color:"#427eae",letterSpacing:".2em",fontWeight:750}}>LINGXIFIELD / ANNOUNCEMENTS</div>
 <h1 style={{fontSize:"clamp(26px,4vw,40px)",margin:"10px 0 12px",fontWeight:750}}>{zh?"平台公告与版本更新":"Announcements & releases"}</h1>
 <p style={{fontSize:14,lineHeight:1.85,color:"var(--lx-muted)"}}>{zh?"网站升级、小程序版本、工具发布和服务状态，按实际发布与验收记录持续更新。":"Verified website, mini-program, tool and service updates in chronological order."}</p>
 <div style={{display:"flex",gap:8,margin:"24px 0 18px",flexWrap:"wrap"}}>{(["all","web","miniapp"] as const).map((f)=><button type="button" onClick={()=>setFilter(f)} aria-pressed={filter===f} key={f} style={{border:"1px solid var(--lx-line)",background:filter===f?"#e8f3ff":"var(--lx-panel)",padding:"9px 16px",borderRadius:10,fontSize:13,color:filter===f?"#225a94":"var(--lx-ink)"}}>{f==="all"?(zh?"全部更新":"All"):f==="web"?(zh?"网站与工具":"Website & tools"):(zh?"微信小程序":"Mini-program")}</button>)}</div>
 {error&&<p role="alert">{zh?"当前公告读取暂时不可用，请稍后刷新。":"Announcements are temporarily unavailable."}</p>}
 <div style={{display:"grid",gap:12}}>{shown.map(item=><article key={item.id} id={item.id} tabIndex={-1} style={{padding:"20px 24px",background:"var(--lx-panel)",border:"1px solid var(--lx-line)",borderRadius:16,boxShadow:"0 6px 18px rgba(29,55,82,.03)"}}>
 <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap",alignItems:"center"}}><small style={{fontSize:12,color:"#377bb8"}}>{item.platform==="miniapp"?(zh?"小程序":"Mini-program"):(zh?"平台更新":"Platform update")}</small><time style={{color:"var(--lx-muted)",fontSize:12}}>{new Date(item.publishedAt).toLocaleDateString(zh?"zh-CN":"en-US")}</time></div>
 <h2 style={{fontSize:18,fontWeight:720,margin:"12px 0 9px"}}>{zh?item.titleZh:item.titleEn||item.titleZh}</h2>
 <p style={{lineHeight:1.9,color:"var(--lx-muted)",fontSize:13}}>{zh?item.bodyZh:item.bodyEn||item.bodyZh}</p>
 </article>)}</div>
 {shown.length===0&&!error&&<p style={{fontSize:14,color:"var(--lx-muted)",padding:20}}>{zh?"暂无匹配公告。":"No updates found."}</p>}
 </div></main>;
}
