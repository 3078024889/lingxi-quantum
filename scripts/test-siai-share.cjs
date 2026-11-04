const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function compile(file,imports={}){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(p=>imports[p]||require(p),m,m.exports);return m.exports;}
const facets=compile('lib/siai-home-facets.ts');
const {readSiaiShareState:read,siaiSharePath:write,SIAI_SHARE_COPY:copy}=compile('lib/siai-share-state.ts',{'./siai-home-facets':facets});
const ids=['alpha','beta','gamma','delta'],categories=['图片','视频'];
const state={query:'图片 & video',category:'图片',task:'image',payment:'paypal',evidence:'verified_free',sort:'name',compareIds:['alpha','beta']};
const link=write(state,'zh');
assert.deepEqual(read(new URL(link,'https://lingxifield.com').search,ids,categories),state);
assert.equal(new URL(link,'https://lingxifield.com').searchParams.get('lang'),'zh');
const invalid=read('?task=admin&payment=crypto&evidence=anything&sort=bad&category=unknown&compare=alpha,alpha,missing,beta,gamma,delta&q=%00hello%0A&token=secret&return=https://evil.example',ids,categories);
assert.deepEqual(invalid,{query:'hello',category:'*',task:'all',payment:'any',evidence:'all',sort:'oldest',compareIds:['alpha','beta','gamma']});
assert(!write(invalid,'en').includes('secret'));assert(!write(invalid,'en').includes('evil'));
assert.equal(read('?q='+('a'.repeat(500)),ids,categories).query.length,160);
assert.equal(read('?compare=missing',ids,categories).compareIds.length,0);
for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
 assert(copy[lang].share&&copy[lang].copied&&copy[lang].fallback&&copy[lang].link);
 assert.equal(new URL(write(state,lang),'https://lingxifield.cn').searchParams.get('lang'),lang);
}
console.log('PASS: share state round-trip, exact facet validation, known-product limit, bounded search, private parameter exclusion, and nine languages');
