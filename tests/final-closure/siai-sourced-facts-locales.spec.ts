import {test,expect} from './export-test';

test('localized SIAI rows preserve sourced candidate facts instead of hiding them',async({page})=>{
 await page.goto('/siai?lang=zh');
 const row=()=>page.locator('.siai-home-table tbody tr').filter({hasText:'Adobe Firefly'}).first();
 await expect(row()).toBeVisible();
 const sourcePrice=await row().locator('td').nth(4).locator('span[title]').getAttribute('title');
 expect(sourcePrice).toBeTruthy();
 expect(sourcePrice).not.toBe('尚无可靠资料');
 expect(sourcePrice).not.toBe('查看官方产品资料');
 for(const locale of ['en','ja','ar']){
  await page.goto('/'+locale+'/siai');
  await expect(row()).toBeVisible();
  const translated=await row().locator('td').nth(4).locator('span[title]').getAttribute('title');
  expect(translated).toContain(sourcePrice);
  expect(translated).not.toBe('See the official product details');
  if(locale==='ar')await expect(page.locator('#siai-market')).toHaveAttribute('dir','rtl');
 }
});
