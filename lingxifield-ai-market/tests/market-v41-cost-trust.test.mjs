import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const math=await import(pathToFileURL(path.join(ROOT,'lib/market-cost-math.ts')).href);
test('short-video credit usage and pricing have auditable units',()=>{
 assert.equal(math.estimateVideoCredits(5,6,2),60);
 assert.equal(math.estimateVideoCost(5,6,2,0.1),6);
 assert.equal(math.estimateVideoCredits(0,0,0),0);
 assert.equal(math.estimateVideoCost(5,6,2,null),null);
});
test('API input and output prices are independent per million tokens',()=>{
 assert.equal(math.estimateApiUsageCost(1_000_000,250_000,1,5),2.25);
 assert.equal(math.estimateApiUsageCost(0,0,0,0),0);
 assert.equal(math.estimateApiUsageCost(-1,10,1,5),null);
 assert.equal(math.estimateApiUsageCost(1,10,Infinity,5),null);
 assert.equal(math.estimateVideoCost(1e308,1e308,1e308,1e308),null);
});
test('nine-language cost and evidence sources never prefill unverified prices',()=>{
 const calculator=read('app/market-cost-estimator.tsx');
 const ui=read('lib/market-ui-extra.ts');
 const methodology=read('app/methodology/page.tsx');
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.ok(calculator.includes('"'+lang+'":['),lang+':calculator translations');
  assert.match(methodology,new RegExp('\\b'+lang+':\\{'));
 }
 assert.match(ui,/"headline":"全球 SI AI 行情平台"/);
 assert.match(calculator,/VIDEO_RATES/);
 assert.match(calculator,/variants\.map\(v=><option/);
 assert.match(calculator,/estimateApiUsageCost/);
});
test('commercial rights must carry a vendor policy source and conditions',()=>{
 const facts=read('lib/market-commercial-evidence.ts');
 assert.match(facts,/https:\/\/help\.runwayml\.com/);
 assert.match(facts,/https:\/\/openai\.com\/policies/);
 assert.match(facts,/checkedAt:/);
 assert.match(facts,/condition:/);
 assert.doesNotMatch(facts,/commercialEvidence\('anthropic-sdk-python'/);
});
test('SEO indexing stays release-gated; sponsored placement not a rank',()=>{
 const policy=read('lib/market-index-policy.ts');
 const methodology=read('app/methodology/page.tsx');
 assert.match(policy,/AI_MARKET_INDEX_READY/);
 assert.match(policy,/VERCEL_ENV!=='preview'/);
 assert.match(methodology,/付费推荐和赞助位必须明示/);
});

test('V41 country and commercial answers are explicit and scope-correct',async()=>{
 const regions=await import(pathToFileURL(path.join(ROOT,'lib/official-country-lists.ts')).href);
 const sdk=regions.officialCountrySnapshot('anthropic-sdk-python');
 assert.equal(sdk.isComplete,false);
 assert.ok(sdk.countries.size>=20);
 for(const country of ['US','SG','JP','GB','AU','DE','FR']){
   assert.ok(sdk.countries.has(country),country);
 }
 assert.equal(regions.officialCountryStatus('anthropic-sdk-python','US'),'supported');
 assert.equal(regions.officialCountryStatus('anthropic-sdk-python','CN'),'unknown'); // separate documented API unsupported rule
 assert.equal(regions.officialCountryStatus('anthropic-sdk-python','HK'),'unknown');
 const facts=read('lib/market-commercial-evidence.ts');
 for(const id of ['anthropic-sdk-python','claude','suno','midjourney','runway','chatgpt','comfyui','ollama']){
   assert.ok(facts.includes(id+':')||facts.includes('"'+id+'":'),id);
 }
 assert.match(facts,/https:\/\/help\.suno\.com/);
 assert.match(facts,/Apache-2\.0/);
 assert.match(facts,/GPL-3\.0/);
 assert.match(facts,/MIT/);
 const row=read('app/market-matrix-row.tsx');
 assert.match(row,/marketLicenseCondition/);
 assert.match(row,/licenseFact\.condition/);
 assert.match(row,/SDK免费；API单独计费/);
});
test('V41 scrolling reveals all columns instead of sticky overlays; no IP guessing',()=>{
 const css=read('app/globals.css');
 const workbench=read('app/market-workbench.tsx');
 assert.ok(css.includes('nth-child(2),td:nth-child(2)){width:184px!important')&&css.includes('position:sticky!important;left:48px!important'));
 assert.ok(css.includes('nth-child(11),td:nth-child(11)){width:174px!important')&&css.includes('position:sticky!important;right:0!important'));
 assert.match(css,/\.marketOverviewTable :is\(th,td\)\{position:static!important/);
 assert.doesNotMatch(workbench,/fetch\('\/api\/v1\/visitor-region'/);
 assert.match(workbench,/MarketMatrixRow/);
});

test('official lists are readable without accordion and source is directly accessible',()=>{
 const details=read('app/market-global-access.tsx');
 const row=read('app/market-matrix-row.tsx');
 assert.match(details,/className="globalSupportedCountries"/);
 assert.doesNotMatch(details,/<details className="globalSupportedCountries"/);
 assert.match(details,/countryList\.other\.map/);
 assert.match(row,/regionList\.source\|\|research\?\.regionSource/);
});

test('provider-verified payment filtering works without a selected country',()=>{
 const data=read('lib/market-payment-facts.ts');
 const screen=read('lib/market-v36-screening.ts');
 const home=read('app/market-workbench.tsx');
 const row=read('app/market-matrix-row.tsx');
 assert.match(screen,/matchesOfficialPayment\(p\.id,payment,country\)/);
 assert.doesNotMatch(screen,/if\(country==='GLOBAL'\)return false/);
 assert.match(data,/paymentFactsFor/);
 assert.match(data,/snapshot\.payments\.source\?snapshot\.payments\.methods/);
 assert.match(data,/research\?\.paymentSource\?research\.payments/);
 assert.match(row,/matchingPaymentMethods/);
 assert.match(home,/paymentFilter=\{paymentFilter\}/);
});
test('fixed publisher, rank and action buttons coexist with scrollable center',()=>{
 const css=read('app/globals.css');
 const last=css.slice(css.lastIndexOf('V4.2: fixed publisher identity'));
 assert.match(last,/nth-child\(2\).*position:sticky!important/);
 assert.match(last,/nth-child\(11\).*position:sticky!important/);
 assert.match(last,/overflow-x:auto!important/);
 assert.match(last,/\[dir="rtl"\]/);
});
test('nine-language home and category labels cover every control',async()=>{
 const labels=await import(pathToFileURL(path.join(ROOT,'lib/market-home-i18n.ts')).href);
 const keys=Object.keys(labels.HOME_COPY.zh).sort();
 assert.ok(keys.length>=50);
 for(const l of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.deepEqual(Object.keys(labels.HOME_COPY[l]).sort(),keys);
  assert.equal(Object.keys(labels.CATEGORY_LABELS[l]).length,12);
  for(const key of keys)assert.ok(labels.HOME_COPY[l][key].trim().length>0,l+':'+key);
  assert.equal(labels.localizedDetailTab(l,'价格与额度'),labels.HOME_COPY[l].detailTabsPricing);
 }
 assert.equal(labels.localizedCategory('en','综合助手'),'General assistants');
 const homepage=read('app/market-workbench.tsx');
 assert.match(homepage,/localizedCategory\(language,x\)/);
 assert.match(homepage,/hc\.sourceNote/);
});

test('all 32 catalog items provide real task summaries in nine languages',async()=>{
 const summary=await import(pathToFileURL(path.join(ROOT,'lib/market-product-locale.ts')).href);
 const ids=['anthropic-sdk-python','chatgpt','claude','comfyui','deepseek','dify','elevenlabs','fasterwhisper','gemini','grok','langchain','llamacpp','llamaindex','lovable','luma','midjourney','n8n','ollama','openwebui','openai-python','perplexity','replit','runway','automatic1111','suno','transformers','vllm','whisper','qwen','jimeng','kling','doubao'];
 for(const l of ['en','ja','ko','fr','de','es','pt','ar']){
  for(const id of ids){
   const result=summary.localizedProductSummary(id,l);
   assert.ok(result&&result.trim().length>8,id+':'+l);
   if(['en','fr','de','es','pt','ar'].includes(l))assert.doesNotMatch(result,/[\u4e00-\u9fff]/,id+':'+l);
  }
 }
 const row=read('app/market-matrix-row.tsx');
 assert.match(row,/localizedProductSummary\(p\.id,language\)/);
});

test('structured locale facts preserve vendor prices and free credits',async()=>{
 const fact=await import(pathToFileURL(path.join(ROOT,'lib/market-fact-locale.ts')).href);
 assert.match(fact.localizedCatalogFact('runway','en','price','年付折合 $12/月'),/\$12.*annually/);
 assert.match(fact.localizedCatalogFact('runway','fr','free','一次性125积分'),/125.*crédits/);
 assert.match(fact.localizedCatalogFact('suno','en','free','每天50积分'),/50.*noncommercial/);
 assert.match(fact.localizedCatalogFact('dify','en','price','590美元每年'),/\$590.*workspace/);
 assert.match(fact.localizedCatalogFact('ollama','en','price','本地工具免费'),/Local software free/);
 assert.match(fact.localizedCatalogFact('midjourney','en','price','待核验'),/\$10/);
 assert.match(fact.localizedCatalogFact('chatgpt','ja','models','GPT'),/GPT-6/);
 const ids=['anthropic-sdk-python','chatgpt','claude','comfyui','deepseek','dify','elevenlabs','fasterwhisper','gemini','grok','langchain','llamacpp','llamaindex','lovable','luma','midjourney','n8n','ollama','openwebui','openai-python','perplexity','replit','runway','automatic1111','suno','transformers','vllm','whisper','qwen','jimeng','kling','doubao'];
 for(const id of ids)for(const lang of ['en','fr','de','es','pt','ar']){
  for(const kind of ['free','price','models']){
   const value=fact.localizedCatalogFact(id,lang,kind,'待核验');
   assert.ok(value&&value.length>2,id+':'+lang+':'+kind);
   assert.doesNotMatch(value,/[\u4e00-\u9fff]/,id+':'+lang+':'+kind);
  }
 }
 const row=read('app/market-matrix-row.tsx');
 assert.match(row,/localizedCatalogFact\(p\.id,language,'price'/);
 assert.match(row,/localizedCatalogFact\(p\.id,language,'free'/);
 assert.match(row,/localizedCatalogFact\(p\.id,language,'models'/);
});

test('FAQ, publisher invite, footer and payment channels are translated for nine languages',async()=>{
 const home=await import(pathToFileURL(path.join(ROOT,'lib/market-home-i18n.ts')).href);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.equal(home.MARKET_FAQ_TRANSLATIONS[lang].length,4);
  assert.equal(home.MARKET_FAQ_ANSWERS[lang].length,4);
  assert.equal(home.MARKET_VENDOR_TRANSLATIONS[lang].length,4);
  assert.ok(home.MARKET_VENDOR_TRANSLATIONS[lang].every(v=>v.trim().length>=4),lang);
 }
 const workbook=read('app/market-workbench.tsx');
 assert.match(workbook,/MARKET_FAQ_TRANSLATIONS\[language\]\[i\]/);
 assert.match(workbook,/MARKET_VENDOR_TRANSLATIONS\[language\]\[3\]/);
 const pay=read('app/market-global-access.tsx');
 assert.match(pay,/支付宝\|Alipay/);
 assert.match(pay,/微信支付\|WeChat Pay/);
});

test('V43 official payment documentation covers domestic AI and international checkout',async()=>{
 const m=await import(pathToFileURL(path.join(ROOT,'lib/market-researched-facts.ts')).href);
 const expected={doubao:['alipay'],jimeng:['alipay','wechat'],kling:['alipay','wechat'],lovable:['alipay','wechat','card'],luma:['card']};
 for(const [id,channels] of Object.entries(expected)){
  const fact=m.researchedFact(id);
  assert.ok(fact?.paymentSource?.startsWith('https://'),id);
  const words=fact.payments.join(' ').toLowerCase();
  for(const key of channels){
   if(key==='alipay')assert.match(words,/alipay|支付宝/,id);
   if(key==='wechat')assert.match(words,/wechat pay|微信支付/,id);
   if(key==='card')assert.match(words,/credit \/ debit card/,id);
  }
 }
 assert.equal(m.researchedFact('kling').extraPaymentSource.includes('qingque.cn'),true);
 assert.equal(m.researchedFact('doubao').paymentSource.includes('draftstatic'),true);
});
test('V43 source-backed prices distinguish open-source core, vendor cloud and commercial licenses',async()=>{
 const m=await import(pathToFileURL(path.join(ROOT,'lib/market-researched-facts.ts')).href);
 for(const id of ['langchain','llamaindex','llamacpp','dify','n8n','comfyui','automatic1111','fasterwhisper','openai-python','whisper','vllm','transformers','openwebui']){
  const p=m.researchedFact(id);
  assert.ok(p?.price&&p.priceSource?.startsWith('https://'),id+':price');
  assert.ok(p?.free&&p.freeSource?.startsWith('https://'),id+':free');
 }
 for(const id of ['langchain','llamaindex','llamacpp','dify','comfyui','automatic1111','fasterwhisper','openai-python','whisper','vllm','transformers','openwebui']){
  assert.ok(m.researchedFact(id)?.commercialSource?.startsWith('https://'),id);
 }
 assert.match(m.researchedFact('dify').commercial,/多租户/);
 assert.match(m.researchedFact('openwebui').commercial,/50/);
 assert.match(m.researchedFact('luma').price,/49.99/);
 assert.match(m.researchedFact('jimeng').price,/79/);
 const repository=read('lib/platform-repository.ts');
 assert.match(repository,/research\?\.price\|\|guide\?\.cost/);
 assert.match(repository,/research\?\.payments\|\|\[\]/);
 const view=read('app/market-matrix-row.tsx');
 assert.match(view,/locallyFree/);
 assert.match(view,/research\?\.regionSource/);
});

test('V43 localized product evidence has paid-vs-free commercial and payment scope',async()=>{
 const m=await import(pathToFileURL(path.join(ROOT,'lib/market-researched-facts.ts')).href);
 const target=m.researchedFact('elevenlabs');
 assert.match(target.price,/\$6\/月/);
 assert.match(target.free,/10,000/);
 assert.match(target.commercial,/免费账户生成内容不附商用授权/);
 assert.match(target.paymentSource,/elevenlabs.io/);
 assert.match(m.researchedFact('lovable').commercialSource,/lovable.dev\/terms/);
 assert.match(m.researchedFact('luma').commercialSource,/lumalabs.ai/);
 assert.match(m.researchedFact('perplexity').commercial,/个人非商业/);
 assert.match(m.researchedFact('qwen').price,/百炼 API 分开/);
 assert.match(m.researchedFact('deepseek').paymentSource,/static.deepseek.com/);
 const row=read('app/market-matrix-row.tsx');
 assert.match(row,/region!=='GLOBAL'/);
});

test('V43 complete 32/32 curated source records distinguish product scope and verified pricing',async()=>{
 const m=await import(pathToFileURL(path.join(ROOT,'lib/market-researched-facts.ts')).href);
 const ids=['anthropic-sdk-python','chatgpt','claude','comfyui','deepseek','dify','elevenlabs','fasterwhisper','gemini','grok','langchain','llamacpp','llamaindex','lovable','luma','midjourney','n8n','ollama','openwebui','openai-python','perplexity','replit','runway','automatic1111','suno','transformers','vllm','whisper','qwen','jimeng','kling','doubao'];
 for(const id of ids){
  const fact=m.researchedFact(id);
  assert.ok(fact?.price&&fact.priceSource?.startsWith('https://'),id+':price');
  assert.ok(fact?.free&&fact.freeSource?.startsWith('https://'),id+':free');
  assert.ok(fact?.region&&fact.regionSource?.startsWith('https://'),id+':region');
 }
 assert.equal(Object.keys(m.RESEARCHED_FACTS).length,32);
 assert.match(m.researchedFact('replit').price,/\$20/);
 assert.match(m.researchedFact('midjourney').price,/\$10/);
 assert.match(m.researchedFact('gemini').price,/19.99/);
 assert.match(m.researchedFact('grok').price,/30/);
 assert.match(m.researchedFact('ollama').price,/按百万 Tokens/);
 const locale=await import(pathToFileURL(path.join(ROOT,'lib/market-fact-locale.ts')).href);
 assert.match(locale.localizedCatalogFact('replit','en','price',''),/\$20/);
 assert.match(locale.localizedCatalogFact('midjourney','en','price',''),/\$10/);
 assert.match(locale.localizedCatalogFact('grok','en','price',''),/\$30/);
});

test('V43 all 32 model rows describe actual vendor models or clearly say framework is model-agnostic',async()=>{
 const m=await import(pathToFileURL(path.join(ROOT,'lib/market-researched-facts.ts')).href);
 const ids=Object.keys(m.RESEARCHED_FACTS);assert.equal(ids.length,32);
 for(const id of ids){
   const p=m.researchedFact(id);
   assert.ok(p.models&&p.models.length>10,id);
   assert.ok(p.modelsSource?.startsWith('https://'),id);
 }
 for(const id of ['langchain','llamaindex','llamacpp','n8n','vllm','openai-python','anthropic-sdk-python'])
   assert.match(m.researchedFact(id).models,/不是|非固定|并非|本地加载|推理服务器/);
 const repo=read('lib/platform-repository.ts');
 assert.match(repo,/label:'模型与用量',text:research\?\.models/);
});

test('V44 existing eight short-video providers are in filter and all nine display languages',()=>{
 const screen=read('lib/market-v36-screening.ts');
 for(const id of ['grok','gemini','qwen','doubao','kling','jimeng','runway','luma']){
  assert.ok(screen.includes(id+":'https://"),id+':source');
  assert.ok(screen.includes(id+':'),id+':catalog');
 }
 assert.ok(!screen.includes("deepseek:'https://"),'do not tag non-video model');
 assert.match(screen,/百炼万相 3\.0 API/);
 assert.match(screen,/豆包 App \/ Seedance 2\.0/);
 const workbench=read('app/market-workbench.tsx');
 assert.match(workbench,/paymentFactsFor\(p.id,region\)/);
});
test('V44 fix placeholder commercial and local payments in 32-product market',async()=>{
 const m=await import(pathToFileURL(path.join(ROOT,'lib/market-researched-facts.ts')).href);
 for(const id of ['deepseek','qwen','jimeng','kling','doubao','n8n','gemini']){
  const f=m.researchedFact(id);
  assert.ok(f.commercialSource?.startsWith('https://'),id);
  assert.ok(f.commercial?.length>20,id);
 }
 assert.match(m.researchedFact('n8n').commercial,/Sustainable Use License/);
 assert.match(m.researchedFact('deepseek').commercial,/4\.2/);
 assert.match(m.researchedFact('jimeng').commercial,/商品展示/);
 const row=read('app/market-matrix-row.tsx');
 for(const id of ['dify','openwebui','n8n'])assert.ok(row.includes("'"+id+"'"));
 assert.match(row,/自托管核心免费/);
 const legal=read('lib/market-commercial-evidence.ts');
 assert.match(legal,/Publisher plan terms/);
});
test('V44 SEO/GEO board requires evidence, not fictitious rankings, and is translated in nine locales',()=>{
 const s=read('app/seo-geo-board.tsx'),home=read('app/market-workbench.tsx');
 for(const l of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(s,new RegExp('\\b'+l+':\\['),l);
 assert.match(s,/no artificial rankings|no se inventan|不生成自然排名/);
 assert.match(home,/SeoGeoBoard language=\{language\}/);
});

test('V44 nine-language pricing/sponsored components and truthful free filter',()=>{
 const home=read('app/market-workbench.tsx');
 const pricing=read('app/price-leaderboards.tsx');
 const sponsored=read('app/sponsored-features.tsx');
 assert.match(home,/PriceLeaderboards language=\{language\}/);
 assert.match(home,/SponsoredFeatures language=\{language\}/);
 for(const l of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.ok(pricing.includes('"'+l+'":['),l+':pricing');
  assert.ok(sponsored.includes('"'+l+'":['),l+':sponsored');
 }
 const screening=read('lib/market-v36-screening.ts');
 assert.match(screening,/if\(p.id==='midjourney'\)return false/);
});
test('V44 searching short video includes known eight products, not only category video items',()=>{
 const repo=read('lib/platform-repository.ts');
 assert.match(repo,/videoTerms=shortDramaEvidence\(id\)/);
 assert.match(repo,/\.\.\.videoTerms/);
 const screen=read('lib/market-v36-screening.ts');
 for(const id of ['grok','gemini','qwen','doubao','kling','jimeng','runway','luma'])
  assert.match(screen,new RegExp('\\b'+id+':.https:\\/\\/'));
});

test('video resolutions are sourced per model; 2K and 4K are never backfilled from 720p',async()=>{
 const r=await import(pathToFileURL(path.join(ROOT,'lib/market-rate-catalog.ts')).href);
 assert.deepEqual(r.RESOLUTIONS,['360p','480p','720p','1080p','2K','4K']);
 assert.ok(r.VIDEO_RATES.length>=20);
 const wan720=r.VIDEO_RATES.find(v=>v.platform==='qwen'&&v.region==='北京'&&v.resolution==='720p');
 const wan1080=r.VIDEO_RATES.find(v=>v.platform==='qwen'&&v.region==='北京'&&v.resolution==='1080p');
 assert.equal(wan720.perSecond,.6);
 assert.equal(wan1080.perSecond,1.2);
 const wanQuote=r.estimateKnownVideoRate(wan720,10,6,2);
 assert.ok(Math.abs(wanQuote.amount-43.2)<1e-9);
 assert.equal(r.estimateKnownVideoRate(wan720,20,1,11),null); // max combined 30 seconds // 6 clips x (10 generated + 2 input video)s x ¥0.6
 const runway=r.VIDEO_RATES.find(v=>v.platform==='runway'&&v.model==='Gen-4.5 Web');
 assert.equal(runway.resolution,'720p');
 assert.equal(r.estimateKnownVideoRate(runway,5,6).credits,360);
 assert.equal(r.estimateKnownVideoRate(runway,12,6),null);
 const luma=r.VIDEO_RATES.find(v=>v.id==='luma-ray314-720p');
 assert.equal(r.estimateKnownVideoRate(luma,5,1).credits,100);
 assert.equal(r.estimateKnownVideoRate(luma,7,1),null);
 assert.ok(r.VIDEO_RATES.filter(v=>v.platform==='runway'&&v.resolution==='4K').every(v=>v.billing==='unverified'));
 const xai=r.VIDEO_RATES.find(v=>v.platform==='grok'&&v.model==='grok-imagine-video-1.5-lite'&&v.resolution==='1080p');
 assert.equal(xai.outputType,'upscaled');
 assert.equal(xai.perSecond,.14);
 const googleUpscale=r.VIDEO_RATES.find(v=>v.platform==='gemini'&&v.resolution==='4K');
 assert.equal(googleUpscale.outputType,'upscaled');
 assert.equal(googleUpscale.billing,'unverified');
 assert.equal(r.estimateKnownVideoRate(googleUpscale,5,2).amount,null);
 assert.ok(r.VIDEO_RATES.some(v=>v.resolution==='2K'&&v.creditsPerSecond===15));
 for(const item of r.VIDEO_RATES)assert.ok(item.source.startsWith('https://'),item.id);
 const ui=read('app/market-cost-estimator.tsx');
 assert.match(ui,/chooseProvider/);
 assert.match(ui,/chooseModel/);
 assert.match(ui,/rate\.chargesInputVideo/);
 assert.doesNotMatch(ui,/pricePerCredit,setPricePerCredit/);
});
test('developer API shows model-specific official token rates instead of user-supplied pricing',async()=>{
 const r=await import(pathToFileURL(path.join(ROOT,'lib/market-rate-catalog.ts')).href);
 for(const a of r.API_RATES){assert.ok(a.source.startsWith('https://'));assert.ok(a.inPerMillion>=0);assert.ok(a.outPerMillion>=0);}
 const peak=r.API_RATES.find(a=>a.model.startsWith('deepseek-flash · 高峰'));
 assert.equal(peak.currency,'CNY');
 assert.equal(math.estimateApiUsageCost(1000000,250000,peak.inPerMillion,peak.outPerMillion),4);
 const ui=read('app/market-cost-estimator.tsx');
 assert.match(ui,/API_RATES\.map/);
 assert.doesNotMatch(ui,/setInputRate|setOutputRate/);
});

test('V45 cost picker only renders supported resolutions and real Kling 3.0 subscription credits',async()=>{
 const catalog=await import(pathToFileURL(path.join(ROOT,'lib/market-rate-catalog.ts')).href);
 const ui=read('app/market-cost-estimator.tsx');
 assert.match(ui,/variants\.map\(v=><option/);
 assert.doesNotMatch(ui, /\[\.\.\.RESOLUTIONS,'not-confirmed'/);
 assert.equal(catalog.VIDEO_RATES.filter(r=>r.resolution==='not-confirmed').length,0);
 assert.equal(catalog.VIDEO_RATES.filter(r=>r.resolution==='480p'||r.resolution==='360p').length,0);
 assert.equal(catalog.VIDEO_RATES.filter(r=>r.platform==='kling').length,4);
 const silent=catalog.VIDEO_RATES.find(r=>r.id==='kling-video3-silent-720p');
 assert.equal(silent.creditsPerSecond,6);
 assert.equal(silent.includedCredits,660);
 assert.equal(catalog.estimateKnownVideoRate(silent,5,6).credits,180);
 const withAudio=catalog.VIDEO_RATES.find(r=>r.id==='kling-video3-native-audio-1080p');
 assert.equal(withAudio.creditsPerSecond,12);
 assert.equal(catalog.estimateKnownVideoRate(withAudio,5,6).credits,360);
});
test('V45 Seedance 2.5 distinguishes advertised promo plan equivalent from a new cash payment',async()=>{
 const catalog=await import(pathToFileURL(path.join(ROOT,'lib/market-rate-catalog.ts')).href);
 const offer=catalog.VIDEO_RATES.find(r=>r.id==='jimeng-seedance25-720p-promo-advanced-annual');
 assert.equal(offer.billing,'plan-equivalent');
 assert.equal(offer.planTotal,5199);
 assert.equal(offer.renewTotal,10398);
 assert.equal(offer.includedCredits,12320);
 assert.equal(offer.promoEnds,'2026-11-05');
 const q=catalog.estimateKnownVideoRate(offer,10,6);
 assert.equal(q.kind,'equivalent');
 assert.ok(Math.abs(q.amount-25.2)<1e-8);
 const db=catalog.VIDEO_RATES.find(r=>r.platform==='doubao');
 assert.equal(db.billing,'token-only');
 assert.equal(db.apiPerMillionNoVideo,70);
 assert.equal(db.apiPerMillionWithVideo,42);
 const ui=read('app/market-cost-estimator.tsx');
 assert.match(ui,/promoExpired/);
 assert.match(ui,/套餐折合成本/);
 assert.match(ui,/超出会员积分/);
 assert.match(ui,/Grok 免费账户可先体验/);
});
test('V45 SEO/GEO requires reviewed source-dated observations and independent cohorts',async()=>{
 const snapshots=JSON.parse(read('data/seo-geo-observations.json'));
 assert.deepEqual(snapshots,[]);
 const sourceCode=read('lib/seo-geo-observations.ts');
 assert.match(sourceCode,/coverageForSeoGeo/);
 assert.match(sourceCode,/groupedSeoGeo/);
 assert.match(sourceCode,/awaiting_independent_measurements/);
 const source=read('lib/seo-geo-observations.ts');
 assert.match(source,/independent_serp/);
 assert.match(source,/ai_answer_citation/);
 assert.match(source,/recordHash/);
 assert.match(source,/search.google.com/);
 assert.match(read('app/seo-geo-board.tsx'),/coverage\.measuredProducts/);
 assert.match(read('app/api/v1/seo-geo/route.ts'),/no-store/);
 const collector=read('scripts/sync-gsc-analytics.mjs');
 assert.match(collector,/GSC_CONFIG_REQUIRED/);
 assert.match(collector,/webmasters.readonly/);
});

test('V45 nine-language structured product pages and sitemap are release gated',()=>{
 const pages=read('app/[lang]/platform/[id]/page.tsx');
 const sitemap=read('app/sitemap.ts');
 const gate=read('lib/market-index-policy.ts');
 assert.match(pages,/marketLocales\.flatMap\(lang=>searchPlatforms/);
 assert.match(pages,/application\/ld\+json/);
 assert.match(pages,/SoftwareApplication/);
 assert.match(pages,/mayIndexMarket\(lang\)/);
 assert.match(pages,/commercialEvidence/);
 assert.match(sitemap,/indexableMarketLocales/);
 assert.match(sitemap,/modelsSource/);
 assert.match(gate,/AI_MARKET_INDEX_READY/);
 assert.match(gate,/VERCEL_ENV!=='preview'/);
});
