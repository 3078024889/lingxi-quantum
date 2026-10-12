import {test,expect} from 'playwright/test';

test('current SASI launcher selects capabilities without uploading a file',async({page})=>{
 await page.goto('/sasi?lang=en');
 await page.getByRole('textbox',{name:'Tell SASI what you want to do…',exact:true}).fill('Build a website for my bakery');
 await page.getByRole('button',{name:'Add',exact:true}).click();
 await page.getByRole('button',{name:/Add capabilities when needed/}).click();
 const choices=page.getByRole('checkbox');
 await expect(choices.first()).toBeVisible();
 await choices.first().check();
 await expect(choices.first()).toBeChecked();
 await expect(page.getByText('Add capabilities when needed · 1',{exact:true})).toBeVisible();
 await choices.first().uncheck();
 await expect(choices.first()).not.toBeChecked();
 await expect(page.getByText('Add capabilities when needed · 1',{exact:true})).toHaveCount(0);
});
