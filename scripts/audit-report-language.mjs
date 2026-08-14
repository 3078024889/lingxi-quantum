import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOTS = ["app", "components", "lib", "knowledge"];
const CJK = /[\u3400-\u9fff]/;
const findings = [];

function filesUnder(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) return filesUnder(full);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

function nameOf(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return node.getText();
}

function report(file, sourceFile, node, reason) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  findings.push(`${file}:${line + 1} ${reason}`);
}

function expressionText(node, sourceFile) {
  return node ? node.getText(sourceFile) : "";
}

function isEnglishConditional(condition, sourceFile) {
  const raw = condition.getText(sourceFile).replace(/\s+/g, "");
  if (/^!?langEn$/.test(raw)) return raw.startsWith("!") ? "false" : "true";
  if (/lang(?:uage)?===?["']en["']/.test(raw)) return "true";
  if (/lang(?:uage)?===?["']zh["']/.test(raw)) return "false";
  return null;
}

for (const file of ROOTS.flatMap(filesUnder)) {
  const source = fs.readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.text === "en" && node.initializer) {
      const raw = expressionText(node.initializer, sourceFile);
      if (CJK.test(raw) || /\b\w+Zh\b/.test(raw)) report(file, sourceFile, node, "English JSX slot contains Chinese or a *Zh value");
    }

    if (ts.isPropertyAssignment(node)) {
      const key = nameOf(node.name);
      if ((key === "en" || /En$/.test(key)) && (CJK.test(expressionText(node.initializer, sourceFile)) || /\b\w+Zh\b/.test(expressionText(node.initializer, sourceFile)))) {
        report(file, sourceFile, node, `English property ${key} contains Chinese or a *Zh value`);
      }
    }

    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t" && node.arguments[1]) {
      const raw = expressionText(node.arguments[1], sourceFile);
      if (CJK.test(raw) || /\b\w+Zh\b/.test(raw)) report(file, sourceFile, node.arguments[1], "English t(...) argument contains Chinese or a *Zh value");
    }

    if (ts.isConditionalExpression(node)) {
      const englishBranch = isEnglishConditional(node.condition, sourceFile);
      const selected = englishBranch === "true" ? node.whenTrue : englishBranch === "false" ? node.whenFalse : null;
      if (selected) {
        const raw = expressionText(selected, sourceFile);
        if (CJK.test(raw) || /\b\w+Zh\b/.test(raw)) report(file, sourceFile, selected, "English conditional branch contains Chinese or a *Zh value");
      }
    }

    if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === "exportArchivePdf") {
      const config = node.arguments[0];
      if (config && ts.isObjectLiteralExpression(config) && !config.properties.some((property) =>
        ts.isPropertyAssignment(property) && nameOf(property.name) === "language"
      )) {
        report(file, sourceFile, node, "exportArchivePdf call does not declare its report language");
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

if (findings.length) {
  console.error(`Report language audit failed (${findings.length} finding${findings.length === 1 ? "" : "s"}):`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Report language audit passed: English slots, branches, and archive exports contain no detected Chinese residue.");
