import{test,expect}from"playwright/test";
const routes=["/tools/e-sign-pdf","/tools/pdf-editor","/tools/pdf-ocr","/tools/pdf-redact","/tools/pdf-pages","/tools/pdf-compress","/tools/pdf-merge-split","/tools/pdf-to-jpg"];
for(const route of routes)test(`${route} exposes unified document intake`,async({page})=>{
 await page.goto(route);
 const input=page.locator('input[type="file"]').first();
 await expect(input).toHaveAttribute("accept",/\.docx/);
 await expect(input).toHaveAttribute("accept",/\.pptx/);
 await expect(input).toHaveAttribute("accept",/\.xlsx/);
});
test("document capabilities advertise supported families even when live conversion is unavailable",async({request})=>{
 const r=await request.get("/api/tools/document/capabilities");
 expect(r.ok()).toBeTruthy();
 const j=await r.json();
 expect(j.officeSupported).toBe(true);
 for(const x of["doc","docx","ppt","pptx","xls","xlsx","odt","ods","odp"])expect(j.formats).toContain(x);
});
