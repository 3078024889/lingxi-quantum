import {test,expect} from "./export-test";
import fs from "node:fs/promises";
import ExcelJS from "exceljs";

test("CSV to XLSX to CSV: UTF-8 BOM, Chinese, commas, quotes and multiline cells survive real downloads",async({page})=>{
 const csv="\uFEFF名称,备注,数量\r\n\"星河,银河\",\"第一行\n第二行\",7\r\n\"报价\"\"单\",正常,10\r\n";
 await page.goto("/tools/csv-to-xlsx?lang=en");
 let area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"数据.csv",mimeType:"text/csv",buffer:Buffer.from(csv,"utf8")});
 await area.getByRole("button",{name:"Process now"}).click();
 let actions=area.getByTestId("result-file-actions");
 await expect(actions).toBeVisible({timeout:30000});
 let waiting=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file"}).click();
 const xlsxDl=await waiting;expect(await xlsxDl.failure()).toBeNull();
 const xlsx=await fs.readFile((await xlsxDl.path())!);
 const workbook=new ExcelJS.Workbook();
 await workbook.xlsx.load(xlsx);
 const sheet=workbook.worksheets[0];expect(sheet).toBeDefined();
 expect(sheet.getCell("A1").value).toBe("名称");
 expect(sheet.getCell("A2").value).toBe("星河,银河");
 expect(sheet.getCell("B2").value).toBe("第一行\n第二行");
 expect(sheet.getCell("C2").value).toBe("7");
 expect(sheet.getCell("A3").value).toBe('报价"单');

 await page.goto("/tools/xlsx-to-csv?lang=en");
 area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"roundtrip.xlsx",mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:xlsx});
 await area.getByRole("button",{name:"Process now"}).click();
 actions=area.getByTestId("result-file-actions");
 await expect(actions).toBeVisible({timeout:30000});
 waiting=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file"}).click();
 const csvDl=await waiting;expect(await csvDl.failure()).toBeNull();
 const restored=(await fs.readFile((await csvDl.path())!)).toString("utf8");
 expect(restored.startsWith("\uFEFF")).toBe(true);
 expect(restored.slice(1).trim()).toBe(csv.slice(1).trim());
});

test("Malformed CSV: an unterminated quoted field fails without producing an XLSX",async({page})=>{
 await page.goto("/tools/csv-to-xlsx?lang=en");
 const area=page.locator("[data-tool-workbench]");
 const broken=Buffer.from('title,body\r\n"unfinished quote\r\ncontinued','utf8');
 await area.locator('input[type="file"]').first().setInputFiles({name:"invalid.csv",mimeType:"text/csv",buffer:broken});
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area).toContainText("The file could not be processed this time");
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
});
