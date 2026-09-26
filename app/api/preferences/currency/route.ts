import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { parseCurrency, recommendedCurrency } from "@/lib/payments/currency-book";

export const runtime = "nodejs";
const COOKIE = "lx_currency";

async function accountCurrency() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, currency: null as "CNY" | "USD" | null };

    const { data, error } = await supabase
      .from("profiles")
      .select("preferred_currency")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return { user, currency: null as "CNY" | "USD" | null };
    return { user, currency: parseCurrency(data?.preferred_currency) };
  } catch {
    return { user: null, currency: null as "CNY" | "USD" | null };
  }
}

export async function GET(req: NextRequest) {
  const account = await accountCurrency();
  const cookieCurrency = parseCurrency(req.cookies.get(COOKIE)?.value);

  return NextResponse.json({
    accountCurrency: account.currency,
    cookieCurrency,
    recommendedCurrency: recommendedCurrency(req),
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as { currency?: unknown } | null;
  const currency = parseCurrency(body?.currency);
  if (!currency) return NextResponse.json({ error: "INVALID_CURRENCY" }, { status: 400 });

  const account = await accountCurrency();
  let accountSaved = false;

  if (account.user) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { id: account.user.id, preferred_currency: currency },
          { onConflict: "id" }
        );
      accountSaved = !error;
    } catch {}
  }

  const res = NextResponse.json({ ok: true, currency, accountSaved });
  res.cookies.set(COOKIE, currency, {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
