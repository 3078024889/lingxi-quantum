import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("./", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Sheet1");
sheet.showGridLines = false;

sheet.getRange("A1:E5").values = [
  ["道具id", "道具名称", "道具图片", "道具价格", "备注"],
  ["nar_100", "单篇叙事·一元", "https://lingxifield.cn/images/mini-products/narrative_access.jpg", 1, "多维叙事·单篇解锁"],
  ["nar_500", "单篇叙事·五元", "https://lingxifield.cn/images/mini-products/narrative_access.jpg", 5, "多维叙事·单篇解锁"],
  ["nar_600", "单篇叙事·六元", "https://lingxifield.cn/images/mini-products/narrative_access.jpg", 6, "多维叙事·单篇解锁"],
  ["sub_narrative_365", "多维叙事·年度解锁", "https://lingxifield.cn/images/mini-products/narrative_access.jpg", 666, "一年内解锁全部叙事"],
];

sheet.getRange("A1:E1").format = {
  fill: "#173B4D",
  font: { bold: true, color: "#F4F0E6" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: "#8CB7B1" },
};
sheet.getRange("A2:E5").format = {
  font: { color: "#302E3A" },
  verticalAlignment: "center",
  borders: { insideHorizontal: { style: "thin", color: "#D9E2E1" } },
};
sheet.getRange("D2:D5").format.numberFormat = "0";
sheet.getRange("D2:D5").format.horizontalAlignment = "right";
sheet.getRange("A1:A5").format.columnWidth = 22;
sheet.getRange("B1:B5").format.columnWidth = 24;
sheet.getRange("C1:C5").format.columnWidth = 70;
sheet.getRange("D1:D5").format.columnWidth = 14;
sheet.getRange("E1:E5").format.columnWidth = 28;
sheet.getRange("A1:E1").format.rowHeight = 28;
sheet.getRange("A2:E5").format.rowHeight = 25;
sheet.freezePanes.freezeRows(1);

console.log((await workbook.inspect({
  kind: "table",
  sheetId: sheet.name,
  range: "A1:E5",
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 8,
  maxChars: 6000,
})).ndjson);

console.log((await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
})).ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}灵犀场-微信虚拟支付道具-叙事补充导入.xlsx`);
const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}叙事补充导入表-预览.png`, new Uint8Array(await preview.arrayBuffer()));
