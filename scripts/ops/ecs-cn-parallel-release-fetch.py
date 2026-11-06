#!/usr/bin/env python3
"""LINGXIFIELD CN staging release downloader. No service, DNS, DB, or config mutation.

Uses HTTPS byte ranges and safe resumable fixed-size chunks. The ONLY output target is
/root/lingxifield-cn-candidate-6b391150/cn-ecs-standalone.tar.gz, and it is atomically
replaced only after its SHA256 matches the immutable GitHub release asset digest.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import os
import re
import shutil
import socket
import sys
import threading
import time
import urllib.request
from pathlib import Path

RELEASE = (
    "https://github.com/3078024889/lingxi-quantum/releases/download/"
    "ecs-cn-candidate-20261106-6b391150/cn-ecs-standalone.tar.gz"
)
EXPECTED_SIZE = 863193911
EXPECTED_SHA256 = "b8dc6a113414eb1617035f40861b85fc99698e8cf44f829d27b7b7521f9bb858"
DEST = Path("/root/lingxifield-cn-candidate-6b391150/cn-ecs-standalone.tar.gz")
USER_AGENT = "LINGXIFIELD-CN-verified-staging-transfer/1"
RANGE_PATTERN = re.compile(r"bytes (\d+)-(\d+)/(\d+)")

# An ECS without IPv6 egress must not try IPv6 before IPv4, which could time out.
_original_getaddrinfo = socket.getaddrinfo

def ipv4_only(host, port, *args, **kwargs):
    result = _original_getaddrinfo(host, port, *args, **kwargs)
    ipv4 = [addr for addr in result if addr[0] == socket.AF_INET]
    return ipv4 or result


def hexsha(path: Path):
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        while block := stream.read(1024 * 1024):
            hasher.update(block)
    return hasher.hexdigest()


def fetch_range(url: str, start: int, end: int, expected_size: int, timeout: int = 40):
    req = urllib.request.Request(
        url, headers={"Range": f"bytes={start}-{end}", "User-Agent": USER_AGENT}
    )
    result = urllib.request.urlopen(req, timeout=timeout)
    match = RANGE_PATTERN.fullmatch(result.headers.get("Content-Range", ""))
    if result.status != 206 or not match or (
        int(match[1]), int(match[2]), int(match[3])
    ) != (start, end, expected_size):
        result.close()
        raise RuntimeError("RANGE_RESPONSE_NOT_206_OR_CONTENT_RANGE_MISMATCH")
    return result


def available_sources(sources, total):
    def probe(url):
        t0 = time.monotonic()
        try:
            with fetch_range(url, 0, 65535, total, timeout=15) as resp:
                data = resp.read(65536)
                if len(data) != 65536:
                    raise RuntimeError("SHORT_RANGE_PROBE")
            return (url, time.monotonic() - t0, "SUPPORTED")
        except Exception as exc:
            return (url, 1e20, type(exc).__name__)

    supported = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(sources)) as pool:
        for url, elapsed, status in pool.map(probe, sources):
            label = "GITHUB_DIRECT" if url == RELEASE else "HTTPS_PROXY"
            print(f"CN_TRANSFER_RANGE_{label}={status}", flush=True)
            if status == "SUPPORTED":
                supported.append((elapsed, url))
    supported.sort(key=lambda pair: pair[0])
    return [pair[1] for pair in supported]


def run_transfer(*, output: Path, total: int, expected_sha: str, sources, workers=12, period=15):
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.is_file() and output.stat().st_size == total:
        if hexsha(output).lower() == expected_sha.lower():
            print("CN_TRANSFER_ALREADY_COMPLETE_SHA256_VERIFIED", flush=True)
            return
    supported = available_sources(sources, total)
    if not supported:
        raise RuntimeError("NO_RANGE_CAPABLE_SOURCE_ABORT_SAFE_KEEP_PARTIAL_FILE")
    print("CN_TRANSFER_RANGE_SOURCE_COUNT=" + str(len(supported)), flush=True)
    chunk = (total + workers - 1) // workers
    folder = output.parent / (output.name + ".segments")
    folder.mkdir(exist_ok=True)
    old_size = output.stat().st_size if output.exists() else 0
    # Reuse bytes already downloaded by the original curl process, if terminated.
    # An immutable SHA256 check validates the entire assembled file before installation.
    if 0 < old_size < total:
        with output.open("rb") as old:
            for index in range(workers):
                first = index * chunk
                last = min(total, first + chunk)
                existing = min(max(0, old_size - first), last - first)
                part = folder / f"part-{index:02d}"
                if existing and not part.exists():
                    old.seek(first)
                    with part.open("wb") as new:
                        left = existing
                        while left:
                            b = old.read(min(left, 1024 * 1024))
                            if not b:
                                raise RuntimeError("PARTIAL_PREFIX_COPY_FAILED")
                            new.write(b)
                            left -= len(b)
        print("CN_TRANSFER_REUSED_EXISTING_PREFIX_BYTES=" + str(old_size), flush=True)
    stop = threading.Event()
    done = set()
    lock = threading.Lock()
    def report():
        while not stop.wait(period):
            b = sum(min((folder / f"part-{i:02d}").stat().st_size, min(chunk,total-i*chunk))
                    for i in range(workers) if (folder / f"part-{i:02d}").exists())
            print(f"CN_TRANSFER_PROGRESS={b}/{total} ({b*100//total}%)", flush=True)
    monitor = threading.Thread(target=report, daemon=True)
    monitor.start()

    def worker(index: int):
        first = index * chunk
        end = min(total, first + chunk) - 1
        if first > end:
            return
        part = folder / f"part-{index:02d}"
        span = end - first + 1
        if part.exists() and part.stat().st_size > span:
            raise RuntimeError("SEGMENT_PART_SIZE_INVALID")
        for attempt in range(40):
            existing = part.stat().st_size if part.exists() else 0
            if existing == span:
                with lock:
                    done.add(index)
                return
            url = supported[attempt % len(supported)]
            try:
                with fetch_range(url, first + existing, end, total) as stream:
                    with part.open("ab") as dest:
                        while True:
                            data = stream.read(256 * 1024)
                            if not data:
                                break
                            dest.write(data)
                if part.stat().st_size > span:
                    raise RuntimeError("SEGMENT_OVERRUN")
            except Exception:
                # Keep fully written bytes for resume on next attempt or execution.
                time.sleep(min(2 + attempt, 10))
        raise RuntimeError(f"SEGMENT_{index}_FAILED_AFTER_RETRIES")

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {pool.submit(worker, i): i for i in range(workers)}
            for future in concurrent.futures.as_completed(futures):
                future.result()
        if len(done) != workers:
            raise RuntimeError("SEGMENT_COMPLETION_INCOMPLETE")
        assembled = output.parent / (output.name + ".verified-tmp")
        digest = hashlib.sha256()
        with assembled.open("wb") as dest:
            for i in range(workers):
                part = folder / f"part-{i:02d}"
                with part.open("rb") as src:
                    while data := src.read(1024 * 1024):
                        digest.update(data)
                        dest.write(data)
            dest.flush()
            os.fsync(dest.fileno())
        if assembled.stat().st_size != total or digest.hexdigest().lower() != expected_sha.lower():
            assembled.unlink(missing_ok=True)
            raise RuntimeError("OFFICIAL_GITHUB_SHA256_OR_SIZE_MISMATCH_ABORT_NO_INSTALL")
        os.replace(assembled, output)
        shutil.rmtree(folder)
        print("CN_RELEASE_DOWNLOAD_SHA256_VERIFIED", flush=True)
        print("CN_RELEASE_ARCHIVE_SIZE_BYTES=" + str(total), flush=True)
        print("CN_RELEASE_READY_FOR_3189_ONLY", flush=True)
    finally:
        stop.set()
        monitor.join(timeout=1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args()
    if not 2 <= args.workers <= 20:
        parser.error("workers must be 2-20")
    if os.geteuid() != 0:
        raise RuntimeError("RUN_AS_ROOT_FOR_FIXED_ECS_DEST")
    socket.getaddrinfo = ipv4_only
    sources = [RELEASE, "https://gh-proxy.com/" + RELEASE]
    run_transfer(output=DEST, total=EXPECTED_SIZE, expected_sha=EXPECTED_SHA256,
                 sources=sources, workers=args.workers)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("CN_TRANSFER_INTERRUPTED_PARTS_KEPT", flush=True)
        sys.exit(130)
    except Exception as exc:
        print("CN_TRANSFER_ERROR=" + str(exc)[:160], flush=True)
        sys.exit(1)
