import {test,expect,type Page} from "playwright/test";
import {PDFDocument} from "pdf-lib";
const languages=["zh","en","ja","ko","fr","de","es","pt","ar"] as const;
const labels=[
 ["选择文件","保存文件","右侧"],
 ["Choose file","Save file","Right"],
 ["ファイルを選択","ファイルを保存","右"],
 ["파일 선택","파일 저장","오른쪽"],
 ["Choisir un fichier","Enregistrer le fichier","Droite"],
 ["Datei auswählen","Datei speichern","Rechts"],
 ["Elegir archivo","Guardar archivo","Derecha"],
 ["Escolher arquivo","Salvar arquivo","Direita"],
 ["اختيار ملف","حفظ الملف","يمين"]
];
async function pdfBytes(){const pdf=await PDFDocument.create();pdf.addPage();pdf.addPage();return Buffer.from(await pdf.save())}
async function upload(page:Page){const input=page.locator('input[type="file"][accept*="pdf"]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:"two.pdf",mimeType:"application/pdf",buffer:await pdfBytes()});await expect(page.getByTestId("pdf-source-page-count")).toContainText("2")}
const stamp=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="25" fill="red"/></svg>');
for(const [i,lang]of languages.entries()){
 test("PDF controls and failures use "+lang,async({page})=>{
  await page.goto("/tools/pdf-editor?lang="+lang);
  await expect(page.getByText(labels[i][0],{exact:true})).toBeVisible();
  await expect(page.getByTestId("draft-saved")).toHaveCount(0);
  await upload(page);
  await expect(page.getByTestId("paid-export-start")).toHaveText(labels[i][1]);
  await page.locator('input[type="file"][accept="image/*"]').nth(1).setInputFiles({name:"stamp.svg",mimeType:"image/svg+xml",buffer:stamp});
  await expect(page.locator('option[value="right"]')).toHaveText(labels[i][2]);
  await expect(page.getByTestId("draft-saved")).toBeVisible();
  if(lang!=="en"){
   await expect(page.getByTestId("pdf-export-plan-summary")).not.toContainText("pages selected");
   await expect(page.locator("main")).not.toContainText("Drag elements");
   await expect(page.locator("main")).not.toContainText("Example:");
  }
  await page.locator('input[type="file"][accept*="pdf"]').first().setInputFiles({name:"broken.pdf",mimeType:"application/pdf",buffer:Buffer.from("not a PDF")});
  const alert=page.getByRole("alert");await expect(alert).toBeVisible();
  await expect(alert).not.toContainText(/PDFDocument|PDFParsing|No PDF header|DOCUMENT_OPEN_FAILED/);
  if(lang!=="en")await expect(alert).not.toContainText("This PDF could not be opened");
 });
}
test("PDF failed autosave never claims the draft is saved",async({page})=>{
 await page.goto("/tools/pdf-editor?lang=en");
 await page.evaluate(()=>{IDBObjectStore.prototype.put=function(){throw new DOMException("Quota full","QuotaExceededError")}});
 await upload(page);
 await expect(page.getByRole("alert")).toContainText("Your task could not be saved");
 await expect(page.getByTestId("draft-saved")).toHaveCount(0);
});
function wav(){const data=Buffer.alloc(16000),header=Buffer.alloc(44);header.write("RIFF");header.writeUInt32LE(36+data.length,4);header.write("WAVEfmt ",8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(8000,24);header.writeUInt32LE(16000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write("data",36);header.writeUInt32LE(data.length,40);return Buffer.concat([header,data])}
test("audio task only enables pricing after its draft is saved",async({page})=>{
 let quotes=0;
 await page.route("**/api/tools/quote",async r=>{quotes++;await r.fulfill({status:503,json:{error:"PRIVATE_ENGINE_FAILURE"}})});
 await page.goto("/tools/audio-transcription?lang=fr");
 await expect(page.getByTestId("draft-saved")).toHaveCount(0);
 const input=page.locator('input[type="file"]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:"voice.wav",mimeType:"audio/wav",buffer:wav()});
 await expect(page.getByTestId("draft-saved")).toHaveText("Votre tâche est enregistrée sur cet appareil.");
 const price=page.getByRole("button",{name:"Voir le prix",exact:true});await expect(price).toBeEnabled();
 await page.evaluate(()=>{IDBObjectStore.prototype.put=function(){throw new DOMException("Quota full","QuotaExceededError")}});
 await price.click();
 await expect(page.getByRole("alert")).toContainText("La tâche n’a pas pu être enregistrée");
 await expect(page.getByTestId("draft-saved")).toHaveCount(0);
 expect(quotes).toBe(0);
 await expect(price).toBeDisabled();
});
test("tool introductions are translated and free of pricing or engine jargon",async({page})=>{
 test.setTimeout(180000);
 const slugs=["pdf-editor","e-sign-pdf","audio-transcription","ocr","pdf-pages","video-toolkit","privacy-cleaner","heic-to-jpg"];
 for(const lang of languages)for(const slug of slugs){
  await page.goto("/tools/"+slug+"?lang="+lang,{waitUntil:"domcontentloaded"});
  const intro=page.getByRole("heading",{level:1}).locator("xpath=following-sibling::p[1]");
  await expect(intro).toBeVisible();
  await expect(intro).not.toContainText(/FFmpeg|EXIF|GPS|按实际分钟报价|高保真|price|pricing|收费|阶梯|免费|在直接重排/);
  if(lang!=="zh")await expect(intro).not.toContainText(/把录音|将照片|轻松|方便|添加文字|添加签名|清理图片/);
  if(slug==="video-toolkit"&&lang!=="en")await expect(page.locator("main")).not.toContainText(/Batch compress|Batch extract|Start batch/);
 }
});
