import {test,expect} from './export-test';

test('book workspace answers platform identity without requiring a document',async({page})=>{
 // The production mutation guard intentionally rejects localhost. Exercise
 // the real handler behind a trusted-host proxy in this isolated local run.
 await page.route('**/api/knowledge/ask',route=>{
  const url=new URL(route.request().url());
  return route.continue(url.hostname==='127.0.0.1'||url.hostname==='localhost'?{headers:{...route.request().headers(),origin:'https://lingxifield.com','x-forwarded-host':'lingxifield.com'}}:{});
 });
 await page.goto('/sasi?mode=book&lang=en');
 await page.getByRole('textbox',{name:'Ask SASI',exact:true}).fill('Who are you?');
 await page.getByRole('button',{name:'↑',exact:true}).click();
 await expect(page.getByText(/SASI coordinates intelligence services and tools/)).toBeVisible();
 await expect(page.getByText(/not a foundation model developed by LingxiField/)).toBeVisible();
});

test('knowledge workspace accepts streamed completion and exports the final answer',async({page})=>{
 await page.route('**/api/knowledge/ask',async route=>{
  expect(route.request().headers().accept).toBe('text/event-stream');
  await route.fulfill({contentType:'text/event-stream',body:'event: delta\ndata: {"text":"Partial text"}\n\nevent: reset\ndata: {}\n\nevent: delta\ndata: {"text":"Verified final answer"}\n\nevent: done\ndata: {"answer":"Verified final answer","intelligence":"standard"}\n\n'});
 });
 await page.goto('/sasi?mode=book&lang=en');
 await page.getByRole('textbox',{name:'Ask SASI',exact:true}).fill('Who are you?');
 await page.getByRole('button',{name:'↑',exact:true}).click();
 await expect(page.getByText('Verified final answer',{exact:true})).toBeVisible();
 await expect(page.getByText('Partial text',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'ZIP',exact:true})).toBeVisible();
});

test('interrupted knowledge response restores the question and cannot be exported',async({page})=>{
 await page.route('**/api/knowledge/ask',route=>route.fulfill({contentType:'text/event-stream',body:'event: delta\ndata: {"text":"Unfinished answer"}\n\n'}));
 await page.goto('/sasi?mode=book&lang=en');
 const question=page.getByRole('textbox',{name:'Ask SASI',exact:true});
 await question.fill('Who are you?');
 await page.getByRole('button',{name:'↑',exact:true}).click();
 await expect(question).toHaveValue('Who are you?');
 await expect(page.getByText('Unfinished answer',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'ZIP',exact:true})).toHaveCount(0);
});
