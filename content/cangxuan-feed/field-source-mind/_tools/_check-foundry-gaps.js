const fs=require('fs'); const path=require('path');
const base=JSON.parse(fs.readFileSync('10-fulltext-ingest-manifest.json','utf8'));
const baseKeys=new Set(Object.keys(base.files).map(k=>k.replace(/\\/g,'/')));
function sourceFilesFromSeed(seed){
  const s=new Set();
  for (const it of seed) {
    if (it.sourceFile) s.add(it.sourceFile);
    const ev=it.evidence||'';
    const m=ev.match(/extracts\/(priority|site-rest|codex|17fen|wm36|web)\/([^\s]+\.txt)/);
    if (m) s.add(m[2]);
  }
  return s;
}
const pri=JSON.parse(fs.readFileSync('foundry-ingest/04-seed-knowledge-incremental-priority-fulltext.json','utf8'));
const site=JSON.parse(fs.readFileSync('foundry-ingest/04-seed-knowledge-incremental-site-rest-fulltext.json','utf8'));
const priFiles=sourceFilesFromSeed(pri);
const siteFiles=sourceFilesFromSeed(site);
console.log('pri sourceFiles', priFiles.size);
console.log('site sourceFiles', siteFiles.size);
const gaps=[]; const covered=[];
for (const bucket of ['codex','17fen','wm36','priority','site-rest']) {
  const dir=path.join('extracts', bucket);
  for (const name of fs.readdirSync(dir).filter(n=>n.endsWith('.txt'))) {
    const fp=path.join(dir,name);
    const bytes=fs.statSync(fp).size;
    if (bytes < 2000) continue;
    const rel=bucket+'/'+name;
    let hit=false;
    if (bucket==='codex'||bucket==='17fen'||bucket==='wm36') hit = baseKeys.has(rel);
    else if (bucket==='priority') hit = priFiles.has(name);
    else if (bucket==='site-rest') hit = siteFiles.has(name);
    if (hit) covered.push(rel); else gaps.push({rel, bytes});
  }
}
console.log('READABLE covered', covered.length);
console.log('READABLE GAPS', gaps.length);
gaps.sort((a,b)=>b.bytes-a.bytes);
console.log(gaps.map(g=>g.bytes+'\t'+g.rel).join('\n'));
const counts={};
for (const k of baseKeys){ const b=k.split('/')[0]; counts[b]=(counts[b]||0)+1; }
console.log('base corpora', counts);
