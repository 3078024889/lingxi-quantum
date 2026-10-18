const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),{JSDOM}=require('jsdom');
const dom=new JSDOM('');
try{
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/shared/developer-document.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,DOMParser:dom.window.DOMParser,XMLSerializer:dom.window.XMLSerializer,URL});
 const {xmlPretty,parseUrlDetails}=exports;
 const fixtures=[
  '<p xml:space="preserve">甲<b>bold</b> <i>italic</i>乙</p>',
  '<p>甲<b>bold</b> <i>italic</i>乙</p>',
  '<root xml:space="preserve"><a>  x  </a> <a>y</a></root>',
  '<root>　<a>x</a>　</root>',
  '<root><![CDATA[ text <with> spaces ]]><a>x</a></root>',
 ];
 const parse=raw=>new dom.window.DOMParser().parseFromString(raw,'application/xml');
 for(const raw of fixtures){const result=xmlPretty(raw);assert.equal(parse(result).documentElement.textContent,parse(raw).documentElement.textContent);assert.equal(parse(result).getElementsByTagName('parsererror').length,0)}
 const formatted=xmlPretty('<root xmlns="urn:example"><child value="a &gt; b"><leaf>你好</leaf></child></root>');
 assert(formatted.includes('\n  <child'));assert(formatted.includes('\n    <leaf>你好</leaf>'));assert.equal(parse(formatted).getElementsByTagNameNS('urn:example','child')[0].getAttribute('value'),'a > b');
 assert.throws(()=>xmlPretty('<broken>'),/XML/);assert.throws(()=>xmlPretty('x'.repeat(500001)),/TOOL_RESULT_TOO_LARGE/);
 assert.throws(()=>xmlPretty('<r>'.repeat(260)+'<leaf/>'+'</r>'.repeat(260)),/TOOL_RESULT_TOO_LARGE/);
 const out=parseUrlDetails('https://例子.测试:8443/p?tag=中文&empty=&tag=English&__proto__=safe&plus=a+b#锚点');
 assert.equal(JSON.stringify(out.search),JSON.stringify({tag:['中文','English'],empty:'',['__proto__']:'safe',plus:'a b'}));assert.equal(out.searchEntries.length,5);assert.equal(out.hostname,'xn--fsqu00a.xn--0zwm56d');assert.throws(()=>parseUrlDetails('not a URL'));
 console.log('PASS: actual XML formatter retains mixed content, xml:space, Unicode spaces, CDATA, namespace and attribute semantics; still indents element-only XML; bounded depth/size and malformed rejection. URL query multiplicity/order/Unicode/special keys retained.');
}finally{dom.window.close()}
