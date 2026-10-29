// Browser smoke tests run only against the explicit local staging URL.
// Usage: AI_MARKET_BASE_URL=http://127.0.0.1:3000 node scripts/ai-market/browser-nine-languages.mjs
import{chromium}from'playwright';
const raw=process.env.AI_MARKET_BASE_URL||'http://127.0.0.1:3000';
const u=new URL(raw);
if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!['http:','https:'].includes(u.protocol))throw Error('LOCAL_STAGING_ONLY');
const locales=['zh','en','ja','ko','fr','de','es','pt','ar'];
const browser=await chromium.launch({headless:true});
const failures=[],checks=[];
try{
 for(const locale of locales){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const url=new URL('/ai-market/lang/'+locale,u);
  try{
   const response=await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
   if(!response?.ok())throw Error('HTTP_'+(response?.status()||'NO_RESPONSE'));
   const state=await page.evaluate(()=>({lang:document.querySelector('div[lang]')?.getAttribute('lang'),dir:document.querySelector('div[lang]')?.getAttribute('dir'),text:document.body.innerText,overflow:document.documentElement.scrollWidth>window.innerWidth+3}));
   if(state.lang!==locale)throw Error('LANG_MISMATCH:'+state.lang);
   if(state.dir!==(locale==='ar'?'rtl':'ltr'))throw Error('DIRECTION_MISMATCH:'+state.dir);
   if(state.overflow)throw Error('HORIZONTAL_OVERFLOW');
   if(state.text.trim().length<40)throw Error('EMPTY_PAGE');
   if(/\b(?:undefined|null|NaN)\b/.test(state.text))throw Error('UNRESOLVED_PLACEHOLDER');
   checks.push({locale,result:'PASS'});
  }catch(e){failures.push({locale,error:String(e.message||e)});checks.push({locale,result:'FAIL'})}
  finally{await page.close()}
 }
}finally{await browser.close()}
console.log(JSON.stringify({checks,failures,scope:'local mobile smoke only; not complete i18n/functional E2E'},null,2));
if(failures.length)process.exitCode=1;
