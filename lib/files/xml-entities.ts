/** Decode XML entities once, preserving escaped literal entity spellings. */
export function decodeXmlEntities(value:string):string{
 const named:Record<string,string>={lt:'<',gt:'>',amp:'&',quot:'"',apos:"'"};
 return value.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi,(original,entity:string)=>{
  if(!entity.startsWith('#'))return named[entity]??original;
  const point=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1));
  if(!Number.isInteger(point)||point<=0||point>0x10ffff||(point>=0xd800&&point<=0xdfff))throw Error('XML_CHARACTER_INVALID');
  return String.fromCodePoint(point);
 });
}
