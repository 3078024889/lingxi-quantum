import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
test('homepage FAQ uses compact four-column desktop cards and responsive fallbacks',()=>{
 const css=read('app/home-afternoon-20261114.css');
 const faq=read('components/HomeSeoAnswers.tsx');
 const section=css.slice(css.lastIndexOf('20261115: compact four-column FAQ'));
 assert.match(section,/\.lx-seo-question-grid\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(section,/@media\(max-width:1180px\)[\s\S]*repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(section,/@media\(max-width:640px\)[\s\S]*minmax\(0,1fr\)/);
 assert.match(section,/\.lx-home-faq-copy p\{[^}]*font-size:13px/);
 assert.match(section,/\.lx-home-growth-heading h2[\s\S]*font-size:28px/);
 assert(faq.includes('className="lx-seo-question-grid"'));
});
test('SASI hero artwork retains its original 3:1 ratio without object-fit fill',()=>{
 const css=read('components/SasiOpenMarketplace.module.css');
 const section=css.slice(css.lastIndexOf('20261115: responsive spacing'));
 assert.match(section,/\.main \.hero\{[^}]*aspect-ratio:3 \/ 1/);
 assert.match(section,/\.main \.heroArtwork\{[^}]*object-fit:contain/);
 assert.doesNotMatch(section,/object-fit:fill/);
 assert.match(section,/@media\(max-width:760px\)[\s\S]*\.main \.heroArtwork\{[^}]*object-fit:contain/);
 assert.match(section,/\.sellerHeroArtwork\{[^}]*object-fit:contain/);
});
test('SIAI directory width follows the homepage content rail',()=>{
 const css=read('app/growth-pages.css');
 const section=css.slice(css.lastIndexOf('20261115: align the SIAI directory'));
 assert.match(section,/width:min\(1600px,calc\(100% - 24px\)\)/);
 assert.match(section,/max-width:1600px/);
});
