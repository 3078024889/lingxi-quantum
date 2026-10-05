import fs from"node:fs";
const p="lib/tools/hub-copy-v1470.ts";
let s=fs.readFileSync(p,"utf8");
s=s.replace(
 'export type ToolDisplayCategory="all"|"pdf"|"image"|"media"|"subtitle"|"table"|"privacy"|"recognition"|"file";',
 'export type ToolDisplayCategory="all"|"pdf"|"image"|"media"|"subtitle"|"table"|"privacy"|"recognition"|"text"|"file"|"other";'
);
const old=' file:L("文本 / 文件","Text / Files","テキスト / ファイル","텍스트 / 파일","Texte / Fichiers","Text / Dateien","Texto / Archivos","Texto / Ficheiros","النصوص / الملفات"),';
const replacement=' text:L("文本 / 常用","Text / Everyday","テキスト / よく使う","텍스트 / 자주 쓰는","Texte / Pratique","Text / Alltag","Texto / Uso diario","Texto / Uso diário","النصوص / الاستخدام اليومي"),\n file:L("文件 / 转换","Files / Convert","ファイル / 変換","파일 / 변환","Fichiers / Conversion","Dateien / Konvertieren","Archivos / Conversión","Ficheiros / Conversão","الملفات / التحويل"),\n other:L("其他","Other","その他","기타","Autres","Andere","Otros","Outros","أخرى"),';
if(!s.includes(old)&&!s.includes(' other:L("其他"'))throw new Error("R16R1_HUB_COPY_SHAPE_DRIFT");
if(s.includes(old))s=s.replace(old,replacement);
fs.writeFileSync(p,s,"utf8");
console.log("R16R1_HUMAN_CATEGORY_COPY=PASS");
