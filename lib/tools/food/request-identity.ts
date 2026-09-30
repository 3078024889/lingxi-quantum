import{createHash}from"node:crypto";import type{NextRequest}from"next/server";
export function foodRequestIpHash(req:NextRequest){
 const raw=(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||req.headers.get("x-real-ip")?.trim()||"unknown").slice(0,128);
 return createHash("sha256").update(raw).digest("hex");
}