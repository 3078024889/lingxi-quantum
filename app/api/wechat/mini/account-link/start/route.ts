import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { requireMiniSession } from "@/lib/mini/session";

export const runtime = "nodejs";

// A short-lived, encrypted hand-off proves that the person who opened the
// account page came from this Mini Program session. It is not an account
// credential and cannot be used to open reports or make payments.
export async function POST(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });

  const ticket = encryptMiniSecret(JSON.stringify({
    sourceUserId: session.userId,
    openid: session.openid,
    expiresAt: Date.now() + 10 * 60 * 1000,
    nonce: randomBytes(18).toString("base64url"),
  }));
  return NextResponse.json({ path: `/account?miniLink=${encodeURIComponent(ticket)}` });
}
