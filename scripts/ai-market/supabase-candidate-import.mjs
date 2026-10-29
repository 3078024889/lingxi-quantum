import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {normalizeCandidateRows,partitionInsertUpdate} from '../../lib/ai-market-candidate-ingest.mjs';

export async function importCandidatesToSupabase({candidates,client,dryRun=true}){
 const rows=normalizeCandidateRows(candidates);
 if(!client || typeof client.from!=='function')throw new Error('DATABASE_CLIENT_REQUIRED');
 const keys=rows.map(r=>r.candidate_key);
 if(keys.length===0)return {dryRun,total:0,inserted:0,updated:0,skipped:0};
 const found=await client.from('ai_market_candidates').select('candidate_key,verification_status').in('candidate_key',keys);
 if(found.error)throw new Error('CANDIDATE_LOOKUP_FAILED');
 const groups=partitionInsertUpdate(found.data||[],rows);
 if(!dryRun){
  if(groups.insert.length){
   const inserted=await client.from('ai_market_candidates').insert(groups.insert);
   if(inserted.error)throw new Error('CANDIDATE_INSERT_FAILED');
  }
  // Conditional update avoids overwriting records approved between lookup and write.
  for(const row of groups.update){
   const {candidate_key,...fields}=row;
   const result=await client.from('ai_market_candidates').update(fields)
    .eq('candidate_key',candidate_key).eq('verification_status','candidate');
   if(result.error)throw new Error('CANDIDATE_UPDATE_FAILED');
  }
 }
 return {dryRun,total:rows.length,inserted:groups.insert.length,updated:groups.update.length,skipped:groups.skipped.length};
}

export async function runImport({file,dryRun=true,env=process.env}){
 const url=env.NEXT_PUBLIC_SUPABASE_URL;
 const key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error('SUPABASE_SERVICE_CREDENTIALS_REQUIRED');
 const endpoint=new URL(url);
 if(endpoint.protocol!=='https:')throw new Error('SUPABASE_HTTPS_REQUIRED');
 const {createClient}=await import('@supabase/supabase-js');
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const raw=JSON.parse(await readFile(file,'utf8'));
 if(!Array.isArray(raw))throw new Error('INVALID_CANDIDATE_FILE');
 if(raw.length>100)throw new Error('BATCH_LIMIT_EXCEEDED');
 return importCandidatesToSupabase({candidates:raw,client,dryRun});
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file=process.argv[2];
 const commit=process.argv.includes('--commit');
 if(!file){console.error('Usage: node scripts/ai-market/supabase-candidate-import.mjs <candidates.json> [--commit]');process.exitCode=2;}
 else try{
  const report=await runImport({file,dryRun:!commit});
  console.log(JSON.stringify({...report,mode:commit?'WRITE_CANDIDATES_ONLY':'DRY_RUN'},null,2));
 }catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
}
