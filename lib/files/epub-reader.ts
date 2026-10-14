import {openBoundedArchive,readArchiveText} from './bounded-archive';

function parseXml(raw:string){
 const doc=new DOMParser().parseFromString(raw,'application/xml');
 if(doc.querySelector('parsererror'))throw Error('EPUB_XML_INVALID');
 return doc;
}
function archivePath(base:string,href:string){
 const root='https://epub.invalid/';
 const resolved=new URL(href,new URL(base,root));
 if(resolved.origin!==new URL(root).origin)throw Error('EPUB_EXTERNAL_CHAPTER');
 const path=decodeURIComponent(resolved.pathname.slice(1));
 if(path.split('/').some(part=>part==='..')||path.includes('\\'))throw Error('EPUB_PATH_INVALID');
 return path;
}
function chapterText(raw:string){
 const doc=new DOMParser().parseFromString(raw,'text/html');
 doc.querySelectorAll('script,style,noscript').forEach(node=>node.remove());
 doc.querySelectorAll('br').forEach(node=>node.replaceWith('\n'));
 doc.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,h6').forEach(node=>node.append('\n'));
 return (doc.body.textContent||'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}

/** Both the standalone tool and SASI read the package's declared spine order. */
export async function readEpub(file:File):Promise<{text:string;chapters:number}>{
 const zip=await openBoundedArchive(file);
 const container=await readArchiveText(zip,'META-INF/container.xml');
 if(!container)throw Error('EPUB_CONTAINER_MISSING');
 const root=parseXml(container).querySelector('rootfile')?.getAttribute('full-path');
 if(!root)throw Error('EPUB_PACKAGE_MISSING');
 const packagePath=archivePath('',root),raw=await readArchiveText(zip,packagePath);
 if(!raw)throw Error('EPUB_OPF_MISSING');
 const opf=parseXml(raw),manifest=new Map<string,string>();
 opf.querySelectorAll('manifest item').forEach(node=>{
  const id=node.getAttribute('id'),href=node.getAttribute('href');
  if(id&&href)manifest.set(id,href);
 });
 const parts:string[]=[];
 for(const item of Array.from(opf.querySelectorAll('spine itemref'))){
  const href=manifest.get(item.getAttribute('idref')||'');
  if(!href)throw Error('EPUB_SPINE_REFERENCE_MISSING');
  const chapter=await readArchiveText(zip,archivePath(packagePath,href));
  if(chapter===undefined)throw Error('EPUB_CHAPTER_MISSING');
  const text=chapterText(chapter);if(text)parts.push(text);
 }
 if(!parts.length)throw Error('EPUB_NO_TEXT');
 return {text:parts.join('\n\n'),chapters:parts.length};
}
