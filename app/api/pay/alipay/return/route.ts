import { NextResponse } from "next/server";
import {trustedSiteOrigin} from "@/lib/sasi/site-origin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const baseUrl = trustedSiteOrigin(req);
  const destination = url.searchParams.get("dest");
  const safeDestination = destination?.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/account/orders";
  const next = new URL(safeDestination, baseUrl);
  next.searchParams.set("payment", "confirming");
  next.searchParams.set("provider", "alipay");
  return NextResponse.redirect(next);
}
