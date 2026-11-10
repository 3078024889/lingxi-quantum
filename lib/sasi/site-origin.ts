import "server-only";

const TRUSTED_HOSTS=new Set([
 "lingxifield.cn","www.lingxifield.cn",
 "lingxifield.com","www.lingxifield.com",
]);

/** Preserve the visitor's own production domain across external payment redirects. */
export function trustedSiteOrigin(req:Request):string{
 const raw=(req.headers.get("x-forwarded-host")||req.headers.get("host")||"")
  .split(",")[0].trim().toLowerCase();
 const hostname=raw.replace(/:\d+$/,"");
 if(raw&&TRUSTED_HOSTS.has(hostname)){
  const host=hostname;
  return "https://"+host;
 }
 const fallback=process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com";
 try{
  const parsed=new URL(fallback);
  if(TRUSTED_HOSTS.has(parsed.hostname.toLowerCase()))return parsed.origin;
 }catch{}
 return "https://lingxifield.com";
}
