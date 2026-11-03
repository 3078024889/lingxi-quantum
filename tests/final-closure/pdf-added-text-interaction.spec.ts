import fs from "node:fs";
import {test,expect} from "./export-test";

test("PDF editor added text supports double-click editing and font-size control without payment",async({page})=>{
 test.setTimeout(90000);
 const response=await page.goto("/tools/pdf-editor?lang=en",{waitUntil:"domcontentloaded"});
 expect(response?.status()).toBe(200);
 const pdf=fs.readFileSync("tests/fixtures/generated/basic.pdf");
 const file=page.locator('input[type="file"]').first();
 await expect(file).toBeEnabled({timeout:15000});
 await file.setInputFiles({name:"demo.pdf",mimeType:"application/pdf",buffer:pdf});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 const input=page.getByPlaceholder("Text to add");
 await input.fill("Original new note");
 await page.getByRole("button",{name:"Add text",exact:true}).click();
 const overlay=page.locator("div.absolute.border-amber-400").filter({hasText:"Original new note"}).first();
 await expect(overlay).toBeVisible();
 await overlay.dblclick();
 const editing=page.getByRole("textbox",{name:"Edit added text"});
 await expect(editing).toBeVisible();
 await editing.fill("Updated text, 123");
 await editing.press("Enter");
 await expect(overlay).toContainText("Updated text, 123");
 const size=page.getByText("Font size").locator("input");
 await expect(size).toBeVisible();
 await size.fill("32");
 await size.blur();
 await expect(size).toHaveValue("32");
 // Editing a local overlay is possible before deciding whether to pay.
 await expect(page.getByTestId("paid-export-result")).toHaveCount(0);
});
