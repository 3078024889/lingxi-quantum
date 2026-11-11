#!/usr/bin/env bash
set -Eeuo pipefail

: "${NEXT_PUBLIC_SUPABASE_URL:?NEXT_PUBLIC_SUPABASE_URL is required}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?NEXT_PUBLIC_SUPABASE_ANON_KEY is required}"
RUNNER_TEMP="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"

pnpm add -D @opennextjs/cloudflare@1.20.16 wrangler@4.158.0 --save-exact
pnpm seo:growth:generate
pnpm seo:growth:audit
pnpm exec opennextjs-cloudflare build
node scripts/cloudflare/stage-large-public-assets.mjs
node scripts/cloudflare/stage-r2-public-assets.mjs --audit

cat > .dev.vars <<EOF
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
SUPABASE_PUBLISHABLE_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
EOF
chmod 600 .dev.vars

worker_pid=""
cleanup() {
  if [[ -n "$worker_pid" ]]; then
    kill "$worker_pid" 2>/dev/null || true
    wait "$worker_pid" 2>/dev/null || true
  fi
  rm -f .dev.vars
}
trap cleanup EXIT

pnpm exec wrangler dev --local --ip 127.0.0.1 --port 8787 --log-level error > "$RUNNER_TEMP/lingxi-render-worker.log" 2>&1 &
worker_pid=$!
ready=0
for i in $(seq 1 70); do
  status="$(curl -sS --noproxy '*' --max-time 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:8787/api/health || true)"
  if [[ "$status" == 200 ]]; then ready=1; break; fi
  sleep 2
done
test "$ready" = 1

for path in /api/money/summary /api/sasi/account /api/sasi/marketplace/my-orders; do
  body="$(mktemp)"
  status="$(curl -sS --noproxy '*' --max-time 18 -o "$body" -w '%{http_code}' "http://127.0.0.1:8787$path" || true)"
  error="$(jq -r '.error // "none"' "$body" 2>/dev/null || echo invalid-json)"
  echo "COM_LOCAL_WORKER_PRIVATE path=$path HTTP_$status error=$error"
  rm -f "$body"
done

mkdir -p .open-next/assets/__lingxi_edge_static__
curl --noproxy '*' -fSs --retry 2 --max-time 45 \
  -H 'Host: lingxifield.com' -H 'X-Forwarded-Proto: https' \
  http://127.0.0.1:8787/ \
  -o .open-next/assets/__lingxi_edge_static__/landing.html

for mapping in \
  'siai:siai' \
  'en/siai:en-siai' \
  'ja/siai:ja-siai' \
  'ko/siai:ko-siai' \
  'fr/siai:fr-siai' \
  'de/siai:de-siai' \
  'es/siai:es-siai' \
  'pt/siai:pt-siai' \
  'ar/siai:ar-siai' \
  'tools:tools' \
  'tools/pass:tools-pass' \
  'ai-wallet:ai-wallet' \
  'account:account-login' \
  'sasi:sasi' \
  'about:about' \
  'announcements:announcements'; do
  route="${mapping%%:*}"
  file="${mapping#*:}"
  if [[ "$route" == siai || "$route" == */siai ]]; then
    # Next has already generated these exact locale pages during the build.
    # OpenNext's local dynamic-parameter router can 404 an existing SSG page;
    # copy the generated HTML directly, with no HTTP fallback or stale snapshot.
    test -s ".next/server/app/$route.html"
    cp ".next/server/app/$route.html" ".open-next/assets/__lingxi_edge_static__/$file.html"
    echo "COM_BUILD_GENERATED_SIAI_HTML route=/$route file=$file"
    continue
  fi
  curl --noproxy '*' -fSs --retry 2 --max-time 55 \
    -H 'Host: lingxifield.com' -H 'X-Forwarded-Proto: https' \
    "http://127.0.0.1:8787/$route" \
    -o ".open-next/assets/__lingxi_edge_static__/$file.html"
  echo "COM_ANON_HTML_SNAPSHOT route=/$route file=$file"
done

node scripts/cloudflare/tool-static-route-manifest-20261110.mjs --slugs |
  xargs -r -P 6 -I{} bash -c '
    slug="$1"
    curl --noproxy "*" -fSs --retry 2 --max-time 55 \
      -H "Host: lingxifield.com" -H "X-Forwarded-Proto: https" \
      "http://127.0.0.1:8787/tools/$slug" \
      -o ".open-next/assets/__lingxi_edge_static__/tool-$slug.html"
    echo "COM_TOOL_DETAIL_SNAPSHOT route=/tools/$slug"
  ' _ {}
echo "COM_TOOL_STATIC_SNAPSHOTS_CAPTURED"

# The discover pages are generateStaticParams() output. Copy the exact build HTML,
# just like SIAI, rather than relying on the OpenNext dynamic-parameter router.
node <<'NODE'
const fs = require("node:fs");
const topics = [
  "sasi-software-marketplace",
  "mt5-ea-source-code",
  "software-licensing-delivery",
  "developer-software-publishing"
];
const locales = ["zh","en","ja","ko","fr","de","es","pt","ar"];
for (const locale of locales) {
  for (const topic of topics) {
    const route = locale === "zh" ? `discover/${topic}` : `${locale}/discover/${topic}`;
    const source = `.next/server/app/${route}.html`;
    const target = `.open-next/assets/__lingxi_edge_static__/geo-${locale}-${topic}.html`;
    if (!fs.existsSync(source)) throw new Error("COM_GEO_GENERATED_HTML_MISSING:" + route);
    const stat = fs.statSync(source);
    if (stat.size < 4500) throw new Error("COM_GEO_GENERATED_HTML_TOO_SMALL:" + route + ":" + stat.size);
    fs.copyFileSync(source, target);
    console.log("COM_GEO_STATIC_SNAPSHOT route=/" + route + " bytes=" + stat.size);
  }
}
NODE

echo "COM_GEO_STATIC_SNAPSHOTS_CAPTURED"

curl --noproxy '*' -fSs --retry 2 --max-time 40 \
  -H 'Host: lingxifield.com' -H 'X-Forwarded-Proto: https' \
  http://127.0.0.1:8787/api/sasi/software/catalog \
  -o .open-next/assets/__lingxi_edge_static__/software-catalog.json
echo 'COM_PUBLIC_SOFTWARE_CATALOG_JSON_SNAPSHOT_CAPTURED'

kill "$worker_pid" 2>/dev/null || true
wait "$worker_pid" 2>/dev/null || true
worker_pid=""
rm -f .dev.vars
node scripts/cloudflare/patch-critical-static-html-20261108.mjs
node scripts/cloudflare/materialize-static-html-assets-20261110.mjs
echo 'COM_STATIC_ASSET_FIRST_ROUTES_APPLIED_BEFORE_CANARY_DEPLOY'
