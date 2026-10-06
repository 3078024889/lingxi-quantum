import {test,expect} from 'playwright/test';
import {PUBLIC_FEATURE_COPY} from '../../lib/public-feature-copy';
const locales=['zh','en','ja','ko','fr','de','es','pt','ar'] as const;
const ask=["问问 SASI","Ask SASI","SASIに質問","SASI에 질문","Demandez à SASI","SASI fragen","Pregunta a SASI","Pergunte ao SASI","اسأل SASI"];
const release=['版本与更新','Release notes','更新情報','업데이트','Mises à jour','Aktualisierungen','Actualizaciones','Atualizações','التحديثات'];
for(const [i,locale]of locales.entries())test('public copy and controls '+locale,async({page})=>{
 await page.goto('/?lang='+locale);
 const footer=page.locator('footer');
 await expect(footer.locator('a[href="/release"]')).toHaveText(release[i]);
 await expect(footer).not.toContainText(/生态|Intelligent Ecosystem|Ecossistema inteligente|Ecosistema inteligente/);
 await expect(footer).toContainText(PUBLIC_FEATURE_COPY[locale].headline);
 await expect(footer).toContainText(PUBLIC_FEATURE_COPY[locale].freeTools);
 await expect(page.locator('main textarea')).toHaveAttribute('aria-label',/./);
 await expect(page.locator('.lx11-lang-label').first()).not.toContainText('/ Language');
 const cards=await page.locator('.lx11-home-card').evaluateAll(elements=>elements.map(card=>{const desc=card.querySelector('p')!.getBoundingClientRect(),action=card.querySelector('b')!.getBoundingClientRect(),bounds=card.getBoundingClientRect();return{descriptionBottom:desc.bottom,actionTop:action.top,actionBottom:action.bottom,cardBottom:bounds.bottom}}));
 expect(cards).toHaveLength(6);for(const card of cards){expect(card.actionTop).toBeGreaterThanOrEqual(card.descriptionBottom);expect(card.actionBottom).toBeLessThanOrEqual(card.cardBottom);}
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
 const toolbar=page.locator('[data-sasi-task-toolbar]');await expect(toolbar).toBeVisible();await expect(toolbar.getByRole('button')).toHaveCount(7);await expect(toolbar.locator('button[aria-pressed="true"]')).toHaveCount(1);await expect(toolbar.getByRole('link')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

const feedbackTitles=['告诉我们哪里没有按期待工作','Tell us what went wrong','困ったことを教えてください','어떤 문제가 있었나요?','Décrivez le problème rencontré','Was hat nicht funktioniert?','Cuéntanos qué ocurrió','Conte o que aconteceu','أخبرنا بما حدث'];
for(const [i,locale]of locales.entries())test('feedback dialog uses '+locale,async({page})=>{
 await page.goto('/?lang='+locale);await expect(page.locator('html')).toHaveAttribute('lang',locale==='zh'?'zh-CN':locale);
 await page.evaluate(()=>window.dispatchEvent(new Event('lingxifield:feedback')));
 const dialog=page.getByRole('dialog',{name:feedbackTitles[i],exact:true});await expect(dialog).toBeVisible();
 await expect(dialog.locator('textarea')).toBeFocused();if(locale!=='zh')await expect(dialog).not.toContainText(/问题|截图|发送|关闭|拖动/);
 await dialog.locator('button').last().click();await expect(dialog.getByRole('alert')).toBeVisible();
 if(locale==='en'){await dialog.locator('button').first().focus();await page.keyboard.press('Shift+Tab');await expect(dialog.locator('a[href^="mailto:"]')).toBeFocused();await page.keyboard.press('Tab');await expect(dialog.locator('button').first()).toBeFocused();}
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});

test('anonymous feedback failure preserves text and never reports success',async({page})=>{
 await page.goto('/?lang=en');await expect(page.locator('html')).toHaveAttribute('lang','en');await page.evaluate(()=>window.dispatchEvent(new Event('lingxifield:feedback')));
 const dialog=page.getByRole('dialog',{name:'Tell us what went wrong',exact:true});await dialog.locator('textarea').fill('PDF preview did not appear.');await dialog.getByRole('button',{name:'Send to LINGXIFIELD',exact:true}).click();
 await expect(dialog.getByRole('alert')).toBeVisible();await expect(dialog.getByRole('alert')).not.toContainText(/SUPABASE|API key|createBrowserClient|SUPPORT_/);await expect(dialog).not.toContainText('Received ✓');await expect(dialog.locator('textarea')).toHaveValue('PDF preview did not appear.');
});

test('language URL overrides saved preference and blocked storage does not break rendering',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/?lang=zh');await page.evaluate(()=>localStorage.setItem('lx-lang','zh'));await page.goto('/en/tools');await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.goto('/ar/tools');await expect(page.locator('html')).toHaveAttribute('lang','ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage disabled','SecurityError')}}));
 await page.goto('/sasi?mode=drama&lang=fr');await expect(page.locator('html')).toHaveAttribute('lang','fr');await expect(page.locator('.lx11-lang-label').first()).toHaveText('Langue');await expect(page.locator('body')).not.toContainText('Application error');expect(errors).toEqual([]);
 await page.goto('/sasi?mode=drama&lang=__proto__');await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');await expect(page.getByPlaceholder('问问 SASI',{exact:true})).toBeVisible();expect(errors).toEqual([]);
});
