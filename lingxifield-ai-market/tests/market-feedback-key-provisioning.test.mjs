import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
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

test('database key provisioning is service-role-only and covered by executable PostgreSQL CI',async()=>{
 const migration=await readFile(new URL('../../supabase/migrations/20261101_ai_market_feedback_key_provisioning.sql',import.meta.url),'utf8');
 const workflow=await readFile(new URL('../../.github/workflows/ai-market-postgres-isolated.yml',import.meta.url),'utf8');
 const api=await readFile(new URL('../app/api/v1/feedback/route.ts',import.meta.url),'utf8');
 const hardened=await readFile(new URL('../../supabase/migrations/20261101_ai_market_feedback_constant_time_hmac.sql',import.meta.url),'utf8');
 assert.match(migration,/request\.jwt\.claim\.role/);
 assert.match(migration,/<> 'service_role'/);
 assert.match(migration,/revoke all on function public\.ai_market_configure_feedback_signing_key\(text\) from public,anon,authenticated/);
 assert.match(migration,/grant execute on function public\.ai_market_configure_feedback_signing_key\(text\) to service_role/);
 assert.match(migration,/on conflict\(id\) do update/);
 assert.match(hardened,/p_signature is null/i);
 assert.match(hardened,/v_nonce is null/i);
 assert.match(hardened,/v_hash is null/i);
 assert.match(hardened,/v_issued is null/i);
 assert.match(workflow,/NULL_FEEDBACK_SIGNATURE_ACCEPTED/);
 assert.match(workflow,/20261030180000_ai_market_public_feedback\.sql/);
 assert.match(workflow,/20261030195000_ai_market_feedback_moderation\.sql/);
 assert.match(workflow,/20261101_ai_market_feedback_key_provisioning\.sql/);
 assert.match(workflow,/Verify visitor feedback HMAC provisioning, submission and moderation in isolated PostgreSQL/);
 assert.match(api,/AI_MARKET_FEEDBACK_HMAC_KEY/);
 assert.doesNotMatch(api,/AI_MARKET_SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});
