import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const root = path.resolve(process.argv[2] || '.');
const ts = createRequire(path.join(root, 'package.json'))('typescript');
const files = [
  // V72R2 structural baseline
  'components/tools/PdfStructuralWorkbench.tsx',
  'app/tools/pdf-protect/page.tsx',
  'app/tools/pdf-unlock/page.tsx',
  'app/tools/pdf-permissions/page.tsx',
  'app/tools/pdf-web-optimize/page.tsx',
  // V73 additions
  'components/tools/PdfStructureInfoWorkbench.tsx',
  'app/tools/pdf-inspect/page.tsx',
  'app/tools/pdf-attachments/page.tsx',
  'app/tools/pdf-bookmarks/page.tsx',
  // Structurally patched registries
  'lib/tools/advanced-catalog.ts',
  'lib/seo/global-seo.ts',
  'lib/tools/experience-registry.ts',
  'lib/tools/card-i18n.ts',
];
for (const rel of files) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`V73_REPO_PARSE_FILE_MISSING:${rel}`);
  const src = fs.readFileSync(p, 'utf8');
  const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  if (sf.parseDiagnostics.length) {
    const d = sf.parseDiagnostics[0];
    throw new Error(`V73_GENERATED_PARSE_FAILED:${rel}:${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  }
}
console.log(`V73_GENERATED_TS_PARSE=PASS (${files.length})`);
