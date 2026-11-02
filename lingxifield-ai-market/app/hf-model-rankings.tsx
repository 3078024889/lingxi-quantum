'use client';
import {useEffect,useState} from 'react';
type Row={rank:number;id:string;downloads:number;likes:number|null;sourceUrl:string};
type Response={items:Row[];collectedAt?:string;scope?:string;error?:string;isGlobalProductRanking:false};
export default function HfModelRankings(){
 const [data,setData]=useState<Response|null>(null);
 const [busy,setBusy]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/v1/hf-model-rankings',{signal:controller.signal}).then(async r=>{
   const result=await r.json() as Response;
   if(!r.ok)throw Error(result.error||'SOURCE_UNAVAILABLE');
   return result;
  }).then(result=>{if(!controller.signal.aborted)setData(result)})
   .catch(()=>{if(!controller.signal.aborted)setData({items:[],error:'SOURCE_UNAVAILABLE',isGlobalProductRanking:false})})
   .finally(()=>{if(!controller.signal.aborted)setBusy(false)});
  return()=>controller.abort();
 },[]);
 return <section className="panel" aria-label="Hugging Face 仓库下载榜" style={{margin:'14px 0',padding:16}}>
  <div className="panelTitle"><h2>实时来源榜 · Hugging Face 模型仓库下载量</h2>
   <span style={{fontSize:12,color:'#58728f'}}>{data?.collectedAt?'采集于 '+data.collectedAt.slice(0,16).replace('T',' ')+ ' UTC':'公开 API'}</span>
  </div>
  <p style={{fontSize:12,color:'#58728f'}}>这是 Hugging Face 仓库下载指标，不是全球 AI 平台访问量、活跃用户、综合能力或 SEO/GEO 排名。</p>
  {busy?<p role="status">读取 Hugging Face 公共数据…</p>:data?.error?<p role="status">来源暂不可用；不显示推测榜单。</p>:null}
  {data?.items?.length?<div className="tableScroll"><table><thead><tr><th>仓库序号</th><th>模型</th><th>仓库下载量</th><th>来源</th></tr></thead>
   <tbody>{data.items.slice(0,10).map(r=><tr key={r.id}><td>{r.rank}</td><td>{r.id}</td><td>{r.downloads.toLocaleString()}</td><td><a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">官方模型页 ↗</a></td></tr>)}</tbody>
  </table></div>:null}
  <a href="https://huggingface.co/docs/hub/api" target="_blank" rel="noopener noreferrer" style={{fontSize:12}}>数据来源与统计范围 ↗</a>
 </section>;
}
