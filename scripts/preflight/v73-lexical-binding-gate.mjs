import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const sourceRoot = path.resolve(process.argv[2]);
const repoRoot = path.resolve(process.argv[3]);
const mode = process.argv[4] || 'repo';
const ts = createRequire(path.join(repoRoot, 'package.json'))('typescript');

const payloadTargets = [
  'components/tools/PdfStructureInfoWorkbench.tsx',
  'app/tools/pdf-inspect/page.tsx',
  'app/tools/pdf-attachments/page.tsx',
  'app/tools/pdf-bookmarks/page.tsx',
];

const repoTargets = [
  'components/tools/PdfStructuralWorkbench.tsx',
  'components/tools/PdfStructureInfoWorkbench.tsx',
  'app/tools/pdf-protect/page.tsx',
  'app/tools/pdf-unlock/page.tsx',
  'app/tools/pdf-permissions/page.tsx',
  'app/tools/pdf-web-optimize/page.tsx',
  'app/tools/pdf-inspect/page.tsx',
  'app/tools/pdf-attachments/page.tsx',
  'app/tools/pdf-bookmarks/page.tsx',
];

const targets = mode === 'payload' ? payloadTargets : repoTargets;

function bindingNames(name, out = []) {
  if (ts.isIdentifier(name)) out.push(name.text);
  else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const el of name.elements) {
      if (ts.isOmittedExpression(el)) continue;
      bindingNames(el.name, out);
    }
  }
  return out;
}

for (const rel of targets) {
  const file = path.join(sourceRoot, rel);
  if (!fs.existsSync(file)) throw new Error(`V73_BINDING_GATE_MISSING:${mode}:${rel}`);
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  if (sf.parseDiagnostics.length) {
    const d = sf.parseDiagnostics[0];
    throw new Error(`V73_BINDING_GATE_PARSE:${rel}:${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  }
  const seen = new Map();
  const add = (name, kind, pos) => {
    const prev = seen.get(name);
    if (prev) throw new Error(`V73_DUPLICATE_TOP_LEVEL_BINDING:${rel}:${name}:${prev.kind}@${prev.pos}:${kind}@${pos}`);
    seen.set(name, { kind, pos });
  };
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) {
      const lexical = (st.declarationList.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const)) !== 0;
      if (!lexical) continue;
      for (const d of st.declarationList.declarations) {
        for (const n of bindingNames(d.name)) add(n, 'lexical', sf.getLineAndCharacterOfPosition(d.getStart(sf)).line + 1);
      }
    } else if (ts.isClassDeclaration(st) && st.name) {
      add(st.name.text, 'class', sf.getLineAndCharacterOfPosition(st.getStart(sf)).line + 1);
    } else if (ts.isEnumDeclaration(st)) {
      add(st.name.text, 'enum', sf.getLineAndCharacterOfPosition(st.getStart(sf)).line + 1);
    } else if (ts.isImportDeclaration(st) && st.importClause) {
      const c = st.importClause;
      if (c.name) add(c.name.text, 'import', sf.getLineAndCharacterOfPosition(c.name.getStart(sf)).line + 1);
      const b = c.namedBindings;
      if (b && ts.isNamespaceImport(b)) add(b.name.text, 'import', sf.getLineAndCharacterOfPosition(b.name.getStart(sf)).line + 1);
      if (b && ts.isNamedImports(b)) for (const e of b.elements) add(e.name.text, 'import', sf.getLineAndCharacterOfPosition(e.name.getStart(sf)).line + 1);
    }
  }
}
console.log(`V73_TOP_LEVEL_BINDING_GATE=PASS (${mode}:${targets.length})`);
