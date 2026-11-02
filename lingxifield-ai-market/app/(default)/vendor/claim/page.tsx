'use client';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
type RequestType='claim'|'update'|'list';
function ClaimContent(){
 const params=useSearchParams();
 const [requestType,setRequestType]=useState<RequestType>('update');
 const [productName,setProductName]=useState(params.get('name')||'');
 const [officialSite,setOfficialSite]=useState('');
 const [workEmail,setWorkEmail]=useState('');
 const [submitterName,setSubmitterName]=useState('');
 const [evidenceUrl,setEvidenceUrl]=useState('');
 const [description,setDescription]=useState('');
 const [capabilityName,setCapabilityName]=useState('');
 const [capabilityOutcome,setCapabilityOutcome]=useState('');
 const [capabilityExample,setCapabilityExample]=useState('');
 const [capabilitySource,setCapabilitySource]=useState('');
 const [xUrl,setXUrl]=useState('');
 const [windowsUrl,setWindowsUrl]=useState('');
 const [macUrl,setMacUrl]=useState('');
 const [iosUrl,setIosUrl]=useState('');
 const [androidUrl,setAndroidUrl]=useState('');
 const [teamUrl,setTeamUrl]=useState('');
 const [fundingUrl,setFundingUrl]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[success,setSuccess]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/vendor/submit',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({requestType,projectId:params.get('product')||'',productName,officialSite,workEmail,submitterName,
     evidenceUrl,description,capabilityName,capabilityOutcome,capabilityExample,capabilitySource,xUrl,windowsUrl,macUrl,iosUrl,androidUrl,teamUrl,fundingUrl})});
   if(response.status!==202)throw Error('提交暂不可用，请通过联系邮箱发送资料。');
   setSuccess(true);setMessage('申请已收到。核对官方身份和资料来源后再更新公开页面。');
  }catch(e){setMessage(e instanceof Error?e.message:'提交未成功，请稍后重试。')}
  finally{setBusy(false);}
 }
 return <main className="vendorClaimPage">
  <a href="/">← 返回全球 SI AI 行情平台</a>
  <div className="vendorClaimIntro"><span>厂商免费服务 · 资料审核与推广独立</span><h1>认领你的 SI AI 产品</h1>
   <p>所有 AI 产品对访客免费开放。认领现有产品需要使用灵犀场原有账户登录，免费最多认领 3 个；企业身份核验后才能管理产品及申请推广。资料纠错与新产品线索仍可匿名提交。</p></div>
  <section className="vendorClaimForm" aria-label="登录灵犀场认领厂商">
   <div className="full">
    <h2>使用灵犀场账号认领</h2>
    <p>现有账户和密码直接使用，无需在全球 SIAI 重新注册。认领免费；审核企业身份后，付费推广与自然排名分开。</p>
    <a className="primaryLink" href={'https://lingxifield.com/account/ai-market?'+new URLSearchParams({product:params.get('product')||''}).toString()} rel="noopener noreferrer" style={{display:'inline-block',padding:'12px 18px',minHeight:44}}>登录灵犀场 · 免费认领现有产品 ↗</a>
   </div>
  </section>
  <form onSubmit={submit} className="vendorClaimForm">
   <label>我要办理<select value={requestType} onChange={e=>setRequestType(e.target.value as RequestType)}><option value="update">修改或补充资料</option><option value="list">提交新产品</option></select></label>
   <label>产品名称 *<input value={productName} maxLength={160} required onChange={e=>setProductName(e.target.value)}/></label>
   <label>官方网站 *<input type="url" value={officialSite} required placeholder="https://" onChange={e=>setOfficialSite(e.target.value)}/></label>
   <label>你的姓名 *<input value={submitterName} maxLength={120} required onChange={e=>setSubmitterName(e.target.value)}/></label>
   <label>官方工作邮箱 *<input type="email" value={workEmail} maxLength={254} required placeholder="name@company.com" onChange={e=>setWorkEmail(e.target.value)}/></label>
   <label>资料来源 *<input type="url" required value={evidenceUrl} placeholder="官网介绍、公司公告或官方团队页面" onChange={e=>setEvidenceUrl(e.target.value)}/></label>
   <label className="full">产品简介<textarea maxLength={1200} rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="一句话介绍用途、适合谁、能做什么"/></label>
   <details className="full" open><summary>补充一个具体功能与官方证据（选填）</summary><div className="vendorExtra">
    <label>功能名称<input maxLength={90} value={capabilityName} placeholder="例如：多语言视频译配" onChange={e=>setCapabilityName(e.target.value)}/></label>
    <label>实际能完成的事情<textarea maxLength={360} rows={3} value={capabilityOutcome} placeholder="写清输入素材、操作和得到的结果" onChange={e=>setCapabilityOutcome(e.target.value)}/></label>
    <label>使用案例<textarea maxLength={320} rows={3} value={capabilityExample} placeholder="例如：把中文短剧译配为英文版并下载音轨" onChange={e=>setCapabilityExample(e.target.value)}/></label>
    <label>功能官方资料 URL<input type="url" value={capabilitySource} placeholder="https://官网/功能说明" onChange={e=>setCapabilitySource(e.target.value)}/></label>
   </div><p>功能、结果、例子和链接必须成套填写。提交后先审核事实与适用条件，不直接改写公开资料或客观名次。</p></details>
   <details className="full"><summary>补充更多链接（选填）</summary><div className="vendorExtra">
    {([['X 官方账号',xUrl,setXUrl],['Windows 下载',windowsUrl,setWindowsUrl],['Mac 下载',macUrl,setMacUrl],
    ['iOS 下载',iosUrl,setIosUrl],['Android 下载',androidUrl,setAndroidUrl],
    ['团队介绍',teamUrl,setTeamUrl],['融资公告',fundingUrl,setFundingUrl]] as const).map(([label,value,change])=>
      <label key={label}>{label}<input type="url" value={value} placeholder="https://" onChange={e=>change(e.target.value)}/></label>)}
   </div></details>
   <p className="full vendorPrivacy">公开阅读、对比、跳转官网均无需登录。厂商提交免费；认领须验证企业身份，审核前资料不会公开。经核验的管理员以后可安全登录维护资料；购买推广需绑定订单与付款记录，赞助不改变客观排名。</p>
   <div className="full"><button type="submit" disabled={busy||success}>{busy?'提交中…':success?'已提交':'免费提交申请'}</button>
    {message&&<p role="status">{message}{!success&&<> 也可以联系 <a href="mailto:business@lingxifield.com">business@lingxifield.com</a></>}</p>}</div>
  </form>
 </main>;
}
export default function ClaimPage(){return <Suspense fallback={<main>正在打开申请页面…</main>}><ClaimContent/></Suspense>;}
