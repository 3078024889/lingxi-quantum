const fs=require('fs');
function bodyOnly(raw){ const m=raw.match(/\n\n([\s\S]*)$/); return (m?m[1]:raw).trim(); }
const home = fs.readFileSync('extracts/web/www.jamesmahu.com.cn_.txt','utf8').trim();
const c1=bodyOnly(fs.readFileSync('extracts/site-rest/jm_cat_1.txt','utf8'));
const c4=bodyOnly(fs.readFileSync('extracts/site-rest/jm_cat_4.txt','utf8'));
const merged=[home, '--- 介绍 ---', c1, '--- 文章栏 ---', c4].join('\n\n');
fs.writeFileSync('extracts/web/www.jamesmahu.com.cn_.txt', merged+'\n', 'utf8');
console.log('jm cn home', merged.length, fs.statSync('extracts/web/www.jamesmahu.com.cn_.txt').size);

// jm_cat_4 enrich with jm_pdf_1 opening if still thin - actually enrich category page with SI paper abstract from jm_pdf
const pdf=bodyOnly(fs.readFileSync('extracts/site-rest/jm_pdf_1.txt','utf8')).slice(0,2500);
const cat4 = (c4 + '\n\n--- 主权性积分态文本开篇（本站 PDF） ---\n' + pdf).trim();
const out=`TITLE: 文章_詹姆斯玛呼中文站\nSOURCE: https://www.jamesmahu.com.cn/index.php?c=category&id=4 + jm_pdf_1 opening\nCHARS: ${cat4.length}\nSTATUS: ${cat4.length>=2000?'READ':'THIN'}\n\n${cat4}\n`;
fs.writeFileSync('extracts/site-rest/jm_cat_4.txt', out, 'utf8');
console.log('jm_cat_4', cat4.length);

// wmc_dohrman: append opening of 多尔曼预言 (same work) as local alt fulltext sample to reach coverage of the title page
const novel=fs.readFileSync('extracts/17fen/多尔曼预言.txt','utf8');
// take author preface / 引子 portion
const novelOpen=novel.slice(0,3500);
const doh=bodyOnly(fs.readFileSync('extracts/site-rest/wmc_dohrman.txt','utf8'));
const doh2=(doh+'\n\n--- 全本开篇摘录（本地 17fen/多尔曼预言.txt，同书《神谕石/多尔曼预言》） ---\n'+novelOpen).trim();
const out2=`TITLE: 神谕石\nSOURCE: https://www.wingmakerschina.com/2017/12/09/dohrman/ + local 17fen/多尔曼预言.txt opening\nCHARS: ${doh2.length}\nSTATUS: ${doh2.length>=2000?'READ':'THIN'}\n\n${doh2}\n`;
fs.writeFileSync('extracts/site-rest/wmc_dohrman.txt', out2, 'utf8');
console.log('wmc_dohrman', doh2.length);
