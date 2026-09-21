const fs=require('fs');
const path=require('path');

// Original 19 THIN from prior queue (by name)
const ORIG_THIN = new Set([
  'codex/Harmonic-Recognition-Distilled-Practice-81.txt',
  'priority/mahu_interview_index.txt',
  'site-rest/jm_cat_4.txt',
  'site-rest/moci_show_3.txt',
  'site-rest/wm_cn_belief_energy.txt',
  'site-rest/wm_cn_diagram.txt',
  'site-rest/wm_cn_download.txt',
  'site-rest/wm_cn_lyricus_index.txt',
  'site-rest/wm_cn_practitioner.txt',
  'site-rest/wm_cn_wm_tools.txt',
  'site-rest/wmc_diagram.txt',
  'site-rest/wmc_dohrman.txt',
  'site-rest/wmc_lyricus.txt',
  'site-rest/wmc_practitioner.txt',
  'web/www.jamesmahu.com.cn_.txt',
  'web/www.jamesmahu.com_.txt',
  'web/www.jamesmahu.com_about.txt',
  'web/www.jamesmahu.com_writings.txt',
  'web/www.wingmakers.com_writings.txt',
]);

const HARD_MISS_REASONS = {
  'codex/Harmonic-Recognition-Distilled-Practice-81.txt': 'HARD-MISS: D: PDF fully extracted (3 pages); source is short distilled practice (~1088 chars). No longer prose on alt URL/D:.',
  'web/www.jamesmahu.com_.txt': 'HARD-MISS: short landing; EN refetch Cloudflare-challenged.',
  'web/www.jamesmahu.com_about.txt': 'HARD-MISS: body 1377; EN refetch Cloudflare-blocked; no longer D: copy.',
  'web/www.jamesmahu.com_writings.txt': 'HARD-MISS: writings index ~662 chars; EN Cloudflare-blocked.',
  'web/www.wingmakers.com_writings.txt': 'HARD-MISS: writings index ~662 chars; EN Cloudflare-blocked.',
};

function bodyOf(raw, bucket){
  if (bucket==='site-rest') {
    const m=raw.match(/^TITLE:.*\nSOURCE:.*\nCHARS:.*\nSTATUS:.*\n\n([\s\S]*)$/);
    return (m?m[1]:raw).trim();
  }
  if (bucket==='priority') {
    const m=raw.match(/\n---\n\n([\s\S]*)$/) || raw.match(/^TITLE:[\s\S]*?\n\n([\s\S]*)$/);
    return (m?m[1]:raw).trim();
  }
  return raw.trim();
}

const now = new Date();
const sh = new Date(now.getTime() + 8*3600*1000);
const stamp = sh.toISOString().replace('T',' ').slice(0,16) + ' Asia/Shanghai';

let total=0, readable=0, thin=0, hard=0, fixedFromThin=0;
const lines=[];
lines.push('# 一一读取总清单');
lines.push(stamp);
lines.push('');
lines.push('Inventory rule: file bytes≥2000 → [READABLE] (legacy).');
lines.push('For the original 19 THIN items: require body≥2000 to upgrade; else [HARD-MISS] with reason.');
lines.push('');

for (const bucket of ['codex','17fen','wm36','priority','site-rest','web']) {
  const dir=path.join('extracts', bucket);
  const files=fs.readdirSync(dir).filter(n=>n.endsWith('.txt')).sort((a,b)=>a.localeCompare(b,'en'));
  lines.push(`## extracts\\${bucket} (${files.length})`);
  for (const name of files) {
    const rel=`${bucket}/${name}`;
    const fp=path.join(dir,name);
    const bytes=fs.statSync(fp).size;
    const raw=fs.readFileSync(fp,'utf8');
    const body=bodyOf(raw, bucket);
    total++;
    let label, extra='';
    if (ORIG_THIN.has(rel)) {
      if (body.length >= 2000) {
        label='READABLE';
        readable++;
        fixedFromThin++;
        extra=` body=${body} (THIN→FIXED)`;
      } else if (HARD_MISS_REASONS[rel]) {
        label='HARD-MISS';
        hard++; thin++;
        extra=` body=${body} — ${HARD_MISS_REASONS[rel]}`;
      } else {
        label='THIN';
        thin++;
        extra=` body=${body}`;
      }
    } else {
      // legacy bytes rule
      if (bytes >= 2000) { label='READABLE'; readable++; }
      else { label='THIN'; thin++; }
      extra=` body=${body}`;
    }
    lines.push(`- [${label}] ${name} bytes=${bytes}${extra}`);
  }
  lines.push('');
}
lines.push(`TOTAL=${total} READABLE=${readable} THIN/HARD-MISS=${thin} HARD-MISS=${hard} THIN_FIXED=${fixedFromThin}`);
lines.push('');
lines.push('## THIN resolution (original 19)');
lines.push(`- FIXED (body≥2000): ${fixedFromThin}`);
lines.push(`- Remaining HARD-MISS: ${hard}`);
lines.push('- Methods: alt CN URLs, twin-page merge, local D:/17fen/sibling extract enrichment, PDF text extract.');
lines.push('- Foundry gapfill: foundry-ingest/05-incremental-gapfill-ingest.json (priority lyricus/philosophy gaps + upgraded site-rest).');
lines.push('- No fake 耶鲁; no底座 invention; no git push.');
fs.writeFileSync('13-read-everything-queue.md', lines.join('\n')+'\n','utf8');
console.log({total, readable, thin, hard, fixedFromThin});
