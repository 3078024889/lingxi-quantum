'use client';
import {useEffect,useState} from 'react';
import {MessageCircle,Send,Stars,ShieldCheck} from 'lucide-react';
import type {Language} from '../lib/v2';
import {FEEDBACK_I18N,FEEDBACK_CATEGORIES,type FeedbackCategory} from '../lib/visitor-feedback-i18n';
type PublicFeedback={id:string;category:FeedbackCategory;product_id:string|null;nickname:string;body:string;locale:Language;created_at:string};
const knownEmail='business@lingxifield.com';
export default function VisitorFeedback({language,productId}:{language:Language;productId?:string}){
 const t=FEEDBACK_I18N[language];
 const [kind,setKind]=useState<FeedbackCategory>(productId?'tool_experience':'site_experience');
 const [body,setBody]=useState(''),[nickname,setNickname]=useState('');
 const [submitted,setSubmitted]=useState(''),[error,setError]=useState(''),[sending,setSending]=useState(false);
 const [items,setItems]=useState<PublicFeedback[]>([]);
 const [contacts,setContacts]=useState<string[]>([knownEmail]);
 useEffect(()=>{fetch('/api/v1/contact-addresses').then(r=>r.ok?r.json():null).then(data=>{if(Array.isArray(data?.addresses))setContacts(data.addresses.slice(0,3));}).catch(()=>{});},[]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{const ctrl=new AbortController();setLoading(true);const q=productId?'?product='+encodeURIComponent(productId):'';
  fetch('/api/v1/feedback'+q,{signal:ctrl.signal,cache:'no-store'}).then(r=>r.ok?r.json():null)
   .then(data=>{if(!ctrl.signal.aborted)setItems(Array.isArray(data?.items)?data.items:[])})
   .catch(()=>{}).finally(()=>{if(!ctrl.signal.aborted)setLoading(false)});
  return()=>ctrl.abort();
 },[productId]);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(sending)return;
  setError('');setSubmitted('');
  if([...body.trim()].length<15||[...body.trim()].length>1500){setError(t.limit);return;}
  setSending(true);
  try{
   const response=await fetch('/api/v1/feedback',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({category:kind,body,nickname,locale:language,productId:productId||''})});
   if(!response.ok)throw new Error('submit');
   const result=await response.json();
   if(!result.accepted)throw new Error('submit');
   setSubmitted((result.published?t.published:t.pending).replace('{nickname}',result.nickname||nickname));
   if(result.published){
     const publicQuery=productId?'?product='+encodeURIComponent(productId):'';
     const fresh=await fetch('/api/v1/feedback'+publicQuery,{cache:'no-store'});
     if(fresh.ok){const data=await fresh.json();setItems(Array.isArray(data?.items)?data.items:[]);setLoading(false);}
   }
   setBody('');setNickname('');
  }catch{setError(t.error);}finally{setSending(false);}
 }
 return <section id="visitor-feedback" className="panel visitorFeedback" dir={language==='ar'?'rtl':'ltr'}>
  <div className="visitorFeedbackHead"><div className="visitorFeedbackIcon"><Stars size={21}/></div>
   <div><h2>{t.title}</h2><p>{t.intro}</p></div></div>
  <div className="visitorFeedbackCols"><form className="visitorFeedbackForm" onSubmit={submit}>
   <h3><MessageCircle size={17}/> {t.prompt}</h3>
   <label>{t.category}<select value={kind} onChange={e=>setKind(e.target.value as FeedbackCategory)}>
    {FEEDBACK_CATEGORIES.filter(x=>x!=='tool_experience'||Boolean(productId)).map(x=><option key={x} value={x}>{t.categories[x]}</option>)}
   </select></label>
   <label>{t.body}<textarea required value={body} onChange={e=>setBody(e.target.value)}
    rows={5} minLength={15} maxLength={1500} placeholder={t.prompt}/></label>
   <label>{t.nickname}<input type="text" value={nickname} maxLength={32}
     onChange={e=>setNickname(e.target.value)} placeholder={t.custom}/></label>
   <p className="visitorFeedbackPrivacy"><ShieldCheck size={14}/> {t.disclaimer}</p>
   {error&&<p role="alert" className="visitorFeedbackError">{error}</p>}
   {submitted&&<p role="status" className="visitorFeedbackSuccess">{submitted}</p>}
   <div className="visitorFeedbackActions"><button disabled={sending} type="submit"><Send size={15}/>{sending?'…':t.send}</button>
    <div className="visitorFeedbackContacts">{contacts.map(email=><a key={email} href={'mailto:'+email+'?subject='+encodeURIComponent('LINGXIFIELD AI Market feedback')}>{t.direct}: {email}</a>)}</div></div>
  </form><div className="visitorFeedbackPublished"><h3>{t.recent}</h3>
   {items.length?items.map(x=><article key={x.id} className="visitorFeedbackEntry">
    <div><strong>{x.nickname}</strong><span>{t.categories[x.category]}</span>
     <time dateTime={x.created_at}>{new Date(x.created_at).toLocaleDateString(language==='zh'?'zh-CN':language)}</time></div>
    <p>{x.body}</p></article>):!loading&&<p className="visitorFeedbackEmpty">{t.empty}</p>}
   <small>{t.privacy}</small></div></div>
 </section>;
}
