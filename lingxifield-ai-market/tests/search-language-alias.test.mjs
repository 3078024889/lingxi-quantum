import test from 'node:test';import assert from 'node:assert/strict';import {createSearchIndex} from '../lib/search-index.mjs';
const rows=[{id:'runway',name:'Runway',company:'Runway',category:'视频生成',description:'视频编辑工具',capabilities:['文生视频']},{id:'midjourney',name:'Midjourney',company:'Midjourney',category:'图片生成',description:'图片创作',capabilities:['文生图']},{id:'deepseek',name:'DeepSeek',company:'DeepSeek',category:'编程开发',description:'代码助手',capabilities:['代码开发']}];
const index=createSearchIndex(rows);
test('English video returns Chinese video tools without fabricated ranking',()=>{const r=index.search({q:'video'});assert.equal(r.total,1);assert.equal(r.items[0].id,'runway')});
test('English image returns Chinese image tools',()=>{const r=index.search({q:'image'});assert.equal(r.total,1);assert.equal(r.items[0].id,'midjourney')});
test('Category filter still applies on expanded query',()=>{assert.equal(index.search({q:'video',category:'图片生成'}).total,0)});
test('Empty query still returns catalog',()=>{assert.equal(index.search().total,3)});

test('AI and SI umbrella terms open the same complete catalog without inventing scores',()=>{
 for(const q of ['AI','SI','SI工具','Super Intelligence','超级智能工具']){
  const result=index.search({q});
  assert.equal(result.total,3,'catalog-wide query '+q);
  assert.deepEqual(result.items.map(x=>x.id).sort(),['deepseek','midjourney','runway']);
 }
});
