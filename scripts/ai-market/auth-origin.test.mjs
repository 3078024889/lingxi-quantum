import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=readFileSync(new URL('../../lib/sasi/request-security.ts',import.meta.url),'utf8').replace('import "server-only";','');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function check({env='production',configured='',host='localhost:3100',origin='http://localhost:3100',forwarded,site='same-origin',urlHost=host,referer}={}){
 const context={exports:{},process:{env:{NODE_ENV:env,LINGXIFIELD_LOCAL_AUTH_ORIGIN:configured}},URL};
 vm.runInNewContext(compiled,context);
 const headers=new Headers({host,'sec-fetch-site':site});
 if(origin!==null)headers.set('origin',origin);
 if(forwarded)headers.set('x-forwarded-host',forwarded);
 if(referer)headers.set('referer',referer);
 return context.exports.isSameOriginMutation({headers,nextUrl:new URL('http://'+urlHost)});
}
test('production loopback is closed by default',()=>assert.equal(check(),false));
test('explicit local production origin works',()=>assert.equal(check({configured:'http://localhost:3100'}),true));
test('development still works without configuration',()=>assert.equal(check({env:'development'}),true));
test('different port, alias, null and foreign sources fail',()=>{
 for(const origin of ['http://localhost:3101','http://127.0.0.1:3100','null','https://evil.example'])assert.equal(check({configured:'http://localhost:3100',origin}),false);
});
test('cross site, forwarded spoof and public destination fail',()=>{
 for(const change of [{site:'cross-site'},{forwarded:'evil.example'},{urlHost:'evil.example'}])assert.equal(check({configured:'http://localhost:3100',...change}),false);
});
test('explicit 127.0.0.1 works only for that host',()=>assert.equal(check({host:'127.0.0.1:3100',origin:'http://127.0.0.1:3100',configured:'http://127.0.0.1:3100'}),true));
test('referer fallback requires exact loopback origin',()=>assert.equal(check({configured:'http://localhost:3100',origin:null,referer:'http://localhost:3100/account'}),true));
test('public configuration cannot enable arbitrary origin',()=>assert.equal(check({host:'evil.example',origin:'https://evil.example',configured:'https://evil.example'}),false));
test('existing trusted production path remains available',()=>assert.equal(check({host:'lingxifield.com',origin:'https://lingxifield.com'}),true));
