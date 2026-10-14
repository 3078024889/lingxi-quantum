import {test,expect as baseExpect} from 'playwright/test';
const expect=baseExpect.configure({timeout:15000});
test.describe.configure({mode:'parallel'});
import {publicToolSurface} from '../../lib/tools/public-surface';
for(const tool of publicToolSurface())test(`${tool.slug}: visible English controls contain no fixed Chinese UI`,async({page},info)=>{
 await page.goto(`/tools/${tool.slug}?lang=en`,{waitUntil:'domcontentloaded'});await expect(page.locator('html')).toHaveAttribute('data-lang','en');
 const scope=page.locator('[data-tool-workbench]');const root=await scope.count()?scope:page.locator('main');
 const untranslated=()=>root.evaluate(element=>{
  const walk=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),rows:string[]=[];
  while(walk.nextNode()){
   const node=walk.currentNode,p=node.parentElement;if(!p||p.closest('textarea,pre,code,script,style,[data-user-content]'))continue;
   // A language selector deliberately uses native language names.
   const option=p.closest('option');if(option&&['zh','en','ja','ko','fr','de','es','pt','ar','zh-CN','zh-TW','ja-JP'].includes(option.value))continue;
   if(!p.getClientRects().length)continue;const value=(node.textContent||'').trim().replace(/灵犀场/g,'');if(/[\u4e00-\u9fff]/.test(value))rows.push(value);
  }return rows;
 });
 await expect.poll(untranslated,{timeout:15000}).toEqual([]);
 const text=await untranslated();await info.attach('visible-language-audit',{body:JSON.stringify({slug:tool.slug,untranslated:text},null,2),contentType:'application/json'});
});
