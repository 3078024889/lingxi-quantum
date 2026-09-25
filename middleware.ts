import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SECURITY_HOLD_EXACT = new Set([
  "/api/tools/website-diagnose",
]);

export async function middleware(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHostname = (forwardedHost || request.headers.get("host") || request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  if (requestHostname === "www.lingxifield.cn" || requestHostname === "www.lingxifield.com") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = requestHostname.slice(4);
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const { pathname } = request.nextUrl;

  if (SECURITY_HOLD_EXACT.has(pathname)) {
    return NextResponse.json(
      { error: "SECURITY_HOLD" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "3600",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }

  const retiredLegacyExact = new Set([
    "/learn","/glossary",
    "/live-as","/subconscious","/practice","/field-tests","/life-map","/relationship",
    "/qian","/mirror","/tarot","/resilience","/romance","/daily","/wealth",
    "/archetype","/mini-report","/membership","/origin"
  ]);

  const retiredLegacyPrefixes = [
    "/practice/","/life-map/","/relationship/","/qian/","/mirror/","/tarot/",
    "/resilience/","/romance/","/daily/","/wealth/","/archetype/","/mini-report/",
    "/gate/",
    "/learn/",
    "/learn/angel-numbers","/learn/higher-self","/learn/raise-frequency",
    "/learn/chakras","/learn/synchronicity","/learn/awakening",
    "/learn/moon-manifestation","/learn/law-of-attraction-vs",
    "/learn/letting-go","/learn/emptiness","/learn/energy-drain"
  ];

  const legacyKnowledgeSurface =
    pathname === "/learn" || pathname === "/glossary" || pathname.startsWith("/learn/");

  if (
    retiredLegacyExact.has(pathname) ||
    retiredLegacyPrefixes.some((prefix)=>pathname.startsWith(prefix))
  ) {
    const target=request.nextUrl.clone();
    target.pathname=legacyKnowledgeSurface?"/explore":"/products";
    target.search="";
    return NextResponse.redirect(target,308);
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(cleanUrl, 308);
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("middleware getUser timeout")), 5000)
      ),
    ]);
  } catch (e) {
    console.error("[middleware] session refresh failed or timed out:", e instanceof Error ? e.message : String(e));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
