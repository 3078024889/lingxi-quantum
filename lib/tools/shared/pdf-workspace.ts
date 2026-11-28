import {PDFDocument,degrees} from 'pdf-lib';
export type WorkspacePage={id:string;file:number;page:number;rotation:number};
export function moveWorkspacePage(items:WorkspacePage[],id:string,target:string){
 const from=items.findIndex(item=>item.id===id),to=items.findIndex(item=>item.id===target);
 if(from<0||to<0||from===to)return items;
 const next=[...items],entry=next.splice(from,1)[0];next.splice(to,0,entry);return next;
}
export async function buildWorkspacePdfs(files:{arrayBuffer():Promise<ArrayBuffer>}[],items:WorkspacePage[],separate=false){
 if(!items.length||items.length>500)throw Error('PDF_PAGE_LIMIT');
 const docs=new Map<number,PDFDocument>();
 const output:Array<{name:string;bytes:Uint8Array}>=[];
 const groups=separate?items.map(item=>[item]):[items];
 for(const [index,group] of groups.entries()){
  const result=await PDFDocument.create();
  for(const item of group){
   if(!Number.isInteger(item.file)||!files[item.file]||!Number.isInteger(item.page)||item.page<0||!Number.isInteger(item.rotation)||item.rotation%90)throw Error('PDF_PAGE_INVALID');
   let source=docs.get(item.file);
   if(!source){source=await PDFDocument.load(await files[item.file].arrayBuffer());docs.set(item.file,source)}
   if(item.page>=source.getPageCount())throw Error('PDF_PAGE_INVALID');
   const [page]=await result.copyPages(source,[item.page]);
   page.setRotation(degrees(((page.getRotation().angle+item.rotation)%360+360)%360));result.addPage(page);
  }
  output.push({name:separate?`page-${index+1}.pdf`:'organized.pdf',bytes:await result.save()});
 }
 return output;
}
