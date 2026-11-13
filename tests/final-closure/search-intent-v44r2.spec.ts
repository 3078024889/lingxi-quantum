import {test,expect} from './export-test';

const cases=[
 ['我要压缩PDF','/tools/pdf-compress'],
 ['I need to compress a PDF','/tools/pdf-compress'],
 ['PDFを圧縮したい','/tools/pdf-compress'],
 ['PDF 압축하고 싶어요','/tools/pdf-compress'],
 ['je veux compresser un PDF','/tools/pdf-compress'],
 ['ich möchte PDF komprimieren','/tools/pdf-compress'],
 ['quiero comprimir un PDF','/tools/pdf-compress'],
 ['quero compactar PDF','/tools/pdf-compress'],
 ['أريد ضغط PDF','/tools/pdf-compress'],
] as const;

for(const [query,href] of cases){
 test(`V44R2 tools search: ${query}`,async({page})=>{
  await page.goto(`/tools?q=${encodeURIComponent(query)}`);
  await expect(page.locator('.lx11-tool-searchbox input')).toHaveValue(query);
  await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
 });
}

test('V44R2 homepage opens a high-confidence PDF intent directly, without leaking the phrase',async({page})=>{
 await page.goto('/');
 await page.locator('.lx11-prompt textarea').fill('quiero comprimir un PDF');
 await page.locator('.lx11-prompt button').click();
 await expect(page).toHaveURL(/\/tools\/pdf-compress\?lang=(zh|en|ja|ko|fr|de|es|pt|ar)$/);
 expect(page.url()).not.toContain('quiero');
 await expect(page.locator('h1').first()).toBeVisible();
});

test('V44R2 homepage retains the query when a broad tool task still needs filtering',async({page})=>{
 await page.goto('/');
 await page.locator('.lx11-prompt textarea').fill('quiero editar PDF');
 await page.locator('.lx11-prompt button').click();
 await expect(page).toHaveURL(/\/tools\?q=/);
 await expect(page.locator('.lx11-tool-searchbox input')).toHaveValue('quiero editar PDF');
});
