import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const sourceRoot=path.resolve(process.argv[2]||'.');
const repoRoot=path.resolve(process.argv[3]||'.');
const requireFromRepo=createRequire(path.join(repoRoot,'package.json'));
const ts=requireFromRepo('typescript');
const targets=[
 'components/tools/VideoEffectsWorkbench.tsx','components/tools/DeveloperUtilityWorkbench.tsx',
 'app/tools/regex-tester/page.tsx','app/tools/text-diff/page.tsx','app/tools/csv-json/page.tsx','app/tools/xml-formatter/page.tsx','app/tools/jwt-decoder/page.tsx','app/tools/url-parser/page.tsx','app/tools/case-converter/page.tsx','app/tools/number-base-converter/page.tsx',
 'lib/tools/paid-catalog.ts','lib/pricing/tool-policy-data.ts','lib/tools/commerce/v67-pricing-contract.ts','lib/seo/global-seo.ts','lib/tools/advanced-catalog.ts'
];
let bad=[];for(const f of targets){const abs=path.join(sourceRoot,f);if(!fs.existsSync(abs)){bad.push(`${f}:MISSING`);continue}const text=fs.readFileSync(abs,'utf8');const sf=ts.createSourceFile(f,text,ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);for(const d of sf.parseDiagnostics)bad.push(`${f}:${d.start??0}:${ts.flattenDiagnosticMessageText(d.messageText,' ')}`)}
if(bad.length){console.error(bad.join('\n'));process.exit(1)}console.log(`V69_MODIFIED_TS_PARSE=PASS (${targets.length})`);
