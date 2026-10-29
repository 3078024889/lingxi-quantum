import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {reviewCandidates,approveCandidates} from '../lib/source-intake.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [input,flags,approvalFile]=process.argv.slice(2);
if(!input){console.error('Usage: node scripts/review-sources.mjs candidates.json [--approve approval-ids.json]');process.exit(2)}
try{
 const currentPath=path.join(root,'data','catalog.json');
 const current=JSON.parse(fs.readFileSync(currentPath,'utf8'));
 const candidates=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));
 const review=reviewCandidates(current,candidates);
 console.log(JSON.stringify(review,null,2));
 if(flags==='--approve'){
  if(!approvalFile)throw Error('Missing explicit approval IDs file');
  const ids=JSON.parse(fs.readFileSync(path.resolve(approvalFile),'utf8'));
  const merged=approveCandidates(current,review,ids);
  const tmp=currentPath+'.tmp-'+process.pid;
  try{fs.writeFileSync(tmp,JSON.stringify(merged.data,null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,currentPath)}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}
  console.log(`APPROVED_IMPORT_PASS inserted=${merged.inserted} total=${merged.data.length}`);
 }else if(flags){throw Error('Unsupported flag')}
}catch(error){console.error('SOURCE_REVIEW_FAILED',error.message);process.exitCode=1}
