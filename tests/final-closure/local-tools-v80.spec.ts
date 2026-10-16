import {test,expect} from './export-test';
test('text-counter counts actual Unicode input and displays English result labels',async({page})=>{
 await page.goto('/tools/text-counter?lang=en');await page.getByRole('textbox',{name:'Input text',exact:true}).fill('汉字 🌍\nhello');await page.getByRole('button',{name:'Start processing',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Result',exact:true})).toHaveValue('Characters (including whitespace): 10\nCharacters (excluding whitespace): 8\nHan characters: 2\nEnglish words: 1\nLines: 2\nUTF-8 bytes: 17');
});
test('case-converter switches formats without losing the editable input',async({page})=>{
 await page.goto('/tools/case-converter?lang=en');const input=page.locator('textarea:not([readonly])');await input.fill('hello_world');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveValue('helloWorld');
 const format=page.locator('select').filter({has:page.locator('option[value="snake"]')});await format.selectOption('kebab');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveValue('hello-world');await expect(input).toHaveValue('hello_world');
});
