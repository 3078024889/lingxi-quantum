import test from 'node:test';import assert from 'node:assert/strict';
import {mayViewLocalReview} from './local-review-access.mjs';
const input={user:{email:'admin@example.com',email_confirmed_at:'2026-01-01'},host:'127.0.0.1:3100',forwardedHost:null,origin:'http://127.0.0.1:3100',emails:'admin@example.com',expiresAt:'2026-10-30T00:00:00Z',now:Date.parse('2026-10-29T00:00:00Z')};
test('confirmed configured admin can view local review',()=>assert.equal(mayViewLocalReview(input),true));
test('anonymous, ordinary and unconfirmed users cannot view',()=>{for(const user of [null,{email:'other@example.com',email_confirmed_at:'2026-01-01'},{email:'admin@example.com'}])assert.equal(mayViewLocalReview({...input,user}),false);});
test('public hosts, forwarded spoofing, expired or missing grants fail',()=>{for(const change of [{host:'evil.example'},{forwardedHost:'evil.example'},{origin:'https://lingxifield.com'},{expiresAt:'2026-01-01'},{emails:''}])assert.equal(mayViewLocalReview({...input,...change}),false);});
