import{createHash}from"node:crypto";import type{NextRequest}from"next/server";
import{trustedClientIp}from"@/lib/security/trusted-client-ip";
export function foodRequestIpHash(req:NextRequest){
 const raw=trustedClientIp(req);
 return createHash("sha256").update(raw).digest("hex");
}