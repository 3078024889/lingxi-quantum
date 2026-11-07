// Isolated feasibility experiment. Never attach this Worker to production routes.
// No credentials, cookies, writes, payment operations or user-specific responses cross the zone.
const PUBLIC_READS=new Map([
  ["/",200],["/tools",200],["/siai",200],["/sasi",200],["/sasi/pricing",200],
  ["/account",200],["/account/orders",200],["/tools/pass",200],
  ["/api/health",200],["/api/pay/providers",200],["/api/sasi/readiness",200],
  ["/api/tools/pass",200],["/api/sasi/account",401],["/api/money/summary",401],
  ["/api/tools/jobs",401],["/api/account/wallet-ledger",401]
]);
export default {
  async fetch(request){
    if(request.method!=="GET"&&request.method!=="HEAD")
      return new Response("READ_ONLY_CANARY",{status:405,headers:{"Allow":"GET, HEAD"}});
    const url=new URL(request.url);
    if(url.search||!PUBLIC_READS.has(url.pathname))
      return new Response("NOT_IN_CANARY_ALLOWLIST",{status:404});
    const target="https://lingxifield.cn"+url.pathname;
    // Intentionally DO NOT forward Cookie, Authorization, Origin, X-Forwarded-*,
    // client IP, body or personalized header values. No redirect following.
    const upstream=await fetch(target,{
      method:request.method,
      redirect:"manual",
      headers:{"Accept":url.pathname.startsWith("/api/")?"application/json":"text/html",
               "User-Agent":"LINGXIFIELD-anonymous-architecture-readonly-probe/1.0"}
    });
    const h=new Headers({
      "Cache-Control":"no-store, private",
      "X-Content-Type-Options":"nosniff",
      "Content-Type":upstream.headers.get("content-type")||"application/octet-stream"
    });
    // If an unexpected redirect happens, do not forward it or any external Location.
    if(upstream.status>=300&&upstream.status<400)
      return new Response("UNEXPECTED_UPSTREAM_REDIRECT",{status:502,headers:h});
    return new Response(request.method==="HEAD"?null:upstream.body,
      {status:upstream.status,headers:h});
  }
};
