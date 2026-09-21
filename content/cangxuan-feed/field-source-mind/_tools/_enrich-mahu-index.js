const fs=require('fs');
function bodyOnly(raw){
  const m=raw.match(/\n---\n\n([\s\S]*)$/) || raw.match(/\n\n([\s\S]*)$/);
  return (m?m[1]:raw).trim();
}
const index=bodyOnly(fs.readFileSync('extracts/priority/mahu_interview_index.txt','utf8'));
// Pull short intros from start of each interview file (first ~400 chars) to enrich index WITHOUT inventing
const parts=[index];
for (const f of ['mahu_2008_1.txt','mahu_2008_2.txt','mahu_2008_3.txt','camelot.txt','mahu_2013.txt','consciousness_media.txt']) {
  const p='extracts/priority/'+f;
  if (!fs.existsSync(p)) continue;
  const b=bodyOnly(fs.readFileSync(p,'utf8'));
  const snippet=b.slice(0,500).replace(/\s+/g,' ').trim();
  parts.push(`\n## ${f}\n${snippet}…`);
}
const body=parts.join('\n').trim();
const out=`TITLE: 玛呼访谈索引\nPAGE_TITLE: 玛呼访谈索引（含各篇开篇摘录）\nSOURCE_HTML: mahu_interview_index.html + linked interview openings\nURL_HINT: wingmakers.com.cn/about.html?id=17\nCHARS: ${body.length}\n---\n\n${body}\n`;
fs.writeFileSync('extracts/priority/mahu_interview_index.txt', out, 'utf8');
console.log('mahu_interview_index enriched', body.length, 'bytes', fs.statSync('extracts/priority/mahu_interview_index.txt').size);
