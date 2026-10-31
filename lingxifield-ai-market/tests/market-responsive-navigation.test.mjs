import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const base=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');

test('mobile categories are an accessible optional offcanvas sidebar, not a blank column',()=>{
 const ui=read('app/market-workbench.tsx'),css=read('app/globals.css');
 for(const value of ['lxMobileCategoriesButton','lxDesktopCategoriesButton','lxMobileCategoriesOpen','lxDesktopCategoriesHidden','market-category-sidebar','lxCategoryBackdrop','lxCategoryDrawerHeader'])
  assert.ok(ui.includes(value),value);
 assert.match(ui,/aria-controls="market-category-sidebar"/);
 assert.match(ui,/aria-expanded=\{mobileCategoriesOpen\}/);
 assert.match(ui,/event\.key==='Escape'/);
 assert.match(ui,/onClick=\{\(\)=>setMobileCategoriesOpen\(false\)\}/);
 assert.match(css,/@media \(max-width:900px\)/);
 assert.ok(css.includes('width:min(340px,86vw)'));
 assert.ok(css.includes('transform:translateX(-110%)'));
 assert.ok(css.includes('.lxMobileCategoriesOpen>.leftAside'));
 assert.ok(css.includes('inset-inline-start:0'));
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('desktop uses wider canvas and never reserves a permanent blank right-hand column',()=>{
 const ui=read('app/market-workbench.tsx'),css=read('app/globals.css');
 assert.ok(css.includes('max-width:1920px;width:100%'));
 assert.ok(css.includes('grid-template-columns:188px minmax(0,1fr)'));
 assert.ok(css.includes('lxDesktopCategoriesHidden'));
 assert.ok(css.includes('.rightAside{display:none}'));
 assert.ok(ui.includes('className={\'homeGrid\''));
});
test('RTL sidebar opens from the right and user-selected categories close mobile drawer',()=>{
 const ui=read('app/market-workbench.tsx'),css=read('app/globals.css');
 assert.ok(css.includes('.app[dir="rtl"] .homeGrid>.leftAside'));
 assert.ok(css.includes('transform:translateX(110%)'));
 assert.ok(ui.includes('setCategory(x);setMobileCategoriesOpen(false)'));
 assert.ok(css.includes('z-index:1101'));
 assert.ok(ui.includes('setCategory(\'全部平台\');setMobileCategoriesOpen(false)'));
});
