import {openBoundedArchive,readArchiveText} from './bounded-archive';

const TEXT_NS='urn:oasis:names:tc:opendocument:xmlns:text:1.0';
const MAX_TEXT=1_000_000;

/** ODF encodes spaces, tabs and line breaks as elements, not text nodes. */
export function odtXmlToText(doc:Document){
 if(doc.getElementsByTagName('parsererror').length)throw Error('ODT_XML_INVALID');
 let size=0;
 const append=(value:string)=>{size+=value.length;if(size>MAX_TEXT)throw Error('ODT_TEXT_TOO_LARGE');return value};
 const walk=(node:Node,depth:number):string=>{
  if(depth>64)throw Error('ODT_TOO_COMPLEX');
  if(node.nodeType===3||node.nodeType===4)return append(node.nodeValue||'');
  if(node.nodeType!==1)return '';
  const el=node as Element;
  if(el.namespaceURI===TEXT_NS){
   if(el.localName==='s'){
    const raw=el.getAttributeNS(TEXT_NS,'c')||'1',count=Number(raw);
    if(!/^\d+$/.test(raw)||!Number.isSafeInteger(count)||count<1||count>10000)throw Error('ODT_SPACE_COUNT_INVALID');
    return append(' '.repeat(count));
   }
   if(el.localName==='tab')return append('\t');
   if(el.localName==='line-break')return append('\n');
  }
  return Array.from(node.childNodes).map(child=>walk(child,depth+1)).join('');
 };
 const blocks=Array.from(doc.getElementsByTagNameNS(TEXT_NS,'*')).filter(n=>n.localName==='p'||n.localName==='h');
 const text=blocks.map(n=>walk(n,0)).join('\n');
 if(!text.trim())throw Error('ODT_NO_TEXT');
 return text;
}

export async function readOdt(file:File){
 const zip=await openBoundedArchive(file),raw=await readArchiveText(zip,'content.xml');
 if(!raw)throw Error('ODT_CONTENT_MISSING');
 return odtXmlToText(new DOMParser().parseFromString(raw,'application/xml'));
}
