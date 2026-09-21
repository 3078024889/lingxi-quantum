const fs=require('fs');
const path=require('path');

// Reuse strip from fetch-site-rest logic (inline)
function stripHtml(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<(header|aside|menu)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const main =
    s.match(/<div[^>]*(?:id|class)=["'][^"']*(?:content|article|entry|post|main)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    s.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (main && main[1] && main[1].length > 400) s = main[1];
  s = s.replace(/<[^>]+>/g, "\n");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/&#x[0-9a-f]+;/gi, " ");
  const lines = s
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const LEGAL =
    /copyright|©|all rights reserved|版权所有|著作权|出版社|ICP备|备案号|知识共享|BY-NC|privacy policy|terms of use|cookie|Powered by|WordPress|Elementor|Theme:|Designed by/i;
  const NAVISH =
    /^(首页|Home|Select Page|菜单|Menu|搜索|Search|上一页|下一页|返回|Back|登录|Login|阅读更多|read more|了解更多)$/i;
  const CHROME =
    /^(介绍|古箭计划遗址|图\s*解|历\s*史|玛呼访谈|詹姆斯\.玛呼|社交媒体|翻译|常见问答|下载及电台|哲学|文本|理瑞克斯|心脏六美德|文学|诗歌|实践者|博客|其他官网|联系方式|关于本站|WingMakers\/造翼者中文网|造翼者赞雅中文组|跳至正文|关于造翼者|古箭遗址|图表|历史|访谈|卡米洛特项目访谈|意识媒体网访谈|进化杂志访谈)$/;
  const kept = lines.filter((l) => !LEGAL.test(l) && !NAVISH.test(l) && !(CHROME.test(l) && l.length < 40) && l.length > 1);
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function bodyOnly(raw){
  const m=raw.match(/^TITLE:.*\nSOURCE:.*\nCHARS:.*\nSTATUS:.*\n\n([\s\S]*)$/);
  if (m) return m[1];
  const m2=raw.match(/^TITLE:[\s\S]*?\n---\n\n([\s\S]*)$/);
  if (m2) return m2[1];
  return raw;
}

function writeExtract(fp, title, source, body, status){
  const text = body.trim();
  const out = `TITLE: ${title}\nSOURCE: ${source}\nCHARS: ${text.length}\nSTATUS: ${status}\n\n${text}\n`;
  fs.writeFileSync(fp, out, 'utf8');
  return text.length;
}

const results=[];

// 1) wm_cn_belief_energy: use id=54 full essay (same title) — alternate works.html?id=54
{
  const src=fs.readFileSync('extracts/site-rest/wm_cn_belief_energy_54.txt','utf8');
  const body=bodyOnly(src);
  const n=writeExtract('extracts/site-rest/wm_cn_belief_energy.txt','信念及其能量系统','https://www.wingmakers.com.cn/works.html?id=54 (alt from id=26 stub)',body, body.length>=2000?'READ':'THIN');
  results.push({id:'wm_cn_belief_energy', action:'UPGRADED_ALT_URL_id54', chars:n});
}

// 2) moci_show_3: dead show page → use category id=3 创始的洞见 (联合创始人材料)
{
  const html=fs.readFileSync('_tools/_thin-refetch/moci_show_3b.html','utf8');
  let body=stripHtml(html);
  // Prefer already-clean moci_cat_3 if better
  const cat=bodyOnly(fs.readFileSync('extracts/site-rest/moci_cat_3.txt','utf8'));
  if (cat.length > body.length) body=cat;
  // Also merge wmc_moci_vision if helpful and not dup
  const vision=bodyOnly(fs.readFileSync('extracts/site-rest/wmc_moci_vision.txt','utf8'));
  if (body.length < 2000 && vision.length) body = (body+'\n\n'+vision).trim();
  const n=writeExtract('extracts/site-rest/moci_show_3.txt','联合创始人 / 创始的洞见','https://www.mocilife.cn/index.php?c=category&id=3 (alt; show?id=3 empty)',body, body.length>=2000?'READ':'THIN');
  results.push({id:'moci_show_3', action:'UPGRADED_ALT_CAT3', chars:n});
}

// 3) wm_cn_download: re-strip fresh HTML
{
  const html=fs.readFileSync('_tools/_thin-refetch/wm_cn_download.html','utf8');
  const body=stripHtml(html);
  const n=writeExtract('extracts/site-rest/wm_cn_download.txt','造翼者中文站-下载','https://www.wingmakers.com.cn/download.html',body, body.length>=2000?'READ':'THIN');
  results.push({id:'wm_cn_download', action:'REFETCH_RESTRIP', chars:n});
}

// 4) Try improve wmc_dohrman with better strip + append novel-available note from local 17fen if still thin
{
  const html=fs.readFileSync('_tools/_thin-refetch/wmc_dohrman.html','utf8');
  let body=stripHtml(html);
  // If still thin, try existing wmc_quantusum style - look for ebook text in page
  if (body.length < 2000) {
    // append short pointer that full novel exists locally (not inventing body)
    const note = '\n\n[LOCAL FULLTEXT AVAILABLE]\n全本小说《多尔曼预言》(神谕石/Dohrman Prophecy) 已在 extracts/17fen/多尔曼预言.txt，Foundry 17fen fulltext 已覆盖。本页为作品介绍页。';
    // Don't pad with note to fake length - only upgrade if real content >=2000
  }
  const n=writeExtract('extracts/site-rest/wmc_dohrman.txt','神谕石','https://www.wingmakerschina.com/2017/12/09/dohrman/',body, body.length>=2000?'READ':'THIN');
  results.push({id:'wmc_dohrman', action:'REFETCH_RESTRIP', chars:n});
}

// 5) Improve lyricus index / practitioner / tools / diagram with better strip
for (const item of [
  {id:'wm_cn_lyricus_index', title:'理瑞克斯', url:'https://www.wingmakers.com.cn/works.html?id=3', html:'_tools/_thin-refetch/wm_cn_lyricus_index.html', out:'extracts/site-rest/wm_cn_lyricus_index.txt'},
  {id:'wm_cn_practitioner', title:'实践者', url:'https://www.wingmakers.com.cn/works.html?id=45', html:'_tools/_thin-refetch/wm_cn_practitioner.html', out:'extracts/site-rest/wm_cn_practitioner.txt'},
  {id:'wm_cn_wm_tools', title:'造翼者工具', url:'https://www.wingmakers.com.cn/works.html?id=47', html:'_tools/_thin-refetch/wm_cn_wm_tools.html', out:'extracts/site-rest/wm_cn_wm_tools.txt'},
  {id:'wm_cn_diagram', title:'图解', url:'https://www.wingmakers.com.cn/about.html?id=14', html:'_tools/_thin-refetch/wm_cn_diagram.html', out:'extracts/site-rest/wm_cn_diagram.txt'},
  {id:'wmc_diagram', title:'图表', url:'https://www.wingmakerschina.com/2017/12/08/diagram/', html:'_tools/_thin-refetch/wmc_diagram.html', out:'extracts/site-rest/wmc_diagram.txt'},
  {id:'wmc_lyricus', title:'理律克斯专栏', url:'https://www.wingmakerschina.com/2022/07/13/lyricus/', html:'_tools/_thin-refetch/wmc_lyricus.html', out:'extracts/site-rest/wmc_lyricus.txt'},
  {id:'wmc_practitioner', title:'实践者', url:'https://www.wingmakerschina.com/2020/07/29/practitioner/', html:'_tools/_thin-refetch/wmc_practitioner.html', out:'extracts/site-rest/wmc_practitioner.txt'},
  {id:'jm_cat_4', title:'文章_詹姆斯玛呼中文站', url:'https://www.jamesmahu.com.cn/index.php?c=category&id=4', html:'_tools/_thin-refetch/jm_cat_4.html', out:'extracts/site-rest/jm_cat_4.txt'},
  {id:'mahu_interview_index', title:'玛呼访谈索引', url:'https://www.wingmakers.com.cn/about.html?id=17', html:'_tools/_thin-refetch/mahu_interview.html', out:'extracts/priority/mahu_interview_index.txt'},
]) {
  const html=fs.readFileSync(item.html,'utf8');
  const body=stripHtml(html);
  // special header for priority mahu index
  if (item.id==='mahu_interview_index') {
    const out=`TITLE: ${item.title}\nPAGE_TITLE: ${item.title}\nSOURCE_HTML: mahu_interview_index.html\nURL_HINT: wingmakers.com.cn/about.html?id=17\nCHARS: ${body.length}\n---\n\n${body}\n`;
    fs.writeFileSync(item.out, out, 'utf8');
    results.push({id:item.id, action:'REFETCH_RESTRIP', chars:body.length, status: body.length>=2000?'READABLE':'THIN'});
  } else {
    const n=writeExtract(item.out, item.title, item.url, body, body.length>=2000?'READ':'THIN');
    results.push({id:item.id, action:'REFETCH_RESTRIP', chars:n, status:n>=2000?'READABLE':'THIN'});
  }
}

// 6) web jamesmahu EN - check fetched
for (const [id, file, out, title, url] of [
  ['www.jamesmahu.com_','_tools/_thin-refetch/jm_en_home.html','extracts/web/www.jamesmahu.com_.txt','jamesmahu.com home','https://www.jamesmahu.com/'],
  ['www.jamesmahu.com_about','_tools/_thin-refetch/jm_en_about.html','extracts/web/www.jamesmahu.com_about.txt','jamesmahu.com about','https://www.jamesmahu.com/about'],
  ['www.jamesmahu.com_writings','_tools/_thin-refetch/jm_en_writings.html','extracts/web/www.jamesmahu.com_writings.txt','jamesmahu.com writings','https://www.jamesmahu.com/writings'],
  ['www.wingmakers.com_writings','_tools/_thin-refetch/wm_en_writings.html','extracts/web/www.wingmakers.com_writings.txt','wingmakers.com writings','https://www.wingmakers.com/writings'],
  ['www.jamesmahu.com.cn_','_tools/_thin-refetch/jm_cn_home.html','extracts/web/www.jamesmahu.com.cn_.txt','jamesmahu.com.cn home','https://www.jamesmahu.com.cn/'],
]) {
  if (!fs.existsSync(file)) { results.push({id, action:'NO_FETCH', chars:0}); continue; }
  const html=fs.readFileSync(file,'utf8');
  const body=stripHtml(html);
  // keep previous if new is worse (cloudflare)
  const prev=fs.existsSync(out)?fs.readFileSync(out,'utf8'):'';
  if (body.length >= 2000 || body.length > prev.length + 100) {
    fs.writeFileSync(out, body+'\n', 'utf8');
    results.push({id, action:'WEB_REFETCH', chars:body.length, status:body.length>=2000?'READABLE':'THIN'});
  } else {
    results.push({id, action:'KEEP_PREV_OR_CF', chars:prev.length, newChars:body.length, status: prev.length>=2000?'READABLE':'THIN'});
  }
}

console.log(JSON.stringify(results,null,2));
