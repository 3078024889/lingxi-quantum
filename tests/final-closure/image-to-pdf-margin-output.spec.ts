import {test,expect,type Page} from "./export-test";
import {PDFDocument} from "pdf-lib";
import sharp from "sharp";
import {readFile} from "node:fs/promises";

async function download(page:Page) {
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:30000});
 const next=page.waitForEvent("download",{timeout:30000});
 await save.click();
 const data=await next;
 expect(data.suggestedFilename()).toBe("lingxifield-images.pdf");
 const bytes=await readFile((await data.path())!);
 return PDFDocument.load(bytes);
}

test("Image-to-PDF: original-size pages retain exact margins and image order after actual download",async({page})=>{
 test.setTimeout(90000);
 const landscape=await sharp({create:{width:120,height:80,channels:3,background:"#ff0000"}}).png().toBuffer();
 const portrait=await sharp({create:{width:40,height:100,channels:3,background:"#0000ff"}}).jpeg().toBuffer();
 await page.goto("/tools/image-to-pdf?lang=en");
 const picker=page.locator('input[type="file"]').first();
 await expect(picker).toBeEnabled({timeout:15000});
 await picker.setInputFiles([
  {name:"landscape.png",mimeType:"image/png",buffer:landscape},
  {name:"portrait.jpg",mimeType:"image/jpeg",buffer:portrait}
 ]);
 await expect(page.getByText("1. landscape.png")).toBeVisible();
 await page.getByRole("button",{name:"Create PDF",exact:true}).click();
 const first=await download(page);
 expect(first.getPageCount()).toBe(2);
 // The default small margin is 18 PDF points on all four edges.
 expect(first.getPages().map(p=>p.getSize())).toEqual([{width:156,height:116},{width:76,height:136}]);

 // Changing page options must invalidate the old download instead of offering stale output.
 await page.getByRole("combobox",{name:"Margin",exact:true}).selectOption("big");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Up",exact:true}).last().click();
 await expect(page.getByText("1. portrait.jpg")).toBeVisible();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Create PDF",exact:true}).click();
 const second=await download(page);
 // Big = 36pt; page sequence changed as requested.
 expect(second.getPages().map(p=>p.getSize())).toEqual([{width:112,height:172},{width:192,height:152}]);
});

test("Image-to-PDF desktop drag-and-drop reorders output pages without image re-encoding",async({page,isMobile})=>{
 test.skip(isMobile,"Mobile users can reorder using the up/down controls");
 test.setTimeout(90000);
 const first=await sharp({create:{width:90,height:45,channels:3,background:"#cc2200"}}).png().toBuffer();
 const second=await sharp({create:{width:35,height:95,channels:3,background:"#0022cc"}}).jpeg().toBuffer();
 await page.goto("/tools/image-to-pdf?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles([
  {name:"wide.png",mimeType:"image/png",buffer:first},
  {name:"tall.jpg",mimeType:"image/jpeg",buffer:second}
 ]);
 const rows=page.getByTestId("image-to-pdf-sort-item");
 await expect(rows).toHaveCount(2);
 await rows.nth(1).dragTo(rows.nth(0));
 await expect(page.getByText("1. tall.jpg")).toBeVisible();
 await page.getByRole("button",{name:"Create PDF",exact:true}).click();
 const pdf=await download(page);
 expect(pdf.getPages().map(p=>p.getSize())).toEqual([
  {width:71,height:131},
  {width:126,height:81}
 ]);
});
