import {test,expect} from "playwright/test";
import {PDFDocument} from "pdf-lib";

test("PDF-to-image paid export never initiates download when free quota is exceeded",async({page})=>{
 test.setTimeout(90000);
 let requests=0,downloads=0;
 page.on("download",()=>downloads++);
 await page.route("**/api/tools/free-export",r=>{
  requests++;const body=r.request().postDataJSON();
  expect(body.toolId).toBe("pdf-to-jpg");
  expect(body.units).toBe(2);
  return r.fulfill({status:402,json:{id:body.id,allowed:false,paidUnits:2,freeUnits:0,loginRequired:false}});
 });
 const doc=await PDFDocument.create();doc.addPage([140,160]);doc.addPage([160,140]);
 await page.goto("/tools/pdf-to-jpg?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"metered.pdf",mimeType:"application/pdf",buffer:Buffer.from(await doc.save())});
 await expect(page.getByRole("button",{name:"Convert",exact:true})).toBeEnabled({timeout:15000});
 await page.getByRole("button",{name:"Convert",exact:true}).click();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toBeVisible({timeout:25000});
 expect(downloads).toBe(0);expect(requests).toBe(0);
 await page.getByRole("button",{name:"Save file",exact:true}).click();
 const dlg=page.getByRole("dialog");
 await expect(dlg).toBeVisible({timeout:12000});
 await expect(dlg).toContainText("free allowance is used");
 expect(requests).toBe(1);expect(downloads).toBe(0);
});
