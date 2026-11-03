'use client';
import {useState,type FormEvent} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {vendorCopy} from '@/lingxifield-ai-market/lib/market-vendor-i18n';

const LOCALES=['zh','en','ja','ko','fr','de','es','pt','ar'];
type Kind='update'|'list';
const field='w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600';
export default function ClaimForm(){
 const search=useSearchParams(),{lang}=useLingxiLang();
 const preferred=search.get('lang')||lang;
 const locale=(LOCALES.includes(preferred)?preferred:lang) as Parameters<typeof vendorCopy>[0];
 const t=vendorCopy(locale);
 const [kind,setKind]=useState<Kind>(search.get('product')?'update':'list');
 const [productName,setProductName]=useState(search.get('name')||'');
 const [officialSite,setOfficialSite]=useState('');
 const [submitterName,setSubmitterName]=useState('');
 const [workEmail,setWorkEmail]=useState('');
 const [evidenceUrl,setEvidenceUrl]=useState('');
 const [description,setDescription]=useState('');
 const [busy,setBusy]=useState(false),[success,setSuccess]=useState(false),[message,setMessage]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||success)return;setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/vendor/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestType:kind,projectId:search.get('product')||'',productName,officialSite,submitterName,workEmail,evidenceUrl,description})});
   if(response.status!==202)throw new Error(t.failure);
   setSuccess(true);setMessage(t.success);
  }catch{setMessage(t.failure)}finally{setBusy(false)}
 }
 return <div lang={locale} dir={locale==='ar'?'rtl':'ltr'} className="mx-auto max-w-3xl space-y-6 text-[var(--lx-ink)]">
  <Link href="/siai" className="text-sm font-semibold text-blue-700 underline underline-offset-4">{t.back}</Link>
  <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 sm:p-8">
   <p className="text-sm font-semibold text-blue-700">{t.badge}</p><h1 className="mt-3 text-2xl font-bold sm:text-3xl">{t.title}</h1><p className="mt-3 text-sm leading-7">{t.intro}</p>
   <form onSubmit={submit} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
    <label className="flex flex-col gap-2 text-sm font-semibold">{t.request}<select value={kind} onChange={e=>setKind(e.target.value as Kind)} className={field}><option value="update">{t.update}</option><option value="list">{t.list}</option></select></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">{t.product} *<input name="productName" required maxLength={160} className={field} value={productName} onChange={e=>setProductName(e.target.value)}/></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">{t.website} *<input name="officialSite" type="url" required maxLength={1000} placeholder="https://" className={field} value={officialSite} onChange={e=>setOfficialSite(e.target.value)}/></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">{t.name} *<input name="submitterName" required maxLength={120} className={field} value={submitterName} onChange={e=>setSubmitterName(e.target.value)}/></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">{t.email} *<input name="workEmail" type="email" required maxLength={254} className={field} value={workEmail} onChange={e=>setWorkEmail(e.target.value)}/></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">{t.evidence} *<input name="evidenceUrl" type="url" required maxLength={1000} placeholder="https://" className={field} value={evidenceUrl} onChange={e=>setEvidenceUrl(e.target.value)}/></label>
    <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">{t.description}<textarea rows={4} maxLength={1200} placeholder={t.descriptionHint} className={field} value={description} onChange={e=>setDescription(e.target.value)}/></label>
    <p className="text-xs leading-6 sm:col-span-2">{t.privacy}</p>
    <div className="flex flex-wrap items-center gap-4 sm:col-span-2"><button type="submit" disabled={busy||success} className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy?t.submitting:success?t.submitted:t.submit}</button><Link href="/account" className="text-sm text-blue-700 underline underline-offset-4">{t.accountAction}</Link></div>
    {message&&<p role="status" className="text-sm leading-7 sm:col-span-2">{message}{!success&&<> <a href="mailto:business@lingxifield.com" className="underline">business@lingxifield.com</a></>}</p>}
   </form>
  </div>
 </div>;
}
