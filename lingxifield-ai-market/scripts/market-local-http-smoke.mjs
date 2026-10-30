import {setTimeout as sleep} from 'node:timers/promises';
const origin=process.env.MARKET_SMOKE_ORIGIN||'http://127.0.0.1:3302';
const languages=['zh','en','ja','ko','fr','de','es','pt','ar'];
async function get(path){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
 try{return await fetch(new URL(path,origin),{signal:controller.signal,redirect:'manual'});}
 finally{clearTimeout(timer);}
}
let ready=false;
for(let n=0;n<40;n++){try{const r=await get('/');if(r.ok){ready=true;break;}}catch{}await sleep(500);}
if(!ready)throw Error('MARKET_SERVER_UNREACHABLE');
const checks=[];
for(const lang of languages){
 const path='/'+lang+'/ai',res=await get(path),html=await res.text();
 if(!res.ok)throw Error('LOCALE_HTTP_'+lang+'_'+res.status);
 if(!html.includes('lang="'+lang+'"'))throw Error('LOCALE_LANG_MISSING_'+lang);
 if(lang==='ar'&&!html.includes('dir="rtl"'))throw Error('ARABIC_RTL_MISSING');
 if(!html.includes('LINGXIFIELD')||!html.includes('Global AI'))throw Error('INTERACTIVE_MARKET_NOT_RENDERED_'+lang);
 checks.push({path,status:res.status,bytes:html.length});
}
for(const path of ['/','/platform/chatgpt','/apps','/models']){
 const res=await get(path),html=await res.text();
 if(!res.ok||html.length<300)throw Error('ROUTE_BROKEN_'+path+'_'+res.status);
 checks.push({path,status:res.status,bytes:html.length});
}
for(const path of ['/api/v1/search?q=video&limit=3','/api/v1/catalog/stats']){
 const r=await get(path);
 if(!r.ok)throw Error('API_HTTP_'+path+'_'+r.status);
 const data=await r.json();
 if(!data||typeof data!=='object')throw Error('API_INVALID_JSON_'+path);
 checks.push({path,status:r.status});
}
console.log(JSON.stringify({checks,allPassed:true,note:'HTTP route/SSR API smoke; client interactions and file processing require Playwright.'},null,2));
