import {PDFDict,PDFDocument,PDFName} from 'pdf-lib';

/** Form widgets share Annots with comments. Keep their original references and
 * AcroForm linkage; deleting the whole array makes filled forms disappear.
 */
export function removePdfComments(doc:PDFDocument){
 let removed=0;
 for(const page of doc.getPages()){
  const annotations=page.node.Annots();
  if(!annotations)continue;
  const keep=annotations.asArray().filter(ref=>{
   const annotation=doc.context.lookup(ref);
   if(!(annotation instanceof PDFDict))throw Error('PDF_ANNOTATION_INVALID');
   if(annotation.lookupMaybe(PDFName.of('Subtype'),PDFName)?.toString()==='/Widget')return true;
   removed++;return false;
  });
  if(keep.length)page.node.set(PDFName.of('Annots'),doc.context.obj(keep));
  else page.node.delete(PDFName.of('Annots'));
 }
 return removed;
}
