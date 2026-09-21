const fs=require('fs');
const site=JSON.parse(fs.readFileSync('foundry-ingest/04-seed-knowledge-incremental-site-rest-fulltext.json','utf8'));
const titles=site.map(x=>x.title+ ' | '+x.sourceFile).filter((v,i,a)=>a.indexOf(v)===i);
const hit=titles.filter(t=>/lyricus|理瑞|理律|会话|蓝图|模式|阈限|philosophy/i.test(t));
console.log(hit.slice(0,50).join('\n'));
console.log('count hit', hit.length);
