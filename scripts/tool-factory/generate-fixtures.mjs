import fs from "node:fs";
import path from "node:path";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import ExcelJS from "exceljs";

const out=path.join(process.cwd(),"tests/fixtures/generated");
fs.mkdirSync(out,{recursive:true});

fs.writeFileSync(path.join(out,"unicode.txt"),"灵犀场 LINGXIFIELD\n日本語 한국어 Français Deutsch Español Português العربية\n\nA\nA\n","utf8");
fs.writeFileSync(path.join(out,"table.csv"),"name,value\nalpha,1\n中文,2\nالعربية,3\n","utf8");
fs.writeFileSync(path.join(out,"sample.json"),JSON.stringify({brand:"LINGXIFIELD",ok:true,items:[1,2,3]},null,2));
fs.writeFileSync(path.join(out,"sample.srt"),"1\n00:00:00,000 --> 00:00:02,000\nLINGXIFIELD fixture\n\n2\n00:00:02,100 --> 00:00:04,000\nSecond line\n","utf8");
fs.writeFileSync(path.join(out,"vector.svg"),`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="white"/><circle cx="90" cy="90" r="45" fill="black"/><text x="155" y="98" font-size="24">LINGXIFIELD</text></svg>`);

const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z8wAAAABJRU5ErkJggg==","base64");
fs.writeFileSync(path.join(out,"pixel.png"),png);

const pdf=await PDFDocument.create();
const page=pdf.addPage([595,842]);
const font=await pdf.embedFont(StandardFonts.Helvetica);
page.drawText("LINGXIFIELD fixture PDF",{x:72,y:760,size:20,font,color:rgb(0,0,0)});
page.drawText("Page 1 - deterministic local fixture",{x:72,y:720,size:12,font});
fs.writeFileSync(path.join(out,"basic.pdf"),await pdf.save());

const wb=new ExcelJS.Workbook();
const ws=wb.addWorksheet("fixture");
ws.addRow(["name","value"]);
ws.addRow(["alpha",1]);
ws.addRow(["LINGXIFIELD",2]);
await wb.xlsx.writeFile(path.join(out,"table.xlsx"));

console.log("FIXTURE_GENERATION=PASS");
