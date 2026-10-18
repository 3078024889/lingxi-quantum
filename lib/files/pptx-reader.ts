import {openBoundedArchive,readArchiveText} from './bounded-archive';

const PRESENTATION_NAMESPACES=['http://schemas.openxmlformats.org/presentationml/2006/main','http://purl.oclc.org/ooxml/presentationml/main'];
const DRAWING_NAMESPACES=['http://schemas.openxmlformats.org/drawingml/2006/main','http://purl.oclc.org/ooxml/drawingml/main'];
const RELATIONSHIP_NAMESPACES=['http://schemas.openxmlformats.org/officeDocument/2006/relationships','http://purl.oclc.org/ooxml/officeDocument/relationships'];
type ReadPart=(path:string)=>Promise<string|undefined>;
type ParseXml=(raw:string)=>Document;

function browserXml(raw:string){
 const doc=new DOMParser().parseFromString(raw,'application/xml');
 if(doc.getElementsByTagName('parsererror').length)throw Error('PPTX_XML_INVALID');
 return doc;
}
function partPath(base:string,target:string){
 // Package relationships must never trigger a network request or a fragment lookup.
 if(!target||/[\\?#]/.test(target)||/^[a-z][a-z\d+.-]*:/i.test(target)||target.startsWith('//'))throw Error('PPTX_SLIDE_REFERENCE_INVALID');
 const resolved=new URL(target,new URL(base,'https://pptx.invalid/'));
 const path=decodeURIComponent(resolved.pathname.slice(1));
 if(resolved.origin!=='https://pptx.invalid'||/[\\?#]/.test(path)||path.split('/').some(p=>p==='..'))throw Error('PPTX_SLIDE_REFERENCE_INVALID');
 return path;
}
function slideText(doc:Document){
 const paragraphs=Array.from(doc.getElementsByTagNameNS('*','p')).filter(n=>DRAWING_NAMESPACES.includes(n.namespaceURI||''));
 return paragraphs.map(p=>{
  let text='';
  for(const n of Array.from(p.getElementsByTagNameNS('*','*'))){
   if(!DRAWING_NAMESPACES.includes(n.namespaceURI||''))continue;
   if(n.localName==='t')text+=n.textContent||'';
   else if(n.localName==='br')text+='\n';
   else if(n.localName==='tab')text+='\t';
  }
  return text;
 }).join('\n').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}

/** Follow the declared slide list, never ZIP entry or numeric filename order.
 * Used by the tool, browser document intake and server-side SASI extraction.
 * The caller owns archive bounds and supplies its server XML parser if needed.
 */
export async function readPptxParts(read:ReadPart,parse:ParseXml=browserXml){
 const presentation=await read('ppt/presentation.xml'),relationships=await read('ppt/_rels/presentation.xml.rels');
 if(!presentation||!relationships)throw Error('PPTX_PRESENTATION_MISSING');
 const doc=parse(presentation),rels=parse(relationships),targets=new Map<string,string>();
 for(const rel of Array.from(rels.getElementsByTagNameNS('http://schemas.openxmlformats.org/package/2006/relationships','Relationship'))){
  if(!RELATIONSHIP_NAMESPACES.some(ns=>rel.getAttribute('Type')===ns+'/slide'))continue;
  const id=rel.getAttribute('Id');
  if(!id||targets.has(id)||rel.getAttribute('TargetMode')==='External')throw Error('PPTX_SLIDE_REFERENCE_INVALID');
  targets.set(id,partPath('ppt/presentation.xml',rel.getAttribute('Target')||''));
 }
 const root=doc.documentElement;
 if(root.localName!=='presentation'||!PRESENTATION_NAMESPACES.includes(root.namespaceURI||''))throw Error('PPTX_XML_INVALID');
 // Section metadata also contains slide ID lists; only this direct list counts.
 const list=Array.from(root.childNodes).find(n=>n.nodeType===1&&(n as Element).localName==='sldIdLst'&&PRESENTATION_NAMESPACES.includes((n as Element).namespaceURI||''));
 const ids=list?Array.from(list.childNodes).filter(n=>n.nodeType===1&&(n as Element).localName==='sldId'&&PRESENTATION_NAMESPACES.includes((n as Element).namespaceURI||'')):[];
 if(!ids.length)throw Error('PPTX_SLIDES_MISSING');
 const blocks:string[]=[];
 for(const [index,node] of ids.entries()){
  const el=node as Element,id=RELATIONSHIP_NAMESPACES.map(ns=>el.getAttributeNS(ns,'id')).find(Boolean);
  const path=id&&targets.get(id);
  if(!path)throw Error('PPTX_SLIDE_REFERENCE_MISSING');
  const raw=await read(path);
  if(!raw)throw Error('PPTX_SLIDE_MISSING');
  const slide=parse(raw),slideRoot=slide.documentElement;
  if(slideRoot.localName!=='sld'||!PRESENTATION_NAMESPACES.includes(slideRoot.namespaceURI||''))throw Error('PPTX_XML_INVALID');
  blocks.push(`# Slide ${index+1}\n${slideText(slide)}`);
 }
 if(!blocks.some(block=>block.slice(block.indexOf('\n')+1).trim()))throw Error('PPTX_NO_TEXT');
 return {text:blocks.join('\n\n').trim(),slides:ids.length};
}

export async function readPptx(file:File){
 const zip=await openBoundedArchive(file);
 return readPptxParts(path=>readArchiveText(zip,path));
}
