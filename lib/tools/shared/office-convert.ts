"use client";

import JSZip from "jszip";
import { parseGenericDocument } from "@/lib/files/document-intake";

const encoder = new TextEncoder();

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function csvEscape(value: string) {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function parseDelimited(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        quoted = false;
        continue;
      }
      cell += ch;
      continue;
    }

    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }

  row.push(cell.replace(/\r$/, ""));
  if (row.some((value) => value.length) || rows.length === 0) rows.push(row);
  return rows;
}

function columnName(index: number) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function worksheetXml(rows: string[][]) {
  const body = rows
    .map(
      (row, r) =>
        `<row r="${r + 1}">${row
          .map((value, c) => {
            const ref = `${columnName(c)}${r + 1}`;
            return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
              value,
            )}</t></is></c>`;
          })
          .join("")}</row>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${body}</sheetData>
</worksheet>`;
}

export async function delimitedToXlsx(file: File) {
  const delimiter =
    /\.tsv$/i.test(file.name) || file.type === "text/tab-separated-values" ? "\t" : ",";
  const rows = parseDelimited(await file.text(), delimiter);
  const zip = new JSZip();

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  );

  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
  );

  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
  );

  zip.file(
    "xl/styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`,
  );

  zip.file("xl/worksheets/sheet1.xml", worksheetXml(rows));

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
  });

  const base = file.name.replace(/\.(csv|tsv)$/i, "") || "table";
  return {
    name: `${base}.xlsx`,
    blob,
    rows: rows.length,
    columns: Math.max(0, ...rows.map((row) => row.length)),
  };
}

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function sharedStrings(xml: string) {
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((hit) =>
    decodeXml([...hit[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join("")),
  );
}

function sheetToRows(xml: string, shared: string[]) {
  const rows: string[][] = [];
  for (const rowHit of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row: string[] = [];
    for (const cellHit of rowHit[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellHit[1];
      const body = cellHit[2];
      const ref = (attrs.match(/\br="([A-Z]+)\d+"/) || [])[1] || "A";

      let index = 0;
      for (const ch of ref) index = index * 26 + (ch.charCodeAt(0) - 64);
      index = Math.max(0, index - 1);

      const type = (attrs.match(/\bt="([^"]+)"/) || [])[1] || "";
      const raw = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1] ?? "";
      const inline = (body.match(/<is>([\s\S]*?)<\/is>/) || [])[1] || "";

      let value = "";
      if (type === "s") value = shared[Number(raw)] ?? raw;
      else if (type === "inlineStr") {
        value = decodeXml(
          [...inline.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(""),
        );
      } else value = decodeXml(raw);

      while (row.length <= index) row.push("");
      row[index] = value;
    }
    rows.push(row);
  }
  return rows;
}

export async function xlsxToCsvFiles(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const sharedXml = await zip.file("xl/sharedStrings.xml")?.async("string");
  const shared = sharedXml ? sharedStrings(sharedXml) : [];

  const sheetPaths = Object.keys(zip.files)
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number(a.match(/sheet(\d+)/i)?.[1] || 0);
      const nb = Number(b.match(/sheet(\d+)/i)?.[1] || 0);
      return na - nb;
    });

  if (!sheetPaths.length) throw new Error("XLSX_WORKSHEET_MISSING");

  const outputs: { name: string; blob: Blob; rows: number; columns: number }[] = [];
  const base = file.name.replace(/\.xlsx$/i, "") || "workbook";

  for (let i = 0; i < sheetPaths.length; i++) {
    const xml = await zip.file(sheetPaths[i])?.async("string");
    if (!xml) continue;
    const rows = sheetToRows(xml, shared);
    const csv = "\uFEFF" + rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob([encoder.encode(csv)], { type: "text/csv;charset=utf-8" });
    outputs.push({
      name: sheetPaths.length === 1 ? `${base}.csv` : `${base}-sheet${i + 1}.csv`,
      blob,
      rows: rows.length,
      columns: Math.max(0, ...rows.map((row) => row.length)),
    });
  }

  return outputs;
}

export async function docxToText(file: File) {
  const parsed = await parseGenericDocument(file);
  if (!parsed || parsed.kind !== "docx") throw new Error("DOCX_PARSE_FAILED");

  const blob = new Blob([parsed.text], { type: "text/plain;charset=utf-8" });
  return {
    name: `${file.name.replace(/\.docx$/i, "") || "document"}.txt`,
    blob,
    characters: parsed.text.length,
  };
}
