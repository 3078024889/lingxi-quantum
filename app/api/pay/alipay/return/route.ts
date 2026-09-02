import { NextResponse } from "next/server";
import { alipaySiteUrl } from "@/lib/alipay";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const baseUrl = alipaySiteUrl();
  const destination = url.searchParams.get("dest");
  const safeDestination = destination?.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/account/orders";
  const next = new URL(safeDestination, baseUrl);
  next.searchParams.set("payment", "confirming");
  next.searchParams.set("provider", "alipay");
  return NextResponse.redirect(next);
}
