// Conservative release gate. Read-only manifest assessment; never deploys.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const REQUIRED=['source_intake','staging_migration','real_evidence','rank_history','task_search','geo_measurement','profiles','vendor_claims','payment_sandbox','nine_language_routes','rtl_mobile','access_control','load_test_2gb','rollback','browser_e2e'];
export function assessGate(input){
 const checks=input?.checks&&typeof input.checks==='object'&&!Array.isArray(input.checks)?input.checks:{};
 const unknown=Object.keys(checks).filter(x=>!REQUIRED.includes(x));
 const failed=REQUIRED.filter(x=>checks[x]?.status!=='pass'||typeof checks[x]?.evidenceUrl!=='string'||!/^https:\/\//.test(checks[x].evidenceUrl));
 return {ready:failed.length===0&&unknown.length===0&&input?.releaseApproved===true,failed,unknown,
  allowedActions:failed.length===0&&unknown.length===0&&input?.releaseApproved===true?['manual_release_review']:['development_only'],
  productionMutationPerformed:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const manifest=process.argv[2];
 if(!manifest){console.error('USAGE: node production-gate-h.mjs manifest.json');process.exitCode=2;}
 else{try{const result=assessGate(JSON.parse(await readFile(manifest,'utf8')));console.log(JSON.stringify(result,null,2));if(!result.ready)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=2;}}
}
