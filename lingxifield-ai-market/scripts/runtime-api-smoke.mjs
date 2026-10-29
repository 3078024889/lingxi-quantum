// Read-only local runtime API checks. No authentication, writes or production traffic.
const raw=process.env.MARKET_PREVIEW_URL||'http://127.0.0.1:3200';
const base=new URL(raw);if(!['127.0.0.1','localhost','[::1]'].includes(base.hostname))throw Error('LOCAL_PREVIEW_ONLY');
const routes=['/api/market/verified-metrics','/api/market/public-repos','/api/v1/market/rankings?metric=monthly_visits','/api/v1/comparable-rankings?metric=monthly_visits','/api/v1/search?q=video','/api/v1/catalog/stats','/en/ai','/ja/ai','/ar/ai'];
const checks=[];
for(const route of routes){
 const start=Date.now();try{
 const r=await fetch(new URL(route,base),{signal:AbortSignal.timeout(20000),redirect:'manual'});
 const ct=r.headers.get('content-type')||'';
 const item={route,status:r.status,ms:Date.now()-start,ok:r.ok&&!r.redirected&&r.status<300};
 if(route.startsWith('/api/')){if(!ct.includes('application/json'))item.ok=false;else{const data=await r.json();if(route.includes('verified-metrics')&&Object.values(data.metrics||{}).some(x=>!x.sourceUrl||!x.checkedAt))item.ok=false;if(route.includes('public-repos')&&!Array.isArray(data.records))item.ok=false;}}
 checks.push(item);
 }catch(e){checks.push({route,status:0,ok:false,error:String(e.message||e)});}
}
console.log(JSON.stringify({checks,pass:checks.every(x=>x.ok),scope:'local HTTP API smoke, not proof of verified metrics or payment',at:new Date().toISOString()},null,2));
if(checks.some(x=>!x.ok))process.exitCode=1;
