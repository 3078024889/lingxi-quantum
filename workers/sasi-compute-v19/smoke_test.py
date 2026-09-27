from __future__ import annotations
import hashlib,hmac,json,os,time,uuid,urllib.request

BASE=os.getenv("SASI_NATIVE_COMPUTE_URL","http://127.0.0.1:8787").rstrip("/")
SECRET=os.getenv("SASI_NATIVE_COMPUTE_SECRET","")
if len(SECRET)<32:
    raise SystemExit("SASI_NATIVE_COMPUTE_SECRET must be set")

def request(method,path,payload=None):
    body=b"" if payload is None else json.dumps(payload,separators=(",",":"),ensure_ascii=False).encode()
    ts=str(int(time.time()*1000)); nonce=str(uuid.uuid4())
    digest=hashlib.sha256(body).hexdigest()
    canonical=f"{ts}.{nonce}.{method}.{path.split('?')[0]}.{digest}"
    sig=hmac.new(SECRET.encode(),canonical.encode(),hashlib.sha256).hexdigest()
    req=urllib.request.Request(
        BASE+path,data=None if method=="GET" else body,method=method,
        headers={"content-type":"application/json","x-lingxi-timestamp":ts,"x-lingxi-nonce":nonce,"x-lingxi-signature":sig},
    )
    with urllib.request.urlopen(req,timeout=30) as res:
        return json.loads(res.read())

with urllib.request.urlopen(BASE+"/health",timeout=10) as res:
    print("HEALTH",res.status,json.loads(res.read()))

payload={
    "protocolVersion":"2026-09-26.v19",
    "requestId":str(uuid.uuid4()),
    "taskId":str(uuid.uuid4()),
    "ownerId":"smoke-user",
    "kind":"reason",
    "model":os.getenv("SASI_NATIVE_REASONING_MODEL","Qwen/Qwen3-8B"),
    "input":{"prompt":"只回答：SASI smoke test","mode":"standard"},
}
created=request("POST","/v1/jobs",payload)
print("SUBMIT",created["job"]["state"],created["job"]["id"])
print("SASI_NATIVE_WORKER_PROTOCOL_SMOKE=PASS")
