const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const {NextRequest}=require('next/server');
function compile(file,imports){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(p=>p==='server-only'?{}:imports[p]||require(p),m,m.exports);return m.exports}
(async()=>{
 const paths=compile('lib/analytics/public-visit.ts',{}),bounded=compile('lib/security/bounded-request-json.ts',{}),origin=compile('lib/sasi/request-security.ts',{});
 for(const path of ['/siai','/siai/claim','/en/siai','/ja/tools','/fr/products','/ar/tools/batch-image'])assert.equal(paths.publicVisitPath(path),path);
 assert.equal(paths.publicVisitPath('/en/siai/'),'/en/siai');
 for(const path of ['/siai/private-id','/siai?search=secret','/en/account','/en/sasi/connections','/en/tools/admin','/en/tools/pay','/en/tools/history','/en/tools/result','/en/tools/private%2Fid','/xx/siai','/en/siai/claim','/en/products/private-id'])assert.equal(paths.publicVisitPath(path),null);
 let inserts=[],guardCalls=0,guardOk=true;
 const track=compile('app/api/analytics/visit/route.ts',{'@/lib/analytics/public-visit':paths,'@/lib/security/bounded-request-json':bounded,'@/lib/sasi/request-security':origin,'@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>{guardCalls++;return guardOk?{ok:true}:{ok:false,status:429,error:'RATE_LIMITED'}}},'@/lib/supabase/admin':{createAdminClient:()=>({from:()=>({insert:async x=>{inserts.push(x);return{error:null}}})})}});
 const base={id:'00000000-0000-4000-8000-000000000001',session:'00000000-0000-4000-8000-000000000002',path:'/tools/food-calorie',referrer:'google.com',device:'desktop'};
 const req=(b=base,extra={})=>new NextRequest('https://lingxifield.com/api/analytics/visit',{method:'POST',headers:{origin:'https://lingxifield.com','content-type':'application/json','user-agent':'Browser',...extra},body:JSON.stringify(b)});
 assert.equal((await track.POST(req())).status,204);assert.equal(inserts.length,1);assert.equal(inserts[0].path,base.path);assert.match(inserts[0].session_hash,/^[0-9a-f]{64}$/);assert(!JSON.stringify(inserts[0]).includes(base.session));assert.deepEqual(Object.keys(inserts[0]).sort(),['device','host','id','path','referrer_host','session_hash','utm_campaign','utm_content','utm_source']);assert.equal(inserts[0].utm_source,null);
 assert.equal((await track.POST(req({...base,path:'/partners',utm_source:'partner_widget',utm_campaign:'siai_directory',utm_content:'sample_partner'}))).status,204);
 assert.equal(inserts.at(-1).path,'/partners');
 assert.equal(inserts.at(-1).utm_source,'partner_widget');
 assert.equal(inserts.at(-1).utm_campaign,'siai_directory');
 assert.equal(inserts.at(-1).utm_content,'sample_partner');
 assert.equal((await track.POST(req({...base,utm_source:'bad@example.com',utm_campaign:'not_provided',utm_content:'name@email.com'}))).status,204);
 assert.equal(inserts.at(-1).utm_source,null);
 assert.equal(inserts.at(-1).utm_campaign,null);
 assert.equal(inserts.at(-1).utm_content,null);
 inserts.splice(1);
 for(const path of ['/account/money-admin','/sasi/connections','/sasi?prompt=secret','/tools/pay'])assert.equal((await track.POST(req({...base,path}))).status,400);
 assert.equal((await track.POST(req(base,{origin:'https://evil.example'}))).status,403);
 assert.equal((await track.POST(req(base,{origin:'https://lingxifield.cn'}))).status,403);
 assert.equal((await track.POST(req(base,{origin:'https://www.lingxifield.com'}))).status,403);
 assert.equal((await track.POST(req(base,{origin:''}))).status,403);
 const before=guardCalls;for(const headers of [{dnt:'1'},{'sec-gpc':'1'},{'user-agent':'Googlebot'}])assert.equal((await track.POST(req(base,headers))).status,204);assert.equal(guardCalls,before);assert.equal(inserts.length,1);
 assert.equal((await track.POST(req({...base,extra:'x'.repeat(3000)}))).status,400);
 guardOk=false;assert.equal((await track.POST(req())).status,429);assert.equal(inserts.length,1);
 guardOk=true;
 for(const path of ['/siai','/siai/claim','/en/siai','/ja/tools/batch-image']){
  assert.equal((await track.POST(req({...base,path}))).status,204);
  assert.equal(inserts.at(-1).path,path);
 }
 const cnRequest=new NextRequest('https://lingxifield.cn/api/analytics/visit',{method:'POST',headers:{origin:'https://lingxifield.cn','content-type':'application/json','user-agent':'Browser'},body:JSON.stringify({...base,path:'/siai'})});
 assert.equal((await track.POST(cnRequest)).status,204);assert.equal(inserts.at(-1).host,'lingxifield.cn');
 const countBeforeProxy=inserts.length;
 assert.equal((await track.POST(req({...base,path:'/siai'},{origin:'https://lingxifield.cn','x-lingxi-public-host':'lingxifield.cn','sec-fetch-site':'same-origin'}))).status,204);
 assert.equal(inserts.at(-1).host,'lingxifield.cn');assert.equal(inserts.length,countBeforeProxy+1);
 for(const extra of [
  {origin:'https://lingxifield.cn','x-lingxi-public-host':'lingxifield.cn','sec-fetch-site':'cross-site'},
  {origin:'https://lingxifield.com','x-lingxi-public-host':'lingxifield.cn','sec-fetch-site':'same-origin'},
  {origin:'https://lingxifield.cn','x-lingxi-public-host':'evil.invalid','sec-fetch-site':'same-origin'},
  {origin:'https://lingxifield.cn','x-lingxi-public-host':'lingxifield.cn'}
 ])assert.equal((await track.POST(req(base,extra))).status,403);
 assert.equal(inserts.length,countBeforeProxy+1);
 assert.equal((await track.POST(req(base,{origin:'https://lingxifield.cn','x-lingxi-public-host':'lingxifield.cn','sec-fetch-site':'same-origin',dnt:'1'}))).status,204);
 assert.equal(inserts.length,countBeforeProxy+1);
 let reads=0;const adminRoute=compile('app/api/account/money-admin/route.ts',{'@/lib/money/operator-settings':{moneyAdministrator:async()=>null},'@/lib/supabase/admin':{createAdminClient:()=>{reads++;throw new Error('Unauthorized read')}},'@/lib/sasi/request-security':origin,'@/lib/money/operator-notifications':{},'@/lib/money/reconcile-worker':{},'@/lib/mini/virtual-refund':{retryVirtualRefunds:async()=>({results:[]})}});
 const denied=await adminRoute.GET(new NextRequest('https://lingxifield.com/api/account/money-admin'));assert.equal(denied.status,403);assert.equal(reads,0);
 let dashboardArgs;const allowedAdmin={rpc:async(name,args)=>{if(name==='operator_dashboard_snapshot')dashboardArgs=args;return{data:name==='operator_dashboard_snapshot'?{order_total:82,orders:[]}:{channels:[]},error:null}},from(){const q={select(){return q},order(){return q},limit(){return q},then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};return q}};
 const allowedRoute=compile('app/api/account/money-admin/route.ts',{'@/lib/money/operator-settings':{moneyAdministrator:async()=>({id:'operator'}),moneyOperatorSettings:async()=>({notify_email:'owner@example.com'})},'@/lib/supabase/admin':{createAdminClient:()=>allowedAdmin},'@/lib/sasi/request-security':origin,'@/lib/money/operator-notifications':{},'@/lib/money/reconcile-worker':{},'@/lib/mini/virtual-refund':{retryVirtualRefunds:async()=>({results:[]})}});
 const response=await allowedRoute.GET(new NextRequest('https://lingxifield.com/api/account/money-admin?days=7.8&orderPage=1&userPage=-5&provider=wechat_mini_virtual&status=paid&search=food-calorie'));assert.equal(response.status,200);assert.equal((await response.json()).dashboard.order_total,82);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.deepEqual(dashboardArgs,{p_days:7,p_order_page:1,p_user_page:0,p_search:'food-calorie',p_provider:'wechat_mini_virtual',p_status:'paid'});
 console.log('PASS: private-route/query exclusions, origin checks, privacy opt-outs, bot exclusion, bounded input, rate limits, hashed sessions without identities, admin denial before data reads and authorized private paginated responses.');
})().catch(e=>{console.error(e);process.exitCode=1});
