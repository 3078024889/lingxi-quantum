import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('ordinary users see purpose, free uses, price, watermark and official entry',async()=>{
 const src=await read('app/market-workbench.tsx'),card=await read('app/market-decision-cards.tsx'),headings=await read('lib/market-matrix-headings.ts');
 for(const x of ['PriceLeaderboards','SponsoredFeatures','MarketMatrixRow','MATRIX_OVERVIEW_HEADINGS[language]'])assert.ok(src.includes(x),x);
 for(const x of ['免费额度','实际价格','官网 · 下载'])assert.ok(headings.includes(x),x);
 const decisionI18n=await read('lib/market-decision-i18n.ts');
 for(const x of ['强大优势','理解与推理','导出水印'])assert.ok(decisionI18n.includes(x)||x==='强大优势'&&card.includes('guide.strengths'),x);
 assert.ok(card.includes('DECISION_I18N[language]'));
 const global=await read('app/market-global-access.tsx');
 assert.ok(global.includes('globalRegionFact(platform.id,region)'));
 assert.ok(global.includes('x.payments.source'));
 assert.ok(global.includes('x.policy.source'));
 assert.ok(!src.includes('<HfModelRankings/>'));
});
test('official Doubao links never point to misleading similar domain',async()=>{
 const links=await read('lib/official-platform-links.ts');
 const catalog=JSON.parse(await read('data/catalog.json'));
 const doubao=catalog.find(x=>x.id==='doubao');
 assert.equal(doubao.website,'https://www.doubao.com/');
 assert.ok(links.includes('https://www.doubao.com/download'));
 assert.ok(!links.includes('doubaoo.com.cn'));
});
test('watermark claim distinguishes visible from C2PA and user observation',async()=>{
 const guide=await read('lib/offer-guide.ts');
 assert.ok(guide.includes('C2PA'));
 assert.ok(guide.includes('不可见来源标记'));
 assert.ok(guide.includes('部分豆包视频现在提供免费无水印导出选项'));
 assert.ok(guide.includes('尚无对应官方公开规则可确认'));
});
test('sponsored placement cannot manipulate organic price rankings or leak payment reference',async()=>{
 const market=await read('app/market-workbench.tsx');
 const sponsor=await read('app/sponsored-features.tsx');
 const api=await read('app/api/v1/sponsored/route.ts');
 const sql=await read('../supabase/migrations/20261030_ai_market_sponsored_disclosure.sql').catch(()=>null);
 assert.ok(market.includes('<SponsoredFeatures/>'));
 assert.ok(sponsor.includes('推广内容 · Sponsored'));
 assert.ok(api.includes("affectsOrganicRank:false"));
 assert.ok(!api.includes("setOrder"));
 assert.ok(api.includes("select','project_id,label,target_url,placement,ends_at'"));
 assert.ok(!api.includes('payment_reference'));
 assert.ok(sponsor.includes('sponsored nofollow'));
 assert.ok(sql?.includes('paid_verified_at IS NOT NULL'));
 assert.ok(sql?.includes('GRANT SELECT(project_id,label,target_url,placement,ends_at)'));
});
test('comparison avoids null scores and shows what customers care about',async()=>{
 const home=await read('app/market-workbench.tsx');
 const translations=await read('lib/market-compare-i18n.ts');
 for(const x of ['理解与推理','图片／视频水印','付款方式','付费增加什么','免费'])assert.ok(translations.includes(x),x);
 assert.ok(home.includes('COMPARE_LABELS[language][i]'));
 assert.ok(home.includes('compareRows.map('));
 assert.ok(!home.includes('String(platform[field.key])'));
});
test('task price ranking uses comparable monthly and annual equivalence groups',async()=>{
 const guide=await read('lib/offer-guide.ts'),ui=await read('app/price-leaderboards.tsx');
 assert.ok(guide.includes('annual_equivalent'));
 assert.ok(guide.includes('monthlyUsd'));
 assert.ok(ui.includes('按月付费'));
 assert.ok(ui.includes('年付折合'));
 assert.ok(ui.includes('年付折算，不代表可以逐月买'));
 assert.ok(ui.includes('视频制作'));
 assert.ok(ui.includes('AI 音乐'));
});
