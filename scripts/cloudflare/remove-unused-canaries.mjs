// Only the two inventoried obsolete test Workers. Never delete shared production workers.
const account='a2f0881406e2477818e14a924c48ed4e';
const zone='0e9df0e4cf67601f60ce1b73fe011b94';
const targets=['lingxifield-com-cn-anon-proxy-canary','lingxifield-com-tools-bluegreen-20261107'];
const token=process.env.CLOUDFLARE_API_TOKEN;
if(!token)throw Error('TOKEN_MISSING');
async function api(path,method='GET'){
 const r=await fetch('https://api.cloudflare.com/client/v4'+path,{method,headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(25000),redirect:'error'});
 const j=await r.json();
 if(!r.ok||!j.success)throw Error(`CF_${method}_${r.status}`);
 if(j.result_info?.total_pages>1)throw Error('PAGINATED_INVENTORY_ABORT');
 return j.result;
}
async function publicProbe(){
 for(const path of ['/tools','/sasi','/api/account/money-admin/access']){
  const r=await fetch('https://lingxifield.com'+path,{signal:AbortSignal.timeout(25000)});
  await r.body?.cancel();
  if(r.status!==200)throw Error(`PUBLIC_PROBE_FAILED_${path}_${r.status}`);
 }
}
await publicProbe();
const scripts=await api(`/accounts/${account}/workers/scripts`);
const routes=await api(`/zones/${zone}/workers/routes`);
const domains=await api(`/accounts/${account}/workers/domains`);
for(const target of targets){
 if(routes.some(x=>x.script===target)||domains.some(x=>x.service===target))throw Error('TARGET_HAS_PUBLIC_ROUTE');
}
for(const item of scripts){
 const config=await api(`/accounts/${account}/workers/scripts/${encodeURIComponent(item.id)}/settings`);
 if((config.bindings||[]).some(b=>targets.includes(b.service)||targets.includes(b.script_name)))throw Error('TARGET_STILL_REFERENCED');
}
for(const target of targets){
 if(!scripts.some(x=>x.id===target)){console.log('ALREADY_ABSENT '+target);continue;}
 const path=`/accounts/${account}/workers/scripts/${encodeURIComponent(target)}`;
 const schedules=await api(path+'/schedules');
 if(schedules.schedules?.length)throw Error('TARGET_HAS_ACTIVE_SCHEDULE');
 // No force flag: Cloudflare must reject deletion if another service references it.
 await api(path,'DELETE');
 console.log('REMOVED_UNUSED_TEST_WORKER '+target);
}
const after=await api(`/accounts/${account}/workers/scripts`);
if(after.some(x=>targets.includes(x.id)))throw Error('DELETE_NOT_CONFIRMED');
const routesAfter=await api(`/zones/${zone}/workers/routes`);
const stable=x=>JSON.stringify(x.map(({id,pattern,script})=>({id,pattern,script})).sort((a,b)=>a.id.localeCompare(b.id)));
if(stable(routes)!==stable(routesAfter))throw Error('ROUTES_CHANGED_DURING_CLEANUP');
await publicProbe();
console.log('TWO_UNUSED_WORKERS_REMOVED_PRODUCTION_ROUTES_UNCHANGED');
