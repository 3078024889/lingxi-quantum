const fs=require('fs');
const htmls=[
'_tools/_thin-refetch/wm_cn_wm_tools.html',
'_tools/_thin-refetch/wm_cn_practitioner.html',
'_tools/_thin-refetch/wm_cn_lyricus_index.html',
'_tools/_thin-refetch/wmc_dohrman.html',
'_tools/_thin-refetch/wm_cn_download.html'
];
const urls=new Set();
for (const h of htmls){
  const t=fs.readFileSync(h,'utf8');
  for (const m of t.matchAll(/href=(["'])(.*?)\1/gi)) {
    const u=m[2];
    if (/\.pdf(\?|$)/i.test(u) || /uploadfile.*\.pdf/i.test(u)) urls.add(u.startsWith('http')?u: new URL(u, 'https://www.wingmakers.com.cn/').href);
  }
}
console.log([...urls].join('\n'));
fs.writeFileSync('_tools/_thin-refetch/pdf-candidates.txt', [...urls].join('\n'), 'utf8');
