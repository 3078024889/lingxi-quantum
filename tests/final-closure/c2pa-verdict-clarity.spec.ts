import {test,expect} from "playwright/test";

test("unsigned image explains that no credential is not proof of AI origin",async({page})=>{
 const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rfoAAAAASUVORK5CYII=","base64");
 await page.goto("/tools/ai-image-check");
 await page.locator('input[type="file"]').setInputFiles({name:"no-manifest.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:"开始检查"}).click();
 const result=page.locator('[data-c2pa-verification="absent"]');
 await expect(result).toBeVisible({timeout:60000});
 await expect(result).toContainText("当前文件未检测到内嵌 C2PA 凭证");
 await expect(result).toContainText("原文件可能从未签名");
 await expect(result).toContainText("AI 模型分数是另一项独立分析");
 await expect(page.getByText("AI 模型生成特征：请查看下方参考分析")).toBeVisible();
});
