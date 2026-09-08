import "server-only";
import type { NextRequest } from "next/server";

export function isSameOriginMutation(request: NextRequest) {
  const origin=request.headers.get("origin");
  const fetchSite=request.headers.get("sec-fetch-site");
  if(fetchSite&&fetchSite!=="same-origin") return false;
  if(!origin) return false;
  try{return new URL(origin).origin===request.nextUrl.origin;}catch{return false;}
}
