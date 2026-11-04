import {test,expect,type Page} from "./export-test";
import {PDFDocument} from "pdf-lib";
import {readFile} from "node:fs/promises";

async function tool(page:Page,mode:"crop"|"flatten",buffer:Buffer){
 await page.goto(`/tools/pdf-${mode}?lang=en`);
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 await input.setInputFiles({name:"source.pdf",mimeType:"application/pdf",buffer});
 const run=page.getByTestId(`pdf-${mode}-run`);
 await expect(run).toBeEnabled({timeout:15000});
 await run.click();
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download",{timeout:15000});
 await save.click();
 const download=await pending;
 return {filename:download.suggestedFilename(),bytes:await readFile((await download.path())!)};
}

test("PDF crop: real two-page export has the intended page crop boxes after independent reopen",async({page})=>{
 test.setTimeout(90000);
 const original=await PDFDocument.create();
 original.addPage([600,800]);
 original.addPage([400,300]);
 const result=await tool(page,"crop",Buffer.from(await original.save()));
 expect(result.filename).toBe("cropped-source.pdf");
 const reopened=await PDFDocument.load(result.bytes);
 expect(reopened.getPageCount()).toBe(2);
 const boxes=reopened.getPages().map(p=>p.getCropBox());
 expect(boxes[0]).toMatchObject({x:10,y:10,width:580,height:780});
 expect(boxes[1]).toMatchObject({x:10,y:10,width:380,height:280});
});

test("PDF flatten: real filled form becomes page content and fields cannot be edited after export",async({page})=>{
 test.setTimeout(90000);
 const original=await PDFDocument.create();
 const sheet=original.addPage([600,800]);
 const field=original.getForm().createTextField("customer");
 field.addToPage(sheet,{x:40,y:700,width:300,height:30});
 field.setText("Form value A-123");
 expect(original.getForm().getFields()).toHaveLength(1);
 const result=await tool(page,"flatten",Buffer.from(await original.save()));
 expect(result.filename).toBe("flattened-source.pdf");
 const reopened=await PDFDocument.load(result.bytes);
 expect(reopened.getPageCount()).toBe(1);
 expect(reopened.getForm().getFields()).toHaveLength(0);
});
