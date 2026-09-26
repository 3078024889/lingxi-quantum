from __future__ import annotations
import hashlib
import hmac
import threading
import time
from fastapi import HTTPException, Request
from .config import CONFIG
from .db import claim_nonce

async def verify_request(request: Request) -> bytes:
    ts_raw = request.headers.get("x-lingxi-timestamp", "")
    nonce = request.headers.get("x-lingxi-nonce", "")
    signature = request.headers.get("x-lingxi-signature", "")
    if len(ts_raw) > 16 or not ts_raw.isdigit() or len(nonce) < 16 or len(nonce) > 128 or len(signature) != 64:
        raise HTTPException(401, "SIGNATURE_REQUIRED")
    now_ms = int(time.time() * 1000)
    ts = int(ts_raw)
    if abs(now_ms - ts) > CONFIG.max_clock_skew_ms:
        raise HTTPException(401, "SIGNATURE_EXPIRED")

    chunks=[]; length=0
    async for chunk in request.stream():
        length+=len(chunk)
        if length>4*1024*1024: raise HTTPException(413,"REQUEST_TOO_LARGE")
        chunks.append(chunk)
    body=b"".join(chunks)
    target=request.url.path
    if request.url.query: target+="?"+request.url.query
    digest = hashlib.sha256(body).hexdigest()
    canonical = f"{ts_raw}.{nonce}.{request.method.upper()}.{target}.{digest}"
    expected = hmac.new(CONFIG.secret.encode(), canonical.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(401, "SIGNATURE_INVALID")

    replay_key = hashlib.sha256(f"{ts_raw}:{nonce}".encode()).hexdigest()
    if not claim_nonce(replay_key,ts+CONFIG.max_clock_skew_ms,now_ms):
        raise HTTPException(409,"SIGNATURE_REPLAYED")
    return body
