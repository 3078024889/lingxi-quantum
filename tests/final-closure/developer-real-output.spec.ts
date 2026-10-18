import {test,expect} from './export-test';

test('integer base conversion preserves values beyond floating point precision and rejects invalid digits',async({page})=>{
 await page.goto('/tools/number-base-converter?lang=en');const input=page.getByPlaceholder('255');await input.fill('9007199254740993');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveValue('20000000000001');
 await page.getByRole('spinbutton').first().fill('16');await expect(page.locator('textarea[readonly]')).toHaveCount(0);await page.getByRole('spinbutton').last().fill('10');await input.fill('20000000000001');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('textarea[readonly]')).toHaveValue('9007199254740993');
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

test('XML edits clear previous output and parsing errors before the next result',async({page})=>{
 await page.goto('/tools/xml-formatter?lang=en');const input=page.locator('textarea:not([readonly])'),run=page.getByRole('button',{name:'Run',exact:true});
 await input.fill('<root><name>你好</name></root>');await run.click();await expect(page.locator('textarea[readonly]')).toHaveValue(/<name>你好<\/name>/);
 await input.fill('<broken>');await expect(page.locator('textarea[readonly]')).toHaveCount(0);await run.click();await expect(page.getByText('Could not parse the input. Check the format.',{exact:true})).toBeVisible();
 await input.fill('<root/>');await expect(page.getByText('Could not parse the input. Check the format.',{exact:true})).toHaveCount(0);await run.click();await expect(page.locator('textarea[readonly]')).toHaveValue('<root/>');
});

test('URL parser preserves repeated parameters, their order and special property names',async({page})=>{
 await page.goto('/tools/url-parser?lang=en');await page.getByPlaceholder('https://example.com/path?a=1').fill('https://例子.测试:8443/path?tag=中文&empty=&tag=English&__proto__=safe&plus=a+b#锚点');await page.getByRole('button',{name:'Run',exact:true}).click();
 const out=JSON.parse(await page.locator('textarea[readonly]').inputValue());expect(out.search).toEqual({tag:['中文','English'],empty:'',['__proto__']:'safe',plus:'a b'});expect(Object.hasOwn(out.search,'__proto__')).toBe(true);
 expect(out.searchEntries).toEqual([['tag','中文'],['empty',''],['tag','English'],['__proto__','safe'],['plus','a b']]);expect(out.port).toBe('8443');expect(out.hostname).toBe('xn--fsqu00a.xn--0zwm56d');
});

for(const input of [
 '<p xml:space="preserve">甲<b>bold</b> <i>italic</i>乙</p>',
 '<p>甲<b>bold</b> <i>italic</i>乙</p>',
 '<root xml:space="preserve"><child>  x  </child> <child>y</child></root>',
 '<root>　<child>x</child>　</root>',
 '<root><![CDATA[ text <with> spaces ]]><child>x</child></root>',
])test(`XML formatter preserves mixed text/CDATA/explicit space: ${input.slice(0,45)}`,async({page})=>{
 await page.goto('/tools/xml-formatter?lang=en');await page.locator('textarea:not([readonly])').fill(input);await page.getByRole('button',{name:'Run',exact:true}).click();const output=await page.locator('textarea[readonly]').inputValue();
 const same=await page.evaluate(({input,output})=>{const parser=new DOMParser(),a=parser.parseFromString(input,'application/xml'),b=parser.parseFromString(output,'application/xml');return !b.querySelector('parsererror')&&a.documentElement.textContent===b.documentElement.textContent},{input,output});expect(same).toBe(true);
});

test('XML formatter still indents element-only regions and retains namespace and attributes',async({page})=>{
 await page.goto('/tools/xml-formatter?lang=en');await page.locator('textarea:not([readonly])').fill('<root xmlns="urn:example"><child value="a &gt; b"><leaf>你好</leaf></child></root>');await page.getByRole('button',{name:'Run',exact:true}).click();const output=await page.locator('textarea[readonly]').inputValue();expect(output).toContain('\n  <child');expect(output).toContain('\n    <leaf>你好</leaf>');
 expect(await page.evaluate(raw=>{const doc=new DOMParser().parseFromString(raw,'application/xml'),child=doc.getElementsByTagNameNS('urn:example','child')[0];return {namespace:doc.documentElement.namespaceURI,attribute:child.getAttribute('value')}},output)).toEqual({namespace:'urn:example',attribute:'a > b'});
});
