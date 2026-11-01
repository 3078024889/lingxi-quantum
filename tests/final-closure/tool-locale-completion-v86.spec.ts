import {test,expect as baseExpect} from './export-test';
const expect=baseExpect.configure({timeout:15000});
test.describe.configure({mode:'parallel'});
import {publicToolSurface} from '../../lib/tools/public-surface';
import {TOOL_COPY_V86} from '../../lib/tools/ui-copy-v86';
import type {LingxiLang} from '../../lib/lingxi-i18n';

const locales: LingxiLang[]=['en','ja','ko','fr','de','es','pt','ar'];
for(const tool of publicToolSurface())test(`${tool.slug}: all eight translated interfaces have no untranslated source phrases`,async({page},info)=>{
 test.setTimeout(120000);const failures:{lang:string;source:string}[]=[];
 for(const lang of locales){
  await page.goto(`/tools/${tool.slug}?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('data-lang',lang);
  await expect(page.locator('html')).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
  // The server renders a Chinese hydration shell before query-string locale state
  // settles. html[data-lang] can update before the tool workbench commits its own
  // translated UI; await actual interface text, not only the root attribute.
  const scope=page.locator('[data-tool-workbench]');
  const inspect=async()=>{
   const text=await (await scope.count()?scope:page.locator('main')).innerText();
   return Object.entries(TOOL_COPY_V86).filter(([source,map])=>source.length>=4&&map[lang]!==source&&text.includes(source)).map(([source])=>({lang,source}));
  };
  try{await expect.poll(inspect,{timeout:12000,intervals:[100,250,500,1000]}).toEqual([])}
  catch{failures.push(...await inspect())}
 }
 await info.attach('locale-acceptance',{body:JSON.stringify({slug:tool.slug,locales,failures},null,2),contentType:'application/json'});expect(failures).toEqual([]);
});
