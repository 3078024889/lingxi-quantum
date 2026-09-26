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
    canonical=f"{ts}.{nonce}.{method}.{path}.{digest}"
    sig=hmac.new(SECRET.encode(),canonical.encode(),hashlib.sha256).hexdigest()
    req=urllib.request.Request(
        BASE+path,data=None if method=="GET" else body,method=method,
        headers={"content-type":"application/json","x-lingxi-timestamp":ts,"x-lingxi-nonce":nonce,"x-lingxi-signature":sig},
    )
    with urllib.request.urlopen(req,timeout=30) as res:
        return json.loads(res.read())

def main():
    import argparse, base64
    from pathlib import Path
    parser=argparse.ArgumentParser()
    parser.add_argument("--kind",choices=["reason","vision","image","video"],default="reason")
    parser.add_argument("--image",type=Path)
    parser.add_argument("--timeout",type=int,default=1800)
    args=parser.parse_args()
    models={"reason":"Qwen/Qwen3-8B","vision":"Qwen/Qwen2.5-VL-7B-Instruct",
        "image":"black-forest-labs/FLUX.1-schnell","video":"Wan-AI/Wan2.1-T2V-1.3B-Diffusers"}
    data={"prompt":"Describe a red cube on a white table.","durationSec":2,"ratio":"1:1"}
    if args.kind=="vision":
        if not args.image: parser.error("--image is required for vision")
        import mimetypes
        data["images"]=["data:"+str(mimetypes.guess_type(args.image.name)[0])+";base64,"+base64.b64encode(args.image.read_bytes()).decode()]
    payload={"protocolVersion":"2026-09-26.v19","requestId":str(uuid.uuid4()),
        "taskId":str(uuid.uuid4()),"ownerId":"smoke-user","kind":"reason" if args.kind=="vision" else args.kind,
        "model":models[args.kind],"input":data}
    job=request("POST","/v1/jobs",payload)["job"]
    deadline=time.monotonic()+args.timeout
    while job["state"] in ("queued","running"):
        if time.monotonic()>deadline: raise SystemExit("FAIL: inference timed out; job="+job["id"])
        time.sleep(2)
        job=request("GET","/v1/jobs/"+job["id"]+"?owner=smoke-user")["job"]
    if job["state"]!="succeeded": raise SystemExit("FAIL: "+json.dumps(job.get("error")))
    if args.kind in ("reason","vision"):
        if not job.get("result",{}).get("text","").strip(): raise SystemExit("FAIL: empty text")
    elif not job.get("artifacts"): raise SystemExit("FAIL: no artifacts")
    print(json.dumps({"status":"INFERENCE_COMPLETED","kind":args.kind,"jobId":job["id"],
        "artifacts":job.get("artifacts"),"text":job.get("result",{}).get("text")},ensure_ascii=False))
    print("Basic execution only. Review output quality and download artifacts before production release.")

if __name__=="__main__": main()
