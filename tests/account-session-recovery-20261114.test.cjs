const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(readFileSync('app/account/AccountClientShell.tsx','utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}
}).outputText;
const settle = () => new Promise(resolve => setImmediate(resolve));
function mount(getUser) {
  const state=[]; let slot=0, effect, listener, cleanup;
  const hooks={useState(initial){const i=slot++;state[i]=initial;return [initial,value=>{state[i]=typeof value==='function'?value(state[i]):value}];},useEffect(fn){effect=fn;}};
  const auth={getUser,onAuthStateChange(fn){listener=fn;return {data:{subscription:{unsubscribe(){}}}};}};
  const client={auth,from(){return {select(){return this},eq(){return this},then(resolve){return Promise.resolve(resolve({count:2,error:null}));}};}};
  const context={exports:{},setTimeout,clearTimeout,URLSearchParams,window:{location:{search:''}},require(name){
    if(name==='react')return hooks;
    if(name==='react/jsx-runtime')return {jsx(){return null},jsxs(){return null}};
    if(name==='@/lib/supabase/client')return {createClient:()=>client};
    return {default:()=>null};
  }};
  vm.runInNewContext(source,context);
  context.exports.default(); cleanup=effect();
  return {state,event:(name)=>listener(name,null),close:()=>cleanup()};
}

test('a mobile browser without a session sees the sign-in form, not an outage',async()=>{
  const app=mount(async()=>({data:{user:null},error:{name:'AuthSessionMissingError',status:400}}));
  await settle();assert.equal(app.state[0],'login');assert.equal(app.state[1],null);app.close();
});
test('expired refresh credentials also offer sign-in without exposing account data',async()=>{
  const app=mount(async()=>({data:{user:null},error:{code:'refresh_token_not_found'}}));
  await settle();assert.equal(app.state[0],'login');app.close();
});
test('a real auth outage remains an error rather than becoming a false signed-in account',async()=>{
  const app=mount(async()=>({data:{user:null},error:{name:'AuthRetryableFetchError',status:503}}));
  await settle();assert.equal(app.state[0],'error');assert.equal(app.state[1],null);app.close();
});
test('verified users can read their account and paid order count',async()=>{
  const app=mount(async()=>({data:{user:{id:'verified-user',email:'test@example.invalid'}},error:null}));
  await settle();assert.equal(app.state[0],'account');assert.equal(app.state[1].id,'verified-user');assert.equal(app.state[2],2);app.close();
});
test('a delayed auth reply cannot restore private data after sign-out',async()=>{
  let resolve;const app=mount(()=>new Promise(done=>{resolve=done}));
  app.event('SIGNED_OUT');
  resolve({data:{user:{id:'old-user'}},error:null});
  await settle();assert.equal(app.state[0],'login');assert.equal(app.state[1],null);app.close();
});
test('auth changes are verified after the Supabase callback releases its lock',async()=>{
  let calls=0;
  const app=mount(async()=>{calls++;return {data:{user:{id:'verified-user'}},error:null}});
  await settle();app.event('TOKEN_REFRESHED');assert.equal(calls,1);
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(calls,2);assert.equal(app.state[0],'account');assert.equal(app.state[2],2);app.close();
});
