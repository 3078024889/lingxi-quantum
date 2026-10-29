import fs from 'node:fs';import {validCatalogEntry} from '../lib/catalog-engine.mjs';const rows=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
if(!Array.isArray(rows)||rows.some(x=>!validCatalogEntry(x))||new Set(rows.map(x=>x.id)).size!==rows.length)throw Error('CATALOG_V25_INVALID');
console.log('CATALOG_V25_PASS count='+rows.length);
