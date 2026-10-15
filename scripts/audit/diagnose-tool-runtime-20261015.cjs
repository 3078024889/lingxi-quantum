const {chromium}=require('playwright');
const fs=require('node:fs');
async function main(){
 const dir='_local/handoff/tool-runtime-20261015';fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const report=[],recognitionLanguage=process.env.TOOL_OCR_LANGUAGE||'eng';
 for(const base of process.argv.slice(2).length?process.argv.slice(2):['https://lingxifield.com','https://lingxifield.cn']){
  const page=await browser.newPage();const events=[];
  if(process.env.TOOL_OCR_BLOCK_LANG)await page.route('**/*.traineddata.gz',route=>route.abort('failed'));
  page.on('pageerror',e=>events.push({error:e.message}));
  page.on('requestfailed',r=>events.push({url:r.url(),failure:r.failure()?.errorText}));
  page.on('response',r=>{if(r.status()>=400||/tesseract|traineddata|wasm/.test(r.url()))events.push({url:r.url(),status:r.status()})});
  try{
   await page.goto(base+'/tools/ocr?lang=en',{waitUntil:'networkidle',timeout:60000});
   console.log(base, 'loaded', (await page.locator('button').allTextContents()).filter(x=>/Extract|Recogn|识别|文字/.test(x)));
   const png=await page.evaluate(language=>{const c=document.createElement('canvas');c.width=900;c.height=230;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,900,230);x.fillStyle='black';x.font='bold 55px Arial';x.fillText('HELLO WORLD 12345',35,165);if(language.includes('chi')){x.font='55px Microsoft YaHei, sans-serif';x.fillText('灵犀场 量子科学',35,75)}return c.toDataURL().split(',')[1]},recognitionLanguage);
   await page.locator('input[type=file]').first().setInputFiles({name:'ocr-test.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
   await page.locator('select').filter({has:page.locator('option[value="chi_sim+eng"]')}).first().selectOption(recognitionLanguage);
   const started=Date.now();await page.getByRole('button',{name:'Extract text',exact:true}).click();
   try{await page.waitForFunction(()=>!!document.querySelector('main textarea')?.value||!!document.querySelector('[data-tool-workbench] [role=alert]'),{},{timeout:45000})}catch{}
   const row={base,language:recognitionLanguage,elapsedMs:Date.now()-started,text:await page.locator('textarea').allTextContents(),value:await page.evaluate(()=>document.querySelector('main textarea')?.value||''),body:(await page.locator('main').innerText()).slice(-2500),events};report.push(row);console.log(JSON.stringify(row));
   await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:dir+'/'+new URL(base).hostname+'.png',fullPage:true});
  }catch(e){report.push({base,error:e.message,events});console.log(JSON.stringify(report.at(-1)))}finally{await page.close()}
 }
 await browser.close();fs.writeFileSync(dir+(process.env.TOOL_OCR_BLOCK_LANG?'/diagnosis-blocked-language.json':'/diagnosis-healthy.json'),JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
