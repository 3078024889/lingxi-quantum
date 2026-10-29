'use client';
import {useState} from 'react';
type Entry={entityId:string;rank:number;value:number;unit:string;sourceUrl:string};
type RankResponse={results?:Entry[];partialSourceScan?:boolean;error?:string};
type Point={day:string;value:number;sourceUrl:string};
type HistoryResponse={points?:Point[];error?:string;partialSourceScan?:boolean};
const metrics=[['hf_downloads','模型仓库下载'],['hf_likes','模型仓库喜欢'],['website_visits','网站访问量'],['output_tokens_per_second','输出速度'],['first_token_latency_ms','首字延迟'],['price_per_million_input_tokens','输入价格'],['geo_citation_rate','AI 引用率']] as const;
const today=new Date().toISOString().slice(0,10);
export default function MarketRankings(){
 const [metric,setMetric]=useState<string>('hf_downloads');const [date,setDate]=useState(today);
 const [period,setPeriod]=useState('lifetime');const [methodology,setMethodology]=useState('hf_api');
 const [sample,setSample]=useState('repo');const [region,setRegion]=useState('global');
 const [loading,setLoading]=useState(false);const [ranking,setRanking]=useState<RankResponse|null>(null);
 const [selected,setSelected]=useState('');const [history,setHistory]=useState<HistoryResponse|null>(null);
 const scope=()=>new URLSearchParams({metric,day:date,region,period,methodology,sample});
 async function loadRanking(){
  setLoading(true);setRanking(null);setSelected('');setHistory(null);
  try{const r=await fetch('/api/ai-market/metrics?'+scope(),{cache:'no-store'});
    const d=await r.json() as RankResponse;setRanking(r.ok?d:{error:d.error||'DATA_UNAVAILABLE'});
  }catch{setRanking({error:'NETWORK_ERROR'});}finally{setLoading(false);}
 }
 async function loadHistory(entityId:string){
  setSelected(entityId);setHistory(null);
  const start=new Date(date+'T00:00:00Z');start.setUTCDate(start.getUTCDate()-30);
  const p=scope();p.set('entityId',entityId);p.set('start',start.toISOString().slice(0,10));p.set('end',date);
  try{const r=await fetch('/api/ai-market/metrics/history?'+p,{cache:'no-store'});
   const d=await r.json() as HistoryResponse;setHistory(r.ok?d:{error:d.error||'DATA_UNAVAILABLE'});}catch{setHistory({error:'NETWORK_ERROR'});}
 }
 const pts=history?.points||[];
 const width=600,height=150,pad=18;
 const vals=pts.map(x=>x.value),lo=Math.min(...vals),hi=Math.max(...vals),span=Math.max(hi-lo,1);
 const coords=pts.map((x,i)=>`${pad+i*(width-2*pad)/Math.max(pts.length-1,1)},${height-pad-(x.value-lo)*(height-2*pad)/span}`).join(' ');
 return <section style={{marginTop:42}} aria-label="真实 AI 行情">
  <h2 style={{fontSize:26,marginBottom:6}}>真实 AI 行情与历史走势</h2>
  <p style={{color:'#64748b'}}>仅显示已核实、同口径的数据。模型仓库下载量不代表实际用户数，第三方数据缺失时不生成模拟排名。</p>
  <form onSubmit={e=>{e.preventDefault();void loadRanking();}} style={{display:'flex',gap:9,flexWrap:'wrap',alignItems:'center',margin:'20px 0'}}>
   <label>指标 <select value={metric} onChange={e=>setMetric(e.target.value)}>{metrics.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
   <label>日期 <input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
   <label>地区 <input value={region} onChange={e=>setRegion(e.target.value)} maxLength={40} size={8}/></label>
   <label>周期 <input value={period} onChange={e=>setPeriod(e.target.value)} maxLength={40} size={10}/></label>
   <label>方法 <input value={methodology} onChange={e=>setMethodology(e.target.value)} maxLength={70} size={10}/></label>
   <label>样本 <input value={sample} onChange={e=>setSample(e.target.value)} maxLength={70} size={8}/></label>
   <button type="submit" disabled={loading} style={{background:'#155eef',border:0,borderRadius:10,padding:'11px 15px',color:'white',fontWeight:600}}>{loading?'查询中…':'查看真实榜单'}</button>
  </form>
  {ranking?.error?<p role="status">行情数据暂不可用（{ranking.error}）。</p>:null}
  {ranking&&!ranking.error&&!ranking.results?.length?<p role="status">当前筛选条件下尚无已验证的同行情数据。</p>:null}
  {ranking?.results?.length?<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
   <thead><tr><th align="left">排名</th><th align="left">产品 / 模型 ID</th><th align="right">指标值</th><th align="left">来源</th><th align="left">走势</th></tr></thead>
   <tbody>{ranking.results.map(x=><tr key={x.entityId} style={{borderTop:'1px solid #dce4ef'}}>
    <td style={{padding:12}}>{x.rank}</td><td>{x.entityId}</td><td align="right">{x.value.toLocaleString()} {x.unit}</td><td><a href={x.sourceUrl} target="_blank" rel="noopener noreferrer">核验来源</a></td>
    <td><button type="button" onClick={()=>void loadHistory(x.entityId)}>30日历史</button></td>
   </tr>)}</tbody></table></div>:null}
  {ranking?.partialSourceScan?<p role="status">本次读取达到上限，排名可能不完整，不能视为全球总榜。</p>:null}
  {selected?<div style={{border:'1px solid #dce4ef',padding:18,borderRadius:14,marginTop:18}}>
   <h3 style={{fontSize:18}}>历史走势 · {selected}</h3>
   {history?.error?<p>历史记录不可用：{history.error}</p>:null}
   {history&&!history.error&&pts.length===0?<p>暂无经过核实的历史记录。</p>:null}
   {pts.length>0?<><svg viewBox="0 0 600 150" role="img" aria-label="历史指标走势" style={{width:'100%',maxWidth:700}}>
    {pts.length===1?<circle cx={pad} cy={height/2} r={4} fill="#155eef"/>:<polyline points={coords} fill="none" stroke="#155eef" strokeWidth={2.5} strokeLinejoin="round"/>}
   </svg><p style={{fontSize:13,color:'#64748b'}}>起始：{pts[0].day} · 最近：{pts[pts.length-1].day} · 数据点：{pts.length}</p></>:null}
   {history?.partialSourceScan?<p>历史记录达到读取上限，走势图仅供部分数据参考。</p>:null}
  </div>:null}
 </section>;
}
