import JSZip from "jszip";

const sites=process.argv.slice(2);
const targets=sites.length?sites:["https://lingxifield.com","https://lingxifield.cn"];

function xml(strings,...values){return String.raw({raw:strings},...values)}

async function makeDocx(){
 const z=new JSZip();
 z.file("[Content_Types].xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
 z.file("_rels/.rels",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
 z.file("word/document.xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:r><w:t>LINGXIFIELD DOCX production gateway smoke test</w:t></w:r></w:p>
<w:p><w:r><w:t>Document conversion verification.</w:t></w:r></w:p>
<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
</w:body></w:document>`);
 return Buffer.from(await z.generateAsync({type:"uint8array"}));
}

async function makeXlsx(){
 const z=new JSZip();
 z.file("[Content_Types].xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`);
 z.file("_rels/.rels",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);
 z.file("xl/workbook.xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Smoke" sheetId="1" r:id="rId1"/></sheets></workbook>`);
 z.file("xl/_rels/workbook.xml.rels",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`);
 z.file("xl/worksheets/sheet1.xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
<row r="1"><c r="A1" t="inlineStr"><is><t>LINGXIFIELD XLSX production gateway smoke test</t></is></c></row>
<row r="2"><c r="A2"><v>20261002</v></c><c r="B2"><v>1</v></c></row>
</sheetData></worksheet>`);
 return Buffer.from(await z.generateAsync({type:"uint8array"}));
}

async function makePptx(){
 const z=new JSZip();
 z.file("[Content_Types].xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);
 z.file("_rels/.rels",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
 z.file("ppt/presentation.xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst><p:sldSz cx="9144000" cy="6858000" type="screen4x3"/><p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);
 z.file("ppt/_rels/presentation.xml.rels",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`);
 z.file("ppt/slides/slide1.xml",xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
<p:sp><p:nvSpPr><p:cNvPr id="2" name="Smoke Test"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="914400" y="914400"/><a:ext cx="7315200" cy="1828800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2400"/><a:t>LINGXIFIELD PPTX production gateway smoke test</a:t></a:r><a:endParaRPr lang="en-US"/></a:p></p:txBody>
</p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`);
 return Buffer.from(await z.generateAsync({type:"uint8array"}));
}

const fixtures=[
 {ext:"docx",type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",make:makeDocx},
 {ext:"xlsx",type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",make:makeXlsx},
 {ext:"pptx",type:"application/vnd.openxmlformats-officedocument.presentationml.presentation",make:makePptx},
];

async function testOne(site,fixture){
 const bytes=await fixture.make();
 const name=`lingxifield-production-smoke.${fixture.ext}`;
 const ticketRes=await fetch(`${site}/api/tools/document/ticket`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,size:bytes.length,type:fixture.type})});
 if(!ticketRes.ok)throw new Error(`${site} ${fixture.ext}: TICKET_HTTP_${ticketRes.status}`);
 const ticket=await ticketRes.json();
 if(ticket.mode!=="direct")throw new Error(`${site} ${fixture.ext}: DOCUMENT_GATEWAY_NOT_CONFIGURED_ON_SITE`);
 const headers={
  "content-type":fixture.type,
  "x-lingxifield-ticket-version":"v1",
  "x-lingxifield-filename":encodeURIComponent(name),
  "x-lingxifield-size":String(bytes.length),
  "x-lingxifield-exp":String(ticket.exp),
  "x-lingxifield-nonce":ticket.nonce,
  "x-lingxifield-token":ticket.token,
 };
 const convert=await fetch(ticket.url,{method:"POST",headers,body:bytes});
 if(!convert.ok){
  const body=await convert.text().catch(()=>"");
  throw new Error(`${site} ${fixture.ext}: CONVERT_HTTP_${convert.status} ${body}`.trim());
 }
 const pdf=new Uint8Array(await convert.arrayBuffer());
 const magic=String.fromCharCode(...pdf.slice(0,5));
 if(magic!=="%PDF-")throw new Error(`${site} ${fixture.ext}: CONVERTED_RESULT_NOT_PDF`);
 const replay=await fetch(ticket.url,{method:"POST",headers,body:bytes});
 if(replay.status!==409)throw new Error(`${site} ${fixture.ext}: REPLAY_GUARD_EXPECTED_409_GOT_${replay.status}`);
 console.log(`${site} ${fixture.ext.toUpperCase()}_PDF_BYTES=${pdf.length}`);
 console.log(`${site} ${fixture.ext.toUpperCase()}_TO_PDF=PASS`);
 console.log(`${site} ${fixture.ext.toUpperCase()}_PDF_MAGIC=PASS`);
 console.log(`${site} ${fixture.ext.toUpperCase()}_REPLAY_GUARD=PASS`);
}

let failed=false;
for(const siteRaw of targets){
 const site=siteRaw.replace(/\/+$/,"");
 console.log(`\n=== ${site} ===`);
 for(const fixture of fixtures){
  try{await testOne(site,fixture)}
  catch(error){failed=true;console.error(`FAIL: ${error?.message||error}`)}
 }
}
if(failed){process.exitCode=1}
else{
 console.log("\nLINGXIFIELD_OFFICE_DOCUMENT_GATEWAY_PRODUCTION=PASS");
 console.log("DOCX_TO_PDF=PASS");
 console.log("XLSX_TO_PDF=PASS");
 console.log("PPTX_TO_PDF=PASS");
 console.log("PDF_MAGIC_VALIDATION=PASS");
 console.log("REPLAY_PROTECTION=PASS");
 console.log("LINGXIFIELD_COM_AND_CN=PASS");
}
