import test from 'node:test';import assert from 'node:assert/strict';
import {validateMeasurement,buildRanking,historyFor,compareEntities} from './market-engine.mjs';
const m=(entityId,value,day='2026-10-29')=>({entityId,metric:'website_visits',value,unit:'visits',day,region:'global',period:'day',methodology:'licensed-provider-v1',sample:'desktop-web',provider:'provider',sourceUrl:'https://example.org/report',verification:'third_party_verified'});
const scope={metric:'website_visits',day:'2026-10-29',region:'global',period:'day',methodology:'licensed-provider-v1',sample:'desktop-web'};
test('rank verified comparable measurements',()=>assert.deepEqual(buildRanking([m('aaa',50),m('bbb',100)],scope).ranked.map(x=>x.entityId),['bbb','aaa']));
test('no synthetic data or estimates',()=>assert.equal(validateMeasurement({...m('aaa',50),verification:'candidate'}),null));
test('scope prevents mixing methodologies',()=>assert.equal(buildRanking([m('aaa',50),{...m('bbb',100),methodology:'another'}],scope).ranked.length,1));
test('scope prevents mixing days',()=>assert.equal(buildRanking([m('aaa',50,'2026-10-28')],scope).ranked.length,0));
test('conflicts excluded',()=>assert.deepEqual(buildRanking([m('aaa',50),m('aaa',60)],scope).excludedConflicts,['aaa']));
test('history is time sorted',()=>assert.deepEqual(historyFor([m('aaa',1,'2026-10-28'),m('aaa',2)],{...scope,entityId:'aaa',start:'2026-10-28',end:'2026-10-29'}).map(x=>x.value),[1,2]));
test('comparison shows missing data honestly',()=>assert.equal(compareEntities([m('aaa',50)],['aaa','bbb'],scope)[1].measurement,null));
test('invalid date rejected',()=>assert.equal(validateMeasurement({...m('aaa',50),day:'2026-02-30'}),null));
test('price scope enforced',()=>assert.equal(validateMeasurement({...m('aaa',50),metric:'price_per_image',unit:'visits'}),null));
test('no sponsored ranking override',()=>assert.equal(buildRanking([m('aaa',50)],scope).advertisersInfluenceRanking,false));

test('three conflicting observations remain excluded',()=>assert.deepEqual(buildRanking([m('aaa',50),m('aaa',60),m('aaa',70)],scope).excludedConflicts,['aaa']));
