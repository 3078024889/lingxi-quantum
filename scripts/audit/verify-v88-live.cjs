const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{PDFDocument,PDFName}=require('pdf-lib');
async function main(){
 const dir=process.env.V88_LIVE_EVIDENCE||'_local/handoff/tool-runtime-20261015/v88-live';fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true}),rows=[];
 const source=await PDFDocument.create();source.setTitle('Private test title');source.setAuthor('Private test author');source.addPage([400,300]).drawText('Visible author: Ada Lovelace',{x:30,y:200,size:16});source.catalog.set(PDFName.of('Metadata'),source.context.register(source.context.stream('TEST XMP',{Type:'Metadata',Subtype:'XML'})));const bytes=Buffer.from(await source.save());
 async function upload(page){await page.locator('input[type=file]').first().setInputFiles({name:'audit.pdf',mimeType:'application/pdf',buffer:bytes})}
 async function download(page){await page.getByRole('button',{name:'Save file',exact:true}).waitFor({timeout:30000});const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).click();const item=await promise;assert.equal(await item.failure(),null);return fs.readFileSync(await item.path())}
 try{for(const base of process.argv.slice(2).length?process.argv.slice(2):['https://lingxifield.com','https://lingxifield.cn']){
  const page=await browser.newPage(),row={base,checks:[],qpdfResources:[],errors:[]};page.setDefaultTimeout(30000);page.on('response',response=>{if(response.url().includes('/media/qpdf-'))row.qpdfResources.push({url:response.url(),status:response.status()})});page.on('pageerror',error=>row.errors.push(error.message));
  if(new URL(base).hostname==='127.0.0.1'){
   row.localTrustedHeaders=true;
   await page.route(/\/api\/tools\/(document-translate|promotion-source)/,route=>route.continue({headers:{...route.request().headers(),origin:'https://lingxifield.com','x-forwarded-host':'lingxifield.com','sec-fetch-site':'same-origin'}}));
  }
  try{
   await page.goto(base+'/tools/pdf-remove-metadata?lang=en');await upload(page);await page.getByRole('button',{name:'Process',exact:true}).click();await page.locator('[data-metadata-verified]').waitFor();const clean=await download(page),parsed=await PDFDocument.load(clean,{updateMetadata:false});assert.equal(parsed.context.trailerInfo.Info,undefined);assert(!parsed.catalog.has(PDFName.of('Metadata')));assert.equal(parsed.getPage(0).getWidth(),400);fs.writeFileSync(path.join(dir,new URL(base).hostname+'-clean.pdf'),clean);await page.locator('[data-tool-workbench]').screenshot({path:path.join(dir,new URL(base).hostname+'-metadata.png')});row.checks.push('metadata downloaded, reopened, Info/XMP absent, page size preserved');
   await page.goto(base+'/tools/pdf-web-optimize?lang=en');await upload(page);await page.getByRole('button',{name:'Process',exact:true}).click();const linear=await download(page);assert.match(linear.subarray(0,1024).toString('latin1'),/\/Linearized/);assert.equal((await PDFDocument.load(linear)).getPageCount(),1);row.checks.push('qpdf real linearized PDF downloaded');
   await page.goto(base+'/tools/document-translate?lang=en');await page.locator('input[type=file]').first().setInputFiles({name:'sample.txt',mimeType:'text/plain',buffer:Buffer.from('Hello world')});const auth=page.waitForResponse(response=>response.url().includes('/api/tools/document-translate'));await page.getByRole('button',{name:'Translate',exact:true}).click();assert.equal((await auth).status(),401);await page.locator('main').getByRole('link',{name:/Sign in/}).waitFor();row.checks.push('anonymous translation stops at login before provider invocation');
   await page.goto(base+'/tools/url-to-video?lang=en');await page.getByRole('textbox',{name:'Website or product URL'}).fill('https://lingxifield.com');const imported=page.waitForResponse(response=>response.url().includes('/api/tools/promotion-source'));await page.getByRole('button',{name:'Read page',exact:true}).click();const response=await imported;row.promotionStatus=response.status();await page.locator('[data-tool-workbench] h3').waitFor({timeout:30000});row.websiteTitle=await page.locator('[data-tool-workbench] h3').innerText();assert(row.websiteTitle.trim());assert.equal(response.status(),200);row.checks.push('actual LingxiField webpage read and identified without video generation');
   row.passed=true;
  }catch(error){row.passed=false;row.error=error.message;await page.screenshot({path:path.join(dir,new URL(base).hostname+'-failure.png'),fullPage:true}).catch(()=>{})}
  rows.push(row);console.log(JSON.stringify({base,passed:row.passed,checks:row.checks,promotionStatus:row.promotionStatus,websiteTitle:row.websiteTitle,error:row.error}));await page.close();
 }}finally{await browser.close()}
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(rows,null,2));if(rows.some(row=>!row.passed))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1});
