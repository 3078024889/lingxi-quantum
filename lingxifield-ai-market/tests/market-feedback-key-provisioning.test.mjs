import test from 'node:test';
import assert from 'node:assert/strict';
import {validateFeedbackProvisionConfig,provisionFeedbackSigningKey} from '../scripts/provision-feedback-key.mjs';

const env={
 AI_MARKET_SUPABASE_URL:'https://example-project.supabase.co',
 AI_MARKET_SERVICE_ROLE_KEY:'s'.repeat(120),
 AI_MARKET_FEEDBACK_HMAC_KEY:'a'.repeat(64)
};

test('provisioning requires HTTPS Supabase, server-only service role and a 32-byte lowercase hex secret',()=>{
 assert.equal(validateFeedbackProvisionConfig(env).secret,'a'.repeat(64));
 assert.throws(()=>validateFeedbackProvisionConfig({...env,AI_MARKET_SUPABASE_URL:'http://example-project.supabase.co'}),/SUPABASE_URL_INVALID/);
 assert.throws(()=>validateFeedbackProvisionConfig({...env,AI_MARKET_SUPABASE_URL:'https://example.com'}),/SUPABASE_URL_INVALID/);
 assert.throws(()=>validateFeedbackProvisionConfig({...env,AI_MARKET_FEEDBACK_HMAC_KEY:'short'}),/32_RANDOM_BYTES/);
 assert.throws(()=>validateFeedbackProvisionConfig({...env,AI_MARKET_FEEDBACK_HMAC_KEY:'A'.repeat(64)}),/32_RANDOM_BYTES/);
 assert.throws(()=>validateFeedbackProvisionConfig({...env,AI_MARKET_SERVICE_ROLE_KEY:'short'}),/SERVICE_ROLE_KEY_INVALID/);
});

test('provisioning sends the secret only to the restricted RPC and never returns it',async()=>{
 let request;
 const result=await provisionFeedbackSigningKey({env,fetchImpl:async(url,options)=>{
  request={url:String(url),options};
  return {ok:true,json:async()=>({configured:true})};
 }});
 assert.equal(request.url,'https://example-project.supabase.co/rest/v1/rpc/ai_market_configure_feedback_signing_key');
 assert.equal(request.options.method,'POST');
 assert.equal(request.options.headers.apikey,env.AI_MARKET_SERVICE_ROLE_KEY);
 assert.equal(request.options.headers.Authorization,'Bearer '+env.AI_MARKET_SERVICE_ROLE_KEY);
 assert.deepEqual(JSON.parse(request.options.body),{p_secret:env.AI_MARKET_FEEDBACK_HMAC_KEY});
 assert.deepEqual(result,{configured:true,endpoint:'https://example-project.supabase.co'});
 assert.equal(JSON.stringify(result).includes(env.AI_MARKET_FEEDBACK_HMAC_KEY),false);
});

test('provisioning fails closed on HTTP errors and unexpected RPC responses',async()=>{
 await assert.rejects(()=>provisionFeedbackSigningKey({env,fetchImpl:async()=>({ok:false,status:403})}),/HTTP_403/);
 await assert.rejects(()=>provisionFeedbackSigningKey({env,fetchImpl:async()=>({ok:true,json:async()=>({configured:false})})}),/RESPONSE_INVALID/);
});
