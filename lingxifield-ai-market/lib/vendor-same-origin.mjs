/**
 * Strict browser same-origin protection for the public vendor interest form.
 *
 * Do not compare Origin to the Next.js internal request.url hostname: that URL
 * may be normalized to localhost behind a reverse proxy. Host is the authority
 * actually addressed by the browser; Origin must match it byte-for-byte after
 * URL parsing and Fetch Metadata must not mark the request as cross-site.
 *
 * x-forwarded-host is deliberately ignored: an untrusted client can forge it.
 * The endpoint still requires server-side validation and grants no ownership.
 */
export function isVendorSameOrigin(request){
 const raw=request.headers.get("origin");
 const host=request.headers.get("host");
 if(!raw||!host)return false;
 let origin;
 try{origin=new URL(raw)}catch{return false}
 if(origin.origin!==raw||origin.username||origin.password||origin.pathname!=="/"||origin.search||origin.hash)return false;
 if(origin.protocol!=="https:" && !(origin.protocol==="http:" && /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(origin.hostname)))return false;
 if(origin.host.toLowerCase()!==host.toLowerCase())return false;
 const fetchSite=request.headers.get("sec-fetch-site");
 if(fetchSite&&fetchSite!=="same-origin"&&fetchSite!=="none")return false;
 return true;
}
