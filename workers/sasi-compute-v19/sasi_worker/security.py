from __future__ import annotations
import hashlib
import hmac
import threading
import time
from fastapi import HTTPException, Request
from .config import CONFIG

_replay: dict[str, int] = {}
_lock = threading.Lock()

def _clean(now_ms: int) -> None:
    cutoff = now_ms - CONFIG.replay_ttl_ms
    expired = [key for key, seen in _replay.items() if seen < cutoff]
    for key in expired:
        _replay.pop(key, None)

async def verify_request(request: Request) -> bytes:
    ts_raw = request.headers.get("x-lingxi-timestamp", "")
    nonce = request.headers.get("x-lingxi-nonce", "")
    signature = request.headers.get("x-lingxi-signature", "")
    if not ts_raw.isdigit() or len(nonce) < 16 or len(nonce) > 128 or len(signature) != 64:
        raise HTTPException(401, "SIGNATURE_REQUIRED")
    now_ms = int(time.time() * 1000)
    ts = int(ts_raw)
    if abs(now_ms - ts) > CONFIG.max_clock_skew_ms:
        raise HTTPException(401, "SIGNATURE_EXPIRED")

    body = await request.body()
    digest = hashlib.sha256(body).hexdigest()
    canonical = f"{ts_raw}.{nonce}.{request.method.upper()}.{request.url.path}.{digest}"
    expected = hmac.new(CONFIG.secret.encode(), canonical.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(401, "SIGNATURE_INVALID")

    replay_key = f"{ts_raw}:{nonce}:{signature}"
    with _lock:
        _clean(now_ms)
        if replay_key in _replay:
            raise HTTPException(409, "SIGNATURE_REPLAYED")
        _replay[replay_key] = now_ms
    return body
