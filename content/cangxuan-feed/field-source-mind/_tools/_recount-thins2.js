const fs=require('fs');
const thins=[
  ['codex','Harmonic-Recognition-Distilled-Practice-81.txt'],
  ['priority','mahu_interview_index.txt'],
  ['site-rest','jm_cat_4.txt'],
  ['site-rest','moci_show_3.txt'],
  ['site-rest','wm_cn_belief_energy.txt'],
  ['site-rest','wm_cn_diagram.txt'],
  ['site-rest','wm_cn_download.txt'],
  ['site-rest','wm_cn_lyricus_index.txt'],
  ['site-rest','wm_cn_practitioner.txt'],
  ['site-rest','wm_cn_wm_tools.txt'],
  ['site-rest','wmc_diagram.txt'],
  ['site-rest','wmc_dohrman.txt'],
  ['site-rest','wmc_lyricus.txt'],
  ['site-rest','wmc_practitioner.txt'],
  ['web','www.jamesmahu.com.cn_.txt'],
  ['web','www.jamesmahu.com_.txt'],
  ['web','www.jamesmahu.com_about.txt'],
  ['web','www.jamesmahu.com_writings.txt'],
  ['web','www.wingmakers.com_writings.txt'],
];
function bodyLen(raw, bucket){
  if (bucket==='codex' || bucket==='web') return raw.trim().length;
  const m=raw.match(/\n\n([\s\S]*)$/);
  return m?m[1].trim().length:raw.length;
}
let fixed=0, hard=[];
for (const [b,n] of thins){
  const fp=`extracts/${b}/${n}`;
  const st=fs.statSync(fp);
  const raw=fs.readFileSync(fp,'utf8');
  const bl=bodyLen(raw,b);
  const ok = bl>=2000;
  if (ok) fixed++; else hard.push({b,n,bytes:st.size,body:bl});
  console.log(`${ok?'FIXED':'HARD-MISS'}\tbytes=${st.size}\tbody=${bl}\t${b}/${n}`);
}
console.log('FIXED', fixed, 'HARD-MISS', hard.length);
