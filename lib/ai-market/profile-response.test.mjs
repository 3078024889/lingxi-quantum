import test from 'node:test';import assert from 'node:assert/strict';import {assembleProductResponse} from './profile-response.mjs';
const entity={id:'p',name:'Tool',entity_type:'product',status:'verified',verified_at:'2026-10-29',official_website:'https://example.org'};
const claim={field:'free_quota',field_value:'3 daily',source_url:'https://example.org/price',source_name:'Official',checked_at:'2026-10-29',reviewed_at:'2026-10-29',reviewed_by:'u'};
test('valid reviewed claim shown with source',()=>assert.equal(assembleProductResponse(entity,[claim]).fields.free_quota.value,'3 daily'));
test('unreviewed claim never displayed',()=>assert.deepEqual(assembleProductResponse(entity,[{...claim,reviewed_by:null}]).fields,{}));
test('conflicting claims suppressed',()=>assert.deepEqual(assembleProductResponse(entity,[claim,{...claim,field_value:'5 daily'}]).conflictingFields,['free_quota']));
test('unverified product excluded',()=>assert.equal(assembleProductResponse({...entity,status:'candidate'},[claim]),null));
test('unsafe source hidden',()=>assert.deepEqual(assembleProductResponse(entity,[{...claim,source_url:'javascript:bad'}]).fields,{}));
