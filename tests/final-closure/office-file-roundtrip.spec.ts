import {test,expect,type Page} from "./export-test";
import {readFile} from "node:fs/promises";
import JSZip from "jszip";
const sheetMime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
async function runFile(page:Page,slug:string,name:string,mime:string,input:Buffer){
 await page.goto("/tools/"+slug+"?lang=en");
 const picker=page.locator('[data-tool-workbench] input[type="file"]').first();
 await expect(picker).toBeEnabled({timeout:15000});
 await picker.setInputFiles({name,mimeType:mime,buffer:input});
 await page.getByRole("button",{name:"Process now",exact:true}).click();
 const result=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(result).toBeVisible({timeout:25000});
 const pending=page.waitForEvent("download",{timeout:20000});
 await result.click();
 const download=await pending;expect(await download.failure()).toBeNull();
 return {bytes:await readFile((await download.path())!),name:download.suggestedFilename()};
}
test("CSV unicode, escaped quotes and multiline cells survive actual XLSX output and CSV download",async({page})=>{
 const input="id,name,note\r\n1,小仙女,\"Stars, Moon\"\r\n2,星咕咕,\"line one\nline two\"\r\n3,\"A \"\"quote\"\"\",done\r\n";
 const first=await runFile(page,"csv-to-xlsx","celestial.csv","text/csv",Buffer.from(input,"utf8"));
 expect(first.name).toBe("celestial.xlsx");expect(first.bytes.subarray(0,2).toString()).toBe("PK");
 const archive=await JSZip.loadAsync(first.bytes,{checkCRC32:true});
 const xml=await archive.file("xl/worksheets/sheet1.xml")?.async("string");
 expect(xml).toBeTruthy();
 expect(xml).toContain("小仙女");expect(xml).toContain("Stars, Moon");
 expect(xml).toContain("line one\nline two");expect(xml).toContain("A &quot;quote&quot;");
 expect(xml).not.toContain("<f>");
 const again=await runFile(page,"xlsx-to-csv","celestial.xlsx",sheetMime,first.bytes);
 expect(again.name).toBe("celestial.csv");
 const recovered=again.bytes.toString("utf8").replace(/^\uFEFF/,"");
 expect(recovered).toBe(input.replace(/\r\n$/,""));
});
test("TSV with Chinese and quoted fields converts to a valid independently readable XLSX",async({page})=>{
 const input="名称\t含义\n宇宙\t\"银河 星星\"\n";
 const output=await runFile(page,"csv-to-xlsx","input.tsv","text/tab-separated-values",Buffer.from(input));
 expect(output.name).toBe("input.xlsx");
 const archive=await JSZip.loadAsync(output.bytes,{checkCRC32:true});
 const xml=await archive.file("xl/worksheets/sheet1.xml")?.async("string");
 expect(xml).toContain("宇宙");expect(xml).toContain("银河 星星");
});
test("broken XLSX returns an error instead of a fake downloadable CSV",async({page})=>{
 await page.goto("/tools/xlsx-to-csv?lang=en");
 await page.locator('[data-tool-workbench] input[type="file"]').first().setInputFiles({name:"corrupt.xlsx",mimeType:sheetMime,buffer:Buffer.from("NOT_A_ZIP_XLSX")});
 await page.getByRole("button",{name:"Process now",exact:true}).click();
 await expect(page.getByText("Could not finish this time",{exact:true})).toBeVisible({timeout:30000});
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});
