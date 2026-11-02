import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditSourceCoverage,auditCompanyCoverage,SOURCE_FIELDS} from '../lib/market-source-coverage.mjs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ok={price:'$25/month',priceSource:'https://publisher.example/pricing',free:'Free tier',freeSource:'https://publisher.example/free',
 region:'US',regionSource:'https://publisher.example/regions',models:'Model A',modelsSource:'https://publisher.example/models',
 commercial:'Commercial',commercialSource:'https://publisher.example/terms',payments:['card'],paymentSource:'https://publisher.example/pay'};
test('six sourced fields per product require matching HTTPS URLs',()=>{
 const r=auditSourceCoverage([{id:'a',facts:ok},{id:'b',facts:{...ok,priceSource:'http://unsafe.example',payments:[]}}]);
 assert.equal(SOURCE_FIELDS.length,6);
 assert.equal(r.total,2);
 assert.equal(r.fullySourcedProducts,1);
 assert.deepEqual(r.missingByProduct,[{id:'b',missing:['price','payments']}]);
 assert.equal(r.fieldCoverage.models,2);
 assert.equal(r.fieldCoverage.price,1);
 assert.throws(()=>auditSourceCoverage([{id:'a'},{id:'a'}]),/DUPLICATE/);
});
test('company coverage deduplicates multiple products under shared parent and separates OSS',()=>{
 const a={name:'Alphabet',kind:'company',evidence:{founded:{text:'1998',source:'https://about.google/our-story'},headquarters:{text:'US',source:'https://about.google/'}}};
 const r=auditCompanyCoverage([a,a,{name:'Community repo',kind:'open_source_project',evidence:{projectStarted:{text:'2023',source:'https://github.com/test'}}}]);
 assert.equal(r.distinctPublishers,2);
 assert.equal(r.companies,1);
 assert.equal(r.projects,1);
 assert.equal(r.companyFoundedSourced,1);
 assert.deepEqual(r.missingFunding,['Alphabet']);
 assert.deepEqual(r.missingLocation,[]);
 assert.deepEqual(r.missingFounding,[]);
});
test('readiness route uses the actual 32 catalog, company facts, measured SEO rows and fail-closed billing',()=>{
 const route=get('app/api/v1/data-readiness/route.ts');
 for(const key of ['MARKET_API_PRODUCTS','researchedFact(id)','companyEvidenceFor(id)','companyPresentationFor(id,id)',
   'seoGeoObservations','rawExperiences','rawMetrics','paymentDeploymentReadiness','apiServiceOffer(id)',
   "Cache-Control':'no-store'"])assert.ok(route.includes(key),key);
 assert.ok(!route.includes('Math.random'));
 const facts=get('lib/market-company-evidence.ts');
 assert.match(facts,/midjourney:\{[^\n]*founded:fact\('2021'/);
 const observ=get('data/seo-geo-observations.json');
 assert.ok(Array.isArray(JSON.parse(observ)));
});
