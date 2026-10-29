import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {mergeCatalog} from '../lib/catalog-engine.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const source=process.argv[2];
if(!source){console.error('Usage: node scripts/import-catalog.mjs <json-array-file>');process.exit(2)}
const filepath=path.resolve(source);const target=path.join(root,'data','catalog.json');
try{
 const batch=JSON.parse(fs.readFileSync(filepath,'utf8'));if(!Array.isArray(batch)||batch.length>50000)throw Error('Expected JSON array with <= 50000 records per batch');
 const current=JSON.parse(fs.readFileSync(target,'utf8'));if(!Array.isArray(current))throw Error('Invalid current catalog');
 const result=mergeCatalog(current,batch);const tmp=target+'.tmp-'+process.pid;
 try{fs.writeFileSync(tmp,JSON.stringify(result.data,null,2)+'\n',{encoding:'utf8',flag:'wx'});fs.renameSync(tmp,target)}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}
 console.log(`CATALOG_IMPORT_PASS inserted=${result.inserted} updated=${result.updated} identical=${result.identical} total=${result.data.length}`)
}catch(e){console.error('CATALOG_IMPORT_FAIL',e.message);process.exitCode=1}
