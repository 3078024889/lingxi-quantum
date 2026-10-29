import test from 'node:test';import assert from 'node:assert/strict';
import {validCompany,validExperience,findCatalog,nominalPrice} from '../lib/catalog-contract.mjs';
test('reject unverified claims disguised as completed data',()=>{assert.equal(validCompany({id:'x',name:'x',platformIds:['a'],officialUrl:'http://test.invalid',status:'verified',funding:null,ipo:null}),false)});
test('invalid URLs and insufficient review evidence rejected',()=>{assert.equal(validExperience({id:'x',platformId:'a',summary:'bad',sourceUrl:'https://example.org',publishedOn:'2026-10-29',kind:'user_report',status:'verified',region:'global'}),false)});
test('search and category match',()=>{const x=[{name:'Runway',company:'Runway',category:'视频生成',about:'视频',features:['文字转视频']},{name:'Claude',company:'Anthropic',category:'综合助手',about:'研究',features:['分析']}];assert.equal(findCatalog(x,'文字转视频').length,1);assert.equal(findCatalog(x,'','综合助手').length,1)});
test('same nominal price by independent currency choice',()=>{assert.equal(nominalPrice(49,'USD').display,'$49');assert.equal(nominalPrice(49,'CNY').display,'¥49');assert.throws(()=>nominalPrice(-3,'USD'))});
