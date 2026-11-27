import {test} from 'node:test';
import assert from 'node:assert/strict';
import {editableMarketplaceListing,validatedMarketplaceDraft} from '../lib/sasi-marketplace/listing-draft.ts';
const valid={title:'Finished software',description:'功能介绍',category:'desktop-app',priceCnyMinor:9900,priceUsdMinor:1900};
test('only owner may revise a draft or rejected listing; published files remain immutable',()=>{
 for(const status of ['draft','rejected'])assert.equal(editableMarketplaceListing('owner',{seller_id:'owner',status}),true);
 for(const status of ['submitted','published','archived'])assert.equal(editableMarketplaceListing('owner',{seller_id:'owner',status}),false);
 assert.equal(editableMarketplaceListing('other',{seller_id:'owner',status:'draft'}),false);
 assert.equal(editableMarketplaceListing('owner',null),false);
});
test('description and money boundaries apply to revisions as well as creation',()=>{
 assert.ok(validatedMarketplaceDraft({...valid,description:'字'.repeat(5000)}));
 assert.equal(validatedMarketplaceDraft({...valid,description:'字'.repeat(5001)}),null);
 for(const priceCnyMinor of [99,NaN,Infinity,1.01,-1,1_000_000_001])assert.equal(validatedMarketplaceDraft({...valid,priceCnyMinor}),null);
 assert.equal(validatedMarketplaceDraft({...valid,category:'unreviewed-type'}),null);
 assert.equal(validatedMarketplaceDraft({...valid,title:'x'}),null);
 assert.equal(validatedMarketplaceDraft(valid).price_cny_minor,9900);
});
