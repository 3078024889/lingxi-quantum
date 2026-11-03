import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CODEX_COPY,CODEX_OFFICIAL,codexFor} from '../lib/market-codex-product.ts';
import {COMPANY_EVIDENCE_IDS} from '../lib/market-company-evidence.ts';
import {matchingEditorialProductIds} from '../lib/market-user-task-queries.mjs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('Codex is verified as an OpenAI feature and not a fake 33rd platform',()=>{
 assert.equal(COMPANY_EVIDENCE_IDS.length,32);
 assert.equal(COMPANY_EVIDENCE_IDS.includes('codex'),false);
 assert.ok(COMPANY_EVIDENCE_IDS.includes('chatgpt'));
 assert.match(CODEX_OFFICIAL.product,/^https:\/\/help\.openai\.com\/en\/articles\/11369540/);
 assert.match(CODEX_OFFICIAL.cloud,/^https:\/\/help\.openai\.com/);
 assert.match(CODEX_OFFICIAL.review,/^https:\/\/help\.openai\.com/);
});
test('Codex UI has real actionable features and plan distinctions in all nine languages',()=>{
 const languages=['zh','en','ja','ko','fr','de','es','pt','ar'];
 assert.deepEqual(Object.keys(CODEX_COPY).sort(),languages.sort());
 for(const lang of languages){
  const c=codexFor(lang);
  assert.equal(c.tasks.length,6,lang);
  for(const x of c.tasks)assert.ok(x.length>=8,lang+' '+x);
  for(const key of ['title','intro','ways','plan','limit','linkLabel']){
   assert.ok(c[key].length>6,lang+' '+key);
  }
  assert.match(c.plan,/API/,'API billed separately for '+lang);
 }
});
test('ChatGPT list row and all nine product pages show Codex coding agent',()=>{
 const capabilities=read('lib/capability-profiles.ts');
 assert.match(capabilities,/Codex 软件开发代理/);
 assert.match(capabilities,/执行测试/);
 const ui=read('app/market-codex-section.tsx');
 const details=read('app\u002f[lang]\u002fplatform\u002f[id]\u002fpage.tsx');
 const homepage=read('app/market-workbench.tsx');
 assert.match(ui,/CODEX_OFFICIAL\.direct/);
 assert.match(details,/id==='chatgpt'\?<MarketCodexSection language=\{l\}/);
 assert.match(homepage,/target\.id==='chatgpt'/);
 assert.match(read('app/market-verified-answers.tsx'),/name:'Codex'/);
 assert.match(read('lib/market-researched-facts.ts'),/Codex 使用额度/);
});
test('Codex can be found using practical coding and GitHub questions',()=>{
 for(const q of ['Codex能帮我开发网站吗','Codex能自动修复BUG并运行测试吗','Codex可以审查GitHub PR吗']){
  assert.ok(matchingEditorialProductIds(q)?.includes('chatgpt'),q);
 }
});
