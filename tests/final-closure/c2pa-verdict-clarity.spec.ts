import {test,expect} from "playwright/test";

test("unsigned image explains that no credential is not proof of AI origin",async({page})=>{
 const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rfoAAAAASUVORK5CYII=","base64");
 await page.goto("/tools/ai-image-check");
 await page.locator('input[type="file"]').setInputFiles({name:"no-manifest.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:"开始检查"}).click();
 const result=page.locator('[data-c2pa-verification="absent"]');
 await expect(result).toBeVisible({timeout:60000});
 await expect(result).toContainText("这份文件没有可读取的来源签名");
 await expect(result).toContainText("原文件可能没有签名");
 await expect(result).toContainText("不能单独判断是否由 AI 生成");
 await expect(page.getByText("内容特征分析（仅供参考）")).toBeVisible();
});

test("media origin displays human-readable result without internal verification terminology",async({page})=>{
 const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rfoAAAAASUVORK5CYII=","base64");
 await page.goto("/tools/ai-image-check");
 await page.locator('input[type="file"]').setInputFiles({name:"unsigned.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:"开始检查"}).click();
 const result=page.locator('[data-c2pa-verification="absent"]');
 await expect(result).toBeVisible({timeout:60000});
 await expect(result).toContainText("文件来源与签名");
 await expect(result).not.toContainText("Manifest");
 await expect(result).not.toContainText("validation_state");
 await expect(page.getByText("内容特征分析（仅供参考）")).toBeVisible();
});
