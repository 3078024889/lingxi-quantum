/** Public catalog input bounds: prevent memory amplification and malformed filters. */
export function marketRegistryParams(searchParams){
 const limitText=searchParams.get('limit'),cursorText=searchParams.get('cursor');
 const limit=limitText===null?24:Number(limitText),cursor=cursorText===null?0:Number(cursorText);
 const q=(searchParams.get('q')||'').trim();
 if(!Number.isSafeInteger(limit)||limit<1||limit>50||!Number.isSafeInteger(cursor)||cursor<0||cursor>100000||q.length>120)
 return null;
 return {q,limit,cursor};
}
export function marketIdParam(id){
 return typeof id==='string'&&/^[a-z][a-z0-9-]{0,79}$/.test(id)?id:null;
}
