/** Normalize and reject potentially identifying Search Console query strings before evidence storage. */
export function safeGscQuery(value){
 if(typeof value!=='string')return null;
 const query=value.normalize('NFKC').replace(/\s+/g,' ').trim();
 if(!query||query.length>120)return null;
 const unsafe=[
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:https?:\/\/|www\.)/i,
  /\b\d{8,}\b/,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  /\b(?:sk|pk|api|token)[-_][A-Za-z0-9_-]{12,}\b/i,
  /\+?\d[\d\s().-]{7,}\d/
 ];
 if(unsafe.some(pattern=>pattern.test(query)))return null;
 return query;
}
