import fs from 'node:fs';
const path = new URL('../data/evidence.json', import.meta.url);
const arr = JSON.parse(fs.readFileSync(path,'utf8'));
if (!Array.isArray(arr)) throw new Error('Evidence file must be an array');
const ids = new Set();
for(const r of arr){
 if(!r.id||ids.has(r.id)||!r.platformId||!r.metric||!r.unit||!r.region||!r.provider||!r.methodology)throw new Error(`Invalid or duplicate record ${r.id}`);
 if(r.value!==null && (typeof r.value!=='number'||!Number.isFinite(r.value)||r.value<0))throw new Error(`Invalid value ${r.id}`);
 if(!['official','third_party','independent_test'].includes(r.evidenceKind)||!['verified','pending','disputed'].includes(r.status))throw new Error(`Invalid evidence flags ${r.id}`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(r.periodStart)||!/^\d{4}-\d{2}-\d{2}$/.test(r.periodEnd)||r.periodStart>r.periodEnd||!Number.isFinite(Date.parse(r.collectedAt)))throw new Error(`Invalid dates ${r.id}`);
 if(!r.sourceUrl?.startsWith('https://'))throw new Error(`Missing HTTPS source ${r.id}`);
 ids.add(r.id);
}
console.log(`EVIDENCE_VALIDATE_PASS count=${arr.length}`);
