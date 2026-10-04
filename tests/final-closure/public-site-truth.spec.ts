import {test,expect} from 'playwright/test';
const locales=['zh','en','ja','ko','fr','de','es','pt','ar'] as const;
const ask=["问问 SASI","Ask SASI","SASIに質問","SASI에 질문","Demandez à SASI","SASI fragen","Pregunta a SASI","Pergunte ao SASI","اسأل SASI"];
const release=['版本与更新','Release notes','更新情報','업데이트','Mises à jour','Aktualisierungen','Actualizaciones','Atualizações','التحديثات'];
for(const [i,locale]of locales.entries())test('public copy and controls '+locale,async({page})=>{
 await page.goto('/?lang='+locale);
 const footer=page.locator('footer');
 await expect(footer.locator('a[href="/release"]')).toHaveText(release[i]);
 await expect(footer).not.toContainText(/生态|Intelligent Ecosystem|Ecossistema inteligente|Ecosistema inteligente|AI短剧|short drama|minidrama|Mini-séries IA|Kurzdramen/);
 await expect(page.locator('main textarea')).toHaveAttribute('aria-label',/./);
 await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale!=='zh'){
  await page.goto('/'+locale);
  const description=await page.locator('meta[name="description"]').getAttribute('content');
  expect(description).not.toMatch(/not finished|not a membership|ecossistema|Ecosistema|智能生态/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://lingxifield.com/'+locale);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(10);
 }
});
test('wallet stays out of search and sitemap',async({page})=>{
 const response=await page.goto('/sasi/pricing');
 expect(response?.headers()['x-robots-tag']).toContain('noindex');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 const sitemap=await page.request.get('/sitemap.xml');expect(sitemap.ok()).toBe(true);expect(await sitemap.text()).not.toContain('/sasi/pricing');
});

for(const [i,locale]of locales.entries())test('SASI input uses '+locale,async({page})=>{
 await page.goto('/sasi?mode=drama&lang='+locale);
 await expect(page.getByPlaceholder(ask[i],{exact:true})).toBeVisible();
 await expect(page.locator('nav.lx-sasi-modebar-reference')).not.toHaveAttribute('aria-label','SASI modes');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
