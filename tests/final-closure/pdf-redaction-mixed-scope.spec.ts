import {test,expect,type Page} from "./export-test";
import {PDFDocument,PDFName,PDFDict,rgb} from "pdf-lib";
import {readFile} from "node:fs/promises";
import sharp from "sharp";

const img=(page:Page)=>page.locator("[data-redaction-surface] img");
const surface=(page:Page)=>page.locator("[data-redaction-surface]");
const mode=(page:Page)=>page.getByRole("combobox",{name:"Same area on every page",exact:true});

async function draw(page:Page,x:number,y:number,w:number,h:number){
 await page.getByRole("button",{name:"Draw redaction",exact:true}).click();
 const canvas=surface(page);await canvas.scrollIntoViewIfNeeded();
 const b=await canvas.boundingBox();if(!b)throw Error("REDACTION_SURFACE_MISSING");
 await page.mouse.move(b.x+b.width*x,b.y+b.height*y);
 await page.mouse.down();
 await page.mouse.move(b.x+b.width*(x+w),b.y+b.height*(y+h),{steps:4});
 await page.mouse.up();
 await expect(canvas).toHaveAttribute("data-mode","scroll");
}

async function colorAt(page:Page,x:number,y:number){
 const png=await img(page).screenshot();
 const {data,info}=await sharp(png).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const px=Math.min(info.width-1,Math.floor(info.width*x));
 const py=Math.min(info.height-1,Math.floor(info.height*y));
 const i=(py*info.width+px)*info.channels;
 return [data[i],data[i+1],data[i+2]];
}

test("mixed page-specific and all-page masks survive mode switching and PDF download/reopen",async({page})=>{
 test.setTimeout(150000);
 let quote:any;
 await page.route("**/api/tools/quote",async route=>{
  if(route.request().method()!=="POST")return route.fulfill({status:404,json:{}});
  const input=route.request().postDataJSON();quote=input;
  await route.fulfill({json:{
   id:"redact-mixed-scope-isolated",tool_id:"pdf-redact",quantity:input.quantity,
   unit_name:"page",amount_rmb:input.quantity,amount_usd:input.quantity,
   display_amount:input.quantity,display_currency:input.currency,currency:input.currency,
   expires_at:new Date(Date.now()+3600000).toISOString(),metadata:input.metadata
  }});
 });
 await page.route("**/api/tools/pay/**",route=>{
  if(route.request().method()!=="GET")return route.abort("blockedbyclient");
  return route.fulfill({json:{paid:true,quote:{
   tool_id:"pdf-redact",quantity:quote.quantity,metadata:quote.metadata
  }}});
 });
 const source=await PDFDocument.create();
 for(let n=0;n<2;n++){
  const sheet=source.addPage([400,600]);
  sheet.drawRectangle({x:0,y:0,width:400,height:600,color:rgb(1,1,1)});
  sheet.drawText("PRIVATE SOURCE "+n,{x:100,y:130,size:12});
 }
 await page.goto("/tools/pdf-redact?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled();
 await input.setInputFiles({name:"source.pdf",mimeType:"application/pdf",buffer:Buffer.from(await source.save())});
 await expect(img(page)).toBeVisible();
 // First mask affects page 1 only. The second affects every page.
 await draw(page,.1,.2,.2,.14);
 await mode(page).selectOption("all");
 await draw(page,.6,.5,.2,.14);
 await expect(page.locator("[data-redaction-box]")).toHaveCount(2);
 await mode(page).selectOption("one");
 await expect(page.locator("[data-redaction-box]")).toHaveCount(2);
 await page.getByRole("spinbutton",{name:"Page",exact:true}).fill("2");
 await expect(img(page)).toBeVisible();
 await expect(page.locator("[data-redaction-box]")).toHaveCount(1);
 await page.getByRole("spinbutton",{name:"Page",exact:true}).fill("1");
 await expect(img(page)).toBeVisible();
 await expect(page.locator("[data-redaction-box]")).toHaveCount(2);

 await page.getByRole("button",{name:"Create safely redacted PDF",exact:true}).click();
 await expect(page.getByRole("button",{name:"Confirm & pay",exact:true})).toBeVisible();
 expect(quote.quantity).toBe(2);
 expect(quote.metadata.regions).toBe(2);
 await page.evaluate(()=>window.dispatchEvent(new Event("pageshow")));
 const save=page.getByRole("button",{name:"Save file",exact:true});
 await expect(save).toBeVisible({timeout:60000});
 const pending=page.waitForEvent("download");
 await save.click();
 const downloaded=await pending;
 const bytes=await readFile((await downloaded.path())!);
 const result=await PDFDocument.load(bytes,{updateMetadata:false});
 expect(result.getPageCount()).toBe(2);
 for(const sheet of result.getPages()){
  const images=sheet.node.Resources()?.lookup(PDFName.of("XObject"),PDFDict);
  expect(images?.keys()).toHaveLength(1);
 }
 // Reopen the actual downloaded output in the PDF viewer, not the redaction editor overlay.
 await input.setInputFiles({name:"redacted.pdf",mimeType:"application/pdf",buffer:bytes});
 await expect(img(page)).toBeVisible({timeout:45000});
 expect((await colorAt(page,.2,.26)).every(x=>x<15)).toBe(true);
 expect((await colorAt(page,.7,.56)).every(x=>x<15)).toBe(true);
 expect((await colorAt(page,.48,.1)).every(x=>x>240)).toBe(true);
 const previousPageImage=await img(page).getAttribute("src");
 await page.getByRole("spinbutton",{name:"Page",exact:true}).fill("2");
 // The page field updates before PDF.js has rendered the newly selected page.
 // Pixel checks must wait for the new blob image, not just visibility of the old one.
 await expect(img(page)).not.toHaveAttribute("src",previousPageImage||"",{timeout:45000});
 await img(page).evaluate(async node=>{const picture=node as HTMLImageElement;if(!picture.complete)await picture.decode()});
 expect((await colorAt(page,.2,.26)).every(x=>x>240)).toBe(true);
 expect((await colorAt(page,.7,.56)).every(x=>x<15)).toBe(true);
});