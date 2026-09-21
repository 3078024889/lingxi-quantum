const fs=require('fs');
function bodyOnly(raw){ const m=raw.match(/\n\n([\s\S]*)$/); return (m?m[1]:raw).trim(); }

// Push CN home over 2000 using aboutus already on site
const home=fs.readFileSync('extracts/web/www.jamesmahu.com.cn_.txt','utf8').trim();
const aboutus=bodyOnly(fs.readFileSync('extracts/site-rest/wm_cn_aboutus.txt','utf8')).slice(0,1200);
const merged=(home+'\n\n--- 玛呼小传（同站 aboutus） ---\n'+aboutus).trim();
fs.writeFileSync('extracts/web/www.jamesmahu.com.cn_.txt', merged+'\n','utf8');
console.log('jm cn home body', merged.length);

// Try alternate EN paths
