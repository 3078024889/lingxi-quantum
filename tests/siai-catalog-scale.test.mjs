import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditCandidateCorpus,safeOfficialUrl} from "../lingxifield-ai-market/lib/market-catalog-scale-audit.mjs";
import {assertSiaiPublicationManifest} from "../app/siai/directory-publication-contract.ts";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const batches=Array.from({length:10},(_,i)=>read("lingxifield-ai-market/data/company-intake/batch-"+String(i+1).padStart(3,"0")+".json"));
const manifest=read("app/siai/directory-publication-manifest.json");
const row=id=>({id});
const clone=value=>JSON.parse(JSON.stringify(value));

test("100 candidates and published 62 are audited from product IDs, not banner totals",()=>{
 const audit=auditCandidateCorpus(batches,{publicManifest:[...manifest.curatedIds,...manifest.sourcePreviewIds],sourcePreviewIds:manifest.sourcePreviewIds});
 assert.deepEqual(audit.issues,[]);
 assert.equal(audit.metrics.batches,10);
 assert.equal(audit.metrics.candidates,100);
 assert.equal(audit.metrics.duplicateIds,0);
 assert.equal(audit.metrics.emptyPublisherKeys,0);
 assert.equal(audit.metrics.publishApproved,0);
 assert.equal(audit.metrics.uniqueNames,100);
 assert.equal(audit.metrics.pendingFacts,700);
 assert.deepEqual(audit.groups.amazon.sort(),["amazon-bedrock","aws-q-developer","aws-sagemaker"]);
 assert.deepEqual(audit.groups.spacex,["cursor"]);
 assert.deepEqual(audit.groups["shengshu-technology"],["vidu"]);
 const pub=assertSiaiPublicationManifest(manifest,manifest.curatedIds.map(row),manifest.sourcePreviewIds.map(row));
 assert.deepEqual({curated:pub.curated,preview:pub.preview,total:pub.total},{curated:32,preview:30,total:62});
});

test("publisher keys and names must be globally unique and stable across batches",()=>{
 const broken=clone(batches);broken[5].products[0].publisherGroupId="-";
 assert(broken[5].products[0].id==="vidu");
 assert(auditCandidateCorpus(broken).issues.some(x=>x.code==="INVALID_PUBLISHER_KEY"));
 broken[5].products[0].publisherGroupId="shengshu-technology";
 broken[5].products[0].id=broken[2].products[0].id;
 assert(auditCandidateCorpus(broken).issues.some(x=>x.code==="DUPLICATE_PRODUCT_ID"));
 const other=clone(batches);
 other[7].products.find(x=>x.id==="aws-q-developer").publisherGroupId="aws";
 assert(auditCandidateCorpus(other).issues.some(x=>x.code==="INCONSISTENT_PUBLISHER_ID"));
 // Different branded product labels sharing a parent need a pinned publisher group.
 assert.notDeepEqual(auditCandidateCorpus(other).groups.amazon,auditCandidateCorpus(batches).groups.amazon);
});

test("candidate publication status remains fail-closed",()=>{
 const b=clone(batches);b[8].visibleToPublic=true;
 assert(auditCandidateCorpus(b).issues.some(x=>x.code==="CANDIDATE_BATCH_PUBLISHED"));
 b[8].visibleToPublic=false;b[8].products[0].publishApproved=true;
 assert(auditCandidateCorpus(b).issues.some(x=>x.code==="UNAPPROVED_ROW_PROMOTED"));
 const c=clone(batches);c[5].products[0].id=manifest.curatedIds[0];
 assert(auditCandidateCorpus(c,{publicManifest:[...manifest.curatedIds,...manifest.sourcePreviewIds],sourcePreviewIds:manifest.sourcePreviewIds}).issues.some(x=>x.code==="CANDIDATE_ID_ALREADY_PUBLIC"));
});

test("editorial manifest rejects shadow publication and changes to either tier",()=>{
 assert.throws(()=>assertSiaiPublicationManifest(manifest,[...manifest.curatedIds.map(row),row("unapproved-vendor")],manifest.sourcePreviewIds.map(row)),/CURATED_IDS_NOT_IN_EDITORIAL_MANIFEST/);
 assert.throws(()=>assertSiaiPublicationManifest(manifest,manifest.curatedIds.map(row),manifest.sourcePreviewIds.slice(1).map(row)),/PREVIEW_IDS_NOT_IN_EDITORIAL_MANIFEST/);
 assert.throws(()=>assertSiaiPublicationManifest({...manifest,curatedIds:[...manifest.curatedIds,manifest.curatedIds[0]]},manifest.curatedIds.map(row),manifest.sourcePreviewIds.map(row)),/DUPLICATE_ID/);
 const src=readFileSync(new URL("../app/siai/catalog-data.ts",import.meta.url),"utf8");
 assert.match(src,/assertSiaiPublicationManifest\(manifest,curated,preview\)/);
 assert.doesNotMatch(src,/curated\.length!==32\|\|rows\.length!==62/);
});

test("HTTPS source URLs reject unsafe redirects, credentials, ports and nonpublic hosts",()=>{
 for(const unsafe of ["http://example.com","https://user:pw@example.com","https://localhost","https://127.0.0.1","https://example.com:4443/","https://example.com/#frag","javascript:alert(1)"])
  assert.equal(safeOfficialUrl(unsafe),null,unsafe);
 assert.equal(safeOfficialUrl("https://www.cursor.com/pricing"),"cursor.com");
});
