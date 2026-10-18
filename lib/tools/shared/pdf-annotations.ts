import {PDFDict,PDFDocument,PDFName,PDFRef} from 'pdf-lib';

/** Form widgets share Annots with comments. Keep their original references and
 * AcroForm linkage; deleting the whole array makes filled forms disappear.
 */
export function removePdfComments(doc:PDFDocument){
 let removed=0;const discarded=new Set<PDFRef>();
 for(const page of doc.getPages()){
  const annotations=page.node.Annots();
  if(!annotations)continue;
  for(let index=annotations.size()-1;index>=0;index--){
   const ref=annotations.get(index);
   const annotation=doc.context.lookup(ref);
   if(!(annotation instanceof PDFDict))throw Error('PDF_ANNOTATION_INVALID');
   if(annotation.lookupMaybe(PDFName.of('Subtype'),PDFName)?.toString()==='/Widget')continue;
   annotations.remove(index);if(ref instanceof PDFRef)discarded.add(ref);removed++;
  }
  if(!annotations.size())page.node.delete(PDFName.of('Annots'));
 }
 // Removing page references alone leaves comment contents in saved orphan objects.
 // Defer deletion until every page has been visited (references may be shared).
 for(const ref of discarded)doc.context.delete(ref);
 return removed;
}
