#!/usr/bin/env node
/**
 * Provision the same random HMAC key into the private Supabase table used by
 * the feedback RPC. The service-role key is accepted only by this local CLI;
 * it is never read by the web application or written to disk.
 *
 * Required env:
 *   AI_MARKET_SUPABASE_URL
 *   AI_MARKET_SERVICE_ROLE_KEY
 *   AI_MARKET_FEEDBACK_HMAC_KEY (exactly 32 random bytes encoded as 64 lowercase hex chars)
 */
import {pathToFileURL} from 'node:url';

export function validateFeedbackProvisionConfig(env=process.env){
 const rawUrl=env.AI_MARKET_SUPABASE_URL||env.SUPABASE_URL;
 const serviceRoleKey=env.AI_MARKET_SERVICE_ROLE_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
 const secret=env.AI_MARKET_FEEDBACK_HMAC_KEY;
 if(!rawUrl||!serviceRoleKey||!secret)throw new Error('FEEDBACK_PROVISION_CONFIG_REQUIRED');
 let base;
 try{base=new URL(rawUrl);}catch{throw new Error('SUPABASE_URL_INVALID');}
 if(base.protocol!=='https:'||base.username||base.password||base.port||base.pathname!=='/'||base.search||base.hash||!base.hostname.endsWith('.supabase.co'))
  throw new Error('SUPABASE_URL_INVALID');
 if(serviceRoleKey.length<80)throw new Error('SERVICE_ROLE_KEY_INVALID');
 if(!/^[a-f0-9]{64}$/.test(secret))throw new Error('FEEDBACK_HMAC_KEY_MUST_BE_32_RANDOM_BYTES_LOWERCASE_HEX');
 return {base,serviceRoleKey,secret};
}

export async function provisionFeedbackSigningKey({env=process.env,fetchImpl=fetch}={}){
 const config=validateFeedbackProvisionConfig(env);
 const endpoint=new URL('/rest/v1/rpc/ai_market_configure_feedback_signing_key',config.base);
 const response=await fetchImpl(endpoint,{
  method:'POST',
  headers:{
   apikey:config.serviceRoleKey,
   Authorization:'Bearer '+config.serviceRoleKey,
   'Content-Type':'application/json'
  },
  body:JSON.stringify({p_secret:config.secret}),
  cache:'no-store',
  redirect:'error',
  signal:AbortSignal.timeout(10000)
 });
 if(!response.ok)throw new Error('FEEDBACK_KEY_PROVISION_FAILED_HTTP_'+response.status);
 const result=await response.json().catch(()=>null);
 if(result?.configured!==true)throw new Error('FEEDBACK_KEY_PROVISION_RESPONSE_INVALID');
 return {configured:true,endpoint:endpoint.origin};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const result=await provisionFeedbackSigningKey();
  process.stdout.write('FEEDBACK_HMAC_KEY_PROVISIONED endpoint='+result.endpoint+'\n');
 }catch(error){
  process.stderr.write(String(error?.message||'FEEDBACK_KEY_PROVISION_FAILED')+'\n');
  process.exitCode=2;
 }
}
