import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(path, "utf8");

test("account page is a static, non-personalized shell with no server-side session or order query", () => {
  const page = read("app/account/page.tsx");
  assert.ok(page.includes('export const dynamic = "force-static"'));
  assert.ok(page.includes("<AccountClientShell />"));
  assert.ok(page.includes("robots: { index: false, follow: false }"));
  assert.doesNotMatch(page, /getServerUser|createClient|searchParams|lib\/supabase\/server/);
});

test("browser shell authenticates through the public Supabase client and keeps private details hidden until verified", () => {
  const shell = read("app/account/AccountClientShell.tsx");
  for (const fragment of [
    '"use client";',
    "createClient",
    "supabase.auth.getUser()",
    "supabase.auth.onAuthStateChange",
    'view === "loading"',
    'view === "error"',
    "MiniAccountLinkPanel",
    "LoginForm",
    "AccountCenterV26",
    'requestedNext.startsWith("/")',
    'requestedNext.startsWith("//")',
    "String.fromCharCode(92)",
    'select("id", { count: "exact", head: true })'
  ]) assert.ok(shell.includes(fragment), "missing client-auth contract: " + fragment);
  assert.doesNotMatch(shell, /SUPABASE_SECRET_KEY|SERVICE_ROLE|createAdminClient/);
});

test("Cloudflare serves the generic account shell as a direct static asset while preserving authenticated APIs", () => {
  const materializer = read("scripts/cloudflare/materialize-static-html-assets-20261110.mjs");
  assert.ok(materializer.includes('route: "/account", source: "account-login.html", target: "account.html"'));
  assert.ok(materializer.includes("Referrer-Policy: no-referrer"));
  const patch = read("scripts/cloudflare/patch-critical-static-html-20261108.mjs");
  assert.ok(patch.includes("const accountIsDynamic=false"));
  assert.ok(patch.includes("const edgeFile=verifiedAnonymousPages[pathname]"));
  const canary = read(".github/workflows/com-unified-next-isolated-canary-20261108.yml");
  assert.ok(canary.includes("account:account-login"));
  assert.ok(canary.includes("COM_CANARY_CANONICAL_SLASH"));
  const cutover = read("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs");
  assert.ok(cutover.includes('"/account"'));
  assert.ok(cutover.includes('staticRoutes=new Set(["/","/siai","/tools","/sasi","/sasi/marketplace","/about","/announcements","/tools/pass","/ai-wallet","/account"'));
});

test("server-side account login remains same-origin and all private account APIs remain authenticated", () => {
  const auth = read("app/account/auth/route.ts");
  assert.ok(auth.includes("isSameOriginMutation(req)"));
  assert.ok(auth.includes("signInWithPassword"));
  assert.ok(auth.includes("verifyOtp"));
  const privateApi = read("app/api/sasi/account/route.ts");
  assert.ok(privateApi.includes("getServerUser(supabase)"));
  assert.ok(privateApi.includes("AUTH_REQUIRED"));
  assert.ok(privateApi.includes("status: 401"));
});
