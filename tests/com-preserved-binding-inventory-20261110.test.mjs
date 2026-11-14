import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs',import.meta.url),'utf8');
const fragment=source.slice(source.indexOf('const preservedValueTypes'),source.indexOf('if (unknownBindings.length)'));
const inspect=new Function('currentBindings','wwwWorker',fragment+'\nreturn unknownBindings;');
test('mapped asset, encrypted secrets, public R2 and API service bindings survive promotion',()=>{
 const bindings=[{type:'assets',name:'ASSETS'},{type:'secret_text',name:'PAYPAL_CLIENT_SECRET'},
 {type:'plain_text',name:'PAYPAL_ENABLED',text:'false'},
 {type:'r2_bucket',name:'LINGXI_PUBLIC_LARGE_R2',bucket_name:'lingxifield-com-large-public'},
 {type:'service',name:'LINGXI_COM_LEGACY_GATEWAY',service:'gateway'}];
 assert.deepEqual(inspect(bindings,'gateway'),[]);
});
test('unknown or mismatched resources stop production before deployment',()=>{
 for(const binding of [{type:'assets',name:'OTHER'}, {type:'kv_namespace',name:'PRIVATE'},
 {type:'r2_bucket',name:'LINGXI_PUBLIC_LARGE_R2',bucket_name:'different-bucket'},
 {type:'service',name:'LINGXI_COM_LEGACY_GATEWAY',service:'different-service'}])
  assert.deepEqual(inspect([binding],'gateway'),[binding]);
});
