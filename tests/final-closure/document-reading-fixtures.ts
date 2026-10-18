export const P='http://schemas.openxmlformats.org/presentationml/2006/main';
export const A='http://schemas.openxmlformats.org/drawingml/2006/main';
export const R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
export const T='urn:oasis:names:tc:opendocument:xmlns:text:1.0';
export const presentationParts:Record<string,string>={
 '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/></Types>',
 '_rels/.rels':`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="root" Type="${R}/officeDocument" Target="ppt/presentation.xml"/></Relationships>`,
 'ppt/presentation.xml':`<deck:presentation xmlns:deck="${P}" xmlns:rel="${R}"><deck:sldIdLst><deck:sldId id="258" rel:id="second"/><deck:sldId id="256" rel:id="first"/></deck:sldIdLst></deck:presentation>`,
 'ppt/_rels/presentation.xml.rels':`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="first" Type="${R}/slide" Target="slides/slide1.xml"/><Relationship Id="second" Type="${R}/slide" Target="slides/second%20slide.xml"/></Relationships>`,
 'ppt/slides/slide1.xml':`<deck:sld xmlns:deck="${P}" xmlns:draw="${A}"><draw:p><draw:r><draw:t>SECOND actual slide</draw:t></draw:r></draw:p></deck:sld>`,
 'ppt/slides/second slide.xml':`<deck:sld xmlns:deck="${P}" xmlns:draw="${A}"><draw:p><draw:r><draw:t xml:space="preserve">FIRST 中文 🌍 </draw:t></draw:r><draw:r><draw:t>&amp; entity</draw:t></draw:r><draw:br/><draw:r><draw:t>after break</draw:t></draw:r></draw:p></deck:sld>`,
 // Unreferenced/orphaned parts must never appear in the extracted content.
 'ppt/slides/slide99.xml':`<deck:sld xmlns:deck="${P}" xmlns:draw="${A}"><draw:p><draw:r><draw:t>ORPHAN MUST NOT APPEAR</draw:t></draw:r></draw:p></deck:sld>`,
};
export const presentationText='# Slide 1\nFIRST 中文 🌍 & entity\nafter break\n\n# Slide 2\nSECOND actual slide';
export const odtParts:Record<string,string>={
 'mimetype':'application/vnd.oasis.opendocument.text',
 'META-INF/manifest.xml':'<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>',
 'content.xml':`<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:txt="${T}"><office:body><office:text><txt:h>灵犀场 🌍</txt:h><txt:p>One<txt:s txt:c="3"/>two<txt:tab/>column<txt:line-break/>第二行</txt:p><txt:p>Third<txt:s/>paragraph &amp; entity</txt:p></office:text></office:body></office:document-content>`,
};
export const odtText='灵犀场 🌍\nOne   two\tcolumn\n第二行\nThird paragraph & entity';
