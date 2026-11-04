import {test,expect} from "./export-test";
import {PDFDocument,rgb} from "pdf-lib";
import JSZip from "jszip";
import sharp from "sharp";
import {readFile} from "node:fs/promises";

test("PDF-to-image waits for user to save, preserves ZIP pages and invalidates outdated output",async({page})=>{
 test.setTimeout(120000);
 let spontaneousDownloads=0;
 page.on("download",()=>spontaneousDownloads++);
 const input=await PDFDocument.create();
 input.addPage([120,160]).drawRectangle({x:0,y:0,width:120,height:160,color:rgb(1,0,0)});
 input.addPage([180,100]).drawRectangle({x:0,y:0,width:180,height:100,color:rgb(0,0,1)});
 await page.goto("/tools/pdf-to-jpg?lang=en");
 const file=page.locator('input[type="file"]').first();
 await file.setInputFiles({name:"pages.pdf",mimeType:"application/pdf",buffer:Buffer.from(await input.save())});
 await expect(page.getByRole("button",{name:"Convert",exact:true})).toBeEnabled({timeout:15000});
 await page.getByRole("textbox",{name:"Pages",exact:true}).fill("2");
 await page.getByRole("combobox",{name:"Format",exact:true}).selectOption("png");
 await expect(page.getByRole("combobox",{name:"JPG quality",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Convert",exact:true}).click();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toBeVisible({timeout:30000});
 expect(spontaneousDownloads).toBe(0);
 await page.getByRole("combobox",{name:"Resolution",exact:true}).selectOption("2");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Convert",exact:true}).click();
 const pending=page.waitForEvent("download");
 await page.getByRole("button",{name:"Save file",exact:true}).click();
 const saved=await pending;
 const zip=await JSZip.loadAsync(await readFile((await saved.path())!));
 const names=Object.keys(zip.files).filter(x=>!zip.files[x].dir);
 expect(names).toEqual(["page-002.png"]);
 const meta=await sharp(await zip.file(names[0])!.async("nodebuffer")).metadata();
 expect([meta.format,meta.width,meta.height]).toEqual(["png",360,200]);
 await page.getByRole("textbox",{name:"Pages",exact:true}).fill("2-foo");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Convert",exact:true}).click();
 await expect(page.locator("[data-tool-workbench] p[role=alert]")).toContainText("Invalid page range");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("PDF-to-image translates page tools across all nine supported languages",async({page})=>{
 const cases=[
 ["zh","生成图片","页码"],["en","Convert","Pages"],["ja","画像を作成","ページ"],
 ["ko","이미지 생성","페이지"],["fr","Convertir","Pages"],["de","Umwandeln","Seiten"],
 ["es","Convertir","Páginas"],["pt","Converter","Páginas"],["ar","تحويل","الصفحات"]
 ];
 for(const [lang,action,pages] of cases){
  await page.goto("/tools/pdf-to-jpg?lang="+lang);
  await expect(page.getByRole("button",{name:action,exact:true})).toBeVisible({timeout:15000});
  await expect(page.getByRole("textbox",{name:pages,exact:true})).toBeVisible();
 }
});
