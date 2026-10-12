const fs=require('fs'),assert=require('assert/strict'),ts=require('typescript'),{EventEmitter}=require('events');
let answers=[{address:'93.184.216.34',family:4}],scenario={},calls=0,pins=[],stallDns=false,observedHeaders=[];
const transport={get(url,options,callback){
 calls++;assert.equal(options.agent,false);assert.equal(options.rejectUnauthorized,true);assert([4,6].includes(options.family));assert.equal(options.headers['Accept-Encoding'],'identity');
 observedHeaders.push({...options.headers});
 if(scenario.rebind)answers=[{address:'127.0.0.1',family:4}];
 options.lookup(url.hostname,{},(e,address,family)=>{assert.equal(e,null);pins.push(address);assert.equal(family,options.family)});
 const req=new EventEmitter();req.destroy=e=>{if(e)req.emit('error',e);req.emit('close')};
 queueMicrotask(()=>{const item=scenario.responses?.shift()||scenario;const res=new EventEmitter();let destroyed=false;res.destroy=()=>{destroyed=true;req.emit('close')};res.statusCode=item.status||200;res.headers={'content-type':item.type||'image/png',...item.headers};callback(res);
 if(scenario.stall||destroyed)return;
 for(const chunk of scenario.chunks||[Buffer.from('png')]){if(destroyed)break;res.emit('data',chunk)}
 if(!destroyed){if(scenario.aborted)res.emit('aborted');else res.emit('end');req.emit('close')}
 });return req;
}};
function compile(file,imports){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(name=>name==='server-only'?{}:imports[name]||require(name),m,m.exports);return m.exports}
const endpoint=compile('lib/security/public-endpoint.ts',{'node:dns/promises':{lookup:async()=>stallDns?new Promise(()=>{}):answers}});
const {fetchPublicMedia}=compile('lib/security/public-media-fetch.ts',{'node:https':transport,'./public-endpoint':endpoint});
const policy=()=>({kind:'image',allowHtml:false,deadline:Date.now()+1000});
(async()=>{
 for(const ip of ['::ffff:127.0.0.1','::ffff:7f00:1','0:0:0:0:0:ffff:c0a8:1','0:0:0:0:0:0:0:1','fe80::1','fc00::1','64:ff9b::7f00:1','2002:7f00:1::','2001:0:1234::1','2001:db8::1'])assert.equal(endpoint.isPublicIp(ip),false,ip);
 assert(endpoint.isPublicIp('2001:4860:4860::8888'));
 const good=await fetchPublicMedia('https://cdn.example/p.png',policy());assert.equal(await good.response.text(),'png');assert.deepEqual(pins,['93.184.216.34']);
 answers=[{address:'2001:4860:4860::8888',family:6}];await fetchPublicMedia('https://cdn.example/p.png',policy());assert.equal(pins.at(-1),'2001:4860:4860::8888');answers=[{address:'93.184.216.34',family:4}];
 scenario={rebind:true};await fetchPublicMedia('https://cdn.example/p.png',policy());assert.equal(pins.at(-1),'93.184.216.34');scenario={};answers=[{address:'93.184.216.34',family:4}];
 const before=calls;answers=[{address:'127.0.0.1',family:4}];await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/PRIVATE/);assert.equal(calls,before);
 answers=[{address:'93.184.216.34',family:4},{address:'::ffff:c0a8:1',family:6}];await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/PRIVATE/);
 answers=[{address:'93.184.216.34',family:4}];
 scenario={status:302,headers:{location:'https://127.0.0.1/admin'}};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/PRIVATE/);
 scenario={status:302,headers:{location:'/again'}};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/TOO_MANY_REDIRECTS/);
 scenario={headers:{'content-length':String(100*1024*1024+1)}};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/MEDIA_TOO_LARGE/);
 scenario={chunks:Array(101).fill(Buffer.alloc(1024*1024))};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/MEDIA_TOO_LARGE/);
 scenario={type:'text/html',chunks:[Buffer.alloc(3*1024*1024),Buffer.alloc(3*1024*1024)]};await assert.rejects(fetchPublicMedia('https://cdn.example/page',{...policy(),kind:'video',allowHtml:true}),/SHARE_PAGE_TOO_LARGE/);
 scenario={headers:{'content-encoding':'gzip'}};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/ENCODING/);
 scenario={headers:{'content-length':'10'}};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/INCOMPLETE/);
 scenario={aborted:true};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',policy()),/INCOMPLETE/);
 scenario={stall:true};await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',{...policy(),deadline:Date.now()+20}),/TIMEOUT/);
 stallDns=true;await assert.rejects(fetchPublicMedia('https://cdn.example/p.png',{...policy(),deadline:Date.now()+20}),/TIMEOUT/);stallDns=false;
 scenario={};await assert.rejects(fetchPublicMedia('https://user:pass@cdn.example/p.png',policy()),/CREDENTIALS/);
 scenario={responses:[{status:302,headers:{location:'https://other.example/p.png'}},{status:200}]};const headerStart=observedHeaders.length;
 await fetchPublicMedia('https://cdn.example/private.png',{...policy(),authHeaders:{Authorization:'Bearer isolated-only'}});
 assert.equal(observedHeaders[headerStart].Authorization,'Bearer isolated-only');assert.equal(observedHeaders[headerStart+1].Authorization,undefined,'redirect must not forward the original API credential');
 scenario={};await assert.rejects(fetchPublicMedia('https://other.example/p.png',{...policy(),allowTarget:url=>url.hostname==='cdn.example'}),/UNTRUSTED_DELIVERY_HOST/);
 await assert.rejects(fetchPublicMedia('http://cdn.example/p.png',policy()),/HTTPS/);
 const route=fs.readFileSync('app/api/tools/media-import/route.ts','utf8');assert(!route.includes('await fetch('));assert(!route.includes('req.json()'));assert(route.includes('boundedRequestJson'));assert(!route.includes('h.includes('));
 const admission=compile('app/api/tools/media-import/route.ts',{'@/lib/security/public-media-fetch':{fetchPublicMedia},'@/lib/security/bounded-request-json':compile('lib/security/bounded-request-json.ts',{}),'@/lib/sasi/request-security':{isSameOriginMutation:()=>true},'@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})}});
 const post=body=>admission.POST(new Request('https://lingxifield.com/api/tools/media-import',{method:'POST',headers:{'content-type':'application/json'},body}));
 scenario={};const actual=await post(JSON.stringify({url:'https://cdn.example/photo.png',kind:'image'}));assert.equal(actual.status,200);assert.equal(await actual.text(),'png');
 assert.equal((await post(JSON.stringify({url:'https://cdn.example/photo.png',kind:'invalid'}))).status,400);
 assert.equal((await post(' '.repeat(32769))).status,413);
 scenario={headers:{'content-length':String(100*1024*1024+1)}};assert.equal((await post(JSON.stringify({url:'https://cdn.example/photo.png',kind:'image'}))).status,413);
 console.log('PASS: actual shared IP classifier and pinned downloader; mapped/expanded IPv6, mixed DNS, private/loop redirects, streamed HTML limit, declared media limit, compressed/truncated/aborted data, deadline and route wiring. Mock network; no production requests.');
})().catch(e=>{console.error(e);process.exitCode=1});
