#!/usr/bin/env python3
"""Exact-route Cloudflare gateway promotion, with fail-closed preflight and rollback.

This script NEVER changes DNS targets, the .cn site, Vercel, user data, or
payments. The current dynamic backend Worker remains deployed under its name.
Use only after the isolated gateway canary has passed. No secrets are logged.
"""
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request

ZONE = "0e9df0e4cf67601f60ce1b73fe011b94"
ACCOUNT = "a2f0881406e2477818e14a924c48ed4e"
OLD = "lingxifield-com-full-canary-20261107"
NEW = "lingxifield-com-static-gateway-canary-20261107"
CANARY = "https://" + NEW + ".3078024889.workers.dev"
PATTERNS = ("lingxifield.com/*", "www.lingxifield.com/*")
ASSETS = ("/", "/tools", "/siai", "/sasi", "/sasi/pricing",
          "/tools/pdf-editor", "/tools/e-sign-pdf", "/tools/pdf-merge-split",
          "/api/public/site-status")
API = "https://api.cloudflare.com/client/v4"


class ReleaseError(RuntimeError):
    pass


def request(url, method="GET", data=None, auth=False, timeout=22):
    headers = {"User-Agent": "LINGXIFIELD-static-gateway-promoter/20261107",
               "Accept-Encoding": "identity",
               "Cache-Control": "no-cache"}
    if auth:
        headers["Authorization"] = "Bearer " + os.environ["CLOUDFLARE_API_TOKEN"]
        headers["Content-Type"] = "application/json"
        headers["Accept"] = "application/json"
    payload = None if data is None else json.dumps(data, separators=(",", ":")).encode()
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    opener = urllib.request.build_opener(NoRedirect())
    try:
        with opener.open(req, timeout=timeout) as resp:
            return resp.status, resp.headers, resp.read(3_000_000)
    except urllib.error.HTTPError as err:
        return err.code, err.headers, err.read(4096)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def cf(path, method="GET", data=None):
    status, _, body = request(API + path, method=method, data=data, auth=True)
    try:
        result = json.loads(body)
    except (ValueError, UnicodeDecodeError):
        raise ReleaseError("CF_NONJSON:" + path)
    if status < 200 or status > 299 or result.get("success") is not True:
        raise ReleaseError("CF_API_FAILURE:" + path + ":" + str(status))
    return result.get("result")



# Observed on the production zone, not workers.dev. Cloudflare RUM is injected
# by the edge after the Worker response; never strip application scripts,
# build identifiers or arbitrary whitespace. Unknown beacon revisions fail closed.
# https://developers.cloudflare.com/web-analytics/faq/
_EDGE_BEACON = b"""<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/vce701823e78c4301a35b7e07294d87301792088814092" integrity="sha512-UKNk8GbxkABxKcXYuLkO16EleLGUkcvJWtpSNmExE0Too3ZaFAxTscNWEc1OdAv5/BikHawapSCaiD2XCmp+Bw==" data-cf-beacon='{"version":"2024.11.0","token":"2c2d1c862dbf4379a0d5908adbbe3605","r":1,"spa":2}' crossorigin="anonymous"></script>"""


def application_bytes(body):
    if body.count(_EDGE_BEACON) != 1:
        return body
    marker = _EDGE_BEACON + b"\n</body>"
    if marker in body:
        return body.replace(marker, b"</body>", 1)
    return body


def validate_public(base, *, baseline=None):
    checks = {}
    for path in ASSETS:
        status, headers, body = request(base + path)
        print("GATEWAY_PUBLIC_CHECK", base, path, status, flush=True)
        if status != 200 or not body:
            raise ReleaseError("PUBLIC_NOT_READY:" + base + path + ":" + str(status))
        if path == "/api/public/site-status":
            data = json.loads(body)
            if data.get("publicSurface") != "ready" or data.get("scope") != "public-maintenance-assets-only":
                raise ReleaseError("PUBLIC_STATUS_SCOPE_INVALID")
            if data.get("payments") != "not-attested" or data.get("sasi") != "not-attested":
                raise ReleaseError("PUBLIC_STATUS_FALSE_BUSINESS_CLAIM")
        elif b"html" not in headers.get("content-type", "").lower().encode():
            raise ReleaseError("PUBLIC_HTML_TYPE_INVALID:" + path)
        checks[path] = hashlib.sha256(application_bytes(body)).hexdigest()
        if baseline is not None and checks[path] != baseline[path]:
            raise ReleaseError("PUBLIC_ASSET_SHA_CHANGED:" + base + path)
    return checks


def snapshot():
    zones = cf("/zones?name=lingxifield.com&per_page=5")
    found = [z for z in zones if z.get("name") == "lingxifield.com"
             and z.get("status") == "active" and z.get("id") == ZONE]
    if len(found) != 1:
        raise ReleaseError("ZONE_NOT_EXACT_ACTIVE_MATCH")
    routes = cf("/zones/" + ZONE + "/workers/routes?per_page=100")
    exact = {}
    for r in routes:
        pattern = r.get("pattern")
        if pattern in PATTERNS:
            if pattern in exact:
                raise ReleaseError("DUPLICATE_DOMAIN_ROUTE:" + pattern)
            exact[pattern] = r
        elif "lingxifield.com" in str(pattern):
            raise ReleaseError("UNEXPECTED_EXTRA_DOMAIN_ROUTE")
    if set(exact) != set(PATTERNS):
        raise ReleaseError("TWO_EXACT_ROUTES_REQUIRED")
    for pattern in PATTERNS:
        r = exact[pattern]
        if r.get("script") != OLD or not r.get("id"):
            raise ReleaseError("OLD_WORKER_NOT_ACTIVE:" + pattern)
    # Do not change the original Vercel origin records; they must stay proxied.
    for name in ("lingxifield.com", "www.lingxifield.com"):
        records = cf("/zones/" + ZONE + "/dns_records?name=" + name + "&per_page=100")
        hits = [r for r in records if r.get("name") == name and r.get("type") in ("A", "AAAA", "CNAME")]
        if len(hits) != 1 or hits[0].get("proxied") is not True:
            raise ReleaseError("EXPECTED_PROXIED_BACKUP_DNS_MISSING:" + name)
    return exact


def switch(pattern, route_id, script):
    result = cf("/zones/" + ZONE + "/workers/routes/" + route_id,
                method="PUT", data={"pattern": pattern, "script": script})
    if result.get("pattern") != pattern or result.get("script") != script or result.get("id") != route_id:
        raise ReleaseError("ROUTE_UPDATE_RESPONSE_MISMATCH:" + pattern)


def check_www():
    for path in ("/", "/tools/e-sign-pdf", "/sasi/pricing"):
        status, headers, _ = request("https://www.lingxifield.com" + path)
        dest = headers.get("Location", "")
        if status != 308 or dest != "https://lingxifield.com" + path:
            raise ReleaseError("WWW_CANONICAL_INVALID:" + path + ":" + str(status))
        print("WWW_EXACT_308", path)


def main():
    if sys.argv[1:] != ["--promote-public-only"]:
        raise ReleaseError("EXPLICIT_PUBLIC_ONLY_RELEASE_FLAG_REQUIRED")
    if os.environ.get("CLOUDFLARE_ACCOUNT_ID") != ACCOUNT or not os.environ.get("CLOUDFLARE_API_TOKEN"):
        raise ReleaseError("CF_ACCOUNT_TOKEN_NOT_READY")
    if cf("/user/tokens/verify").get("status") != "active":
        raise ReleaseError("TOKEN_INVALID")
    # Probe the actual gateway script before allowing any production changes.
    status, headers, body = request(CANARY + "/__lingxi_gateway_probe")
    if status != 200 or body != b"LINGXI_GATEWAY_CANARY_V2" or headers.get("x-lingxi-gateway") != "v2":
        raise ReleaseError("GATEWAY_SCRIPT_NOT_REACHED")
    baseline = validate_public(CANARY)
    for i in range(4):
        validate_public(CANARY, baseline=baseline)
        print("CANARY_STATIC_STABLE", i + 1)
    saved = snapshot()
    changed = []
    try:
        for pattern in PATTERNS:
            changed.append(pattern)  # mutate-then-timeout must be rollback-safe
            switch(pattern, saved[pattern]["id"], NEW)
            print("ROUTE_SWITCHED", pattern, NEW, flush=True)
        # A pending CDN route update may take seconds; do not accept changed bodies.
        last = None
        for attempt in range(1, 8):
            try:
                validate_public("https://lingxifield.com", baseline=baseline)
                check_www()
                last = None
                break
            except ReleaseError as exc:
                last = str(exc)
                print("PUBLIC_ROUTE_RETRY", attempt, last, flush=True)
                time.sleep(3)
        if last is not None:
            raise ReleaseError("POST_ROUTE_ACCEPTANCE_FAILED:" + last)
        routes = cf("/zones/" + ZONE + "/workers/routes?per_page=100")
        for pattern in PATTERNS:
            current = [r for r in routes if r.get("pattern") == pattern]
            if len(current) != 1 or current[0].get("script") != NEW:
                raise ReleaseError("ROUTE_NOT_STABLE:" + pattern)
        print("PRODUCTION_PUBLIC_STATIC_GATE_SUCCESS_LEGACY_DYNAMIC_STILL_SEPARATELY_UNVERIFIED")
    except Exception as exc:
        print("PUBLIC_PROMOTION_FAILED_ROLLING_BACK", type(exc).__name__, flush=True)
        failures = []
        for pattern in reversed(changed):
            try:
                switch(pattern, saved[pattern]["id"], OLD)
                print("RESTORED_ORIGINAL_ROUTE", pattern, flush=True)
            except Exception as restore:
                failures.append(pattern + ":" + type(restore).__name__)
        if failures:
            raise ReleaseError("CRITICAL_ROLLBACK_FAILURE:" + ",".join(failures)) from exc
        print("ALL_CHANGED_ROUTES_ROLLED_BACK")
        raise


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print("COM_PUBLIC_RELEASE_FAILED:", type(err).__name__, str(err)[:250], file=sys.stderr)
        sys.exit(1)
