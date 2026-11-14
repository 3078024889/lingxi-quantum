const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const ts=require('typescript');
const compiled=ts.transpileModule(fs.readFileSync('lib/alipay.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const merchant=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const gateway=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const pem=(key,privateKey=false)=>key.export({type:privateKey?'pkcs8':'spki',format:'pem'});
function load(overrides={}){
 const exports={};
 vm.runInNewContext(compiled,{exports,module:{exports},require,Buffer,URL,URLSearchParams,console,process:{env:{ALIPAY_ENABLED:'true',ALIPAY_APP_ID:'test-app',ALIPAY_SELLER_ID:'test-seller',ALIPAY_PRIVATE_KEY:pem(merchant.privateKey,true),ALIPAY_PUBLIC_KEY:pem(gateway.publicKey),...overrides}}});
 return exports;
}
const canonical=(params,notify=false)=>Object.entries(params).filter(([key,value])=>key!=='sign'&&(!notify||key!=='sign_type')&&value!=='').sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>`${k}=${v}`).join('&');
test('Alipay accepts distinct merchant signing and gateway verification keys; both signatures use the correct party',()=>{
 const api=load();assert.equal(api.alipayKeyMaterialReady(),true);assert.equal(api.alipayEnabled(),true);
 const request=new URL(api.createAlipayPaymentUrl({outTradeNo:'LXTEST1',amountRmb:1,subject:'local test',returnUrl:'https://example.test/return',notifyUrl:'https://example.test/notify',mobile:false}));
 const params=Object.fromEntries(request.searchParams);
 assert.equal(crypto.verify('RSA-SHA256',Buffer.from(canonical(params)),merchant.publicKey,Buffer.from(params.sign,'base64')),true);
 const notify={app_id:'test-app',out_trade_no:'LXTEST1',trade_status:'TRADE_SUCCESS',total_amount:'1.00',sign_type:'RSA2'};
 notify.sign=crypto.sign('RSA-SHA256',Buffer.from(canonical(notify,true)),gateway.privateKey).toString('base64');
 assert.equal(api.verifyAlipayNotification(notify),true);
 assert.equal(api.verifyAlipayNotification({...notify,total_amount:'99.00'}),false);
 notify.sign=crypto.sign('RSA-SHA256',Buffer.from(canonical(notify,true)),merchant.privateKey).toString('base64');
 assert.equal(api.verifyAlipayNotification(notify),false,'merchant public key must not replace the gateway verification key');
});
test('Alipay keeps explicit enablement and rejects malformed, non-RSA and weak key material',()=>{
 assert.equal(load({ALIPAY_ENABLED:'false'}).alipayEnabled(),false);
 assert.equal(load({ALIPAY_PRIVATE_KEY:'invalid'}).alipayKeyMaterialReady(),false);
 assert.equal(load({ALIPAY_PUBLIC_KEY:''}).alipayKeyMaterialReady(),false);
 const weak=crypto.generateKeyPairSync('rsa',{modulusLength:1024});
 assert.equal(load({ALIPAY_PRIVATE_KEY:pem(weak.privateKey,true)}).alipayKeyMaterialReady(),false);
 const ec=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 assert.equal(load({ALIPAY_PUBLIC_KEY:pem(ec.publicKey)}).alipayKeyMaterialReady(),false);
});
test('Alipay accepts escaped Windows PEM and whitespace-wrapped bare DER keys',()=>{
 assert.equal(load({ALIPAY_PRIVATE_KEY:pem(merchant.privateKey,true).replace(/\n/g,'\\r\\n'),ALIPAY_PUBLIC_KEY:pem(gateway.publicKey).replace(/\n/g,'\\r\\n')}).alipayKeyMaterialReady(),true);
 const bare=key=>String(key).replace(/-----[^\n]+-----/g,'').replace(/\s/g,'').match(/.{1,37}/g).join(' \n\t');
 assert.equal(load({ALIPAY_PRIVATE_KEY:bare(pem(merchant.privateKey,true)),ALIPAY_PUBLIC_KEY:bare(pem(gateway.publicKey))}).alipayKeyMaterialReady(),true);
});
