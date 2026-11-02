import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compareFoundingRecords} from '../lib/company-founding-order.mjs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const rows=[
 {id:'comfyui',kind:'open_source_project',year:'2023',name:'ComfyUI'},
 {id:'midjourney',kind:'company',year:null,name:'Midjourney'},
 {id:'alibaba',kind:'company',year:'1999',name:'Alibaba'},
 {id:'llamaindex',kind:'company',year:null,name:'LlamaIndex'},
 {id:'runway',kind:'company',year:'2018',name:'Runway'},
 {id:'google',kind:'company',year:'1998',name:'Google'},
 {id:'stable-webui',kind:'open_source_project',year:'2022',name:'Stable Diffusion WebUI'},
 {id:'openai',kind:'company',year:'2015',name:'OpenAI'}
];
test('ascending founding dates preserve corporate meaning; OSS starts are a separate group',()=>{
 const sorted=[...rows].sort((a,b)=>compareFoundingRecords(a,b));
 assert.deepEqual(sorted.map(x=>x.id),['google','alibaba','openai','runway','llamaindex','midjourney','stable-webui','comfyui']);
});
test('descending founding years works without burying unknown company dates behind projects',()=>{
 const sorted=[...rows].sort((a,b)=>compareFoundingRecords(a,b,'desc'));
 assert.deepEqual(sorted.map(x=>x.id),['runway','openai','alibaba','google','llamaindex','midjourney','comfyui','stable-webui']);
});
test('equal years get deterministic stable name/id tie breakers',()=>{
 const t=[{kind:'company',year:'2023',name:'X',id:'b'},{kind:'company',year:'2023',name:'X',id:'a'}];
 assert.deepEqual([...t].sort(compareFoundingRecords).map(x=>x.id),['a','b']);
 assert.equal(compareFoundingRecords({kind:'company',year:'202A',name:'A',id:'a'},{kind:'company',year:'2023',name:'B',id:'b'}),1);
});
test('full 32-item market defaults to founding year on server, client and API',()=>{
 const screening=get('lib/market-v36-screening.ts');
 const repository=get('lib/platform-repository.ts'),page=get('app/market-workbench.tsx'),api=get('app/api/v1/search/route.ts');
 assert.match(screening,/MarketSort='founded'\|'foundedDesc'/);
 assert.match(screening,/compareFoundingRecords/);
 assert.match(repository,/sort='founded'/);
 assert.match(page,/useState<MarketSort>\('founded'\)/);
 assert.match(api,/rawSort=sp.get\('sort'\)\|\|'founded'/);
 assert.match(api,/sorts=\['founded','foundedDesc'/);
 for(const code of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(screening,new RegExp(code+':\\{filters:[^\\n]+sorts:\\{founded:'));
});
test('publisher-backed corporate dates added while unknowns remain unspecified',()=>{
 const evidence=get('lib/market-company-evidence.ts');
 for(const [name,year,src] of [['runway','2018','runway.com/news/runway-raises-50-series-c'],['lovable','2023','lovable.dev/gpt-engineer'],['ollama','2023','linkedin.com/company/ollama']]){
  const entry=evidence.split('\n '+name+':{')[1]?.split('\n ')[0]||'';
  assert.ok(entry.includes("founded:fact('"+year+"'"),name);
  assert.ok(entry.includes(src),src);
 }
 assert.match(evidence,/llamaindex:\{[^\n]*founded:fact\('2023'/);
 assert.match(evidence,/midjourney:\{[^\n]*founded:fact\('2021'/);
});

test('corporate origin sources and financing are individually cited, never borrowed from product launch years',()=>{
 const evidence=get('lib/market-company-evidence.ts');
 const locale=get('lib/market-company-evidence-locale.ts');
 for(const [id,source] of [
  ['kuaishou','ir.kuaishou.com/zh-hans/investor-resources/investor-faqs'],
  ['suno','suno.com/careers'],
  ['runway','runway.com/news/runway-series-e-funding'],
  ['elevenlabs','elevenlabs.io/blog/series-d'],
  ['huggingface','newsroom.ibm.com/2023-08-24-IBM'],
  ['midjourney','linkedin.com/company/midjourney'],
  ['perplexity','perplexity.ai/zh/hub/legal/terms-of-service']
 ]){
  const row=evidence.split('\n '+id+':{')[1]?.split('\n ')[0]||'';
  assert.ok(row.includes(source),id+' source missing');
 }
 for(const key of ['runway.funding','elevenlabs.funding','huggingface.funding'])assert.ok(locale.includes("'"+key+"':["),key);
 for(const key of ['runway','elevenlabs','suno','midjourney','perplexity','kuaishou'])assert.match(locale,new RegExp(' '+key+':\\{country:'));
});
