import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const payload = path.resolve(process.argv[2]);
const repoRoot = path.resolve(process.argv[3]);
const ts = createRequire(path.join(repoRoot, 'package.json'))('typescript');

// Payload preflight must validate only files physically shipped by V73.
// Baseline V72R2 files are validated separately by the repository gate.
const files = [
  'components/tools/PdfStructureInfoWorkbench.tsx',
  'app/tools/pdf-inspect/page.tsx',
  'app/tools/pdf-attachments/page.tsx',
  'app/tools/pdf-bookmarks/page.tsx',
];

let n = 0;
for (const rel of files) {
  const p = path.join(payload, rel);
  if (!fs.existsSync(p)) throw new Error(`V73_PAYLOAD_FILE_MISSING:${rel}`);
  const src = fs.readFileSync(p, 'utf8');
  const sf = ts.createSourceFile(
    rel,
    src,
    ts.ScriptTarget.Latest,
    true,
    rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  if (sf.parseDiagnostics.length) {
    const d = sf.parseDiagnostics[0];
    throw new Error(`V73_PAYLOAD_PARSE_FAILED:${rel}:${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  }
  n++;
}
console.log(`V73_PAYLOAD_TS_PARSE=PASS (${n})`);
