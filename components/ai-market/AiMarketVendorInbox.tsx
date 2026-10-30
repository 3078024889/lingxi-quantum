import {createAdminClient} from '@/lib/supabase/admin';
type Claim={id:string;product_name:string;request_type:string;official_site:string;work_email:string;submitter_name:string;evidence_url:string;status:string;created_at:string;description:string|null;proposed_data:Record<string,string>|null};
export default async function AiMarketVendorInbox(){
 let claims:Claim[]=[];
 let available=true;
 try{
  const r=await createAdminClient().from('ai_market_vendor_submissions')
   .select('id,product_name,request_type,official_site,work_email,submitter_name,evidence_url,status,created_at,description,proposed_data')
   .order('created_at',{ascending:false}).limit(30);
  if(r.error)available=false;else claims=(r.data||[]) as Claim[];
 }catch{available=false;}
 return <section style={{margin:'20px 0',padding:18,background:'#fff',border:'1px solid #e1e9f5',borderRadius:12}}>
  <h2 style={{fontSize:19}}>厂商认领与资料补充</h2>
  <p style={{color:'#64748b',fontSize:13}}>厂商免费提交 · 官方身份与资料来源审核后才能更新公开页面。</p>
  {!available?<p>尚未接通申请记录。</p>:claims.length===0?<p>暂无新的厂商申请。</p>:<div style={{display:'grid',gap:10}}>
   {claims.map(x=><article key={x.id} style={{border:'1px solid #e6ebf6',padding:12,borderRadius:8}}>
    <strong>{x.product_name}</strong> <span style={{color:'#64748b'}}>· {x.request_type==='claim'?'认领':x.request_type==='update'?'修改资料':'新产品'} · {x.status==='pending_identity_check'?'待身份确认':x.status==='pending_review'?'待审核':x.status}</span>
    <p style={{fontSize:12,margin:'7px 0'}}>申请人：{x.submitter_name} · {x.work_email} · {x.created_at.slice(0,10)}</p>
    <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
     <a href={x.official_site} target="_blank" rel="noopener noreferrer">官方网站 ↗</a>
     <a href={x.evidence_url} target="_blank" rel="noopener noreferrer">资料来源 ↗</a>
    </div>
    {x.description&&<p style={{color:'#475569'}}>{x.description}</p>}
    {x.proposed_data&&Object.keys(x.proposed_data).length>0&&<details><summary>厂商补充的链接</summary>
     {Object.entries(x.proposed_data).map(([k,v])=><div key={k}>{k}：<a href={v} target="_blank" rel="noopener noreferrer">{v}</a></div>)}
    </details>}
   </article>)}
  </div>}
 </section>;
}
