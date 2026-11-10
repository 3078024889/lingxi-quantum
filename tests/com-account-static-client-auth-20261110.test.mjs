import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(path, "utf8");

test("account page is a static, non-personalized shell with no server-side session or order query", () => {
  const page = read("app/account/page.tsx");
  assert.match(page, /export const dynamic = "force-static"/);
  assert.match(page, /<AccountClientShell\\s*\\/>/);
  assert.match(page, /robots: \\{ index: false, follow: false \\}/);
  assert.doesNotMatch(page, /getServerUser|createClient|searchParams|lib\\/supabase\\/server/);
});

test("browser shell authenticates through the public Supabase client and keeps private details hidden until verified", () => {
  const shell = read("app/account/AccountClientShell.tsx");
  assert.match(shell, /^"use client";/);
  assert.match(shell, /createClient/);
  assert.match(shell, /supabase\\.auth\\.getUser\\(\\)/);
  assert.match(shell, /supabase\\.auth\\.onAuthStateChange/);
  assert.match(shell, /view === "loading"/);
  assert.match(shell, /view === "error"/);
  assert.match(shell, /MiniAccountLinkPanel/);
  assert.match(shell, /LoginForm/);
  assert.match(shell, /AccountCenterV26/);
  assert.match(shell, /requestedNext\\.startsWith\\("\\/"\\)/);
  assert.match(shell, /requestedNext\\.startsWith\\("\\/\\/"\\)/);
  assert.match(shell, /String\\.fromCharCode\\(92\\)/);
  assert.match(shell, /select\\("id", \\{ count: "exact", head: true \\}\\)/);
  assert.doesNotMatch(shell, /SUPABASE_SECRET_KEY|SERVICE_ROLE|createAdminClient/);
});

test("Cloudflare serves the generic account shell as a direct static asset while preserving authenticated APIs", () => {
  const materializer = read("scripts/cloudflare/materialize-static-html-assets-20261110.mjs");
  assert.match(materializer, /route: "\\/account", source: "account-login\\.html", target: "account\\.html"/);
  assert.match(materializer, /Referrer-Policy: no-referrer/);
  const patch = read("scripts/cloudflare/patch-critical-static-html-20261108.mjs");
  assert.match(patch, /const accountIsDynamic=false/);
  assert.match(patch, /const edgeFile=verifiedAnonymousPages\\[pathname\\]/);
  const canary = read(".github/workflows/com-unified-next-isolated-canary-20261108.yml");
  assert.match(canary, /account:account-login/);
  assert.match(canary, /COM_CANARY_CANONICAL_SLASH/);
  const cutover = read("scripts/cloudflare/com-celestial-apex-verified-cutover-20261109.mjs");
  assert.match(cutover, /"\\/account"/);
  assert.match(cutover, /staticRoutes=new Set\\([^\\n]*"\\/account"/);
});

test("server-side account login remains same-origin and all private account APIs remain authenticated", () => {
  const auth = read("app/account/auth/route.ts");
  assert.match(auth, /isSameOriginMutation\\(req\\)/);
  assert.match(auth, /signInWithPassword/);
  assert.match(auth, /verifyOtp/);
  const privateApi = read("app/api/sasi/account/route.ts");
  assert.match(privateApi, /getServerUser\\(supabase\\)/);
  assert.match(privateApi, /AUTH_REQUIRED/);
  assert.match(privateApi, /status: 401/);
});
