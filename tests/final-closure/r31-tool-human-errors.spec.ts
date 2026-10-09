import {test,expect} from "playwright/test";
test("image conversion failure is understandable, without browser exception terms",async({page})=>{
 await page.goto("/tools/png-to-jpg?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"broken.png",mimeType:"image/png",buffer:Buffer.from("not a PNG")});
 await page.getByRole("button",{name:/^Convert/}).click();
 const alert=page.locator('[role="alert"]:not(#__next-route-announcer__)');
 await expect(alert).toContainText("Image conversion did not finish");
 await expect(alert).not.toContainText(/InvalidStateError|decode|stack|TypeError|DOMException/i);
});
test("PDF bad page range is explained, not exposed as an exception",async({page})=>{
 await page.goto("/tools/pdf-merge-split?lang=en");
 const fs=await import("node:fs");
 const pdf=fs.readFileSync("tests/fixtures/generated/basic.pdf");
 await page.locator('input[type="file"]').first().setInputFiles({name:"book.pdf",mimeType:"application/pdf",buffer:pdf});
 await page.getByPlaceholder("1-3,5,8-10").fill("999999");
 await page.getByRole("button",{name:"Extract pages"}).click();
 await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText("Enter valid pages");
 await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).not.toContainText(/TypeError|DOMException|PDFDocument/i);
});
