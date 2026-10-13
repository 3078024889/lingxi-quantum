import {test,expect} from 'playwright/test';
test('json-formatter preserves integer precision and duplicate keys through pretty/minify',async({page})=>{
 await page.goto('/tools/json-formatter?lang=en');
 const input=page.locator('textarea').first(),source='{"id":900719925474099312345,"id":-0,"amount":1.2300e+40,"text":"\\u4e2d"}';
 await input.fill(source);await page.getByRole('button',{name:'Pretty print',exact:true}).click();
 expect(await input.inputValue()).toContain('900719925474099312345');
 expect((await input.inputValue()).match(/"id"/g)).toHaveLength(2);
 await page.getByRole('button',{name:'Minify',exact:true}).click();await expect(input).toHaveValue(source);
});
test('json-formatter invalid input remains editable and recovery preserves values',async({page})=>{
 await page.goto('/tools/json-formatter?lang=en');const input=page.locator('textarea').first();
 await input.fill('{"broken":1,}');await page.getByRole('button',{name:'Pretty print',exact:true}).click();await expect(input).toHaveValue('{"broken":1,}');
 await input.fill('{"fixed":9007199254740993}');await page.getByRole('button',{name:'Minify',exact:true}).click();await expect(input).toHaveValue('{"fixed":9007199254740993}');
});
