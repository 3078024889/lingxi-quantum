import {test,expect} from "playwright/test";
import {PDFDocument,rgb} from "pdf-lib";

async function makePdf(pageCount:number){
  const pdf=await PDFDocument.create();
  for(let i=1;i<=pageCount;i++){
    const p=pdf.addPage([595.28,841.89]);
    p.drawRectangle({x:40,y:760,width:120,height:24,color:rgb(.92,.92,.92)});
  }
  return Buffer.from(await pdf.save());
}

const stampSvg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><rect width="420" height="220" fill="white"/><ellipse cx="210" cy="110" rx="80" ry="80" fill="none" stroke="#c00" stroke-width="12"/><path d="M105 135 C180 55 235 165 315 85" fill="none" stroke="#111" stroke-width="8"/></svg>`);

async function uploadPdf(page:any,count=9){
  const input=page.locator('input[type="file"][accept*="pdf"]').first();
  await expect(input).toBeEnabled();
  await input.setInputFiles({name:`${count}-pages.pdf`,mimeType:"application/pdf",buffer:await makePdf(count)});
  await expect(page.getByTestId("pdf-source-page-count")).toContainText(new RegExp(`${count}\\s*(页|pages)`,"i"),{timeout:15000});
}

test.describe("document engine real browser inputs",()=>{
  test("page input supports clear and retype without forced 1",async({page})=>{
    await page.goto("/tools/pdf-editor",{waitUntil:"domcontentloaded"});
    await uploadPdf(page,9);
    const pageNumber=page.getByTestId("pdf-page-number-input");
    await expect(pageNumber).toBeVisible();
    await pageNumber.fill("");
    await expect(pageNumber).toHaveValue("");
    await pageNumber.fill("9");
    await pageNumber.press("Enter");
    await expect(pageNumber).toHaveValue("9");
  });

  test("invalid export range is fail-closed and cannot quote",async({page})=>{
    let quoteCalls=0;
    await page.route("**/api/tools/quote",async route=>{quoteCalls++;await route.fulfill({status:500,json:{error:"SHOULD_NOT_BE_CALLED"}})});
    await page.goto("/tools/pdf-editor",{waitUntil:"domcontentloaded"});
    await uploadPdf(page,9);
    const range=page.getByTestId("pdf-export-range-input");
    await expect(range).toBeVisible();
    await range.fill("1-a");
    await expect(page.getByText(/页码范围无效|Invalid page range/i)).toBeVisible();
    const exportButton=page.getByRole("button",{name:/确认价格并导出|Confirm price/i});
    await expect(exportButton).toBeDisabled();
    expect(quoteCalls).toBe(0);
  });

  test("quote quantity follows export plan exactly",async({page})=>{
    const quantities:number[]=[];
    await page.route("**/api/tools/quote",async route=>{
      const body=route.request().postDataJSON();quantities.push(Number(body.quantity));
      await route.fulfill({status:200,json:{id:"11111111-1111-4111-8111-111111111111",quantity:Number(body.quantity),amount_rmb:1.9,amount_usd:0.49,currency:"CNY",display_currency:"CNY",display_amount:1.9,expires_at:new Date(Date.now()+600000).toISOString()}});
    });
    await page.goto("/tools/pdf-editor",{waitUntil:"domcontentloaded"});
    await uploadPdf(page,9);
    const range=page.getByTestId("pdf-export-range-input");
    await expect(range).toBeVisible();
    await range.fill("1-3");
    await expect(page.getByTestId("pdf-export-plan-summary")).toHaveText(/本次导出\s*3\s*页|export\s*3\s*pages/i);
    const exportButton=page.getByRole("button",{name:/确认价格并导出|Confirm price/i});
    await exportButton.click();
    await page.waitForTimeout(150);
    expect(quantities).toEqual([3]);
  });

  test("nine-page seam stamp creates nine page assignments",async({page})=>{
    await page.goto("/tools/e-sign-pdf",{waitUntil:"domcontentloaded"});
    await uploadPdf(page,9);
    const imageInputs=page.locator('input[type="file"][accept="image/*"]');
    await imageInputs.nth(1).setInputFiles({name:"stamp.svg",mimeType:"image/svg+xml",buffer:stampSvg});
    await page.getByRole("button",{name:/按选择页切分盖章|Slice across selected pages/i}).click();
    await expect(page.getByText(/已应用到\s*9|Applied to\s*9/i)).toBeVisible();
  });

  test("document copy exposes three tones and optional purpose text",async({page})=>{
    await page.goto("/tools/document-copy-layout",{waitUntil:"domcontentloaded"});
    await expect(page.getByTestId("document-copy-tone-bw")).toBeChecked();
    await expect(page.getByTestId("document-copy-tone-gray")).not.toBeChecked();
    await expect(page.getByTestId("document-copy-tone-color")).not.toBeChecked();
    const check=page.getByTestId("document-copy-purpose-toggle");
    await expect(check).not.toBeChecked();
  });
});
