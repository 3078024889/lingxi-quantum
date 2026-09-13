const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
let user = {id:'owner'}, calls = [], result = {data:[{id:'report'}],error:null};
const query = {delete(){calls.push(['delete']);return this},eq(...args){calls.push(['eq',...args]);return this},async select(){return result}};
const moduleStub={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/account/report/delete/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleStub.exports,URL,require(name){if(name==='next/server')return {NextResponse:{json:(data,options)=>({status:options?.status||200,data})}};if(name.endsWith('/server'))return {createClient:()=>({auth:{getUser:async()=>({data:{user}})}})};if(name.endsWith('/admin'))return {createAdminClient:()=>({from(table){calls.push(['from',table]);return query}})};throw Error(name)}});
const post=moduleStub.exports.POST;
const id='11111111-1111-4111-8111-111111111111';
const request=(kind,origin='https://example.com')=>({url:'https://example.com/api/account/report/delete',headers:new Headers({origin}),json:async()=>({kind,id})});
(async()=>{
assert.equal((await post(request('qian','https://attacker.com'))).status,403);
user=null;assert.equal((await post(request('qian'))).status,401);user={id:'owner'};
for(const kind of ['orders','constructor','__proto__','invalid'])assert.equal((await post(request(kind))).status,400);
assert.equal(calls.length,0);
for(const kind of ['lifemap','relationship','qian','mirror','resilience','romance','daily','wealth','archetype']){calls=[];assert.equal((await post(request(kind))).status,200);assert(calls.some(c=>c[0]==='eq'&&c[1]==='user_id'&&c[2]==='owner'));assert(calls.some(c=>c[0]==='eq'&&c[1]==='id'&&c[2]===id));if(kind==='archetype')assert(calls.some(c=>c[1]==='product_id'&&c[2]==='life-archetype'));}
result={data:[],error:null};assert.equal((await post(request('qian'))).status,404);
result={data:null,error:{message:'private database error'}};const failed=await post(request('qian'));assert.equal(failed.status,500);assert(!JSON.stringify(failed).includes('private database'));
console.log('PASS: nine report types, ownership scope, product scope, origin, auth, allowlist, missing records and database errors. No live records changed.');
})().catch(e=>{console.error(e);process.exitCode=1});
