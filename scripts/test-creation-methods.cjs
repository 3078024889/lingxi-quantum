const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  const m = new Module(path.resolve(file)); m.filename = path.resolve(file); m.paths = module.paths;
  const original = m.require.bind(m);
  m.require = id => id === './function-options' ? load('lib/sasi/function-options.ts') : Object.hasOwn(mocks, id) ? mocks[id] : original(id);
  m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText, m.filename);
  return m.exports;
}
const methods = load('lib/sasi/creation-methods.ts');
for (const task of ['chat','director','book','website','image','video']) {
  const m = methods.creationMethod(task);
  assert.ok(m.ids.length); assert.match(m.instructions, /budget/);
}
assert.throws(() => methods.creationMethod('unknown'));
assert.throws(() => methods.creationMethod('video',['evidence']), /INVALID_FUNCTION_SELECTION/);
assert.throws(() => methods.creationMethod('video','shots'), /INVALID_FUNCTION_SELECTION/);
assert.deepEqual(methods.creationMethod('video',['shots','dialogue','shots']).ids,['clarity','shots','dialogue']);
assert.ok(methods.creationMethod('book',[]).ids.includes('evidence'));
const {unitEconomics}=load('lib/sasi/unit-economics.ts');
const videoCost=unitEconomics({priceFen:690,supplierFen:320,operationsFen:20,retryReserveFen:64,paymentFeeBps:60});
assert.equal(videoCost.paymentFeeFen,5);assert.equal(videoCost.contributionFen,281);
assert.equal(unitEconomics({priceFen:10,supplierFen:20,operationsFen:0,retryReserveFen:0,paymentFeeBps:0}).contributionFen,-10);
assert.throws(()=>unitEconomics({priceFen:0,supplierFen:0,operationsFen:0,retryReserveFen:0,paymentFeeBps:0}));
const brief = '完整用户描述'.repeat(600);
assert.ok(methods.compileVisualBrief('image', brief).prompt.endsWith(brief));
assert.throws(() => methods.compileVisualBrief('video', '  '));

// Exercise the actual quote/confirmation route with a fake DB/provider; no paid request.
let stored, executed, estimateMessages;
const db = {from(table) {
  const q = { select(){return q}, eq(){return q},
    insert(row){stored = {...row, id:'task', state:'quoted'}; return q},
    update(){return q}, single: async()=>({data:stored}),
    maybeSingle: async()=>({data:table === 'sasi_provider_connections'
      ? {fingerprint:'fingerprint', health_status:'healthy', encrypted_credential:'encrypted'} : stored})};
  return q;
}};
const route = load('app/api/sasi/byok/text/route.ts', {
  'next/server': {NextResponse:{json:(body, init)=>({body,status:init?.status ?? 200})}},
  '@/lib/supabase/server': {createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})}})},
  '@/lib/supabase/admin': {createAdminClient:()=>db},
  '@/lib/sasi/request-security': {isSameOriginMutation:()=>true},
  '@/lib/security/abuse-guard': {enforceAbuseGuard:async()=>({ok:true})},
  '@/lib/sasi/credential-vault': {decryptProviderKey:()=> 'fake-test-key'},
  '@/lib/sasi/creation-methods': methods,
  '@/lib/sasi/ark-text': {TEXT_PROFILE:{validUntil:'2099-01-01'}, TEXT_VERSION:'test', SASI_SYSTEM:'base', DIRECTOR_CONTRACT:'director-json',
    estimatedTextFen:messages=>{estimateMessages=structuredClone(messages);return 1},
    runArkText:async(key,messages)=>{executed=messages;return {answer:'test'}}},
  '@/lib/sasi/website-artifact': {WEBSITE_CONTRACT:'website-json',validateWebsiteArtifact:x=>x},
  '@/lib/sasi-kernel/cognition/grounded-answer': {buildGroundedReasoningPrompt:({question})=>question,validateGroundedAnswer:()=>({ok:true,refs:[1]})},
});
const request = body => ({json:async()=>body});
(async()=>{
  for (const mode of ['chat','director','book','website']) {
    const r = await route.POST(request({action:'quote',mode,question:'保留我的完整需求',evidence:[{text:'资料内容'}]}));
    assert.equal(r.status,201);
    assert.deepEqual(stored.request.method,methods.creationMethod(mode));
    assert.ok(stored.request.messages[0].content.includes(stored.request.method.instructions));
    assert.equal(stored.request.messages.at(-1).content,'保留我的完整需求');
    assert.deepEqual(estimateMessages,stored.request.messages);
  }
  assert.equal((await route.POST(request({action:'quote',mode:'director',question:'我的故事',functions:['dialogue','shots']}))).status,201);
  assert.deepEqual(stored.request.method.ids,['clarity','dialogue','shots']);
  assert.equal((await route.POST(request({action:'quote',mode:'director',question:'我的故事',functions:['mobile']}))).status,400);
  const quote = structuredClone(stored.request.messages);
  assert.equal((await route.POST(request({action:'confirm',taskId:'task'}))).status,422);
  assert.equal(executed,undefined);
  // Client cannot replace the frozen method or prompt after accepting the quote.
  stored.request.mode='chat';
  const r = await route.POST(request({action:'confirm',taskId:'task',acceptSupplierBilling:true,question:'替换内容',method:{instructions:'override'}}));
  assert.equal(r.status,200); assert.deepEqual(executed,quote);
  console.log('PASS: task routing, full brief preservation, actual text quote compilation, cost snapshot, explicit consent and frozen execution (mock provider).');
})().catch(e=>{console.error(e);process.exitCode=1});
