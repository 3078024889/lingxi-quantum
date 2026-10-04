import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const payload = path.resolve(process.argv[2]);
const repoRoot = path.resolve(process.argv[3]);
const ts = createRequire(path.join(repoRoot, 'package.json'))('typescript');

const files = [
  'components/tools/PdfStructureInfoWorkbench.tsx',
  'app/tools/pdf-inspect/page.tsx',
  'app/tools/pdf-attachments/page.tsx',
  'app/tools/pdf-bookmarks/page.tsx',
];

const configPath = path.join(repoRoot, 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, repoRoot, undefined, configPath);
if (parsed.errors?.length) throw new Error(ts.flattenDiagnosticMessageText(parsed.errors[0].messageText, '\n'));

const overlay = new Map();
for (const rel of files) {
  const src = path.join(payload, rel);
  if (!fs.existsSync(src)) throw new Error(`V73_PAYLOAD_FILE_MISSING:${rel}`);
  overlay.set(path.normalize(path.join(repoRoot, rel)), fs.readFileSync(src, 'utf8'));
}

const host = ts.createCompilerHost(parsed.options, true);
const baseReadFile = host.readFile.bind(host);
const baseFileExists = host.fileExists.bind(host);
const norm = p => path.normalize(path.resolve(p));
host.fileExists = p => overlay.has(norm(p)) || baseFileExists(p);
host.readFile = p => overlay.get(norm(p)) ?? baseReadFile(p);
host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
  const text = host.readFile(fileName);
  if (text === undefined) return undefined;
  return ts.createSourceFile(fileName, text, languageVersion, true, fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : fileName.endsWith('.ts') ? ts.ScriptKind.TS : undefined);
};

const roots = [...new Set([...parsed.fileNames.map(norm), ...overlay.keys()])];
const program = ts.createProgram({ rootNames: roots, options: parsed.options, host });
const payloadSet = new Set([...overlay.keys()].map(norm));
const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => d.file && payloadSet.has(norm(d.file.fileName)));
if (diagnostics.length) {
  for (const d of diagnostics.slice(0, 20)) {
    const pos = d.file && typeof d.start === 'number' ? d.file.getLineAndCharacterOfPosition(d.start) : null;
    const rel = d.file ? path.relative(repoRoot, d.file.fileName) : 'unknown';
    const where = pos ? `${rel}:${pos.line + 1}:${pos.character + 1}` : rel;
    console.error(`${where} TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  }
  throw new Error(`V73_PAYLOAD_TYPECHECK_FAILED:${diagnostics.length}`);
}
console.log(`V73_PAYLOAD_TYPECHECK=PASS (${files.length})`);
