#!/usr/bin/env python3
"""Hermetic, network-free regression for the .com domain cutover transaction."""
import importlib.util
import hashlib
import socket
import os
from pathlib import Path
import sys
import urllib.parse

SCRIPT = Path(__file__).resolve().parents[2] / "scripts/cloudflare/com-public-route-cutover-20261107.py"
spec = importlib.util.spec_from_file_location("lingxifield_com_release", SCRIPT)
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)
ORIGINAL_EDGE_PROBE=app.edge_probe
B = b"<html><body>LINGXIFIELD" + b"x" * 1500 + b"</body></html>"

class FakeCloudflare:
    def __init__(self, fail_live=False, bad_zone=False, conflict=False, stale_402=False):
        self.fail_live=fail_live
        self.stale_402=stale_402
        self.bad_zone=bad_zone
        self.routes=[{"id":"preexisting","pattern":"lingxifield.com/*","script":"other"}] if conflict else []
        self.records = {
            "lingxifield.com":{"id":"apex","type":"A","name":"lingxifield.com","content":"216.198.79.1","ttl":3600,"proxied":False,"proxiable":True},
            "www.lingxifield.com":{"id":"www","type":"CNAME","name":"www.lingxifield.com","content":"d4cba923aaf06b93.vercel-dns-017.com","ttl":3600,"proxied":False,"proxiable":True}
        }
    def cf(self,path,*,method="GET",payload=None):
        if path=="/user/tokens/verify":
            return {"status":"active"}
        if path.startswith("/zones?"):
            return [{"id":"unexpected" if self.bad_zone else app.EXPECTED_ZONE_ID,"name":app.ZONE_NAME,"status":"active"}]
        if "/workers/routes" in path:
            if method=="GET":return list(self.routes)
            if method=="POST":
                result={"id":"new"+str(len(self.routes)+1), "pattern":payload["pattern"], "script":payload["script"]}
                self.routes.append(result)
                return result
            if method=="DELETE":
                ident=path.rsplit("/",1)[-1]
                self.routes=[r for r in self.routes if r["id"]!=ident]
                return {"id":ident}
        if "/dns_records?" in path:
            query=urllib.parse.parse_qs(path.split("?",1)[1])
            return [dict(self.records[query["name"][0]])]
        if "/dns_records/" in path and method=="PATCH":
            ident=path.rsplit("/",1)[-1]
            hostname=next(h for h,r in self.records.items() if r["id"]==ident)
            self.records[hostname].update(payload)
            return dict(self.records[hostname])
        raise AssertionError("UNEXPECTED_CF_API:"+path+":"+method)
    def page(self,host,path):
        if self.stale_402 and not host.startswith(app.CANARY):
            return 402,b'original Vercel DNS still cached'
        if self.fail_live and not host.startswith(app.CANARY):
            return 503,b"Worker resource limit exceeded"
        if path=="/api/public/site-status":
            return 200,b'{"schemaVersion":1,"scope":"public-maintenance-assets-only","publicSurface":"ready","dynamicBackend":"not-attested","payments":"not-attested","sasi":"not-attested"}'
        if path=="/api/site-release-announcement":
            return 200,b'{"enabled":true,"phase":"maintenance","site":"main"}'
        if path in ("/api/sasi/account","/api/tools/jobs"):
            return 401,b'{"error":"unauthorized"}'
        if path in ("/","/tools","/siai"):
            return 200,B
        return 200,b'{"status":"ok"}'

def exercise(label, *, fail_live=False, bad_zone=False, conflict=False, stale_402=False, edge_ok=False, should_pass=False):
    fake=FakeCloudflare(fail_live,bad_zone,conflict,stale_402)
    app.cf=fake.cf
    app.page=fake.page
    app.time.sleep=lambda _:None
    def edge_mock(hostname,baseline):
        if edge_ok:
            assert hostname in app.HOSTS and baseline.get("/") and baseline.get("/api/public/site-status")
            print("MOCK_FORCED_TLS_EDGE_PROBE_PASS",hostname)
            return "104.16.12.10"
        raise RuntimeError("MOCK_EDGE_ROUTE_NOT_REACHABLE")
    app.edge_probe=edge_mock
    os.environ["CLOUDFLARE_API_TOKEN"]="mock-only-no-real-token"
    os.environ["CLOUDFLARE_ACCOUNT_ID"]=app.EXPECTED_ACCOUNT_ID
    sys.argv=["com-public-route-cutover-20261107.py","--promote-public-maintenance-only"]
    caught=False
    try:app.main()
    except RuntimeError as e:
        caught=True
        print("EXPECTED_NEGATIVE_FIXTURE",label,str(e)[:170])
    assert caught!=should_pass, "UNEXPECTED_SUCCESS_OR_FAILURE:"+label
    if should_pass:
        assert all(r["proxied"] for r in fake.records.values())
        assert len(fake.routes)==2 and {x["script"] for x in fake.routes}=={app.SCRIPT}
    else:
        assert all(r["proxied"] is False and r["ttl"]==3600 for r in fake.records.values())
        assert fake.routes==([{"id":"preexisting","pattern":"lingxifield.com/*","script":"other"}] if conflict else [])
    print("COM_CUTOVER_TRANSACTION_FIXTURE_PASS",label)

exercise("success",should_pass=True)
exercise("503-autorestore",fail_live=True)
exercise("stale-vercel-dns-but-real-tls-edge",stale_402=True,edge_ok=True,should_pass=True)
exercise("stale-vercel-dns-and-no-cloudflare-route-rollback",stale_402=True,edge_ok=False)
exercise("zone-id-mismatch",bad_zone=True)
exercise("existing-route-protected",conflict=True)

# Test the genuine www canonical-redirect verification, not only the transaction
# shell. All HTTP responses are isolated fixtures; no real Cloudflare calls.
original_edge_probe = ORIGINAL_EDGE_PROBE
app.socket.getaddrinfo = lambda *args, **kw: [
    (socket.AF_INET,socket.SOCK_STREAM,6,"",("172.67.180.71",443))
]
fake = FakeCloudflare()
redirectable={"/api/site-release-announcement","/api/sasi/account","/api/tools/jobs"}
baseline = {
    p:hashlib.sha256(fake.page(app.CANARY,p)[1]).hexdigest()
    for p in ("/","/tools","/siai","/api/public/site-status")
}
for bad_target in (False,True):
    def edge_response(host,ip,path):
        if host == app.HOSTS[1] and path in redirectable:
            return 308,b"",("https://evil.example/"+path.lstrip("/") if bad_target else "https://"+app.HOSTS[0]+path)
        status,body=fake.page(app.CANARY,path)
        return status,body,""
    app.forced_edge_page=edge_response
    try:
        original_edge_probe("www.lingxifield.com",baseline)
        assert not bad_target,"UNSAFE_WWW_REDIRECT_WAS_ACCEPTED"
    except RuntimeError as e:
        if not bad_target:raise
        assert str(e).startswith("CLOUDFLARE_EDGE_WORKER_ROUTE_NOT_VERIFIABLE")
        print("COM_WWW_MALICIOUS_REDIRECT_REJECTED_PASS")
    else:
        print("COM_WWW_308_EXACT_HTTPS_CANONICAL_REDIRECT_AND_APEX_CHECK_PASS")
print("COM_PUBLIC_ROUTE_CUTOVER_ROLLBACK_REGRESSION_PASS")

