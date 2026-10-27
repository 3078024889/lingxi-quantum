import type {PriceSeries} from "../../../lib/ai-discovery/price-series";
import {priceTrend} from "../../../lib/ai-discovery/price-series";
export default function PriceSparkline({series,field}:{series:PriceSeries;field:"prompt"|"completion"}){
 const points=series.points.filter(p=>p[field]!==null);
 const trend=priceTrend(series,field);
 if(points.length<2)return <p role="status">Not enough dated observations for a price chart.</p>;
 const values=points.map(p=>p[field]!);
 const min=Math.min(...values),max=Math.max(...values),span=max-min||1;
 const x=(i:number)=>12+(i/(points.length-1))*296;
 const y=(v:number)=>92-((v-min)/span)*72;
 const path=points.map((p,i)=>(i===0?"M":"L")+x(i).toFixed(1)+","+y(p[field]!).toFixed(1)).join(" ");
 return <figure style={{margin:0}}>
 <svg viewBox="0 0 320 110" role="img" aria-label={field+" routing price history for "+series.id} style={{width:"100%",maxWidth:640}}>
 <title>{series.id} {field} price observations</title><path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
 {points.map((p,i)=><circle key={p.observedAt} cx={x(i)} cy={y(p[field]!)} r="3" fill="currentColor"/>)}
 </svg>
 <figcaption>Observed {points.length} dates · {trend.percent===null?"Percentage unavailable":trend.percent.toFixed(2)+"%"} · USD per token · OpenRouter routing price. Missing dates are not estimates.</figcaption>
 </figure>;
}
