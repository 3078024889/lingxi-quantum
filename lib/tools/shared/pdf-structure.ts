import {PDFArray,PDFDict,PDFDocument,PDFHexString,PDFName,PDFNumber,PDFString,type PDFObject} from 'pdf-lib';
export type PdfOutline={title:string;destpageposfrom1:number|string;kids:PdfOutline[]};
export async function readPdfStructure(bytes:Uint8Array){
 const doc=await PDFDocument.load(bytes,{updateMetadata:false}),context=doc.context;
 const lookup=(value:PDFObject|undefined)=>context.lookup(value);
 const text=(value:PDFObject|undefined)=>{const object=lookup(value);return object instanceof PDFString||object instanceof PDFHexString||object instanceof PDFName?object.decodeText():''};
 let visited=0;const step=()=>{if(++visited>10000)throw Error('PDF_STRUCTURE_TOO_COMPLEX')};
 function nameTree(root:PDFObject|undefined){
  const entries=new Map<string,PDFObject>(),seen=new Set<PDFDict>();
  function walk(value:PDFObject|undefined,depth:number){step();if(depth>32)throw Error('PDF_STRUCTURE_TOO_COMPLEX');const node=lookup(value);if(!(node instanceof PDFDict))return;if(seen.has(node))throw Error('PDF_STRUCTURE_CYCLE');seen.add(node);
   const names=lookup(node.get(PDFName.of('Names')));if(names instanceof PDFArray)for(let i=0;i+1<names.size();i+=2){step();entries.set(text(names.get(i)),names.get(i+1))}
   const kids=lookup(node.get(PDFName.of('Kids')));if(kids instanceof PDFArray)for(let i=0;i<kids.size();i++)walk(kids.get(i),depth+1);
  }
  if(root)walk(root,0);return entries;
 }
 const names=lookup(doc.catalog.get(PDFName.of('Names')));
 const attachments=names instanceof PDFDict?[...nameTree(names.get(PDFName.of('EmbeddedFiles'))).keys()]:[];
 const destinations=names instanceof PDFDict?nameTree(names.get(PDFName.of('Dests'))):new Map<string,PDFObject>();
 const legacy=lookup(doc.catalog.get(PDFName.of('Dests')));if(legacy instanceof PDFDict)for(const [key,value]of legacy.entries())destinations.set(key.decodeText(),value);
 const pages=doc.getPages(),pageIndexes=new Map<PDFDict,number>(pages.map((page,index)=>[page.node,index+1]));
 function pageFor(value:PDFObject|undefined,depth=0):number|string{
  step();if(depth>8)return '—';const dest=lookup(value);
  if(dest instanceof PDFArray){const target=lookup(dest.get(0));return target instanceof PDFNumber?target.asNumber()+1:target instanceof PDFDict?pageIndexes.get(target)||'—':'—'}
  if(dest instanceof PDFDict)return pageFor(dest.get(PDFName.of('D')),depth+1);
  const name=text(value);return name&&destinations.has(name)?pageFor(destinations.get(name),depth+1):'—';
 }
 const seen=new Set<PDFDict>();
 function outlines(value:PDFObject|undefined,depth=0):PdfOutline[]{
  if(depth>32)throw Error('PDF_STRUCTURE_TOO_COMPLEX');const out:PdfOutline[]=[];let node=lookup(value);
  while(node instanceof PDFDict){step();if(seen.has(node))throw Error('PDF_STRUCTURE_CYCLE');seen.add(node);const action=lookup(node.get(PDFName.of('A')));out.push({title:text(node.get(PDFName.of('Title')))||'—',destpageposfrom1:pageFor(node.get(PDFName.of('Dest'))||(action instanceof PDFDict?action.get(PDFName.of('D')):undefined)),kids:outlines(node.get(PDFName.of('First')),depth+1)});node=lookup(node.get(PDFName.of('Next')))}return out;
 }
 const root=lookup(doc.catalog.get(PDFName.of('Outlines')));
 return {pages:pages.length,attachments,outlines:root instanceof PDFDict?outlines(root.get(PDFName.of('First'))):[],warnings:[] as string[]};
}
