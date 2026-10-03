import JSZip from"jszip";
import type{SasiConversationRow}from"./composer-core";

function xmlEscape(value:string){
 return String(value??"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&apos;");
}

function paragraph(text:string,style?:string){
 const lines=String(text??"").split(/\r?\n/);
 return lines.map(line=>
  `<w:p>${style?`<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`:""}<w:r><w:t xml:space="preserve">${xmlEscape(line||" ")}</w:t></w:r></w:p>`
 ).join("");
}

export async function buildSasiDocx(rows:SasiConversationRow[],title="SASI"){
 const zip=new JSZip();
 zip.file("[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
 <Default Extension="xml" ContentType="application/xml"/>
 <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
 <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);
 zip.folder("_rels")?.file(".rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
 zip.folder("word")?.file("styles.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
 <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="38"/><w:szCs w:val="38"/></w:rPr></w:style>
 <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>
</w:styles>`);
 const body=[
  paragraph(title,"Title"),
  ...rows.flatMap((row,index)=>[
   paragraph(`${index+1}. ${row.question}`,"Heading1"),
   paragraph(row.answer),
  ])
 ].join("");
 zip.folder("word")?.file("document.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
 <w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body>
</w:document>`);
 return zip.generateAsync({
  type:"blob",
  mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
 });
}

export async function downloadSasiDocx(rows:SasiConversationRow[],filename:string,title="SASI"){
 const blob=await buildSasiDocx(rows,title);
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download=filename.toLowerCase().endsWith(".docx")?filename:`${filename}.docx`;
 a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
