import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePublicationGates} from '../lib/market-launch-gates.mjs';

const verified={
 inventory:{curated:32},
 sourceAudit:{curated32Reviewed:true},
 uses:{allVerified:false}, // third-party platforms are not our hosted task runner
 seo:{verifiedObservations:0,verifiedOwnership:false}, // first indexing precedes GSC search data
 merchant:{checkoutDisabled:true,verifiedSettlement:false,refundAndRevocation:false},
 mobile:{nineLocalesRealBrowser:true},
 realSite:{verifiedPublicProduction:true}
};

test('a reviewed free directory may launch before GSC data or paid merchant onboarding',()=>{
 const r=evaluatePublicationGates(verified);
 assert.equal(r.readOnly.ready,true);
 assert.deepEqual(r.readOnly.blocking,[]);
 assert.equal(r.readOnly.seoGeoObservationsRequiredBeforeInitialIndex,false);
 assert.equal(r.goLive,false);
 assert.equal(r.canPublishNext10,false);
});

test('read-only gate blocks unreviewed sources, missing browser evidence or enabled billing',()=>{
 const missingSource=evaluatePublicationGates({...verified,sourceAudit:{curated32Reviewed:false}});
 assert.equal(missingSource.readOnly.ready,false);
 assert.ok(missingSource.readOnly.blocking.includes('curated32WithReviewedSources'));
 const missingBrowser=evaluatePublicationGates({...verified,mobile:{nineLocalesRealBrowser:false}});
 assert.ok(missingBrowser.readOnly.blocking.includes('nineLocaleMobileBrowser'));
 const billingOpened=evaluatePublicationGates({...verified,merchant:{...verified.merchant,checkoutDisabled:false}});
 assert.ok(billingOpened.readOnly.blocking.includes('merchantCheckoutExplicitlyDisabled'));
 const noDomain=evaluatePublicationGates({...verified,realSite:{verifiedPublicProduction:false}});
 assert.ok(noDomain.readOnly.blocking.includes('verifiedPublicProduction'));
});

test('missing release evidence always fails closed',()=>{
 const r=evaluatePublicationGates({inventory:{curated:32},uses:{},seo:{},merchant:{},mobile:{},realSite:{}});
 assert.equal(r.readOnly.ready,false);
 assert.equal(r.goLive,false);
 assert.equal(r.readOnly.blocking.length,4);
});
