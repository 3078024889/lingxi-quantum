import Link from 'next/link';
import { redirect } from 'next/navigation';
import { moneyAdministrator } from '@/lib/money/operator-settings';
import { aiMarketPreview } from '@/lib/ai-market-preview';
import AiMarketReviewFeedback from '@/components/ai-market/AiMarketReviewFeedback';
import AiMarketCandidates from '@/components/ai-market/AiMarketCandidates';
import AiMarketCloudProgress from '@/components/ai-market/AiMarketCloudProgress';
import { aiMarketEngineeringStatus } from '@/lib/ai-market-engineering-status';
import {headers} from 'next/headers';
import {createClient} from '@/lib/supabase/server';
import {mayViewLocalReview} from '@/lib/ai-market/local-review-access.mjs';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: '全球 AI 行情审查台 | LINGXIFIELD',
  robots: { index: false, follow: false },
};

const audits = [
  { title: '全球 AI 行情页面', state: '待完整验收', detail: '检查排行榜、产品详情、分类与移动端，不使用无来源的数字' },
  { title: '真实数据与来源', state: '尚未达标', detail: '记录官方来源、地区、统计周期、核验状态；当前不得宣传十万实际收录' },
  { title: '九语言与 SEO/GEO', state: '待逐页复核', detail: '检查九语言正文、canonical、hreflang、阿拉伯语 RTL 与索引保护' },
  { title: 'CNY / USD 商业逻辑', state: '待支付验收', detail: '同数字币种报价；服务端确认订单和权益，赞助展示不改自然排名' },
  { title: '用户体验和资本档案', state: '待来源核验', detail: '公司成立、融资、上市、用户评论均需要原始链接与更新时间' },
  { title: '发布及回滚', state: '未批准上线', detail: '必须先通过生产构建、桌面/手机测试、权限检查和回滚演练' },
] as const;

function vettedPreview(input: string | undefined): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !(host === 'vercel.app' || host.endsWith('.vercel.app'))) return null;
    return url.href;
  } catch { return null; }
}

export default async function AiMarketReview() {
  let admin = null;
  let localReadOnly = false;
  try { admin = await moneyAdministrator(); } catch { admin = null; }
  if(!admin){
    try{
      const {data:{user}}=await createClient().auth.getUser();
      const h=await headers();
      localReadOnly=mayViewLocalReview({user,host:h.get('host'),forwardedHost:h.get('x-forwarded-host'),origin:process.env.LINGXIFIELD_LOCAL_AUTH_ORIGIN,emails:process.env.LINGXIFIELD_LOCAL_REVIEW_EMAILS,expiresAt:process.env.LINGXIFIELD_LOCAL_REVIEW_EXPIRES_AT});
      if(localReadOnly)admin=user;
    }catch{admin=null;}
  }
  if (!admin) redirect('/account?next=%2Faccount%2Fai-market-review');

  const preview = vettedPreview(process.env.LINGXIFIELD_AI_MARKET_PREVIEW_URL || aiMarketPreview.url);
  const knownChecks = audits.length;
  return <main style={{maxWidth:1180,margin:'36px auto',padding:'0 20px 80px',fontFamily:'system-ui',color:'#10223f'}}>
    <p style={{fontSize:12,letterSpacing:1.1,color:'#2861c9'}}>LINGXIFIELD · AI MARKET · ADMIN REVIEW</p>
    <h1 style={{fontSize:'clamp(26px,4vw,36px)',margin:'8px 0'}}>全球 AI 行情管理审查台</h1>
    {localReadOnly&&<p role="status">本机只读预览：可以查看页面与验收进度；暂不开放审核保存、支付或发布操作。</p>}
    <p style={{color:'#63758f'}}>仅限已认证管理员。审查版不修改线上排行榜、不触发支付，也不会自动合并或部署。</p>
    <div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'22px 0 24px'}}>
      <Link href={localReadOnly?'http://127.0.0.1:3201/':'/ai-market'} style={{display:'inline-flex',padding:'12px 18px',background:'#155eef',borderRadius:10,color:'#fff'}}>打开当前版本 AI 行情</Link>
      {preview ? <a href={preview} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',padding:'12px 18px',background:'#155eef',borderRadius:10,color:'#fff',textDecoration:'none',fontWeight:650}}>打开上次云端预览 ↗</a> :
        <span style={{padding:'12px 18px',borderRadius:10,background:'#edf2fa',color:'#4d637f'}}>预览地址尚未配置</span>}
      <Link href="/account" style={{display:'inline-flex',padding:'12px 18px',border:'1px solid #cbd5e1',borderRadius:10,color:'#193154',textDecoration:'none'}}>返回账户</Link>
    </div>
    <section aria-label="审查概况" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12,marginBottom:24}}>
      <div style={{padding:18,border:'1px solid #dbe4f2',borderRadius:14,background:'#fff'}}><small style={{color:'#64748b'}}>已登记审查维度</small><p style={{fontSize:27,fontWeight:750,margin:'7px 0 0'}}>{knownChecks}</p></div>
      <div style={{padding:18,border:'1px solid #dbe4f2',borderRadius:14,background:'#fff'}}><small style={{color:'#64748b'}}>当前公开发布状态</small><p style={{fontSize:18,fontWeight:700,margin:'12px 0 0',color:'#a65b10'}}>未批准</p></div>
      <div style={{padding:18,border:'1px solid #dbe4f2',borderRadius:14,background:'#fff'}}><small style={{color:'#64748b'}}>云端预览入口</small><p style={{fontSize:18,fontWeight:700,margin:'12px 0 0'}}>{preview?'已配置':'待配置'}</p></div>
    </section>
    <section style={{border:'1px solid #dae4f3',borderRadius:16,background:'#fff',overflow:'hidden'}}>
      <div style={{padding:'20px 22px',borderBottom:'1px solid #e7edf6'}}><h2 style={{fontSize:20,margin:0}}>版本审查清单</h2><p style={{fontSize:13,color:'#64748b',margin:'8px 0 0'}}>以下为工程待办状态，不是自动检测结果；发布前必须逐项附测试证据。</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:12,padding:16}}>
        {audits.map(item=><article key={item.title} style={{padding:18,border:'1px solid #e1e8f1',borderRadius:12,background:'#f8fbff'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,flexWrap:'wrap'}}>
            <h3 style={{fontSize:16,margin:0}}>{item.title}</h3>
            <span style={{fontSize:12,color:'#8b5519',background:'#fff2d9',borderRadius:20,padding:'4px 9px'}}>{item.state}</span>
          </div>
          <p style={{color:'#546681',fontSize:13,lineHeight:1.7,marginBottom:0}}>{item.detail}</p>
        </article>)}
      </div>
    </section>
    <AiMarketCloudProgress/>
    <section aria-label="工程建设进度" style={{margin:'20px 0',padding:20,border:'1px solid #c7d7ee',borderRadius:16,background:'#fff'}}>
      <h2 style={{fontSize:21,margin:'0 0 8px'}}>历史建设记录与版本差异</h2>
      <p style={{fontSize:13,color:'#53677f'}}>快照日期：{aiMarketEngineeringStatus.snapshotDate}。{aiMarketEngineeringStatus.note}</p>
      <p style={{fontSize:13}}>代码分支：<code style={{overflowWrap:'anywhere'}}>{aiMarketEngineeringStatus.sourceBranch}</code> · <a href={aiMarketEngineeringStatus.sourceUrl} target="_blank" rel="noopener noreferrer">查看源码与提交</a></p>
      <p style={{fontSize:13,color:'#a65b10'}}>当前开发分支未完成云端预览部署，也未合并 main。浏览器里的旧版不会自动更新。</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:10}}>
        {aiMarketEngineeringStatus.milestones.map(item=><article key={item.name} style={{padding:15,background:'#f8fbff',border:'1px solid #e2e9f3',borderRadius:10}}>
          <h3 style={{fontSize:15,margin:'0 0 7px'}}>{item.name}</h3>
          <p style={{fontSize:12,fontWeight:650,color:item.state==='not_ready'||false?'#a65b10':'#315b9b',margin:'0 0 7px'}}>{item.state==='local_build'?'历史本地编译通过':item.state==='committed'?'源码已提交 · 尚未完整验收':false?'待数据库迁移':false?'尚未部署':'尚未完成'}</p>
          <p style={{fontSize:13,color:'#57677c',lineHeight:1.65,margin:0}}>{item.detail}</p>
        </article>)}
      </div>
    </section>
    {!localReadOnly&&<><AiMarketCandidates /><AiMarketReviewFeedback revision={aiMarketPreview.revision} /></>}
    <section style={{marginTop:18,padding:20,borderRadius:14,background:'#eef4ff',fontSize:13,color:'#405577',lineHeight:1.8}}>
      <strong>当前审查基线</strong>
      <div>Codex V2.9 预览记录：{aiMarketPreview.reviewedOn} · 修订 {aiMarketPreview.revision.slice(0,12)}</div>
      <div>生产数据状态：未通过来源真实性及可比排名验收。旧演示曲线和评分不得当作实时行情。</div>
      <div>下阶段：将审查状态接入持久化数据库、管理员操作审计、版本差异及审核审批流程。</div>
      {process.env.NODE_ENV === 'development' && <div><a href="http://127.0.0.1:3201/" target="_blank" rel="noopener noreferrer">打开独立本地行情预览 ↗</a></div>}
    </section>
  </main>;
}
