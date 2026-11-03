'use client';
import {Suspense,useState} from 'react';
import {useParams,useSearchParams} from 'next/navigation';
import {isMarketLanguage} from '../../../../lib/market-secondary-i18n';
import {vendorCopy} from '../../../../lib/market-vendor-i18n';
type Kind='update'|'list';
function ClaimUI(){
 const params=useParams<{lang:string}>(),search=useSearchParams();
 const language=isMarketLanguage(params.lang)?params.lang:'zh',t=vendorCopy(language);
 const [kind,setKind]=useState<Kind>('update');
 const [productName,setProductName]=useState(search.get('name')||'');
 const [officialSite,setOfficialSite]=useState(''),[workEmail,setWorkEmail]=useState(''),[submitterName,setSubmitterName]=useState(''),[evidenceUrl,setEvidenceUrl]=useState(''),[description,setDescription]=useState('');
 const [capabilityName,setCapabilityName]=useState(''),[capabilityOutcome,setCapabilityOutcome]=useState(''),[capabilityExample,setCapabilityExample]=useState(''),[capabilitySource,setCapabilitySource]=useState('');
 const [xUrl,setXUrl]=useState(''),[windowsUrl,setWindowsUrl]=useState(''),[macUrl,setMacUrl]=useState(''),[iosUrl,setIosUrl]=useState(''),[androidUrl,setAndroidUrl]=useState(''),[teamUrl,setTeamUrl]=useState(''),[fundingUrl,setFundingUrl]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[success,setSuccess]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy||success)return;setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/vendor/submit',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({requestType:kind,projectId:search.get('product')||'',productName,officialSite,workEmail,submitterName,
     evidenceUrl,description,capabilityName,capabilityOutcome,capabilityExample,capabilitySource,xUrl,windowsUrl,macUrl,iosUrl,androidUrl,teamUrl,fundingUrl})});
   if(response.status!==202)throw Error(t.failure);
   setSuccess(true);setMessage(t.success);
  }catch(e){setMessage(e instanceof Error?e.message:t.failure)}
  finally{setBusy(false)}
 }
 return <main lang={language} dir={language==='ar'?'rtl':'ltr'} className="vendorClaimPage">
  <a href={'/'+language+'/ai'}>{t.back}</a>
  <div className="vendorClaimIntro"><span>{t.badge}</span><h1>{t.title}</h1><p>{t.intro}</p></div>
  <section className="vendorClaimForm" aria-label={t.accountTitle}>
   <div className="full"><h2>{t.accountTitle}</h2><p>{t.accountDesc}</p>
    <a className="primaryLink" href={'https://lingxifield.com/account/ai-market?'+new URLSearchParams({product:search.get('product')||''}).toString()} rel="noopener noreferrer" style={{display:'inline-block',padding:'12px 18px',minHeight:44}}>{t.accountAction}</a>
   </div></section>
  <form onSubmit={submit} className="vendorClaimForm">
   <label>{t.request}<select value={kind} onChange={e=>setKind(e.target.value as Kind)}><option value="update">{t.update}</option><option value="list">{t.list}</option></select></label>
   <label>{t.product} *<input required maxLength={160} value={productName} onChange={e=>setProductName(e.target.value)}/></label>
   <label>{t.website} *<input required type="url" value={officialSite} placeholder="https://" onChange={e=>setOfficialSite(e.target.value)}/></label>
   <label>{t.name} *<input required maxLength={120} value={submitterName} onChange={e=>setSubmitterName(e.target.value)}/></label>
   <label>{t.email} *<input required type="email" maxLength={254} value={workEmail} onChange={e=>setWorkEmail(e.target.value)}/></label>
   <label>{t.evidence} *<input required type="url" value={evidenceUrl} placeholder="https://" onChange={e=>setEvidenceUrl(e.target.value)}/></label>
   <label className="full">{t.description}<textarea rows={3} maxLength={1200} placeholder={t.descriptionHint} value={description} onChange={e=>setDescription(e.target.value)}/></label>
   <details className="full"><summary>{t.featureToggle}</summary><div className="vendorExtra">
    <label>{t.featureName}<input maxLength={90} value={capabilityName} onChange={e=>setCapabilityName(e.target.value)}/></label>
    <label>{t.outcome}<textarea rows={3} maxLength={360} value={capabilityOutcome} onChange={e=>setCapabilityOutcome(e.target.value)}/></label>
    <label>{t.example}<textarea rows={3} maxLength={320} value={capabilityExample} onChange={e=>setCapabilityExample(e.target.value)}/></label>
    <label>{t.featureSource}<input type="url" value={capabilitySource} placeholder="https://" onChange={e=>setCapabilitySource(e.target.value)}/></label>
   </div><p>{t.featureNote}</p></details>
   <details className="full"><summary>{t.extraLinks}</summary><div className="vendorExtra">
    {([['X',xUrl,setXUrl],['Windows',windowsUrl,setWindowsUrl],['Mac',macUrl,setMacUrl],['iOS',iosUrl,setIosUrl],['Android',androidUrl,setAndroidUrl],
    [t.team,teamUrl,setTeamUrl],[t.funding,fundingUrl,setFundingUrl]] as const).map(([label,value,set])=><label key={label}>{label}<input type="url" value={value} placeholder="https://" onChange={e=>set(e.target.value)}/></label>)}
   </div></details>
   <p className="full vendorPrivacy">{t.privacy}</p>
   <div className="full"><button type="submit" disabled={busy||success}>{busy?t.submitting:success?t.submitted:t.submit}</button>
    {message&&<p role="status">{message}{!success&&<> <a href="mailto:business@lingxifield.com">business@lingxifield.com</a></>}</p>}</div>
  </form>
 </main>;
}
export default function LocalizedVendorClaim(){return <Suspense fallback={<main>LINGXIFIELD…</main>}><ClaimUI/></Suspense>;}
