import {test,expect} from 'playwright/test';

const home='#siai-market';
const rows='.siai-home-tr';

test.beforeEach(async ({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator(home)).toBeVisible();
 await expect(page.locator(rows)).toHaveCount(32);
});

test('task search filters the actual 32 product rows and safely handles no results',async({page})=>{
 const search=page.locator('.siai-home-search input');
 await expect(search).toBeVisible();
 await search.fill('ComfyUI');
 const filtered=await page.locator(rows).count();
 expect(filtered).toBeGreaterThan(0);
 expect(filtered).toBeLessThan(32);
 await expect(page.locator(rows).first()).toContainText('ComfyUI');
 await search.fill('this-siai-product-does-not-exist-974189');
 await expect(page.locator(rows)).toHaveCount(0);
 await expect(page.locator('.siai-home-empty')).toBeVisible();
 await search.clear();
 await expect(page.locator(rows)).toHaveCount(32);
});

test('source-linked product details open inline and close without losing catalog',async({page})=>{
 const first=page.locator(rows).first();
 const control=first.locator('button[aria-expanded]');
 await expect(control).toHaveAttribute('aria-expanded','false');
 await control.click();
 await expect(control).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('.siai-home-expanded-row')).toHaveCount(1);
 const detail=page.locator('.siai-home-detail');
 await expect(detail.locator('h2')).toBeVisible();
 await expect(detail.locator('dl > div')).toHaveCount(6);
 const official=detail.locator('.siai-home-sources a');
 expect(await official.count()).toBeGreaterThan(0);
 const links=await official.evaluateAll(nodes=>nodes.map(n=>(n as HTMLAnchorElement).href));
 expect(links.every(href=>href.startsWith('https://'))).toBe(true);
 await detail.locator('button').first().click();
 await expect(page.locator('.siai-home-expanded-row')).toHaveCount(0);
 await expect(page.locator(rows)).toHaveCount(32);
});

test('compare two independently selected products, then remove one without losing the other',async({page})=>{
 const all=page.locator(rows);
 const firstName=(await all.nth(0).locator('.siai-home-identity strong').first().innerText()).trim();
 const secondName=(await all.nth(1).locator('.siai-home-identity strong').first().innerText()).trim();
 await all.nth(0).locator('button[aria-pressed]').click();
 await all.nth(1).locator('button[aria-pressed]').click();
 const bar=page.locator('.siai-compare-toolbar');
 await expect(bar).toBeVisible();
 await expect(bar).toContainText(firstName);
 await expect(bar).toContainText(secondName);
 await bar.locator(':scope > button').first().click();
 const table=page.locator('#siai-comparison');
 await expect(table).toBeVisible();
 await expect(table.locator('thead th')).toHaveCount(3);
 await expect(table).toContainText(firstName);
 await expect(table).toContainText(secondName);
 await bar.locator('button[aria-label]').filter({hasText:firstName}).first().click();
 await expect(bar).not.toContainText(firstName);
 await expect(bar).toContainText(secondName);
 await expect(page.locator(rows)).toHaveCount(32);
});

test('all nine languages switch the actual ranking interface, Arabic flips reading direction',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop-chromium','Language selector is in a desktop sidebar; mobile uses account menu');
 const select=page.locator('aside.lx11-sidebar:not(.lx11-drawer) label.lx11-lang-label + select.lx11-lang-select');
 await expect(select).toBeVisible();
 const main=page.locator(home);
 const langs=['zh','en','ja','ko','fr','de','es','pt','ar'];
 for(const lang of langs){
  await select.selectOption(lang);
  await expect(select).toHaveValue(lang);
  await expect(main).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
  const h=main.locator('h1');
  await expect(h).toBeVisible();
  expect((await h.innerText()).trim().length).toBeGreaterThan(4);
  await expect(page.locator(rows)).toHaveCount(32);
 }
 await select.selectOption('en');
 await expect(main.locator('h1')).toHaveText('Global SIAI Rankings');
});

test('mobile: all four facet rows remain present, table scrolls and inline details are operable',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='mobile-chromium','Mobile-only real viewport test');
 await expect(page.locator('.siai-filter-line')).toHaveCount(4);
 const scroll=page.locator('.siai-home-table-scroll');
 const dimensions=await scroll.evaluate(el=>({width:el.clientWidth,content:el.scrollWidth}));
 expect(dimensions.content).toBeGreaterThan(dimensions.width);
 const left=await scroll.evaluate(el=>{el.scrollLeft=500;return el.scrollLeft});
 expect(left).toBeGreaterThan(0);
 await page.locator(rows).first().locator('button[aria-expanded]').click();
 await expect(page.locator('.siai-home-detail')).toBeVisible();
 await expect(page.locator('.siai-home-expanded-row')).toHaveCount(1);
});
