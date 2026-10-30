import 'server-only';
import Link from 'next/link';

const repo='3078024889/lingxi-quantum';
const pullUrl='https://github.com/'+repo+'/pull/51';
const workflowUrl='https://github.com/'+repo+'/actions/workflows/ai-market-evidence-cloud.yml';
type GitPr={state?:string;draft?:boolean;merged?:boolean;updated_at?:string;head?:{sha?:string}};
type GitRun={name?:string;status?:string;conclusion?:string;html_url?:string;created_at?:string};
async function readGit<T>(path:string):Promise<T|null>{
 try{
  const res=await fetch('https://api.github.com/repos/'+repo+path,{
   headers:{Accept:'application/vnd.github+json','User-Agent':'LINGXIFIELD-Admin-ReadOnly'},
   next:{revalidate:300},signal:AbortSignal.timeout(6500)
  });
  if(!res.ok)return null;
  return await res.json() as T;
 }catch{return null;}
}
export default async function AiMarketCloudProgress(){
 const [pr,runs]=await Promise.all([
  readGit<GitPr>('/pulls/51'),
  readGit<{workflow_runs?:GitRun[]}>('/actions/runs?per_page=30&branch=feature%2Fai-si-detail-decisions-20261030')
 ]);
 const recent=(runs?.workflow_runs||[]).filter(x=>['AI Market isolated cloud build','AI Market Review Gate','AI Market sourced evidence (bounded cloud collection)'].includes(x.name||'')).slice(0,6);
 return <section aria-label="云端构建与采集状态" style={{margin:'20px 0',padding:20,border:'1px solid #b6d0f1',borderRadius:16,background:'#fff'}}>
  <h2 style={{fontSize:20,margin:'0 0 8px'}}>云端工程进度 · GitHub 实际状态</h2>
  <p style={{fontSize:12,color:'#62748d',lineHeight:1.6}}>只读同步，最多缓存 5 分钟。链接可打开原始证据；不能把构建通过当作生产功能验收。</p>
  <p style={{fontSize:14}}><Link href={pullUrl} target="_blank" rel="noopener noreferrer">开发分支 PR #51 ↗</Link>　{pr? (pr.merged?'已合并':pr.draft?'草稿审查中':pr.state==='open'?'等待审核':'已关闭'):'状态暂不可用'}
    {pr?.updated_at?' · 最近修改 '+pr.updated_at.slice(0,16).replace('T',' ')+ ' UTC':''}</p>
  {recent.length? <div style={{display:'grid',gap:8}}>
    {recent.map((run,i)=><div key={(run.html_url||run.name||'run')+i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',padding:'10px 13px',border:'1px solid #e1eaf5',borderRadius:9,background:'#f7faff'}}>
      <span style={{fontSize:13}}>{run.name}</span>
      <span style={{fontSize:12,color:run.conclusion==='success'?'#087c53':'#98621c'}}>{run.status==='completed'?run.conclusion||'完成':run.status||'未知'}</span>
      {run.html_url?<a href={run.html_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12}}>日志与产物 ↗</a>:null}
    </div>)}
  </div>:<p role="status">运行记录暂不可用；<a href={workflowUrl} target="_blank" rel="noopener noreferrer">前往 GitHub 采集页面查看</a>。</p>}
  <p style={{marginTop:12,fontSize:12,color:'#6c8098'}}>未通过数据库审核的数据只作为研究候选。已有的 SASI、实用工具和收款不受此分支影响。</p>
 </section>;
}
