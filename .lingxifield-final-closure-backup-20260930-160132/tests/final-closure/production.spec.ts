import { test, expect } from "playwright/test";

const origins = [
  "https://lingxifield.com",
  "https://lingxifield.cn",
];

const publicRoutes = ["/", "/tools", "/sasi", "/products", "/about", "/privacy", "/terms"];

for (const origin of origins) {
  test.describe(`production ${origin}`, () => {
    for (const route of publicRoutes) {
      test(`${route} renders`, async ({ page }) => {
        const response = await page.goto(origin + route, { waitUntil: "domcontentloaded" });
        expect(response).not.toBeNull();
        expect(response!.status()).toBeLessThan(500);
        await expect(page.locator("body")).toBeVisible();
        const text = await page.locator("body").innerText();
        expect(text).not.toMatch(/Internal Server Error/i);
        expect(text).not.toMatch(/潜意识重塑|场域精测|意识显化|一念显化|生命图谱/);
      });
    }
  });
}
