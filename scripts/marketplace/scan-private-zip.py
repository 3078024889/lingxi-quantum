#!/usr/bin/env python3
"""Isolated marketplace ZIP scanner. Never executes uploaded source/binaries.

Required: pip install boto3; apt install clamav clamav-freshclam.
Runs on short-lived CI runner, not on the production ECS/Cloudflare Worker.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

MAX_ZIP = 30 * 1024 * 1024
MAX_UNPACKED = 250 * 1024 * 1024
MAX_FILES = 300
MAX_INDIVIDUAL = 100 * 1024 * 1024
MAX_RATIO = 100
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", re.I)
SCAN_VERSION = "lingxifield-zip-clamav-20261108-v1"


def required(name: str) -> str:
    result = os.environ.get(name, "").strip()
    if not result:
        raise RuntimeError("MISSING_CONFIG_" + name)
    return result


def rest(method: str, route: str, payload=None, query=None):
    base = required("SUPABASE_URL").rstrip("/")
    secret = required("SUPABASE_SECRET_KEY")
    url = base + "/rest/v1/" + route
    if query:
        url += "?" + urllib.parse.urlencode(query)
    data = None if payload is None else json.dumps(payload, separators=(",", ":")).encode()
    headers = {
        "apikey": secret,
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    # New Supabase sb_secret_ keys are opaque API keys, NOT JWTs. Sending
    # them in Authorization: Bearer is rejected by the REST gateway.
    # Legacy service_role JWTs require the Authorization header.
    if not secret.startswith("sb_secret_"):
        headers["Authorization"] = "Bearer " + secret
    request = urllib.request.Request(url, data=data, method=method, headers=headers)
    with urllib.request.urlopen(request, timeout=25) as resp:
        body = resp.read(128 * 1024)
        return json.loads(body) if body else None


def inspect_zip(data: bytes, tmpdir: Path):
    if len(data) > MAX_ZIP or len(data) < 22:
        raise ValueError("ZIP_SIZE_INVALID")
    extracted = tmpdir / "safe"
    extracted.mkdir(mode=0o700)
    file_count, unpacked = 0, 0
    seen = set()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        if len(entries) > MAX_FILES:
            raise ValueError("ZIP_FILE_COUNT_EXCEEDED")
        for member in entries:
            original = member.filename
            if "\\" in original or "\x00" in original or original.startswith("/"):
                raise ValueError("UNSAFE_ZIP_PATH")
            path = PurePosixPath(original)
            if not path.parts or any(p in ("..", ".") for p in path.parts) or ":" in path.parts[0]:
                raise ValueError("UNSAFE_ZIP_PATH")
            normalized = str(path).casefold()
            if normalized in seen:
                raise ValueError("DUPLICATE_ZIP_PATH")
            seen.add(normalized)
            mode = (member.external_attr >> 16) & 0xFFFF
            file_type = stat.S_IFMT(mode)
            if file_type not in (0, stat.S_IFREG, stat.S_IFDIR):
                raise ValueError("ZIP_LINK_OR_SPECIAL_FILE")
            if member.is_dir():
                continue
            file_count += 1
            if member.flag_bits & 0x1:
                raise ValueError("ENCRYPTED_ZIP_NOT_ALLOWED")
            if member.file_size > MAX_INDIVIDUAL:
                raise ValueError("ZIP_MEMBER_TOO_LARGE")
            unpacked += member.file_size
            if unpacked > MAX_UNPACKED:
                raise ValueError("ZIP_EXPANSION_LIMIT")
            if member.file_size > MAX_RATIO * max(member.compress_size, 1):
                raise ValueError("ZIP_COMPRESSION_RATIO_EXCEEDED")
            dest = extracted.joinpath(*path.parts)
            dest.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
            with archive.open(member) as src, dest.open("xb") as out:
                while True:
                    chunk = src.read(64 * 1024)
                    if not chunk:
                        break
                    out.write(chunk)
                if out.tell() != member.file_size:
                    raise ValueError("ZIP_CONTENT_SIZE_MISMATCH")
    if file_count < 1:
        raise ValueError("EMPTY_ZIP")
    return extracted, {"files": file_count, "uncompressedBytes": unpacked}


def clamav_scan(extracted: Path, original: Path) -> tuple[bool, str]:
    version = subprocess.run(["clamscan", "--version"], capture_output=True, text=True, timeout=10, check=True)
    version_id = version.stdout.strip()[:90]
    for item in (original, extracted):
        scan = subprocess.run(
            ["clamscan", "--recursive", "--infected", "--no-summary",
             "--max-filesize=100M", "--max-scansize=250M",
             "--max-recursion=8", str(item)],
            capture_output=True, text=True, timeout=600,
        )
        if scan.returncode == 1:
            return False, version_id
        if scan.returncode != 0:
            raise RuntimeError("MALWARE_SCANNER_UNAVAILABLE")
    return True, version_id


def main() -> None:
    import boto3
    listing_id = required("SASI_SCAN_LISTING_ID").lower()
    if not UUID.fullmatch(listing_id):
        raise RuntimeError("INVALID_LISTING_ID")
    rows = rest("GET", "sasi_market_listings", query={
        "select": "id,seller_id,status,scan_status,quarantine_path,file_size_bytes",
        "id": "eq." + listing_id,
        "limit": "1"
    })
    if not isinstance(rows, list) or len(rows) != 1:
        raise RuntimeError("LISTING_NOT_FOUND")
    listing = rows[0]
    if listing["status"] != "submitted" or listing["scan_status"] != "unscanned":
        raise RuntimeError("LISTING_NOT_PENDING_SCAN")
    owner, path = listing["seller_id"], listing["quarantine_path"]
    prefix = "sasi/" + owner + "/market/" + listing_id + "/quarantine/"
    if not isinstance(path, str) or not path.startswith(prefix) or not path.endswith(".zip"):
        raise RuntimeError("QUARANTINE_PATH_INVALID")
    endpoint = required("R2_ENDPOINT")
    if not endpoint.startswith("https://"):
        raise RuntimeError("R2_ENDPOINT_NOT_HTTPS")
    bucket = required("R2_BUCKET_SASI_ARTIFACTS")
    client = boto3.client(
        "s3", endpoint_url=endpoint, region_name="auto",
        aws_access_key_id=required("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=required("R2_SECRET_ACCESS_KEY"),
    )
    item = client.get_object(Bucket=bucket, Key=path)
    length = int(item["ContentLength"])
    if length < 22 or length > MAX_ZIP or length != int(listing["file_size_bytes"]):
        raise RuntimeError("SOURCE_OBJECT_SIZE_CHANGED")
    payload = item["Body"].read(MAX_ZIP + 1)
    if len(payload) != length:
        raise RuntimeError("SOURCE_OBJECT_READ_FAILED")
    digest = hashlib.sha256(payload).hexdigest()
    report = {"policy": "safe-zip-v1", "zipBytes": length}
    status, approved_key, sha = "scan_failed", None, None
    with tempfile.TemporaryDirectory(prefix="sasi-market-scan-") as location:
        directory = Path(location)
        original = directory / "upload.zip"
        original.write_bytes(payload)
        try:
            extracted, counts = inspect_zip(payload, directory)
            report.update(counts)
            clean, engine = clamav_scan(extracted, original)
            report["engine"] = engine
            if clean:
                approved_key = "sasi/" + owner + "/market/" + listing_id + "/approved/" + digest + ".zip"
                client.put_object(
                    Bucket=bucket, Key=approved_key, Body=payload,
                    ContentType="application/zip",
                    ContentDisposition='attachment; filename="software.zip"',
                    CacheControl="private, no-store",
                    Metadata={"sha256": digest, "scan-policy": SCAN_VERSION},
                )
                confirmed = client.head_object(Bucket=bucket, Key=approved_key)
                if int(confirmed["ContentLength"]) != length or confirmed.get("Metadata", {}).get("sha256") != digest:
                    raise RuntimeError("APPROVED_OBJECT_VERIFICATION_FAILED")
                status, sha = "clean", digest
            else:
                status = "infected"
                report["verdict"] = "malware_detected"
        except (ValueError, zipfile.BadZipFile) as exc:
            report["verdict"] = str(exc)[:100]
            status = "scan_failed"
        except (OSError, RuntimeError, subprocess.TimeoutExpired) as exc:
            report["verdict"] = type(exc).__name__
            status = "scan_failed"
    # Never log a signed URL, service token, file contents or the ZIP source.
    result = rest("POST", "rpc/sasi_market_record_scan", {
        "p_listing_id": listing_id,
        "p_quarantine_path": path,
        "p_status": status,
        "p_sha256": sha,
        "p_approved_path": approved_key,
        "p_report": report,
        "p_scanner_version": SCAN_VERSION,
    })
    if not isinstance(result, dict) or result.get("ok") is not True:
        raise RuntimeError("SCAN_ATTESTATION_REJECTED")
    print("SASI_SCAN_RECORDED status=" + status + " listing=" + listing_id)
    if status != "clean":
        raise SystemExit(1)
    print("SASI_PRIVATE_APPROVED_OBJECT_READY_FOR_HUMAN_REVIEW")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("SASI_SCAN_FAILED_CLOSED " + type(exc).__name__, file=sys.stderr)
        raise SystemExit(1)
