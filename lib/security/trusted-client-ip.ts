import "server-only";
import {isIP} from "node:net";

/**
 * Read the client IP only from an explicitly trusted edge/proxy boundary.
 * On Vercel, x-vercel-forwarded-for/x-real-ip are assigned by Vercel.
 * Self-hosted deployments must explicitly opt into a sanitizing trusted proxy.
 * Untrusted user-supplied X-Forwarded-For must never create fresh quota buckets.
 */
export function trustedClientIp(request: Pick<Request,"headers">):string{
  const productionEdge=process.env.VERCEL==="1";
  const externalProxy=process.env.LINGXIFIELD_TRUST_PROXY_HEADERS==="true";
  if(!productionEdge&&!externalProxy)return "unknown";
  const fields=productionEdge
    ?["x-vercel-forwarded-for","x-real-ip"]
    :["x-forwarded-for","x-real-ip"];
  for(const field of fields){
    const raw=request.headers.get(field)?.trim()??"";
    // Never trust an unbounded forwarded chain or a user-supplied arbitrary key.
    if(!raw||raw.length>64||raw.includes(","))continue;
    if(isIP(raw)===4||isIP(raw)===6)return raw.toLowerCase();
  }
  return "unknown";
}
