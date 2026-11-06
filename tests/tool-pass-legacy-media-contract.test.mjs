import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('historical quote delivery requires atomic stage receipt and settled order',()=>{
 const guard=read('lib/tools/media/paid-guard.ts'),sql=read('supabase/migrations/20261106070000_legacy_media_execution_guard.sql');
 assert.match(guard,/lingxi_claim_legacy_media_execution/);
 assert.match(sql,/join public.orders o/);
 assert.match(sql,/o.status='paid'/);
 assert.match(sql,/primary key\(quote_id,stage\)/);
 assert.match(sql,/for update/);
});
for(const [stage,path,sideEffect] of [
 ['transcribe','app/api/tools/media/transcribe/route.ts','await transcribeAudioRemote(x)'],
 ['translate','app/api/tools/media/translate/route.ts','await translateTextRemote('],
 ['tts','app/api/tools/media/tts/route.ts','await synthesizeRemote(']
]){
 test(stage+' consumes one historical quote stage before supplier call',()=>{
  const code=read(path);
  const claim=code.indexOf('await claimLegacyMediaExecution(');
  assert.ok(claim>0&&code.indexOf(sideEffect)>claim);
  assert.ok(code.includes('stage:"'+stage+'"'));
 });
}
