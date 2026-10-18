/** Format element-only XML regions without changing mixed text or xml:space. */
export function xmlPretty(source:string){
 if(source.length>500000)throw Error('TOOL_RESULT_TOO_LARGE');
 const doc=new DOMParser().parseFromString(source,'application/xml');
 if(doc.getElementsByTagName('parsererror').length)throw Error('XML');
 let added=0;
 const whitespace=(depth:number)=>{const value='\n'+'  '.repeat(depth);added+=value.length;if(added+source.length>2*1024*1024)throw Error('TOOL_RESULT_TOO_LARGE');return doc.createTextNode(value)};
 function format(el:Element,depth:number){
  if(depth>256)throw Error('TOOL_RESULT_TOO_LARGE');
  // Once preserved or mixed, leave the whole subtree alone. Descendant padding
  // would also change this element's text content.
  if(el.getAttributeNS('http://www.w3.org/XML/1998/namespace','space')==='preserve')return;
  const nodes=Array.from(el.childNodes);
  if(nodes.some(n=>n.nodeType===4||(n.nodeType===3&&/[^\t\n\r ]/.test(n.nodeValue||''))))return;
  if(!nodes.some(n=>n.nodeType===1))return;
  const children=nodes.filter(n=>n.nodeType!==3||/[^\t\n\r ]/.test(n.nodeValue||''));
  nodes.filter(n=>n.nodeType===3&&!/[^\t\n\r ]/.test(n.nodeValue||'')).forEach(n=>el.removeChild(n));
  for(const child of children){
   el.insertBefore(whitespace(depth+1),child);
   if(child.nodeType===1)format(child as Element,depth+1);
  }
  el.appendChild(whitespace(depth));
 }
 format(doc.documentElement,0);
 const result=new XMLSerializer().serializeToString(doc);
 if(result.length>2*1024*1024)throw Error('TOOL_RESULT_TOO_LARGE');
 return result;
}

/** Keep every occurrence; single values retain the tool's previous string shape. */
export function parseUrlDetails(source:string){
 const u=new URL(source.trim()),keys=Array.from(new Set(u.searchParams.keys()));
 const search=Object.fromEntries(keys.map(key=>{const values=u.searchParams.getAll(key);return[key,values.length===1?values[0]:values]}));
 return {protocol:u.protocol,host:u.host,hostname:u.hostname,port:u.port,pathname:u.pathname,search,searchEntries:Array.from(u.searchParams.entries()),hash:u.hash,origin:u.origin};
}
