import {test,expect} from './export-test';

test('integer base conversion preserves values beyond floating point precision and rejects invalid digits',async({page})=>{
 await page.goto('/tools/number-base-converter?lang=en');const input=page.getByPlaceholder('255');await input.fill('9007199254740993');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveValue('20000000000001');
 await page.getByRole('spinbutton').first().fill('16');await page.getByRole('spinbutton').last().fill('10');await input.fill('20000000000001');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveValue('9007199254740993');
 await page.getByRole('spinbutton').first().fill('2');await input.fill('102');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveCount(0);await expect(page.getByText('Could not parse the input. Check the format.')).toBeVisible();
});

test('CSV converts quoted Unicode multiline fields and rejects records that would lose data',async({page})=>{
 await page.goto('/tools/csv-json?lang=en');const input=page.getByPlaceholder('Paste or type here');await input.fill('name,note\n灵犀场,"first\nsecond, ""quoted"""');await page.getByRole('button',{name:'Run',exact:true}).click();const output=await page.locator('textarea[readonly]').inputValue();expect(JSON.parse(output)).toEqual([{name:'灵犀场',note:'first\nsecond, "quoted"'}]);
 for(const invalid of ['name,name\none,two','name,note\none','name,note\none,"unterminated']){await input.fill(invalid);await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveCount(0);await expect(page.getByText('Could not parse the input. Check the format.')).toBeVisible()}
});

test('URL parser retains Unicode query values and fragment',async({page})=>{
 await page.goto('/tools/url-parser?lang=en');await page.getByPlaceholder('https://example.com/path?a=1').fill('https://example.com:8443/path?name=%E7%81%B5%E7%8A%80%E5%9C%BA&item=1#part');await page.getByRole('button',{name:'Run',exact:true}).click();expect(JSON.parse(await page.locator('textarea[readonly]').inputValue())).toMatchObject({protocol:'https:',hostname:'example.com',port:'8443',pathname:'/path',search:{name:'灵犀场',item:'1'},hash:'#part'});
});

test('JWT decoder displays Unicode claims as text without executing them',async({page})=>{
 const header=Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url'),payload=Buffer.from(JSON.stringify({name:'灵犀场',html:'<script>window.injected=true</script>'})).toString('base64url');await page.goto('/tools/jwt-decoder?lang=en');await page.getByPlaceholder('eyJ...').fill(`${header}.${payload}.`);await page.getByRole('button',{name:'Run',exact:true}).click();expect(JSON.parse(await page.locator('textarea[readonly]').inputValue()).payload.name).toBe('灵犀场');expect(await page.evaluate(()=>Object.hasOwn(window,'injected'))).toBe(false);
});
