const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
const file='lib/tools/commerce/paid-export-quote-binding.ts';
const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};vm.runInNewContext(js,{exports,Number,Array});
const verify=exports.matchesPaidExportQuote;
const input={quoteId:'quote-1',toolId:'e-sign-pdf',quantity:5,draftId:'draft-1',pages:5};
const bound={id:'quote-1',tool_id:'e-sign-pdf',quantity:5,unit_name:'page',metadata:{draftId:'draft-1'}};
assert.equal(verify(bound,input),true);
for(const broken of [undefined,null,{}, {...bound,id:'quote-2'}, {...bound,tool_id:'pdf-editor'}, {...bound,quantity:6},
 {...bound,metadata:{draftId:'draft-2'}}, {...bound,quantity:NaN}, {...bound,quantity:0}]){
 assert.equal(verify(broken,input),false,JSON.stringify(broken));
}
assert.equal(verify({tool_id:'e-sign-pdf',quantity:5,unit_name:'page'},input),true,'legacy paid quote without id remains eligible only after trusted status response');
assert.equal(verify({tool_id:'e-sign-pdf',quantity:5,unit_name:'page'}, {...input,quantity:1}),true,'legacy page quote must still recover');
assert.equal(verify({...bound,unit_name:'use',quantity:1}, {...input,quantity:5}),false,'wrong quantity without page unit is rejected');
assert.equal(verify({...bound,quantity:6}, {...input,quantity:5,pages:6}),true,'legacy page count is accepted for old PDF billing contract');
assert.equal(verify({...bound,tool_id:'video-dubbing',quantity:5}, {...input,toolId:'e-sign-pdf'}),false);
const component=fs.readFileSync('components/tools/PaidExportButton.tsx','utf8');
assert(component.includes('if(!matchesPaidExportQuote(q,{quoteId:id,toolId,quantity,draftId,pages:metadata?.pages}))'));
assert(component.indexOf('if(!matchesPaidExportQuote(q')<component.indexOf('await unlock(id)'));
console.log('PAID_EXPORT_QUOTE_BINDING_V166=PASS: missing/wrong quotes cannot be treated as paid delivery; real and legacy PDF quantity/draft contracts preserved; no financial writes.');
