import {test,expect} from 'playwright/test';
import {quoteDisplay} from '../../lib/tools/commerce/quote-display';
import {deliveryText} from '../../lib/tools/commerce/delivery-copy';

test('quote display accepts both API contracts and never displays NaN',()=>{
 expect(quoteDisplay({currency:'CNY',amountRmb:1.9}).text).toBe('¥1.90');
 expect(quoteDisplay({display_currency:'USD',amount_usd:1.49}).text).toBe('$1.49');
 expect(quoteDisplay({display_amount:null,amount_rmb:4.9}).text).toBe('¥4.90');
 for(const value of [undefined,null,'',NaN,Infinity,-2,'invalid'])expect(quoteDisplay({display_amount:value}).text).toBe('');
});

for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
 test(`share ${lang}: private parameters removed, language preserved, modal fits`,async({page})=>{
  await page.goto(`/tools/e-sign-pdf?lang=${lang}&resumeQuote=private-test&resumeDraft=private-test`,{waitUntil:'domcontentloaded'});
  const open=page.locator('button').filter({hasText:/^↗ /});
  await expect(open).toHaveCount(1);
  await open.click();
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  await expect(dialog.locator('input[readonly]')).toHaveValue(new RegExp(`/tools/e-sign-pdf\\?lang=${lang}$`));
  await expect(dialog).toContainText(deliveryText(lang,'privateShare'));
  const box=await dialog.boundingBox();expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(page.viewportSize()!.width+1);
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
 });
}
