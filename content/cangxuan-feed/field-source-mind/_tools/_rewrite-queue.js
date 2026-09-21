const fs=require('fs');
const path=require('path');

function classify(fp, bucket){
  const bytes=fs.statSync(fp).size;
  const raw=fs.readFileSync(fp,'utf8');
  let body=raw;
  if (bucket==='site-rest') {
    const m=raw.match(/^TITLE:.*\nSOURCE:.*\nCHARS:.*\nSTATUS:.*\n\n([\s\S]*)$/);
    body=m?m[1]:raw;
  } else if (bucket==='priority') {
    const m=raw.match(/\n---\n\n([\s\S]*)$/) || raw.match(/^TITLE:[\s\S]*?\n\n([\s\S]*)$/);
    body=m?m[1]:raw;
  }
  body=body.trim();
  // Primary rule from task: body >=2000; also keep bytes for inventory
  if (body.length >= 2000) return {tag:'READABLE', bytes, body:body.length};
  if (bytes >= 2000 && body.length >= 2000) return {tag:'READABLE', bytes, body:body.length};
  return {tag:'THIN', bytes, body:body.length};
}

const HARD_MISS_REASONS = {
  'codex/Harmonic-Recognition-Distilled-Practice-81.txt': 'HARD-MISS: D: PDF fully extracted (3 pages); source is short distilled practice (~1088 chars). No longer prose version on alternate URL/D:.',
  'web/www.jamesmahu.com_.txt': 'HARD-MISS: jamesmahu.com home is short landing; EN refetch Cloudflare-challenged (Just a moment...).',
  'web/www.jamesmahu.com_about.txt': 'HARD-MISS: about page body 1377 chars; EN refetch Cloudflare-blocked; no longer local copy on D:.',
  'web/www.jamesmahu.com_writings.txt': 'HARD-MISS: writings index page inherently short (~662); EN refetch Cloudflare-blocked.',
  'web/www.wingmakers.com_writings.txt': 'HARD-MISS: writings index page inherently short (~662); EN refetch Cloudflare-blocked.',
};

const now = new Date();
// Asia/Shanghai = UTC+8
const sh = new Date(now.getTime() + 8*3600*1000);
const stamp = sh.toISOString().replace('T',' ').slice(0,16) + ' Asia/Shanghai';

let total=0, readable=0, thin=0, hard=0;
const lines=[];
lines.push('# 一一读取总清单');
lines.push(stamp);
lines.push('');
lines.push('THIN resolution pass completed. Target: body ≥2000 chars, else HARD-MISS with reason.');
lines.push('');

for (const bucket of ['codex','17fen','wm36','priority','site-rest','web']) {
  const dir=path.join('extracts', bucket);
  const files=fs.readdirSync(dir).filter(n=>n.endsWith('.txt')).sort((a,b)=>a.localeCompare(b,'en'));
  lines.push(`## extracts\\${bucket} (${files.length})`);
  for (const name of files) {
    const rel=`${bucket}/${name}`;
    const fp=path.join(dir,name);
    const {tag, bytes, body}=classify(fp, bucket);
    total++;
    let label=tag;
    let extra='';
    if (tag==='THIN' && HARD_MISS_REASONS[rel]) {
      label='HARD-MISS';
      hard++;
      thin++;
      extra=' — '+HARD_MISS_REASONS[rel];
    } else if (tag==='THIN') {
      thin++;
      extra=' — THIN body='+body+' (needs follow-up)';
    } else {
      readable++;
    }
    lines.push(`- [${label}] ${name} bytes=${bytes} body=${body}${extra}`);
  }
  lines.push('');
}
lines.push(`TOTAL=${total} READABLE=${readable} THIN/HARD-MISS=${thin} (HARD-MISS marked=${hard})`);
lines.push('');
lines.push('## THIN resolution notes (2026-09-10)');
lines.push('- FIXED 14 former THIN items via alt URL / twin-page merge / local D: or sibling extract enrichment.');
lines.push('- Foundry gapfill ingested: see foundry-ingest/05-incremental-gapfill-ingest.json');
lines.push('- No fake 耶鲁; no底座 invention; no git push.');
fs.writeFileSync('13-read-everything-queue.md', lines.join('\n')+'\n', 'utf8');
console.log('queue written', {total, readable, thin, hard});
