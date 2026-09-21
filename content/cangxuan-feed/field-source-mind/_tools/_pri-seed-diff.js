const fs=require('fs');
const pri=JSON.parse(fs.readFileSync('foundry-ingest/04-seed-knowledge-incremental-priority-fulltext.json','utf8'));
const seeded=new Set(pri.map(x=>x.sourceFile).filter(Boolean));
const dir=fs.readdirSync('extracts/priority').filter(n=>n.endsWith('.txt'));
console.log('priority files', dir.length, 'seeded', seeded.size);
for (const n of dir){
  const bytes=fs.statSync('extracts/priority/'+n).size;
  console.log((seeded.has(n)?'IN ':'GAP'), bytes, n);
}
