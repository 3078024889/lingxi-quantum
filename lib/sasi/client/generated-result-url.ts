/** API asset links are authenticated and must not be rejected as non-HTTPS supplier links. */
export function isGeneratedResultUrl(value:unknown):value is string{
 if(typeof value!=='string')return false;
 if(/^\/api\/sasi\/generated-assets\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))return true;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password}catch{return false}
}
