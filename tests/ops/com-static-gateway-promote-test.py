#!/usr/bin/env python3
"""Offline release-transaction and rollback regression. No network or secrets."""
import importlib.util
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[2] / "scripts/cloudflare/com-static-gateway-promote-20261107.py"
spec = importlib.util.spec_from_file_location("gateway_release", SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class Harness:
    def __init__(self, bad_www=False, extra_route=False):
        self.bad_www = bad_www
        self.routes = {
            "lingxifield.com/*": {"pattern": "lingxifield.com/*", "id": "apex-id", "script": mod.OLD},
            "www.lingxifield.com/*": {"pattern": "www.lingxifield.com/*", "id": "www-id", "script": mod.OLD},
        }
        if extra_route:
            self.routes["extra.lingxifield.com/*"] = {
                "pattern": "extra.lingxifield.com/*", "id": "unexpected", "script": "other"}
        self.calls = []

    def cf(self, path, method="GET", data=None):
        if path == "/user/tokens/verify":
            return {"status": "active"}
        if path.startswith("/zones?"):
            return [{"name": "lingxifield.com", "status": "active", "id": mod.ZONE}]
        if path.endswith("/workers/routes?per_page=100"):
            return list(self.routes.values())
        if "/dns_records?" in path:
            name = path.split("name=", 1)[1].split("&", 1)[0]
            return [{"name": name, "type": "A" if name == "lingxifield.com" else "CNAME",
                     "proxied": True}]
        if "/workers/routes/" in path and method == "PUT":
            route_id = path.rsplit("/", 1)[-1]
            assert set(data) == {"pattern", "script"}
            rec = self.routes[data["pattern"]]
            assert rec["id"] == route_id
            rec["script"] = data["script"]
            self.calls.append((data["pattern"], data["script"]))
            return dict(rec)
        raise AssertionError("unexpected Cloudflare API call " + path)

    def request(self, url, *args, **kwargs):
        if url == mod.CANARY + "/__lingxi_gateway_probe":
            return 200, {"x-lingxi-gateway": "v2"}, b"LINGXI_GATEWAY_CANARY_V2"
        raise AssertionError("unexpected external fetch " + url)

    def validate(self, base, baseline=None):
        if self.bad_www and base == "https://lingxifield.com":
            raise mod.ReleaseError("controlled 503")
        out = {path: "verified-hash" for path in mod.ASSETS}
        if baseline is not None:
            assert out == baseline
        return out

    def www(self):
        if self.bad_www:
            raise mod.ReleaseError("controlled www redirect")


class PromotionTests(unittest.TestCase):
    def do_test(self, harness):
        with patch.dict(os.environ, {"CLOUDFLARE_ACCOUNT_ID": mod.ACCOUNT,
                                     "CLOUDFLARE_API_TOKEN": "dummy-test-only"}), \
             patch.object(sys, "argv", ["test", "--promote-public-only"]), \
             patch.object(mod, "cf", harness.cf), \
             patch.object(mod, "request", harness.request), \
             patch.object(mod, "validate_public", harness.validate), \
             patch.object(mod, "check_www", harness.www), \
             patch.object(mod.time, "sleep", lambda _: None):
            mod.main()

    def test_exact_two_route_promotion(self):
        h = Harness()
        self.do_test(h)
        self.assertEqual({x["script"] for x in h.routes.values()}, {mod.NEW})
        self.assertEqual(len(h.calls), 2)

    def test_failed_live_gate_restores_original_routes(self):
        h = Harness(bad_www=True)
        with self.assertRaises(mod.ReleaseError):
            self.do_test(h)
        self.assertEqual({x["script"] for x in h.routes.values()}, {mod.OLD})
        self.assertEqual(len(h.calls), 4)

    def test_unexpected_route_refuses_promotion(self):
        h = Harness(extra_route=True)
        with self.assertRaises(mod.ReleaseError):
            self.do_test(h)
        self.assertEqual(h.calls, [])

    def test_explicit_flag_required(self):
        with patch.object(sys, "argv", ["test"]):
            with self.assertRaises(mod.ReleaseError):
                mod.main()


if __name__ == "__main__":
    unittest.main(verbosity=2)
