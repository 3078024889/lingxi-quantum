#!/usr/bin/env python3
"""Read-only Global SIAI TLS/DNS gate.

Inspect publicly resolvable A/NS/CAA/DS information using independent DoH
resolvers, test DNSSEC CD-bit response distinction, and inspect local ECS port
80 status without changing NS, DNS, firewall, nginx, certbot or services.

Based on official Let's Encrypt challenge and CAA/SERVFAIL diagnostics and
Google / Cloudflare public DNS-over-HTTPS JSON APIs.
"""
from __future__ import annotations

import json
import shutil
import socket
import subprocess
import sys
from typing import Any

DOMAIN = "globalsiai.cn"
HOSTS = (DOMAIN, "www." + DOMAIN)
EXPECTED_IP = "39.104.205.16"
PROVIDERS = (
    ("Google", "https://dns.google/resolve"),
    ("Cloudflare", "https://cloudflare-dns.com/dns-query"),
)
RCODES = {0: "NOERROR", 2: "SERVFAIL", 3: "NXDOMAIN", 4: "NOTIMP", 5: "REFUSED"}
QTYPES = {1: "A", 2: "NS", 28: "AAAA", 43: "DS", 257: "CAA"}


def assess(reply: dict[str, Any], qtype: int, expected: str | None = None) -> dict[str, Any]:
    rcode = reply.get("Status")
    if not isinstance(rcode, int):
        return {"state": "INVALID", "rcode": "UNKNOWN", "answers": []}
    answers = reply.get("Answer") or []
    if not isinstance(answers, list):
        answers = []
    records = sorted(
        {
            str(item["data"]).rstrip(".")
            for item in answers
            if isinstance(item, dict)
            and item.get("type") == qtype
            and isinstance(item.get("data"), str)
        }
    )
    status = RCODES.get(rcode, "RCODE_" + str(rcode))
    good = rcode == 0 and (expected is None or records == [expected])
    return {
        "state": "PASS" if good else "FAIL",
        "rcode": status,
        "answers": records,
        "ad": bool(reply.get("AD")),
    }


def self_test() -> None:
    good = {"Status": 0, "Answer": [{"type": 1, "data": EXPECTED_IP}]}
    assert assess(good, 1, EXPECTED_IP)["state"] == "PASS"
    assert assess(good, 1, "192.0.2.1")["state"] == "FAIL"
    assert assess({"Status": 2, "Answer": []}, 1, EXPECTED_IP)["rcode"] == "SERVFAIL"
    assert assess({"Status": 0}, 257)["state"] == "PASS"  # no CAA is valid
    assert assess({"Status": 0, "Answer": [{"type": 1, "data": "203.0.113.10"}]}, 1, EXPECTED_IP)["state"] == "FAIL"
    assert assess({"Status": "0"}, 1)["state"] == "INVALID"
    assert assess({"Status": 0, "Answer": None}, 1, EXPECTED_IP)["state"] == "FAIL"
    print("GLOBALSIAI_DNS_READONLY_SELF_TEST=PASS")


def curl_doh(url: str, host: str, qtype: str, cd: bool = False) -> dict[str, Any] | None:
    if not shutil.which("curl"):
        return None
    command = [
        "curl", "-4fsS", "--retry", "1", "--retry-delay", "1",
        "--connect-timeout", "5", "--max-time", "12", "--get",
        "--header", "accept: application/dns-json",
        "--data-urlencode", "name=" + host,
        "--data-urlencode", "type=" + qtype,
        "--data-urlencode", "cd=" + ("true" if cd else "false"),
        url,
    ]
    try:
        process = subprocess.run(
            command, check=True, capture_output=True, text=True, timeout=17
        )
        output = json.loads(process.stdout)
        return output if isinstance(output, dict) else None
    except (OSError, subprocess.SubprocessError, ValueError):
        return None


def local_readonly() -> None:
    print("=== ECS port listener / service status (local only) ===")
    if shutil.which("ss"):
        try:
            r = subprocess.run(
                ["ss", "-H", "-lntp"],
                capture_output=True, text=True, timeout=5, check=False
            )
            matches = [
                line for line in r.stdout.splitlines()
                if any(
                    token in line.split()[3]
                    for token in (":80", ":443", ":4289", ":3188", ":3189")
                )
                and len(line.split()) >= 4
            ]
            for line in matches[:12]:
                print("LOCAL_TCP_LISTEN=" + line[:320])
        except (OSError, subprocess.SubprocessError, IndexError):
            print("LOCAL_TCP_LISTEN=UNAVAILABLE")
    for service in ("nginx", "globalsiai-market-stage", "lingxifield-ecs", "lingxifield-cn-stage"):
        try:
            p = subprocess.run(
                ["systemctl", "is-active", service],
                capture_output=True, text=True, timeout=4, check=False,
            )
            print("LOCAL_SERVICE=" + service + ":" + p.stdout.strip())
        except (OSError, subprocess.SubprocessError):
            print("LOCAL_SERVICE=" + service + ":UNAVAILABLE")
    print("EXTERNAL_TCP80_REACHABILITY=NOT_MEASURED_BY_LOCAL_ECS")


def main() -> int:
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
        return 0
    if len(sys.argv) != 2 or sys.argv[1] not in ("--read-only", "--external-only"):
        print("GLOBALSIAI_DNS_USAGE: python3 script --read-only|--external-only")
        return 2

    print("GLOBALSIAI_TLS_DIAG_TARGET=" + DOMAIN)
    print("EXPECTED_ECS_IP=" + EXPECTED_IP)
    print("=== Public DoH DNS: Google and Cloudflare ===")
    failures = 0
    dnssec_suspected = False
    delegation: dict[str, list[str]] = {}

    for provider, url in PROVIDERS:
        for host in HOSTS:
            reply = curl_doh(url, host, "A")
            if reply is None:
                print(f"DNS_A_PROVIDER={provider} HOST={host} STATE=UNREACHABLE")
                failures += 1
                continue
            result = assess(reply, 1, EXPECTED_IP)
            print(f"DNS_A_PROVIDER={provider} HOST={host} STATE={result['state']} "
                  f"RCODE={result['rcode']} ADDRS={','.join(result['answers']) or '-'} "
                  f"AD={int(result['ad'])}")
            if result["state"] != "PASS":
                failures += 1
                if result["rcode"] == "SERVFAIL":
                    bypass = curl_doh(url, host, "A", cd=True)
                    if bypass is not None:
                        cd = assess(bypass, 1, EXPECTED_IP)
                        print(f"DNS_CD_PROVIDER={provider} HOST={host} "
                              f"STATE={cd['state']} RCODE={cd['rcode']}")
                        if cd["state"] == "PASS":
                            dnssec_suspected = True

        for rr, qtype in (("NS", 2), ("CAA", 257), ("DS", 43)):
            result_raw = curl_doh(url, DOMAIN, rr)
            if result_raw is None:
                print(f"DNS_{rr}_PROVIDER={provider} STATE=UNREACHABLE")
                if rr in ("NS", "CAA"):
                    failures += 1
                continue
            result = assess(result_raw, qtype)
            print(f"DNS_{rr}_PROVIDER={provider} STATE={result['state']} "
                  f"RCODE={result['rcode']} ANSWERS={','.join(result['answers']) or '-'}")
            if rr == "NS":
                delegation[provider] = result["answers"]
            if rr in ("NS", "CAA") and result["state"] != "PASS":
                failures += 1

    if (
        all(delegation.get(provider) for provider, _ in PROVIDERS)
        and delegation["Google"] != delegation["Cloudflare"]
    ):
        print("DNS_NS_PROVIDER_DISAGREEMENT=YES_CHECK_REGISTRAR_DELEGATION")
        failures += 1
    else:
        print("DNS_NS_PROVIDER_DISAGREEMENT=NO_OR_UNDETERMINED")

    print("DNSSEC_BOGUS_SUSPECTED=" + ("YES_VERIFY_DS_AT_REGISTRAR" if dnssec_suspected else "NOT_CONFIRMED"))
    if dnssec_suspected:
        failures += 1
    print("DNS_PUBLIC_GATE=" + ("PASS" if failures == 0 else "FAIL"))
    if sys.argv[1] == "--read-only":
        local_readonly()
    else:
        print("=== Independent external TCP connectivity from GitHub runner ===")
        for port in (80, 443):
            try:
                with socket.create_connection((EXPECTED_IP, port), timeout=6):
                    print(f"EXTERNAL_TCP_PORT={port} STATUS=CONNECT_PASS")
            except OSError as e:
                kind = type(e).__name__
                print(f"EXTERNAL_TCP_PORT={port} STATUS=CONNECT_FAIL REASON={kind}")
        print("EXTERNAL_TCP_CONNECTION_IS_SINGLE_VANTAGE_NOT_CA_GLOBAL_PROOF")
    print("GLOBALSIAI_DNS_DIAGNOSIS_READ_ONLY=PASS")
    print("GLOBALSIAI_CERT_REQUEST_PERMITTED=" + ("YES_DNS_ONLY_PORT80_STILL_NEEDS_EXTERNAL_PROBE" if failures == 0 else "NO_FIX_DNS_FIRST"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
