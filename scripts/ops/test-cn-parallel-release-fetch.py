#!/usr/bin/env python3
"""Offline immutable-release downloader exercise; runs unchanged on Python 3.6."""
from __future__ import print_function
import ast
import hashlib
import importlib.util
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread
import re

SCRIPT = Path(__file__).with_name("ecs-cn-parallel-release-fetch.py")
source = SCRIPT.read_text(encoding="utf-8")
compile(source, str(SCRIPT), "exec")
if "from __future__ import annotations" in source or ":=" in source:
    raise SystemExit("LEGACY_PYTHON_SYNTAX_NOT_REMOVED")
spec = importlib.util.spec_from_file_location("release_downloader", str(SCRIPT))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

data = bytes((i * 17) % 251 for i in range(600013))
digest = hashlib.sha256(data).hexdigest()
class RangeHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/release":
            self.send_error(404)
            return
        match = re.fullmatch(r"bytes=(\d+)-(\d+)", self.headers.get("Range", ""))
        if not match:
            self.send_response(200)
            self.end_headers()
            return
        first,last = int(match.group(1)),int(match.group(2))
        if first<0 or last>=len(data) or first>last:
            self.send_error(416)
            return
        payload=data[first:last+1]
        self.send_response(206)
        self.send_header("Content-Range","bytes {}-{}/{}".format(first,last,len(data)))
        self.send_header("Content-Length",str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
    def log_message(self, fmt, *args):
        pass

server=HTTPServer(("127.0.0.1",0),RangeHandler)
thread=Thread(target=server.serve_forever)
thread.daemon=True
thread.start()
try:
    with TemporaryDirectory() as tmp:
        dest=Path(tmp)/"release.tar.gz"
        dest.write_bytes(data[:23531])
        url="http://127.0.0.1:{}/release".format(server.server_port)
        module.run_transfer(output=dest,total=len(data),expected_sha=digest,
                            sources=[url],workers=4,period=1)
        assert dest.stat().st_size==len(data),"SIZE_MISMATCH"
        assert hashlib.sha256(dest.read_bytes()).hexdigest()==digest,"HASH_MISMATCH"
        module.run_transfer(output=dest,total=len(data),expected_sha=digest,
                            sources=[url],workers=4,period=1)
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=2)
print("CN_LEGACY_PYTHON_RELEASE_RANGE_RESUME_SHA256_PASS")
