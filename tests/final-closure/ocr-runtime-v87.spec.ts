import {test,expect,type Page} from './export-test';
import {PDFDocument} from 'pdf-lib';
import fs from 'node:fs/promises';

async function image(page:Page){
 const bytes=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=220;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,1000,220);ctx.fillStyle='#000';ctx.font='bold 64px Arial';ctx.fillText('HELLO WORLD 12345',30,130);return canvas.toDataURL().split(',')[1]});
 return Buffer.from(bytes,'base64');
}
async function setup(page:Page,lang='eng'){
 await page.addInitScript(()=>{
  const Native=window.Worker;const tracked:Array<{url:string;active:boolean}>=[];(window as any).__ocrWorkers=tracked;
  window.Worker=class extends Native{record:{url:string;active:boolean};constructor(url:string|URL,options?:WorkerOptions){super(url,options);this.record={url:String(url),active:true};tracked.push(this.record)}terminate(){this.record.active=false;super.terminate()}};
 });
 await page.goto('/tools/ocr?lang=en');
 await expect(page.locator('input[type=file]').first()).toBeEnabled();
 await page.locator('input[type=file]').first().setInputFiles({name:'sample.png',mimeType:'image/png',buffer:await image(page)});
 await page.getByRole('combobox',{name:'Recognition language'}).selectOption(lang);
}
async function stopped(page:Page){await expect.poll(()=>page.evaluate(()=>(window as any).__ocrWorkers.filter((w:any)=>w.url.includes('/media/ocr-')&&w.active).length)).toBe(0)}

for(const lang of ['eng','chi_sim+eng','chi_tra+eng','jpn+eng','kor+eng','fra+eng','deu+eng','spa+eng','por+eng','ara+eng'])test(`OCR really loads ${lang} and downloads recognized text without external CDN`,async({page})=>{
 test.setTimeout(90000);const external:string[]=[];
 await page.route(/https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\//,route=>{external.push(route.request().url());return route.abort()});
 await setup(page,lang);await page.getByRole('button',{name:'Extract text',exact:true}).click();
 await expect(page.locator('textarea')).toHaveValue(/HELLO WORLD 12345/,{timeout:60000});
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).click();const file=await pending;
 expect(await fs.readFile((await file.path())!,'utf8')).toContain('HELLO WORLD 12345');expect(external).toEqual([]);await stopped(page);
});

test('missing language data reports failure, releases worker, preserves input and retries successfully',async({page})=>{
 await page.route('**/media/ocr-*/lang/*.gz',route=>route.fulfill({status:404,body:'missing'}));await setup(page);
 await page.getByRole('button',{name:'Extract text',exact:true}).click();
 await expect(page.locator('main').getByRole('alert')).toContainText('Recognition could not finish',{timeout:15000});await stopped(page);
 await expect(page.getByRole('button',{name:'Extract text',exact:true})).toBeEnabled();await expect(page.getByText('sample.png',{exact:true}).first()).toBeVisible();
 await page.unroute('**/media/ocr-*/lang/*.gz');await page.getByRole('button',{name:'Extract text',exact:true}).click();await expect(page.locator('textarea')).toHaveValue(/HELLO WORLD 12345/,{timeout:30000});await stopped(page);
});

for(const action of ['cancel','timeout'] as const)test(`stalled initialization ${action} terminates the worker and re-enables retry`,async({page})=>{
 let release!:()=>void;const stalled=new Promise<void>(resolve=>{release=resolve});
 await page.route('**/media/ocr-*/lang/*.gz',async route=>{await stalled;await route.abort().catch(()=>{})});
 try{
  await setup(page);await page.clock.install();await page.getByRole('button',{name:'Extract text',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__ocrWorkers.filter((w:any)=>w.url.includes('/media/ocr-')&&w.active).length)).toBe(1);
  if(action==='cancel')await page.getByRole('button',{name:'Cancel',exact:true}).click();else await page.clock.fastForward(91_000);
  await expect(page.locator('main').getByRole('alert')).toContainText(action==='cancel'?'Recognition cancelled':'Recognition could not finish');await stopped(page);await expect(page.getByRole('button',{name:'Extract text',exact:true})).toBeEnabled();
 }finally{release()}
});

test('free scanned-PDF first page uses the same local OCR and produces actual text',async({page})=>{
 test.setTimeout(60000);await page.goto('/tools/pdf-ocr?lang=en');const png=await image(page),pdf=await PDFDocument.create(),embedded=await pdf.embedPng(png);pdf.addPage([1000,220]).drawImage(embedded,{x:0,y:0,width:1000,height:220});
 await expect(page.locator('input[type=file]').first()).toBeEnabled();await page.locator('input[type=file]').first().setInputFiles({name:'scan.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
 await page.locator('select').filter({has:page.locator('option[value="chi_sim+eng"]')}).selectOption('eng');await page.getByRole('button',{name:'Recognize page 1 free',exact:true}).click();
 await expect(page.locator('textarea')).toHaveValue(/HELLO WORLD 12345/,{timeout:30000});
});

test('OCR privacy disclosure matches browser-local processing in all nine languages',async({page})=>{
 test.setTimeout(60000);
 const disclosures={zh:'在浏览器本地处理，文件不会上传。',en:'Processing runs in your browser; files are not uploaded.',ja:'ブラウザ内で処理し、ファイルはアップロードしません。',ko:'브라우저에서 처리하며 파일은 업로드되지 않습니다.',fr:'Le traitement se fait dans le navigateur ; les fichiers ne sont pas téléversés.',de:'Die Verarbeitung erfolgt im Browser; Dateien werden nicht hochgeladen.',es:'El procesamiento se realiza en el navegador; los archivos no se suben.',pt:'O processamento ocorre no navegador; os arquivos não são enviados.',ar:'تجري المعالجة في المتصفح ولا تُرفع الملفات.'};
 for(const [locale,disclosure] of Object.entries(disclosures)){
  await page.goto('/tools/ocr?lang='+locale);await expect(page.locator('body')).toContainText(disclosure);
 }
});

test('failed free PDF OCR clears its loading message and restores the free retry button',async({page})=>{
 const pdf=await PDFDocument.create();pdf.addPage([200,200]);
 await page.route('**/media/ocr-*/lang/*.gz',route=>route.fulfill({status:404,body:'missing'}));
 await page.goto('/tools/pdf-ocr?lang=en');await expect(page.locator('input[type=file]').first()).toBeEnabled();
 await page.locator('input[type=file]').first().setInputFiles({name:'scan.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
 await page.getByRole('button',{name:'Recognize page 1 free',exact:true}).click();
 await expect(page.locator('main').getByRole('alert')).toContainText('OCR could not finish',{timeout:20000});
 await expect(page.getByText('Loading recognition engine and language data…',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Recognize page 1 free',exact:true})).toBeEnabled();await expect(page.locator('textarea')).toHaveCount(0);
});

test('OCR retains a working non-SIMD engine for devices without SIMD support',async({page})=>{
 test.setTimeout(60000);const coreRequests:string[]=[];
 page.on('request',request=>{if(request.url().includes('/core/'))coreRequests.push(request.url())});
 await page.route('**/media/ocr-*/worker.min.js',async route=>{
  const response=await route.fetch();
  // Force only the small capability probes to report no SIMD. The real OCR
  // engine still executes and produces text; its WASM validation is untouched.
  await route.fulfill({response,body:'const __lxValidate=WebAssembly.validate.bind(WebAssembly);WebAssembly.validate=b=>b.byteLength<256?false:__lxValidate(b);\n'+await response.text()});
 });
 await setup(page);await page.getByRole('button',{name:'Extract text',exact:true}).click();
 await expect(page.locator('textarea')).toHaveValue(/HELLO WORLD 12345/,{timeout:45000});
 expect(coreRequests.some(url=>url.endsWith('/tesseract-core-lstm.wasm.js'))).toBe(true);expect(coreRequests.some(url=>url.includes('simd'))).toBe(false);await stopped(page);
});

test('a blank scanned page does not produce a misleading completed OCR download',async({page})=>{
 test.setTimeout(60000);const pdf=await PDFDocument.create();pdf.addPage([200,200]);await page.goto('/tools/pdf-ocr?lang=en');
 await expect(page.locator('input[type=file]').first()).toBeEnabled();await page.locator('input[type=file]').first().setInputFiles({name:'blank.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
 await page.locator('select').filter({has:page.locator('option[value="chi_sim+eng"]')}).selectOption('eng');await page.getByRole('button',{name:'Recognize page 1 free',exact:true}).click();
 await expect(page.locator('main').getByRole('alert')).toContainText('No text found',{timeout:45000});
 await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);await expect(page.locator('textarea')).toHaveCount(0);await expect(page.getByRole('button',{name:'Recognize page 1 free',exact:true})).toBeEnabled();
});
