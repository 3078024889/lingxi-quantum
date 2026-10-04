import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(process.argv[2] || ".");
const preflightOnly = process.argv.includes("--preflight");
const req = createRequire(path.join(root, "package.json"));
const ts = req("typescript");

const abs = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(abs(p), "utf8");
const write = (p, s) => fs.writeFileSync(abs(p), s, "utf8");

function parse(file, source) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  if (sf.parseDiagnostics.length) {
    const d = sf.parseDiagnostics[0];
    throw new Error(`V70_AST_PARSE_FAILED:${file}:${d.start ?? 0}:${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
  }
  return sf;
}

function unwrap(expr) {
  while (
    ts.isAsExpression(expr) ||
    ts.isTypeAssertionExpression(expr) ||
    ts.isParenthesizedExpression(expr) ||
    ts.isSatisfiesExpression?.(expr)
  ) expr = expr.expression;
  return expr;
}

function findVariableInitializer(sf, variableName, expectedKind) {
  let found = null;
  const visit = (node) => {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName && node.initializer) {
      const init = unwrap(node.initializer);
      if (expectedKind === "array" && !ts.isArrayLiteralExpression(init)) {
        throw new Error(`V70_AST_SHAPE_MISMATCH:${variableName}:expected-array`);
      }
      if (expectedKind === "object" && !ts.isObjectLiteralExpression(init)) {
        throw new Error(`V70_AST_SHAPE_MISMATCH:${variableName}:expected-object`);
      }
      found = init;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!found) throw new Error(`V70_AST_TARGET_MISSING:${variableName}`);
  return found;
}

function appendIntoLiteral({ file, variableName, expectedKind, marker, entries }) {
  const source = read(file);
  if (source.includes(marker)) return { file, changed: false, reason: "already-present" };
  const sf = parse(file, source);
  const literal = findVariableInitializer(sf, variableName, expectedKind);
  const closePos = literal.end - 1;
  const closeChar = source[closePos];
  if ((expectedKind === "array" && closeChar !== "]") || (expectedKind === "object" && closeChar !== "}")) {
    throw new Error(`V70_AST_CLOSE_TOKEN_MISMATCH:${file}:${variableName}`);
  }

  const before = source.slice(literal.getStart(sf) + 1, closePos);
  const hasMembers = expectedKind === "array" ? literal.elements.length > 0 : literal.properties.length > 0;
  const trimmed = before.trimEnd();
  const alreadyComma = hasMembers && trimmed.endsWith(",");
  const prefix = hasMembers && !alreadyComma ? ",\n" : "\n";
  const candidate = source.slice(0, closePos) + prefix + entries.trimEnd() + "\n" + source.slice(closePos);
  parse(file, candidate);
  if (!preflightOnly) write(file, candidate);
  return { file, changed: true, reason: preflightOnly ? "preflight-ok" : "written" };
}

const results = [];
results.push(appendIntoLiteral({
  file: "lib/tools/advanced-catalog.ts",
  variableName: "ADVANCED_TOOLS",
  expectedKind: "array",
  marker: 'href:"/tools/pdf-overlay"',
  entries: `  { href:"/tools/pdf-overlay", title:"PDF 叠加", description:"把抬头纸、背景或统一模板叠加到 PDF 页面。", keywords:["PDF叠加","PDF overlay","PDF背景","PDF抬头纸"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-header-footer", title:"PDF 页眉页脚", description:"给整份 PDF 添加统一页眉、页脚和页码。", keywords:["PDF页眉","PDF页脚","PDF header footer"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-bates-numbering", title:"PDF Bates 编号", description:"给合同、证据材料和归档 PDF 添加连续编号。", keywords:["Bates编号","PDF连续编号","证据编号"], category:"pdf", localOnly:true },
  { href:"/tools/pdf-viewer-preferences", title:"PDF 打开方式", description:"设置 PDF 打开时的页面布局、侧栏和窗口显示。", keywords:["PDF打开方式","PDF viewer preferences","PDF页面布局"], category:"pdf", localOnly:true },`
}));

results.push(appendIntoLiteral({
  file: "lib/seo/global-seo.ts",
  variableName: "GLOBAL_TOOL_CATALOG",
  expectedKind: "array",
  marker: 'slug:"pdf-overlay"',
  entries: `  {slug:"pdf-overlay",zh:"PDF 叠加",en:"Overlay PDF",mode:"local" as const},
  {slug:"pdf-header-footer",zh:"PDF 页眉页脚",en:"PDF Header & Footer",mode:"local" as const},
  {slug:"pdf-bates-numbering",zh:"PDF Bates 编号",en:"PDF Bates Numbering",mode:"local" as const},
  {slug:"pdf-viewer-preferences",zh:"PDF 打开方式",en:"PDF Viewer Preferences",mode:"local" as const},`
}));

results.push(appendIntoLiteral({
  file: "lib/tools/experience-registry.ts",
  variableName: "TOOL_EXPERIENCE",
  expectedKind: "object",
  marker: '"pdf-overlay":',
  entries: `"pdf-overlay":{kind:"document",primary:"上传 PDF",working:"正在叠加页面…",result:"下载 PDF",advancedAfterUpload:true,localFirst:true},
"pdf-header-footer":{kind:"document",primary:"上传 PDF",working:"正在添加页眉页脚…",result:"下载 PDF",advancedAfterUpload:true,localFirst:true},
"pdf-bates-numbering":{kind:"document",primary:"上传 PDF",working:"正在添加编号…",result:"下载 PDF",advancedAfterUpload:true,localFirst:true},
"pdf-viewer-preferences":{kind:"document",primary:"上传 PDF",working:"正在保存打开方式…",result:"下载 PDF",advancedAfterUpload:true,localFirst:true},`
}));

results.push(appendIntoLiteral({
  file: "lib/tools/card-i18n.ts",
  variableName: "TITLES",
  expectedKind: "object",
  marker: '"pdf-overlay":L(',
  entries: `"pdf-overlay":L("PDF 叠加","Overlay PDF","PDF重ね合わせ","PDF 겹치기","Superposer PDF","PDF überlagern","Superponer PDF","Sobrepor PDF","تراكب PDF"),
"pdf-header-footer":L("PDF 页眉页脚","PDF Header & Footer","PDFヘッダー・フッター","PDF 머리글·바닥글","En-tête et pied de page PDF","PDF Kopf- & Fußzeile","Encabezado y pie PDF","Cabeçalho e rodapé PDF","رأس وتذييل PDF"),
"pdf-bates-numbering":L("PDF Bates 编号","PDF Bates Numbering","PDF Bates番号","PDF Bates 번호","Numérotation Bates PDF","PDF Bates-Nummerierung","Numeración Bates PDF","Numeração Bates PDF","ترقيم Bates PDF"),
"pdf-viewer-preferences":L("PDF 打开方式","PDF Viewer Preferences","PDF表示設定","PDF 보기 설정","Préférences d’affichage PDF","PDF Anzeigeoptionen","Preferencias de vista PDF","Preferências de visualização PDF","إعدادات عرض PDF"),`
}));

const recipeFile = "lib/tools/platform/tool-recipes.json";
const recipes = JSON.parse(read(recipeFile));
let recipeChanged = false;
for (const slug of ["pdf-overlay","pdf-header-footer","pdf-bates-numbering","pdf-viewer-preferences"]) {
  if (!recipes.some((x) => x.slug === slug)) {
    recipes.push({slug,capabilities:["document.page-model","document.overlay.text","download.local"],contractVersion:1,requiresNineLanguage:true,requiresDesktop:true,requiresMobile:true,requiresRealFixture:true,privacyMode:"local-first"});
    recipeChanged = true;
  }
}
if (!preflightOnly && recipeChanged) write(recipeFile, JSON.stringify(recipes, null, 2) + "\n");

if (preflightOnly) {
  console.log("V70R1_AST_PATCH_PREFLIGHT=PASS");
} else {
  console.log("V70R1_AST_PATCH=PASS");
}
for (const r of results) console.log(`V70R1_AST_TARGET=${r.file}:${r.reason}`);
