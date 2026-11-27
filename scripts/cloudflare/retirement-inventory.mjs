// Read-only metadata inventory. Never print settings values or credentials.
const account='a2f0881406e2477818e14a924c48ed4e';
const zone='0e9df0e4cf67601f60ce1b73fe011b94';
const token=process.env.CLOUDFLARE_API_TOKEN;
if(!token)throw Error('CLOUDFLARE_TOKEN_MISSING');
async function get(path){
 const r=await fetch('https://api.cloudflare.com/client/v4'+path,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(25000),redirect:'error'});
 const data=await r.json();
 if(!r.ok||!data.success)throw Error(`CLOUDFLARE_METADATA_HTTP_${r.status}`);
 return data.result;
}
const routes=await get(`/zones/${zone}/workers/routes`);
console.log('RETIREMENT_ROUTES '+JSON.stringify(routes.map(({id,pattern,script})=>({id,pattern,script}))));
const scripts=await get(`/accounts/${account}/workers/scripts`);
for(const entry of scripts){
 if(!/lingxi|sasi/i.test(entry.id))continue;
 const name=entry.id;
 const prefix=`/accounts/${account}/workers/scripts/${encodeURIComponent(name)}`;
 const settings=await get(prefix+'/settings');
 const schedule=await get(prefix+'/schedules');
 const subdomain=await get(prefix+'/subdomain');
 console.log('RETIREMENT_WORKER '+JSON.stringify({name,modified:entry.modified_on,
  schedules:schedule.schedules,subdomain,
  bindings:(settings.bindings||[]).map(({name,type,service,bucket_name})=>({name,type,service,bucket_name}))}));
}
console.log('READ_ONLY_INVENTORY_COMPLETE_NO_CLOUD_MUTATIONS');
