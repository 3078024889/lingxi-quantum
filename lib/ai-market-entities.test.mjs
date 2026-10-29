import test from 'node:test';
import assert from 'node:assert/strict';
import {auditGraph} from './ai-market-entities.mjs';
const entities=[
{id:'company-a',kind:'company',name:'Company A',status:'candidate',website:'https://example.com'},
{id:'product-a',kind:'product',name:'Product A',status:'candidate'},
{id:'model-a',kind:'model',name:'Model A',status:'candidate'},
{id:'version-a',kind:'version',name:'Version A',status:'candidate'}];
const relationships=[{type:'owns',from:'company-a',to:'product-a'},{type:'provides',from:'product-a',to:'model-a'},{type:'releases',from:'model-a',to:'version-a'}];
test('full graph passes',()=>assert.equal(auditGraph({entities,relationships}).ok,true));
test('graph never grants publishing',()=>assert.equal(auditGraph({entities,relationships}).publishable,false));
test('duplicate IDs rejected',()=>assert.equal(auditGraph({entities:[...entities,entities[0]],relationships}).ok,false));
test('invalid type edge rejected',()=>assert.equal(auditGraph({entities,relationships:[{type:'owns',from:'model-a',to:'company-a'}]}).ok,false));
test('orphan link rejected',()=>assert.equal(auditGraph({entities,relationships:[{type:'owns',from:'missing',to:'product-a'}]}).ok,false));
test('unsafe website rejected',()=>assert.equal(auditGraph({entities:[{...entities[0],website:'javascript:alert(1)'}],relationships:[]}).ok,false));
