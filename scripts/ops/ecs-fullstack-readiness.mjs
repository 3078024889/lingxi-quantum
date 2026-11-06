#!/usr/bin/env node
/**
 * Read-only ECS audit. Reports variable NAMES and statuses, never secret values.
 * Run as root with --pid=<systemd MainPID> and --release=/opt/... .
 */
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
const release=process.argv.find(a=>a.startsWith('--release='))?.slice(10)||'/opt/lingxifield/releases/26cdd986';
const pid=Number(process.argv.find(a=>a.startsWith('--pid='))?.slice(6)||0);
let env=null;
try {
  const entries=readFileSync('/proc/'+pid+'/environ','utf8').split('\0');
  env=new Map(entries.filter(Boolean).map(e=>{const pos=e.indexOf('=');return [e.slice(0,pos),e.slice(pos+1)]}));
} catch {}
const required={
  browserAuth:['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  databaseAdmin:['NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'],
  fileStorage:['R2_ENDPOINT','R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET_PRIVATE_BURN'],
  paymentsAlipay:['ALIPAY_APP_ID','ALIPAY_PRIVATE_KEY','ALIPAY_PUBLIC_KEY','ALIPAY_ENABLED'],
  paymentsWechat:['WECHAT_APP_ID','WECHAT_MCH_ID','WECHAT_API_V3_KEY','WECHAT_PRIVATE_KEY'],
  sasiTask:['SASI_WORKER_SECRET','SASI_QUOTE_SECRET']
};
const status={};
for(const [group,keys] of Object.entries(required)){
  const missing=env?keys.filter(k=>!env.get(k)?.trim()):[];
  status[group]=env===null?{state:'UNKNOWN_PID'}:{state:missing.length?'MISSING':'PRESENT_NOT_VALIDATED',missing};
}
const browserAssets=join(release,'.next','static');
let files=0,urlFound=false,keyFound=false;
const check=(dir,depth=0)=>{
  if(depth>7||files>=4000||(urlFound&&keyFound))return;
  let list;
  try{list=readdirSync(dir,{withFileTypes:true})}catch{return}
  for(const f of list){
    const p=join(dir,f.name);
    if(f.isDirectory())check(p,depth+1);
    else if(f.isFile()&&f.name.endsWith('.js')){
      let size=0;try{size=statSync(p).size}catch{continue}
      if(size>10*1024*1024)continue;
      files++;
      try{
        const src=readFileSync(p,'utf8');
        if(src.includes('sxsgdpqojepgbbrxrzlq.supabase.co'))urlFound=true;
        if(/sb_publishable_[A-Za-z0-9_-]{20,}/.test(src)||/eyJ[A-Za-z0-9_-]{80,}/.test(src))keyFound=true;
      }catch{}
    }
    if(files>=4000||(urlFound&&keyFound))return;
  }
};
check(browserAssets);
const providerNames=['ARK_API_KEY','OPENAI_API_KEY','DASHSCOPE_API_KEY','ZHIPU_API_KEY','XAI_API_KEY'];
console.log(JSON.stringify({
  kind:'LINGXIFIELD_ECS_FULLSTACK_EVIDENCE_V1',
  readOnly:true,
  processReadable:env!==null,
  releaseFound:existsSync(join(release,'server.js')),
  buildTimeBrowserAuthMarkers:{supabaseUrl:urlFound,keyLikeToken:keyFound,filesChecked:files},
  runtimeEnvironment:status,
  sasiProviderPresent:env!==null&&providerNames.some(k=>Boolean(env.get(k)?.trim())),
  note:'Presence is not correctness. Real login/file/job/monetary tests remain mandatory.'
},null,2));
