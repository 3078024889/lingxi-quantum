import fs from 'node:fs';
const repo='3078024889/lingxi-quantum',token=process.env.GH_TOKEN;
if(!token)throw Error('GITHUB_AUTH_REQUIRED');
async function api(path,method='GET'){
 const r=await fetch('https://api.github.com/repos/'+repo+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('GITHUB_RETIREMENT_API_FAILED '+method+' '+r.status+' '+path);
 return r.status===204?null:r.json();
}
async function live(){for(const host of ['lingxifield.com','lingxifield.cn'])for(const path of ['/','/sasi','/sasi/seller']){
 const r=await fetch('https://'+host+path,{signal:AbortSignal.timeout(30000)});
 if(r.status!==200||!(await r.text()).includes('data-release-design="20261114-afternoon-three-pages"'))throw Error('LIVE_DESIGN_GATE_FAILED '+host+path);
}}
const plan=JSON.parse(fs.readFileSync('scripts/ops/github-obsolete-releases-approved-20261115.json','utf8'));
const keep=['7bb4bda0594e','a4dfd1b46024','5308e015b06b','5054d6f492c1'];
await live();
for(const entry of plan){
 if(!/^ecs-cn-unified-202611(?:08|10)-[0-9a-f]{12}$/.test(entry.tag)||keep.includes(entry.tag.slice(-12)))throw Error('PROTECTED_RELEASE');
 const release=await api('/releases/'+entry.id);
 const assets=release.assets.map(x=>({id:x.id,size:x.size})).sort((a,b)=>a.id-b.id);
 if(release.tag_name!==entry.tag||JSON.stringify(assets)!==JSON.stringify(entry.assets))throw Error('RELEASE_CHANGED_SINCE_INVENTORY');
 const ref=await api('/git/ref/tags/'+entry.tag);
 let object=ref.object;
 if(object.type==='tag')object=(await api('/git/tags/'+object.sha)).object;
 if(object.type!=='commit'||!object.sha.startsWith(entry.tag.slice(-12)))throw Error('RELEASE_TAG_SOURCE_MISMATCH');
}
console.log('OBSOLETE_RELEASE_PREFLIGHT_PASS count='+plan.length);
for(const entry of plan){
 await api('/releases/'+entry.id,'DELETE');
 await api('/git/refs/tags/'+entry.tag,'DELETE');
 console.log('OBSOLETE_GITHUB_RELEASE_AND_TAG_DELETED '+entry.tag);
}
await live();
for(const suffix of keep){const date=['5308e015b06b','5054d6f492c1'].includes(suffix)?'20261108':'20261110';await api('/releases/tags/ecs-cn-unified-'+date+'-'+suffix);}
console.log('GITHUB_OLD_RELEASES_RETIREMENT_PASS_CURRENT_SOURCES_AND_LIVE_PAGES_PRESERVED');
