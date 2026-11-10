// Thin same-owner API bridge. Authentication, merchant signatures, quotas and
// entitlement checks remain in the existing application on the operator's ECS.
export function createBusinessBridge(upstreamFetch=fetch){
 return {async fetch(request){
  const url=new URL(request.url);
  if(!['lingxifield.com','lingxifield-com-business-origin-20261110.3078024889.workers.dev'].includes(url.hostname))
   return Response.json({error:'INVALID_SITE'},{status:403});
  if(!url.pathname.startsWith('/api/')&&url.pathname!=='/account/auth')
   return Response.json({error:'ROUTE_NOT_ALLOWED'},{status:404});
  if(!['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'].includes(request.method))
   return Response.json({error:'METHOD_NOT_ALLOWED'},{status:405});
  const headers=new Headers();
  for(const name of ['accept','content-type','authorization','origin','referer','sec-fetch-site','range',
    'paypal-auth-algo','paypal-cert-url','paypal-transmission-id','paypal-transmission-sig','paypal-transmission-time',
    'wechatpay-signature','wechatpay-timestamp','wechatpay-nonce','wechatpay-serial']){
   if(request.headers.has(name))headers.set(name,request.headers.get(name));
  }
  const cookies=(request.headers.get('cookie')||'').split(';').map(x=>x.trim())
   .filter(x=>/^sb-[a-z0-9]+-auth-token(?:\.\d+)?=/i.test(x));
  if(cookies.length)headers.set('cookie',cookies.join('; '));
  headers.set('x-forwarded-host','lingxifield.com');
  headers.set('x-forwarded-proto','https');
  const ip=request.headers.get('cf-connecting-ip');
  if(ip){headers.set('x-forwarded-for',ip);headers.set('x-real-ip',ip);}
  const target='https://lingxifield.cn'+url.pathname+url.search;
  try{
   const init={method:request.method,headers,redirect:'manual',signal:AbortSignal.timeout(28000)};
   if(!['GET','HEAD'].includes(request.method))init.body=request.body;
   const result=await upstreamFetch(target,init);
   const outgoing=new Headers(result.headers);
   outgoing.set('cache-control','private, no-store');
   outgoing.set('x-content-type-options','nosniff');
   outgoing.set('x-lingxi-business-origin','ecs');
   // Host-only Supabase refresh cookies apply to the browser's .com origin.
   // A .cn Domain attribute must never be passed to the .com browser.
   const setCookies=result.headers.getSetCookie?.()||[];
   if(setCookies.length){
    outgoing.delete('set-cookie');
    for(const cookie of setCookies){
     if(/^sb-[a-z0-9]+-auth-token(?:\.\d+)?=/i.test(cookie))
      outgoing.append('set-cookie',cookie.replace(/;\s*Domain=[^;]+/ig,''));
    }
   }
   const location=outgoing.get('location');
   if(location){
    const destination=new URL(location,target);
    if(['lingxifield.cn','www.lingxifield.cn'].includes(destination.hostname)){
     destination.hostname='lingxifield.com';outgoing.set('location',destination.toString());
    }
   }
   return new Response(request.method==='HEAD'?null:result.body,{status:result.status,headers:outgoing});
  }catch{return Response.json({error:'BUSINESS_ORIGIN_UNAVAILABLE'},{status:503,headers:{'cache-control':'private, no-store'}});}
 }};
}
export default createBusinessBridge();
