#!/usr/bin/env python3
"""LINGXIFIELD .com public-maintenance cutover. Explicit opt-in, exact scope, auto rollback.

This deliberately preserves old Vercel A/CNAME targets and never reads or alters
financial data. Cloudflare routes intercept proxied DNS; on failure proxying and
newly created routes are reverted. Vercel project is not modified.
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.cloudflare.com/client/v4"
ZONE_NAME = "lingxifield.com"
EXPECTED_ZONE_ID = "0e9df0e4cf67601f60ce1b73fe011b94"
EXPECTED_ACCOUNT_ID = "a2f0881406e2477818e14a924c48ed4e"
SCRIPT = "lingxifield-com-full-canary-20261107"
CANARY = "https://lingxifield-com-full-canary-20261107.3078024889.workers.dev"
HOSTS = ("lingxifield.com", "www.lingxifield.com")

def stop(msg):
    raise RuntimeError(msg)

def request(url, *, method="GET", payload=None, headers=None, timeout=25):
    h = {"User-Agent": "LINGXIFIELD-exact-domain-cutover/20261107", "Accept": "application/json"}
    if headers:
        h.update(headers)
    body = None if payload is None else json.dumps(payload, separators=(",", ":")).encode()
    if body is not None:
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as f:
            return f.status, f.read(200000)
    except urllib.error.HTTPError as e:
        return e.code, e.read(5000)

def cf(path, *, method="GET", payload=None):
    token = os.environ["CLOUDFLARE_API_TOKEN"]
    code, raw = request(API + path, method=method, payload=payload,
                        headers={"Authorization": "Bearer " + token})
    try:
        result = json.loads(raw)
    except ValueError:
        stop("CF_API_NONJSON:" + str(code) + ":" + path.split("?")[0])
    if code < 200 or code >= 300 or result.get("success") is not True:
        errors = [str(e.get("code", "")) + ":" + str(e.get("message", ""))[:120]
                  for e in result.get("errors", [])[:3]]
        stop("CF_API_FAILED:" + str(code) + ":" + path.split("?")[0] + ":" + ";".join(errors))
    return result["result"]

def page(host, path):
    url = host + path
    return request(url, headers={"Accept-Encoding": "identity", "Cache-Control": "no-cache"}, timeout=25)

def assert_canary():
    expected = {"/": 200, "/tools": 200, "/siai": 200,
                "/api/health": 200, "/api/site-release-announcement": 200,
                "/api/sasi/account": 401, "/api/tools/jobs": 401,
                "/api/public/siai-widget": 200}
    baseline = {}
    for path, wanted in expected.items():
        code, body = page(CANARY, path)
        print("COM_PRE_CUTOVER_CANARY", path, code)
        if code != wanted:
            stop("CANARY_NOT_READY:" + path + ":" + str(code))
        if path in ("/", "/tools", "/siai"):
            if len(body) < 1000 or b"<html" not in body:
                stop("CANARY_PUBLIC_HTML_INVALID:" + path)
            baseline[path] = hashlib.sha256(body).hexdigest()
        if path == "/api/site-release-announcement":
            d = json.loads(body)
            if d.get("enabled") is not True or d.get("phase") != "maintenance" or d.get("site") != "main":
                stop("CANARY_MAINTENANCE_NOTICE_NOT_ACTIVE")
    return baseline

def exact_dns(zone_id):
    result = {}
    for hostname in HOSTS:
        value = cf("/zones/" + zone_id + "/dns_records?"
                   + urllib.parse.urlencode({"name": hostname, "per_page": 100}))
        a = [d for d in value if d.get("type") in ("A", "AAAA", "CNAME")
             and d.get("name") == hostname]
        if len(a) != 1:
            stop("UNEXPECTED_EXACT_HOST_DNS_COUNT:" + hostname + ":" + str(len(a)))
        record = a[0]
        if hostname == HOSTS[0]:
            if record["type"] != "A" or record.get("content") != "216.198.79.1":
                stop("APEX_VERCEL_BACKUP_ORIGIN_NOT_MATCHED")
        else:
            if record["type"] != "CNAME" or not str(record.get("content", "")).endswith(".vercel-dns-017.com"):
                stop("WWW_VERCEL_BACKUP_ORIGIN_NOT_MATCHED")
        if record.get("proxied") is not False or record.get("proxiable") is False:
            stop("DNS_ALREADY_PROXIED_OR_UNPROXYABLE:" + hostname)
        result[hostname] = record
        print("COM_VERCEL_DNS_BACKUP_HELD", hostname, record["type"], str(record["content"])[:100])
    return result

def proxied(zone_id, rec, enable):
    doc = {"type": rec["type"], "name": rec["name"],
           "content": rec["content"], "ttl": 1 if enable else rec["ttl"], "proxied": enable}
    out = cf("/zones/" + zone_id + "/dns_records/" + rec["id"],
             method="PATCH", payload=doc)
    if out.get("proxied") is not enable or out.get("content") != rec["content"]:
        stop("DNS_PROXY_UPDATE_UNEXPECTED:" + rec["name"])
    print("COM_DNS_PROXY_STATE", rec["name"], enable)

def probe_live(hostname, baseline):
    url = "https://" + hostname
    checks = {"/api/health": 200, "/": 200, "/tools": 200,
              "/siai": 200, "/api/site-release-announcement": 200,
              "/api/sasi/account": 401, "/api/tools/jobs": 401}
    last = {}
    for attempt in range(1, 25):
        results = {}
        for path, wanted in checks.items():
            code, body = page(url, path)
            results[path] = code
            if code == wanted and path in baseline:
                if hashlib.sha256(body).hexdigest() != baseline[path]:
                    results[path] = -1
            if path == "/api/site-release-announcement" and code == 200:
                try:
                    d = json.loads(body)
                    if d.get("enabled") is not True or d.get("phase") != "maintenance":
                        results[path] = -2
                except (ValueError, TypeError):
                    results[path] = -3
        if all(results.get(p) == wanted for p, wanted in checks.items()):
            print("COM_EXACT_HOST_HTTP_GATE_PASS", hostname, "attempt", attempt)
            for p in ("/", "/tools", "/siai"):
                print("COM_EXACT_HOST_ASSET_SHA256_PASS", hostname, p)
            return
        last = results
        print("COM_EXACT_HOST_STILL_PROPAGATING", hostname, attempt,
              ",".join(p + "=" + str(results.get(p)) for p in checks if results.get(p) != checks[p]))
        time.sleep(5)
    stop("EXACT_HOST_HEALTH_GATE_FAILED:" + hostname + ":" + json.dumps(last))

def steady_check(hostname):
    url = "https://" + hostname
    for attempt in range(1, 5):
        for path in ("/", "/tools", "/siai"):
            code, _ = page(url, path)
            if code != 200:
                stop("LIVE_PUBLIC_INTERMITTENT_ERROR:" + hostname + ":" + path + ":" + str(code))
        print("COM_LIVE_STEADY_3_ROUTES_PASS", hostname, attempt)

def main():
    if sys.argv[1:] != ["--promote-public-maintenance-only"]:
        stop("EXPLICIT_OPT_IN_REQUIRED")
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    if account != EXPECTED_ACCOUNT_ID:
        stop("CF_ACCOUNT_ID_UNEXPECTED")
    if not os.environ.get("CLOUDFLARE_API_TOKEN", ""):
        stop("CF_TOKEN_MISSING")
    token = cf("/user/tokens/verify")
    if token.get("status") != "active":
        stop("CF_TOKEN_NOT_ACTIVE")
    zones = cf("/zones?" + urllib.parse.urlencode({"name": ZONE_NAME, "per_page": 5}))
    active = [z for z in zones if z.get("name") == ZONE_NAME and z.get("status") == "active"]
    if len(active) != 1 or active[0]["id"] != EXPECTED_ZONE_ID:
        stop("ZONE_ID_OR_ACTIVE_STATE_UNEXPECTED")
    zid = active[0]["id"]
    routes = cf("/zones/" + zid + "/workers/routes?per_page=100")
    if any("lingxifield.com" in str(x.get("pattern", ""))
           for x in routes):
        stop("EXISTING_DOMAIN_WORKER_ROUTES_REQUIRE_MANUAL_REVIEW")
    dns = exact_dns(zid)
    baseline = assert_canary()
    print("COM_DEPLOYMENT_PRECHECK_PASS")
    new_routes = []
    changed_dns = []
    success = False
    try:
        for hostname in HOSTS:
            pattern = hostname + "/*"
            new = cf("/zones/" + zid + "/workers/routes", method="POST",
                     payload={"pattern": pattern, "script": SCRIPT})
            if new.get("script") != SCRIPT or new.get("pattern") != pattern or not new.get("id"):
                stop("ROUTE_CREATED_WITH_WRONG_TARGET:" + hostname)
            new_routes.append(new["id"])
            print("COM_NEW_WORKER_ROUTE_STAGED", hostname, SCRIPT)
            proxied(zid, dns[hostname], True)
            changed_dns.append(hostname)
            probe_live(hostname, baseline)
            steady_check(hostname)
        check_routes = cf("/zones/" + zid + "/workers/routes?per_page=100")
        for hostname in HOSTS:
            if not any(r.get("pattern") == hostname + "/*" and r.get("script") == SCRIPT for r in check_routes):
                stop("WORKER_ROUTE_READBACK_MISMATCH:" + hostname)
        print("COM_PUBLIC_MAINTENANCE_SITE_SWITCH_SUCCESS")
        print("COM_VERCEL_PROJECT_AND_DNS_ORIGIN_VALUES_PRESERVED=true")
        print("COM_NAMED_DOMAINS_LIVE=lingxifield.com,www.lingxifield.com")
        print("COM_REAL_LOGIN_PAYMENTS_REFUNDS_SASI_FILE_EXPORT_NOT_ATTESTED=true")
        success = True
    finally:
        if not success:
            print("COM_PUBLIC_SWITCH_FAILED_ROLLING_BACK")
            errors = []
            for hostname in reversed(changed_dns):
                try:
                    proxied(zid, dns[hostname], False)
                except Exception as exc:
                    errors.append("RESTORE_DNS:" + hostname + ":" + str(exc)[:130])
            for rid in reversed(new_routes):
                try:
                    cf("/zones/" + zid + "/workers/routes/" + rid, method="DELETE")
                except Exception as exc:
                    errors.append("DELETE_ROUTE:" + rid + ":" + str(exc)[:130])
            if errors:
                print("COM_PUBLIC_ROLLBACK_INCOMPLETE:", ";".join(errors))
            else:
                print("COM_PUBLIC_ROLLBACK_VERCEL_DNS_TARGETS_RESTORED")

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("COM_RELEASE_ABORT:", str(error)[:420], file=sys.stderr)
        sys.exit(1)
