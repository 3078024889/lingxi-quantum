import {performance} from 'node:perf_hooks';
import {createSearchIndex} from '../lib/search-index.mjs';
const before=process.memoryUsage().rss,start=performance.now();
const rows=Array.from({length:100000},(_,i)=>({id:`synthetic-${i}`,name:`Synthetic ${i}`,company:`Company ${i%10000}`,category:i%2?'Video':'Code',description:'Synthetic capacity fixture, not real products',capabilities:i%2?['视频生成','video']:['编程','code']}));
const index=createSearchIndex(rows),buildMs=performance.now()-start,samples=[];
for(let i=0;i<200;i++){const t=performance.now();const page=index.search({q:i%2?'视频生成':'code',limit:24,cursor:i*24});if(page.items.length>24)throw Error('UNBOUNDED_RESPONSE');samples.push(performance.now()-t);}
samples.sort((a,b)=>a-b);
console.log(JSON.stringify({fixture:'synthetic-only',rows:rows.length,buildMs,p50Ms:samples[100],p95Ms:samples[190],rssMiB:process.memoryUsage().rss/1048576,rssDeltaMiB:(process.memoryUsage().rss-before)/1048576,scope:'single-process index only; not HTTP concurrency or production capacity'},null,2));
