#!/usr/bin/env node
// Existing 3194 service only. No charges, orders or refunds. Never prints credentials.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const UNIT='lingxifield-cn-release-20261108-9230bcba6a24.service';
const FIELDS=['WECHAT_MCH_ID','WECHAT_APP_ID','WECHAT_CERT_SERIAL_NO','WECHAT_PRIVATE_KEY','WECHAT_PLATFORM_PUBLIC_KEY','WECHAT_PLATFORM_PUBLIC_KEY_ID','WECHAT_API_V3_KEY'];
export function verifyReply(headers,raw,pub,expectedId,now=Date.now()){
 const serial=headers.get('wechatpay-serial'),ts=headers.get('wechatpay-timestamp')||'',nonce=headers.get('wechatpay-nonce')||'',signature=headers.get('wechatpay-signature')||'';
 if(serial!==expectedId||!/^\d{10}$/.test(ts)||Math.abs(now/1000-Number(ts))>300||!nonce||!signature||signature.startsWith('WECHATPAY/SIGNTEST/'))throw Error('WECHAT_REPLY_HEADERS_INVALID');
 if(!crypto.verify('RSA-SHA256',Buffer.from(ts+'\n'+nonce+'\n'+raw+'\n'),pub,Buffer.from(signature,'base64')))throw Error('WECHAT_REPLY_SIGNATURE_INVALID');
}
export function recoverConfig(certPem,keyPem,publicPem,metadata,v3){
 const cert=new crypto.X509Certificate(certPem),privateKey=crypto.createPrivateKey(keyPem),publicKey=crypto.createPublicKey(publicPem);
 if(privateKey.asymmetricKeyType!=='rsa'||publicKey.asymmetricKeyType!=='rsa')throw Error('WECHAT_RSA_REQUIRED');
 const derived=crypto.createPublicKey(privateKey).export({format:'der',type:'spki'});
 if(!derived.equals(cert.publicKey.export({format:'der',type:'spki'})))throw Error('WECHAT_CERTIFICATE_KEY_MISMATCH');
 const mchid=cert.subject.split('\n').find(x=>x.startsWith('CN='))?.slice(3);
 if(!/^\d{1,32}$/.test(mchid||'')||metadata.merchantId!==mchid)throw Error('WECHAT_CERTIFICATE_MERCHANT_MISMATCH');
 if(Date.now()<Date.parse(cert.validFrom)||Date.now()>Date.parse(cert.validTo))throw Error('WECHAT_MERCHANT_CERTIFICATE_EXPIRED');
 if(!/^wx[a-z0-9]{1,30}$/i.test(metadata.appid||'')||metadata.merchantBindingVerifiedFromSignedHistoricalTransaction!==true)throw Error('WECHAT_APPID_BINDING_NOT_VERIFIED');
 if(!/^PUB_KEY_ID_\d+$/.test(metadata.platformPublicKeyId||''))throw Error('WECHAT_PLATFORM_KEY_ID_INVALID');
 if(!/^[A-Za-z0-9]{32}$/.test(v3))throw Error('WECHAT_API_V3_KEY_FORMAT_INVALID');
 return {WECHAT_MCH_ID:mchid,WECHAT_APP_ID:metadata.appid,WECHAT_CERT_SERIAL_NO:cert.serialNumber,WECHAT_PRIVATE_KEY:keyPem.toString(),WECHAT_PLATFORM_PUBLIC_KEY:publicPem.toString(),WECHAT_PLATFORM_PUBLIC_KEY_ID:metadata.platformPublicKeyId,WECHAT_API_V3_KEY:v3};
}
export function decryptCertificate(item,key){
 if(item.algorithm!=='AEAD_AES_256_GCM')throw Error('WECHAT_CERTIFICATE_CIPHER_UNSUPPORTED');
 const encrypted=Buffer.from(item.ciphertext,'base64');
 if(encrypted.length<=16)throw Error('WECHAT_CERTIFICATE_CIPHER_INVALID');
 const decipher=crypto.createDecipheriv('aes-256-gcm',Buffer.from(key),Buffer.from(item.nonce));
 decipher.setAAD(Buffer.from(item.associated_data||''));decipher.setAuthTag(encrypted.subarray(-16));
 return new crypto.X509Certificate(Buffer.concat([decipher.update(encrypted.subarray(0,-16)),decipher.final()]));
}
async function provider(cfg,route){
 const ts=String(Math.floor(Date.now()/1000)),nonce=crypto.randomBytes(12).toString('hex');
 const sig=crypto.sign('RSA-SHA256',Buffer.from('GET\n'+route+'\n'+ts+'\n'+nonce+'\n\n'),crypto.createPrivateKey(cfg.WECHAT_PRIVATE_KEY)).toString('base64');
 const auth='WECHATPAY2-SHA256-RSA2048 mchid="'+cfg.WECHAT_MCH_ID+'",nonce_str="'+nonce+'",timestamp="'+ts+'",serial_no="'+cfg.WECHAT_CERT_SERIAL_NO+'",signature="'+sig+'"';
 const response=await fetch('https://api.mch.weixin.qq.com'+route,{headers:{Authorization:auth,Accept:'application/json','Accept-Language':'zh-CN'},redirect:'error',signal:AbortSignal.timeout(20000)});
 const raw=await response.text();
 verifyReply(response.headers,raw,crypto.createPublicKey(cfg.WECHAT_PLATFORM_PUBLIC_KEY),cfg.WECHAT_PLATFORM_PUBLIC_KEY_ID);
 let data;try{data=JSON.parse(raw)}catch{throw Error('WECHAT_GATEWAY_RESPONSE_INVALID')}
 return {status:response.status,data};
}
function runtime(){
 const pid=execFileSync('systemctl',['show',UNIT,'-p','MainPID','--value'],{encoding:'utf8'}).trim();
 if(!/^[1-9]\d*$/.test(pid))throw Error('SERVICE_NOT_RUNNING');
 const env=Object.fromEntries(fs.readFileSync('/proc/'+pid+'/environ','utf8').split('\0').filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)]}));
 if(env.PORT!=='3194')throw Error('PRODUCTION_PORT_CHANGED');
 return env;
}
async function local(route,options={}){return fetch('http://127.0.0.1:3194'+route,{...options,redirect:'error',signal:AbortSignal.timeout(8000)})}
async function healthy(){
 for(let i=0;i<30;i++){
  try{const r=await local('/api/health');if(r.status===200&&(await r.json()).ok===true)return}catch{}
  await new Promise(resolve=>setTimeout(resolve,2000));
 }
 throw Error('SERVICE_HEALTH_FAILED');
}
export function envFile(cfg){
 return FIELDS.map(name=>{
  const value=cfg[name];if(typeof value!=='string'||value.includes('\0'))throw Error('RECOVERY_VALUE_INVALID');
  // systemd EnvironmentFile double quotes support real newlines; escape shell-like syntax literally.
  return name+'="'+value.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/`/g,'\\`').replace(/\$/g,'\\$')+'"';
 }).join('\n')+'\nWECHAT_ENABLED=true\n';
}
function secureFile(file){
 const stat=fs.lstatSync(file);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==0||(stat.mode&0o077)!==0)throw Error('RECOVERY_FILE_NOT_ROOT_PRIVATE');
 return fs.readFileSync(file);
}
async function main(){
 if(process.getuid?.()!==0)throw Error('ROOT_REQUIRED');
 if(!['--audit','--enable'].includes(process.argv[2]))throw Error('USE_AUDIT_OR_ENABLE');
 const dir=path.dirname(fs.realpathSync(process.argv[1]));
 const meta=JSON.parse(secureFile(path.join(dir,'public-parameters.json')));
 const cfg=recoverConfig(secureFile(path.join(dir,'apiclient_cert.pem')),secureFile(path.join(dir,'apiclient_key.pem')),secureFile(path.join(dir,'pub_key.pem')),meta,secureFile(path.join(dir,'wechat-api-v3.pending.txt')).toString('utf8'));
 const original=runtime();
 await healthy();
 const baseline=await(await local('/api/pay/providers')).json();
 console.log('WECHAT_RECOVERY_CERTIFICATE_KEY_PAIR_AND_PUBLIC_METADATA_PASS');
 const id='LXVERIFY'+crypto.randomBytes(12).toString('hex');
 const query=await provider(cfg,'/v3/pay/transactions/out-trade-no/'+id+'?mchid='+cfg.WECHAT_MCH_ID);
 if(query.status!==404||query.data.code!=='ORDER_NOT_EXIST')throw Error('WECHAT_SIGNED_QUERY_FAILED');
 console.log('WECHAT_RECOVERY_SIGNED_LIVE_QUERY_PASS_NO_CHARGE');
 const certificates=await provider(cfg,'/v3/certificates');
 if(certificates.status===404&&certificates.data.code==='RESOURCE_NOT_EXISTS'&&meta.apiV3SetByMerchantConfirmed===true){
  console.log('WECHAT_PUBLIC_KEY_MODE_NO_PLATFORM_CERTIFICATE_API_V3_CONFIRMED_BY_MERCHANT_REAL_CALLBACK_STILL_REQUIRED');
 }else{
  if(certificates.status!==200||!Array.isArray(certificates.data.data)||!certificates.data.data.length)throw Error('WECHAT_API_V3_PROOF_UNAVAILABLE_HTTP_'+certificates.status);
  let decrypted=false;
  for(const item of certificates.data.data){
   try{const cert=decryptCertificate(item.encrypt_certificate,cfg.WECHAT_API_V3_KEY);if(cert.serialNumber.toUpperCase()===String(item.serial_no).toUpperCase())decrypted=true;}catch{}
  }
  if(!decrypted)throw Error('WECHAT_NEW_API_V3_KEY_DECRYPTION_FAILED');
  console.log('WECHAT_NEW_API_V3_KEY_PROVIDER_DECRYPTION_PASS');
 }
 if(process.argv[2]==='--audit'){console.log('WECHAT_AUDIT_PASS_NO_SERVICE_CHANGES');return;}
 if(JSON.stringify(runtime())!==JSON.stringify(original))throw Error('SERVICE_CHANGED_DURING_PROBE');
 const env='/etc/lingxifield/wechat-recovered-20261110.env';
 const dropDir='/etc/systemd/system/'+UNIT+'.d';
 const conf=dropDir+'/zzzz-wechat-recovered-20261110.conf';
 const files=[env,conf];
 const saved=files.map(file=>{
  if(!fs.existsSync(file))return null;
  const st=fs.lstatSync(file);if(st.isSymbolicLink()||!st.isFile()||st.uid!==0||(st.mode&0o022)!==0)throw Error('RECOVERY_OVERRIDE_UNSAFE');
  return fs.readFileSync(file);
 });
 const suffix='.backup-'+Date.now();files.forEach((file,i)=>{if(saved[i])fs.copyFileSync(file,file+suffix)});
 try{
  fs.mkdirSync(dropDir,{recursive:true,mode:0o755});
  fs.writeFileSync(env,envFile(cfg),{mode:0o600});fs.chmodSync(env,0o600);
  fs.writeFileSync(conf,'[Service]\nEnvironmentFile='+env+'\n',{mode:0o644});
  execFileSync('systemctl',['daemon-reload']);execFileSync('systemctl',['restart',UNIT]);await healthy();
  const current=runtime();for(const name of FIELDS)if(current[name]!==cfg[name])throw Error('WECHAT_RUNTIME_VALUE_MISMATCH');
  const result=await(await local('/api/pay/providers')).json();
  if(result.wechat!==true||result.alipay!==baseline.alipay||result.paypal!==baseline.paypal)throw Error('PAYMENT_CHANNEL_POSTCHECK_FAILED');
  const rejection=await local('/api/pay/wechat/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  if(rejection.status!==401)throw Error('WECHAT_UNSIGNED_CALLBACK_NOT_REJECTED');
  console.log('DUAL_SITE_PAYMENT_CHANNELS='+JSON.stringify({wechat:result.wechat,alipay:result.alipay,paypal:result.paypal}));
  console.log('WECHAT_RECOVERED_AND_ENABLED_REAL_PURCHASE_ACCEPTANCE_STILL_REQUIRED');
 }catch{
  files.forEach((file,i)=>{if(saved[i])fs.writeFileSync(file,saved[i]);else if(fs.existsSync(file))fs.unlinkSync(file)});
  execFileSync('systemctl',['daemon-reload']);execFileSync('systemctl',['restart',UNIT]);await healthy();
  throw Error('WECHAT_INSTALL_REVERTED');
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{
 console.log('WECHAT_RECOVERY_STOP='+(/^[A-Z0-9_]{1,100}$/.test(e.message||'')?e.message:'RECOVERY_FAILED_NO_VALUES_PRINTED'));process.exitCode=1;
});
