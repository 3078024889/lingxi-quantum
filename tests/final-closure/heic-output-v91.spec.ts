import {test,expect} from './export-test';
import sharp from 'sharp';
import fs from 'node:fs/promises';
const fixture=process.env.HEIC_FIXTURE_PATH;
for(const slug of ['heic-local','heic-to-jpg'])test(`${slug} converts a real HEIC fixture into a decodable JPEG`,async({page})=>{
 test.skip(!fixture,'Set HEIC_FIXTURE_PATH to a local authorized HEIC sample.');test.setTimeout(90000);
 await page.route('**/api/tools/quote',route=>route.abort());await page.goto(`/tools/${slug}?lang=en`);const area=page.locator('[data-tool-workbench]');const input=area.locator('input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:'real-example.heic',mimeType:'image/heic',buffer:await fs.readFile(fixture!)});await area.locator('button:visible:enabled').filter({hasNotText:/^(Remove|Clear|Choose file)$/}).last().click();const save=page.getByRole('button',{name:'Save file',exact:true}).first();await expect(save).toBeVisible({timeout:60000});const waiting=page.waitForEvent('download');await save.click();const file=await waiting;expect(file.suggestedFilename()).toMatch(/\.jpe?g$/i);const metadata=await sharp(await fs.readFile((await file.path())!)).metadata();expect(metadata.format).toBe('jpeg');expect(metadata.width).toBeGreaterThan(100);expect(metadata.height).toBeGreaterThan(100);
});
