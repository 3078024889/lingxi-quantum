import Link from 'next/link';
import { redirect } from 'next/navigation';
import { moneyAdministrator } from '@/lib/money/operator-settings';

export const dynamic = 'force-dynamic';
export const metadata = { title:'全球 AI 行情审查台 | LINGXIFIELD',robots:{index:false,follow:false} };

export default async function AiMarketReview(){
  let user=null;
  try {user=await moneyAdministrator();} catch {user=null;}
  if(!user) redirect('/account?next=%2Faccount%2Fai-market-review');
  const configured=process.env.LINGXIFIELD_AI_MARKET_PREVIEW_URL;
  let preview:string|null=null;
  if(configured){try{const u=new URL(configured);if(u.protocol==='https:'&&u.hostname.endsWith('.vercel.app')&&!u.username&&!u.password)preview=u.href;}catch{}}
  return <main style={{maxWidth:1180,margin:'35px auto',padding:'0 20px',fontFamily:'system-ui'}}>
    <p style={{color:'#3674c5',fontSize:13}}>LINGXIFIELD / AI MARKET / REVIEW</p>
    <h1 style={{fontSize:32}}>全球 AI 行情 · 管理审查台</h1>
    <p style={{color:'#64748b'}}>独立审查入口。当前工程不会自动发布审核意见，也不自动合并或部署。</p>
    <div style={{display:'flex',gap:12,flexWrap:'wrap',margin:'24px 0'}}>
      <Link href={preview || "/account/ai-market-review"} style={{background:'#155eef',color:'white',padding:'12px 18px',borderRadius:9}}>{preview?"查看新版 AI 行情":"在线预览尚未配置"}</Link>
      <Link href="/account" style={{border:'1px solid #cbd5e1',padding:'12px 18px',borderRadius:9}}>返回管理账户</Link>
    </div>
    {process.env.NODE_ENV==="development"&&<p><a href="http://localhost:3001/" target="_blank" rel="noopener noreferrer">打开本机 V2.9 预览 ↗</a></p>}<section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
      {[
        ['页面设计','首页、排名、详情与移动端布局审查'],
        ['数据真实性','来源、更新时间、口径、核验状态'],
        ['九语言','翻译覆盖、路由、canonical、hreflang'],
        ['商业管理','CNY/USD 币种选择、套餐与支付核验'],
      ].map(([title,body])=><article key={title} style={{border:'1px solid #e2e8f0',borderRadius:12,padding:20,background:'#fff'}}><h2 style={{fontSize:18,margin:'0 0 8px'}}>{title}</h2><p style={{margin:0,color:'#64748b'}}>{body}</p></article>)}
    </section>
    <p style={{marginTop:28,color:'#64748b'}}>当前为只读审核页骨架。反馈提交、版本记录与审批工作流尚需连接数据库，不能把此页面当作已完成的后台管理系统。</p>
  </main>;
}
