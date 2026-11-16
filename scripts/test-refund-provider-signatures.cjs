const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),ts=require('typescript');
const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
process.env.WECHAT_APP_ID='fixture';process.env.WECHAT_API_V3_KEY='0'.repeat(32);process.env.WECHAT_MCH_ID='fixture';process.env.WECHAT_CERT_SERIAL_NO='fixture';process.env.WECHAT_PRIVATE_KEY=pair.privateKey;
process.env.ALIPAY_APP_ID='fixture';process.env.ALIPAY_PRIVATE_KEY=pair.privateKey.replace(/-----[^\n]+-----/g,'');process.env.ALIPAY_PUBLIC_KEY=pair.publicKey.replace(/-----[^\n]+-----/g,'');
function load(file){const mod={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports',code)(name=>name==='@/lib/money/refund-identifiers'?{wechatRefundNotifyUrl:()=>null}:require(name),mod,mod.exports);return mod.exports;}
const wx=load('lib/wechatpay.ts'),alipay=load('lib/alipay.ts');
let calls=0;
global.fetch=async(url,options)=>{
 calls++;
 if(String(url).includes('weixin.qq.com')){
  const fields=Object.fromEntries([...options.headers.Authorization.matchAll(/(\w+)="([^"]+)"/g)].map(x=>[x[1],x[2]]));const u=new URL(url);
  const canonical=[options.method,u.pathname+u.search,fields.timestamp,fields.nonce_str,options.body||'',''].join('\n');
  assert(crypto.verify('RSA-SHA256',Buffer.from(canonical),pair.publicKey,Buffer.from(fields.signature,'base64')),'WeChat canonical signature');
  const b=JSON.parse(options.body);return new Response(JSON.stringify({refund_id:'verified-ref',out_refund_no:b.out_refund_no,out_trade_no:b.out_trade_no,amount:b.amount,status:'SUCCESS'}));
 }
 const params=new URLSearchParams(options.body),signature=params.get('sign');params.delete('sign');const canonical=[...params].filter(([k,v])=>v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>`${k}=${v}`).join('&');
 assert(crypto.verify('RSA-SHA256',Buffer.from(canonical),pair.publicKey,Buffer.from(signature,'base64')),'Alipay canonical signature with multiline unwrapped key');
 const payload={code:'10000',refund_fee:'1.00',trade_no:'verified-ref',fund_change:'Y'},raw=JSON.stringify(payload),sign=crypto.sign('RSA-SHA256',Buffer.from(raw),pair.privateKey).toString('base64');
 return new Response(JSON.stringify({alipay_trade_refund_response:payload,sign}));
};
(async()=>{assert.equal((await wx.createWechatRefund({outTradeNo:'LXoriginal',outRefundNo:'stable-refund',totalFen:1000,refundFen:100})).status,'SUCCESS');assert.equal((await alipay.createAlipayRefund({outTradeNo:'LXoriginal',outRequestNo:'stable-refund',refundFen:100})).status,'SUCCESS');assert.equal(calls,2);console.log('PASS: WeChat and Alipay refund signatures, original refund references, signed Alipay responses; generated keys and mock transport only.');})().catch(e=>{console.error(e);process.exitCode=1});
