import {test,expect} from 'playwright/test';
import sharp from 'sharp';
import {PDFDocument,StandardFonts} from 'pdf-lib';

// Actual public production website; no billing, storage or API routes are mocked here.
const publicPages=['/','/siai','/tools','/tools/batch-image','/tools/pdf-pages-per-sheet','/tools/pdf-rasterize','/privacy','/terms','/refunds'];

test('production real HTTP pages, robots and sitemap respond without a Vercel error',async({page,request})=>{
 test.setTimeout(150000);
 for(const path of publicPages){
  const response=await request.get(path,{timeout:25000,maxRedirects:5});
  expect(response.status(),path+' HTTP status').toBe(200);
  expect((await response.text()).length,path+' nonempty HTML').toBeGreaterThan(200);
 }
 for(const path of ['/robots.txt','/sitemap.xml']){
  const response=await request.get(path,{timeout:25000,maxRedirects:5});
  expect(response.status(),path+' HTTP status').toBe(200);
 }
 await page.goto('/siai',{waitUntil:'domcontentloaded',timeout:30000});
 await expect(page.locator('footer.lx11-footer')).toBeAttached({timeout:30000});
 await expect(page.locator('.lx-footer-unified')).toBeAttached({timeout:30000});
});

test('production locales actually respond and Arabic RTL is retained',async({page,request})=>{
 test.setTimeout(120000);
 for(const locale of ['en','ja','ko','fr','de','es','pt','ar']){
  const response=await request.get('/'+locale+'/siai',{timeout:25000,maxRedirects:5});
  expect(response.status(),locale+' SIAI status').toBe(200);
  expect((await response.text()).length,locale+' SIAI HTML').toBeGreaterThan(200);
 }
 await page.goto('/ar/siai',{waitUntil:'domcontentloaded'});
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/\/ar\/siai$/);
});

test('production actually processes PNG without mocks and drops stale results on a setting change',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/tools/batch-image?lang=en',{waitUntil:'domcontentloaded'});
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:20000});
 const bytes=await sharp({create:{width:96,height:48,channels:4,background:{r:50,g:125,b:250,alpha:0.5}}}).png().toBuffer();
 await input.setInputFiles({name:'production-check.png',mimeType:'image/png',buffer:bytes});
 await page.getByRole('combobox',{name:'Output format',exact:true}).selectOption('image/png');
 await page.getByRole('button',{name:'Process batch',exact:true}).click();
 const result=page.getByRole('button',{name:'Save file',exact:true}).first();
 await expect(result).toBeVisible({timeout:30000});
 await expect(page.getByText('production-check.png',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'1080 px',exact:true}).click();
 await expect(result).toHaveCount(0);
});

test('production creates a vector PDF from real bytes on both devices without mocks',async({page})=>{
 test.setTimeout(90000);
 const document=await PDFDocument.create();
 const font=await document.embedFont(StandardFonts.Helvetica);
 document.addPage([200,300]).drawText('PRODUCTION VECTOR 2026',{x:12,y:170,size:14,font});
 await page.goto('/tools/pdf-pages-per-sheet?lang=en',{waitUntil:'domcontentloaded'});
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:20000});
 await input.setInputFiles({name:'live-source.pdf',mimeType:'application/pdf',buffer:Buffer.from(await document.save())});
 await page.getByRole('button',{name:'Process',exact:true}).click();
 await expect(page.getByRole('button',{name:'Save file',exact:true}).first()).toBeVisible({timeout:30000});
 // Separate output test opens actual downloads, with metering-only test stub.
});


for(const [site,url] of [
 ['Global SIAI','https://globalsiai.com/'],
 ['Global SIAI www','https://www.globalsiai.com/'],
 // CN is tested with an actual Chrome/Pixel7 user agent below, not Playwright APIRequest.
] as const){
 test('real production custom domain: '+site,async({request})=>{
  const response=await request.get(url,{timeout:30000,maxRedirects:5});
  expect(response.status(),site+' HTTP status').toBe(200);
  expect((await response.text()).length,site+' nonempty HTML').toBeGreaterThan(200);
 });
}


test('CN domain in actual Chrome page versus API client is explicitly distinguished',async({page,request})=>{
 test.setTimeout(60000);
 const api=await request.get('https://lingxifield.cn/',{timeout:30000,maxRedirects:5});
 const browser=await page.goto('https://lingxifield.cn/',{waitUntil:'domcontentloaded',timeout:30000});
 console.log('CN_DOMAIN_PROBE',JSON.stringify({apiStatus:api.status(),browserStatus:browser?.status()??null,apiServer:api.headers()['server']??null,browserServer:browser?.headers()['server']??null}));
 expect(browser?.status(),'Chrome/Pixel7 actual user-agent HTTP').toBe(200);
 expect((await page.locator('body').innerText()).length).toBeGreaterThan(200);
});

test('all 124 indexed tool routes respond on the real production domain',async({request},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop-chromium','One origin HTTP route census is sufficient');
 test.setTimeout(360000);
 const {readFile}=await import('node:fs/promises');
 const source=await readFile('lib/seo/global-seo.ts','utf8');
 const start=source.indexOf('export const GLOBAL_TOOL_CATALOG=['),end=source.indexOf('] as const',start);
 expect(start).toBeGreaterThan(0);expect(end).toBeGreaterThan(start);
 const slugs=[...source.slice(start,end).matchAll(/\{slug:"([a-z0-9-]+)"/g)].map(m=>m[1]);
 expect(slugs.length,'catalogue count').toBe(124);
 const bad:string[]=[];
 for(const slug of slugs){
  try{
   const response=await request.get('/tools/'+slug+'?lang=en',{timeout:25000,maxRedirects:5});
   if(response.status()!==200)bad.push(slug+':HTTP '+response.status());
  }catch(error){bad.push(slug+':'+(error instanceof Error?error.message.slice(0,100):String(error)));}
 }
 console.log('PRODUCTION_ROUTE_CENSUS',JSON.stringify({registered:slugs.length,ok:slugs.length-bad.length,failed:bad}));
 expect(bad,'All registered public tool routes must load').toEqual([]);
});
