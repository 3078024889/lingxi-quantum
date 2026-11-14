import fs from 'node:fs';
const account=process.env.CLOUDFLARE_ACCOUNT_ID,token=process.env.CLOUDFLARE_API_TOKEN;
if(!account||!token)throw Error('CLOUDFLARE_AUTH_NOT_CONFIGURED');
async function api(path,method='GET'){
 const r=await fetch('https://api.cloudflare.com/client/v4'+path,{method,headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(30000)});
 const body=await r.json();
 if(!r.ok||body.success===false)throw Error('CLOUDFLARE_API_FAILED '+method+' '+r.status+' '+(body.errors||[]).map(x=>x.code).join(','));
 return body;
}
const scripts=(await api(`/accounts/${account}/workers/scripts`)).result;
if(!Array.isArray(scripts)||scripts.length>500)throw Error('UNEXPECTED_WORKER_INVENTORY');
const domains=(await api(`/accounts/${account}/workers/domains`)).result;
const zones=await api('/zones?per_page=50');
if(zones.result_info?.total_pages>1)throw Error('ZONE_PAGINATION_REQUIRES_REVIEW');
const routes=[];
for(const z of zones.result){for(const r of (await api(`/zones/${z.id}/workers/routes`)).result)routes.push({zone:z.name,pattern:r.pattern,script:r.script});}
const bindings=[];
for(const worker of scripts){
 const settings=(await api(`/accounts/${account}/workers/scripts/${encodeURIComponent(worker.id)}/settings`)).result;
 for(const b of settings.bindings||[])if(b.type==='service')bindings.push({from:worker.id,to:b.service,environment:b.environment||null});
}
const routed=new Set([...routes.map(x=>x.script),...domains.map(x=>x.service)].filter(Boolean));
const live='lingxifield-com-celestial-20261109';
if(!routed.has(live))throw Error('CURRENT_PRODUCTION_ROUTE_NOT_FOUND');
const safeCandidates=scripts.filter(x=>/^lingxifield-com-/.test(x.id)&&x.id!==live&&!routed.has(x.id)&&!bindings.some(b=>b.to===x.id));
const inventory={workers:scripts.map(x=>({name:x.id,modifiedOn:x.modified_on})),routes,domains:domains.map(x=>({hostname:x.hostname,service:x.service,environment:x.environment})),bindings,safeCandidates:safeCandidates.map(x=>({name:x.id,modifiedOn:x.modified_on}))};
console.log('CLOUDFLARE_OBSOLETE_INVENTORY '+JSON.stringify(inventory));
const approvedPath='scripts/ops/cloudflare-obsolete-approved-20261115.json';
if(!fs.existsSync(approvedPath)){console.log('INVENTORY_ONLY_NO_MUTATION');process.exit(0);}
const approved=JSON.parse(fs.readFileSync(approvedPath,'utf8'));
if(!Array.isArray(approved)||!approved.length)throw Error('EMPTY_RETIREMENT_APPROVAL');
for(const target of approved){
 const match=safeCandidates.find(x=>x.id===target.name&&x.modified_on===target.modifiedOn);
 if(!match||!/^lingxifield-com-(?:canary-|main-|next-|unified-|static-|wallet-|premium-)/.test(target.name))throw Error('OBSOLETE_WORKER_GUARD_FAILED '+target.name);
}
for(const target of approved){
 await api(`/accounts/${account}/workers/scripts/${encodeURIComponent(target.name)}`,'DELETE');
 console.log('OBSOLETE_WORKER_DELETED '+target.name);
}
const remaining=(await api(`/accounts/${account}/workers/scripts`)).result;
if(!remaining.some(x=>x.id===live)||approved.some(x=>remaining.some(y=>y.id===x.name)))throw Error('POST_RETIREMENT_INVENTORY_FAILED');
for(const path of ['/','/sasi','/sasi/seller']){
 const r=await fetch('https://lingxifield.com'+path,{signal:AbortSignal.timeout(30000)});
 if(r.status!==200||!(await r.text()).includes('data-release-design="20261114-afternoon-three-pages"'))throw Error('PRODUCTION_DESIGN_GATE_FAILED '+path);
}
console.log('CLOUDFLARE_RETIREMENT_PASS_PRODUCTION_THREE_PAGES_UNCHANGED');
