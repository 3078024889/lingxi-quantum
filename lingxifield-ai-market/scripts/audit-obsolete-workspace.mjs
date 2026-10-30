// Safe, read-only cleanup audit. Never delete candidate code, data, backups or production files.
import {readdir,stat,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const ignored=new Set(['node_modules','.next','.git']);
const patterns=[/\.bak$/i,/\.backup_\d+/i,/\.tmp$/i,/\.old$/i,/^previous_build_/i];
const findings=[];let scanned=0;
async function visit(dir,depth=0){
 if(depth>9)return;
 let entries;try{entries=await readdir(dir,{withFileTypes:true})}catch{return}
 for(const e of entries){
  if(ignored.has(e.name))continue;
  const file=resolve(dir,e.name),rel=relative(root,file).replaceAll('\\','/');
  if(e.isDirectory()){if(rel.startsWith('reports/')){findings.push({path:rel,kind:'generated_report_directory',action:'retain_until_review',safeToAutoDelete:false});continue}await visit(file,depth+1);continue}
  if(!e.isFile())continue;scanned++;
  if(patterns.some(p=>p.test(e.name)))findings.push({path:rel,kind:'backup_or_temporary_candidate',action:'inspect_provenance_and_references',safeToAutoDelete:false});
 }
}
await visit(root);
const report={schema:'lingxifield_workspace_cleanup_audit_v1',generatedAt:new Date().toISOString(),scannedFiles:scanned,candidates:findings,
 rule:'No deletion until import graph, test references, tracked status and required runtime data are checked. Gitignored snapshots/backup may be essential.'};
const folder=resolve(root,'reports/cleanup-audit');await mkdir(folder,{recursive:true});
await writeFile(resolve(folder,'candidates.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({scanned,candidates:findings.length,file:resolve(folder,'candidates.json')},null,2));
