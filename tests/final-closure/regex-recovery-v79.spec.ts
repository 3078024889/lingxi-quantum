import {test,expect} from './export-test';

test('catastrophic regex times out without freezing the page and the next run succeeds',async({page})=>{
 await page.goto('/tools/regex-tester?lang=en');
 await page.locator('input[placeholder="/pattern/gi"]').fill('/(a+)+$/');
 await page.locator('textarea').first().fill('a'.repeat(10000)+'!');
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.locator('input[placeholder="/pattern/gi"]')).toBeDisabled();await expect(page.locator('textarea').first()).toBeDisabled();
 const responsive=await page.evaluate(()=>new Promise<number>(resolve=>setTimeout(()=>resolve(1),100)));
 expect(responsive).toBe(1);
 await expect(page.getByText('Matching took too long. Simplify the expression or use less text.',{exact:true})).toBeVisible({timeout:15000});
 await page.locator('input[placeholder="/pattern/gi"]').fill('/(你)/gu');await page.locator('textarea').first().fill('你好，你');
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.locator('textarea[readonly]')).toHaveValue(/"position": 3/);
 expect(JSON.parse(await page.locator('textarea[readonly]').inputValue())).toHaveLength(2);
});
test('excessively nested XML fails clearly instead of allocating huge indentation',async({page})=>{
 await page.goto('/tools/xml-formatter?lang=en');await page.locator('textarea').first().fill('<a>'.repeat(300)+'text'+'</a>'.repeat(300));await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.getByText('The input or results are too large. Use less text or narrow the pattern.',{exact:true})).toBeVisible();
 await page.locator('textarea').first().fill('<root><name>你好</name></root>');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveValue(/<name>你好<\/name>/);
});
