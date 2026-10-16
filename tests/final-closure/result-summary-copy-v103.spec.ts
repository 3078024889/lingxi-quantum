import{test,expect}from'./export-test';
import{resultDetail}from'../../lib/tools/result-details-copy';

test('result summaries hide internal fields, retain exact hashes and name image dimensions',()=>{
 expect(resultDetail('en','width',222)).toEqual({label:'Width',value:'222'});
 expect(resultDetail('zh','height',148)).toEqual({label:'高度',value:'148'});
 expect(resultDetail('en','sizeA',1024)).toEqual({label:'File size (KB) A',value:'1'});
 const digest='0123456789abcdef';expect(resultDetail('en','sha256A',digest)).toEqual({label:'SHA256 A',value:digest});
 for(const key of ['rounds','structureConfidence','sameSize','internalProvider','__proto__','constructor'])expect(resultDetail('en',key,'private diagnostic')).toBeNull();
});

test('all nine languages have curated input/output count labels',()=>{
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']as const){
  const input=resultDetail(lang,'inputFiles',2),output=resultDetail(lang,'outputFiles',1);
  expect(input?.label).toBeTruthy();expect(output?.label).toBeTruthy();
  expect(input?.label).not.toBe('inputFiles');expect(output?.label).not.toBe('outputFiles');
  expect(input?.label).not.toBe(output?.label);
 }
});
