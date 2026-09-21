const fs=require('fs'); const path=require('path');
function bodyOf(fp){
  const raw=fs.readFileSync(fp,'utf8');
  const m=raw.match(/^TITLE:.*\nSOURCE:.*\nCHARS:.*\nSTATUS:.*\n\n([\s\S]*)$/);
  if (m) return m[1];
  const m2=raw.match(/^TITLE:.*\nPAGE_TITLE:.*\nSOURCE_HTML:.*\nURL_HINT:.*\nCHARS:.*\n---\n\n([\s\S]*)$/);
  if (m2) return m2[1];
  return raw;
}
const gaps=[
'priority/ancient_arrow_17fen_local.txt','priority/philosophy_modes.txt','priority/lyricus_intro.txt','priority/lyricus_6.txt','priority/philosophy_blueprint.txt','priority/lyricus_4.txt','priority/lyricus_5.txt',
'site-rest/wmc_si_manifesto.txt','site-rest/wm_cn_spiritual_tools.txt','site-rest/wm_cn_myth_narrative.txt','site-rest/wmc_behavior.txt','site-rest/wmc_tools.txt','site-rest/wm_cn_poetry_ancient_arrow.txt','site-rest/wmc_imagination.txt','site-rest/wmc_mocihome.txt','site-rest/wmc_phil_intro.txt','site-rest/wmc_myth.txt','site-rest/wm_cn_philosophy_index.txt','site-rest/wmc_weather.txt','site-rest/wm_cn_poetry_index.txt','site-rest/wm_cn_james_mahu.txt','site-rest/si_cat_1.txt','site-rest/wmc_jamesmahu.txt','site-rest/wmc_publish.txt','site-rest/wmc_sixvirtues_toc.txt','site-rest/wm_cn_neruda_index.txt','site-rest/jm_cat_1.txt','site-rest/wm_cn_si_manifesto.txt'
];
for (const rel of gaps){
  const fp='extracts/'+rel;
  const bytes=fs.statSync(fp).size;
  const body=bodyOf(fp);
  console.log(bytes+'\tbody='+body.length+'\t'+rel+'\t'+body.slice(0,40).replace(/\n/g,' '));
}
// compare ancient_arrow duplicate
const a=fs.readFileSync('extracts/priority/ancient_arrow_17fen_local.txt','utf8');
const b=fs.readFileSync('extracts/17fen/古箭计划.txt','utf8');
console.log('ancient vs 17fen equal?', a===b, 'aLen',a.length,'bLen',b.length);
