import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';import {parseEnv} from 'node:util';
import {recoverConfig,verifyReply,decryptCertificate,envFile} from '../scripts/ops/wechat-restore-ecs-20261110.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wechat-recovery-test-'));
const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const key=pair.privateKey.export({format:'pem',type:'pkcs8'});
fs.writeFileSync(path.join(dir,'key.pem'),key,{mode:0o600});
fs.writeFileSync(path.join(dir,'openssl.cnf'),'[req]\ndistinguished_name=dn\n[dn]\n');
execFileSync(process.env.WECHAT_TEST_OPENSSL||'openssl',['req','-new','-x509','-key',path.join(dir,'key.pem'),'-out',path.join(dir,'cert.pem'),'-days','1','-config',path.join(dir,'openssl.cnf'),'-subj','/CN=1234567890'],{stdio:'ignore'});
const cert=fs.readFileSync(path.join(dir,'cert.pem'));
const publicPem=pair.publicKey.export({format:'pem',type:'spki'});
const meta={merchantId:'1234567890',appid:'wx1234567890abcdef',platformPublicKeyId:'PUB_KEY_ID_1234567890',merchantBindingVerifiedFromSignedHistoricalTransaction:true};
const apiKey='Aa0'.repeat(10)+'Bb';
test.after(()=>{
 const resolved=fs.realpathSync(dir),base=fs.realpathSync(os.tmpdir());
 assert.equal(path.dirname(resolved),base);assert.ok(path.basename(resolved).startsWith('wechat-recovery-test-'));
 fs.rmSync(resolved,{recursive:true,force:true});
});
test('recovered credentials require a matching certificate, private key and signed historical merchant binding',()=>{
 const config=recoverConfig(cert,key,publicPem,meta,apiKey);
 assert.equal(config.WECHAT_MCH_ID,'1234567890');
 assert.equal(config.WECHAT_APP_ID,meta.appid);
 const other=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
 assert.throws(()=>recoverConfig(cert,other.privateKey.export({format:'pem',type:'pkcs8'}),publicPem,meta,apiKey),/KEY_MISMATCH/);
 assert.throws(()=>recoverConfig(cert,key,publicPem,{...meta,merchantId:'999'},apiKey),/MERCHANT_MISMATCH/);
 assert.throws(()=>recoverConfig(cert,key,publicPem,{...meta,merchantBindingVerifiedFromSignedHistoricalTransaction:false},apiKey),/BINDING_NOT_VERIFIED/);
 assert.throws(()=>recoverConfig(cert,key,publicPem,meta,'not-a-real-key'),/API_V3_KEY_FORMAT_INVALID/);
});
test('raw signed replies reject altered bodies, stale timestamps and unexpected public key IDs',()=>{
 const ts=Math.floor(Date.now()/1000),nonce='test-nonce',body='{"code":"ORDER_NOT_EXIST"}';
 const signature=crypto.sign('RSA-SHA256',Buffer.from(ts+'\n'+nonce+'\n'+body+'\n'),pair.privateKey).toString('base64');
 const headers=new Headers({'wechatpay-serial':meta.platformPublicKeyId,'wechatpay-timestamp':String(ts),'wechatpay-nonce':nonce,'wechatpay-signature':signature});
 assert.doesNotThrow(()=>verifyReply(headers,body,pair.publicKey,meta.platformPublicKeyId));
 assert.throws(()=>verifyReply(headers,body+' ',pair.publicKey,meta.platformPublicKeyId),/SIGNATURE_INVALID/);
 assert.throws(()=>verifyReply(headers,body,pair.publicKey,'PUB_KEY_ID_999'),/HEADERS_INVALID/);
 assert.throws(()=>verifyReply(headers,body,pair.publicKey,meta.platformPublicKeyId,(ts+301)*1000),/HEADERS_INVALID/);
});
test('APIv3 authentication tag rejects a wrong decryption key and tampered encrypted certificate',()=>{
 const nonce='123456789012',aad='certificate';
 const cipher=crypto.createCipheriv('aes-256-gcm',Buffer.from(apiKey),Buffer.from(nonce));cipher.setAAD(Buffer.from(aad));
 const encrypted=Buffer.concat([cipher.update(cert),cipher.final(),cipher.getAuthTag()]);
 const item={algorithm:'AEAD_AES_256_GCM',nonce,associated_data:aad,ciphertext:encrypted.toString('base64')};
 assert.equal(decryptCertificate(item,apiKey).serialNumber,new crypto.X509Certificate(cert).serialNumber);
 assert.throws(()=>decryptCertificate(item,'0'.repeat(32)));
 const bad=Buffer.from(encrypted);bad[0]^=1;
 assert.throws(()=>decryptCertificate({...item,ciphertext:bad.toString('base64')},apiKey));
});
test('multiline PEM environment serialization preserves all seven credentials and enables only WeChat',()=>{
 const config=recoverConfig(cert,key,publicPem,meta,apiKey);
 const result=parseEnv(envFile(config));
 for(const [name,value] of Object.entries(config))assert.equal(result[name],value);
 assert.equal(result.WECHAT_ENABLED,'true');
 assert.equal(Object.keys(result).length,8);
 assert.equal(result.PAYPAL_ENABLED,undefined);assert.equal(result.ALIPAY_ENABLED,undefined);
});
