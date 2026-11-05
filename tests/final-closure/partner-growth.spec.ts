import {test,expect} from "playwright/test";

test("partner network displays embeddable SIAI and QR tools without login",async({page})=>{
 await page.goto("/partners");
 await expect(page.locator("h1")).toBeVisible();
 const snippets=page.locator("textarea[readonly]");
 await expect(snippets.first()).toHaveValue(/lingxifield-v1\.js/);
 await expect(snippets.nth(1)).toHaveValue(/data-lx-widget="tools"/);
 await expect(page.locator('a[href="/siai/updates.xml"]')).toBeVisible();
 await expect(page.locator('main a[href="/siai"]').first()).toBeVisible();
 await expect(page.locator('main a[href="/downloads/lingxifield-siai-wordpress.zip"]')).toBeVisible();
 const installer=await page.request.get("/downloads/lingxifield-siai-wordpress.zip");
 expect(installer.ok()).toBeTruthy();
 expect(installer.headers()["content-type"]).toMatch(/zip|octet-stream/);
 const bytes=await installer.body();
 expect(bytes.subarray(0,2).toString("utf8")).toBe("PK");
 expect(bytes.length).toBeGreaterThan(1000);
 expect(bytes.length).toBeLessThan(300000);
});

test("external SIAI feed exports reviewed profiles and never source previews",async({request})=>{
 const r=await request.get("/api/public/siai-widget");
 expect(r.ok()).toBeTruthy();
 expect(r.headers()["access-control-allow-origin"]).toBe("*");
 const payload=await r.json();
 expect(payload.schemaVersion).toBe(1);
 expect(payload.total).toBeGreaterThan(0);
 expect(payload.total).toBe(payload.rows.length);
 expect(new Set(payload.rows.map((item:{id:string})=>item.id)).size).toBe(payload.rows.length);
 for(const row of payload.rows){
  expect(row).not.toHaveProperty("recordStatus");
  expect(row).toHaveProperty("name");
  expect(row).toHaveProperty("reviewedAt");
 }
});

test("QR generator rejects missing or unbounded text and emits only SVG",async({request})=>{
 const empty=await request.get("/api/public/qr-code");
 expect(empty.status()).toBe(400);
 const tooLong=await request.get("/api/public/qr-code?text="+encodeURIComponent("x".repeat(257)));
 expect(tooLong.status()).toBe(400);
 const ok=await request.get("/api/public/qr-code?text=https%3A%2F%2Fexample.com");
 expect(ok.ok()).toBeTruthy();
 expect(ok.headers()["content-type"]).toContain("image/svg+xml");
 const svg=await ok.text();
 expect(svg).toContain("<svg");
 expect(svg).not.toContain("<script");
});
