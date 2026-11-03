import fs from 'node:fs';
import {validCompany,validExperience} from '../lib/catalog-contract.mjs';
for (const [name,validate] of [['company-profiles',validCompany],['user-experiences',validExperience]]) {
 const rows=JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
 if(!Array.isArray(rows))throw new Error(`${name}: expected array`);
 const ids=new Set();for (const r of rows){if(!validate(r)||ids.has(r.id))throw new Error(`${name}: invalid/duplicate entry ${r?.id}`);ids.add(r.id)}
 console.log(`CATALOG_VALIDATE_PASS dataset=${name} count=${rows.length}`);
}
