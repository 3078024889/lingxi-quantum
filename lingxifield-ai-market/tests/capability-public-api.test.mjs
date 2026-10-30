import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('public API serves a curated profile with a guest-access contract',async()=>{
 const api=await read('app/api/v1/products/[id]/capabilities/route.ts');
 assert.match(api,/capabilityProfile\(id\)/);
 assert.match(api,/findPlatform\(id\)/);
 assert.match(api,/authenticatedUserRequired:false/);
 assert.match(api,/verifiedIndependentBenchmark:false/);
 assert.match(api,/capability_sources_needed/);
 assert.match(api,/status:404/);
 assert.match(api,/s-maxage=3600/);
});
test('old homepage remains intact while newly reviewed cards enrich the real detail',async()=>{
 const home=await read('app/market-workbench.tsx');
 const ui=await read('app/capability-showcase.tsx');
 assert.match(home,/<MarketDecisionCards platform=\{target\}/);
 assert.match(home,/<CapabilityShowcase platform=\{target\}/);
 assert.match(home,/MarketMatrixRow/);
 assert.match(home,/SeoGeoBoard/);
 assert.match(home,/SponsoredFeatures/);
 assert.match(ui,/capabilityProfile\(platform\.id\)/);
 assert.match(ui,/item\.source/);
});
test('review queue never publishes or claims independent quality for raw catalog labels',async()=>{
 const src=await read('scripts/build-capability-review-queue.mjs');
 assert.match(src,/can(not)?PublishWithoutReview:true/);
 assert.match(src,/autoPublish:false/);
 assert.match(src,/sourceStatus:'catalogue_only_not_a_verified_function'/);
 assert.doesNotMatch(src,/unlinkSync|rmSync|deleteMany|updateMany/);
});
