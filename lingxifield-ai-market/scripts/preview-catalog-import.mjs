import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {auditCatalogImport} from '../lib/catalog-insights.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=process.argv[2];if(!file){console.error('Usage: node scripts/preview-catalog-import.mjs <candidate.json>');process.exit(2)}
const target=path.resolve(file);if(!fs.existsSync(target)){console.error('IMPORT_SOURCE_NOT_FOUND');process.exit(2)}
const current=JSON.parse(fs.readFileSync(path.join(root,'data/catalog.json'),'utf8'));
const incoming=JSON.parse(fs.readFileSync(target,'utf8'));
const result=auditCatalogImport(current,incoming);console.log(JSON.stringify(result,null,2));
if(!result.canImport)process.exitCode=1;
