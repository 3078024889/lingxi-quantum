const fs=require('fs');
const path=require('path');
const dir='_tools/_thin-refetch';

function stripHtml(html){
  let s=html
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi,' ')
    .replace(/<!--[\s\S]*?-->/g,' ');
  const mains=[];
  for (const re of [/<article[\s\S]*?<\/article>/i, /<main[\s\S]*?<\/main>/i]) {
    const m=s.match(re); if (m) mains.push(m[0]);
  }
  if (mains.length) s=mains.sort((a,b)=>b.length-a.length)[0];
  s=s.replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n\n').replace(/<\/div>/gi,'\n').replace(/<\/h[1-6]>/gi,'\n\n');
  s=s.replace(/<[^>]+>/g,' ');
  s=s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(+n));
  s=s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/[ \t]{2,}/g,' ').trim();
  const drop=/^(首页|Home|Select Page|菜单|Menu|搜索|Search|版权|Copyright|联系|Contact|登录|Login|Register|订阅|RSS|分享|Share|上一篇|下一篇|相关文章)$/i;
  s=s.split(/\n+/).map(l=>l.trim()).filter(l=>l && !drop.test(l) && l.length>1).join('\n');
  return s;
}

const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
for (const f of files){
  const raw=fs.readFileSync(path.join(dir,f),'utf8');
  const body=stripHtml(raw);
  const out=path.join(dir, f.replace(/\.html$/,'.txt'));
  fs.writeFileSync(out, body, 'utf8');
  console.log(f, 'html='+raw.length, 'body='+body.length);
  console.log('  ', body.slice(0,100).replace(/\n/g,' | '));
}

const h=fs.readFileSync(path.join(dir,'wm_cn_belief_energy.html'),'utf8');
const links=[...h.matchAll(/href=(["'])(.*?)\1/gi)].map(m=>m[2]);
console.log('BELIEF links sample:');
for (const u of links.filter(u=>/pdf|works|id=|download|belief|哲学|content/i.test(u)).slice(0,50)) console.log(' ', u);
console.log('title', ((h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'').trim());
