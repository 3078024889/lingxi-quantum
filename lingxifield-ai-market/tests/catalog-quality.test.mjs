import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogQuality,catalogDetail} from '../lib/catalog-quality.mjs';
const example={id:'example-ai',name:'Example AI',company:'Example Inc',category:'General',website:'https://example.org',description:'Example only',status:'unverified',updatedAt:'2026-10-29T00:00:00Z',capabilities:['Text']};
test('empty never implies verified records',()=>{const x=catalogQuality([]);assert.equal(x.total,0);assert.equal(x.verifiedMarketMetrics,0)});
test('detects invalid entries and duplicates',()=>{const x=catalogQuality([example,example,{...example,status:'unknown'}]);assert.equal(x.valid,2);assert.equal(x.invalid,1);assert.equal(x.duplicates,1)});
test('catalog lookup returns safe item',()=>{assert.equal(catalogDetail([example],'example-ai')?.id,'example-ai');assert.equal(catalogDetail([example],'../../secret'),null)});
test('invalid dataset is safe',()=>{assert.equal(catalogQuality(null).total,0);assert.equal(catalogDetail(null,'example-ai'),null)});
