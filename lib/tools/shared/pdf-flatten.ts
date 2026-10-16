import {PDFDocument,PDFName,PDFRef} from 'pdf-lib';

/** Keep field appearances, remove interactivity and dangling widget references.
 * Other resolved annotations (for example links) must remain intact.
 */
export function flattenPdfForm(doc:PDFDocument){
 const form=doc.getForm();form.flatten();
 if(form.getFields().length)throw new Error('PDF_FLATTEN_INCOMPLETE');
 for(const page of doc.getPages()){
  const annotations=page.node.Annots();if(!annotations)continue;
  for(let index=annotations.size()-1;index>=0;index--){
   const value=annotations.get(index);
   if(value instanceof PDFRef&&doc.context.lookup(value)===undefined)annotations.remove(index);
  }
  if(!annotations.size())page.node.delete(PDFName.of('Annots'));
 }
}
