import {PDFDict, PDFDocument, PDFName, PDFRef, PDFStream, PDFString, PDFHexString} from 'pdf-lib';

export type PdfMetadataSnapshot = {fields: Record<string,string>; xmpStreams: number};

/** Read without getters that create an Info dictionary or refresh timestamps. */
export function inspectPdfMetadata(doc: PDFDocument): PdfMetadataSnapshot {
 const info=doc.context.lookup(doc.context.trailerInfo.Info);
 const fields:Record<string,string>={};
 if(info instanceof PDFDict)for(const [key,value] of info.entries()){
  const resolved=doc.context.lookup(value);
  fields[key.decodeText()]=resolved instanceof PDFString||resolved instanceof PDFHexString?resolved.decodeText():String(resolved??'');
 }
 let xmpStreams=0;
 for(const [,obj] of doc.context.enumerateIndirectObjects()){
  const dict=obj instanceof PDFStream?obj.dict:obj instanceof PDFDict?obj:null;
  if(dict?.has(PDFName.of('Metadata')))xmpStreams++;
 }
 return {fields,xmpStreams};
}

/** Clear document properties and XMP, including page/resource metadata.
 * Page text, visible signatures, annotations, attachments and embedded-image EXIF
 * are separate content; this is not a redaction or complete anonymization tool.
 */
export function clearPdfMetadata(doc:PDFDocument){
 const info=doc.context.trailerInfo.Info;
 delete doc.context.trailerInfo.Info;
 if(info instanceof PDFRef)doc.context.delete(info);
 const metadataRefs:PDFRef[]=[];
 for(const [ref,obj] of doc.context.enumerateIndirectObjects()){
  const dict=obj instanceof PDFStream?obj.dict:obj instanceof PDFDict?obj:null;
  if(!dict)continue;
  const metadata=dict.get(PDFName.of('Metadata'));
  if(metadata instanceof PDFRef)metadataRefs.push(metadata);
  dict.delete(PDFName.of('Metadata'));
  if(dict.get(PDFName.of('Type'))===PDFName.of('Metadata'))metadataRefs.push(ref);
 }
 for(const ref of metadataRefs)doc.context.delete(ref);
}

export async function cleanPdfMetadata(input:ArrayBuffer|Uint8Array){
 const doc=await PDFDocument.load(input,{updateMetadata:false});
 const before=inspectPdfMetadata(doc),pages=doc.getPageCount();
 clearPdfMetadata(doc);
 const bytes=await doc.save();
 const check=await PDFDocument.load(bytes,{updateMetadata:false});
 const after=inspectPdfMetadata(check);
 if(Object.keys(after.fields).length||after.xmpStreams||check.getPageCount()!==pages)throw new Error('PDF_METADATA_VERIFICATION_FAILED');
 return {bytes,before,after,pages};
}
