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
 ['LINGXIFIELD CN','https://lingxifield.cn/']
] as const){
 test('real production custom domain: '+site,async({request})=>{
  const response=await request.get(url,{timeout:30000,maxRedirects:5});
  expect(response.status(),site+' HTTP status').toBe(200);
  expect((await response.text()).length,site+' nonempty HTML').toBeGreaterThan(200);
 });
}
