import { discoverHuggingFace } from './huggingface-discovery.mjs';
import { persistCandidates } from './candidate-store.mjs';
import { pathToFileURL } from 'node:url';
export async function runCandidateImport({collection='models',limit=25,file='data/ai-market/hf-candidates.json',fetcher=fetch}={}){
 const result=await discoverHuggingFace({collection,limit,fetcher});
 const stats=await persistCandidates({file,candidates:result.candidates});
 return {source:result.source,collection,retrievedAt:result.retrievedAt,stats,publicationApproved:false};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 const collection=process.argv[2]||'models';
 const limit=Number(process.argv[3]||25);
 const file=process.argv[4]||'data/ai-market/hf-candidates.json';
 try{console.log(JSON.stringify(await runCandidateImport({collection,limit,file}),null,2));}
 catch(err){console.error(err instanceof Error?err.message:String(err));process.exitCode=1;}
}
