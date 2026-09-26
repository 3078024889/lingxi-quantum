from __future__ import annotations
import json
import time
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
import re
from .inventory import inventory, model_path
from .db import accepted_model
from .config import CONFIG
from .db import init_db, insert_job, get_job, cancel
from .executor import start, stop
from .licenses import assert_model, public_models
from .model_manager import MANAGER
from .security import verify_request

app=FastAPI(title="LINGXIFIELD SASI Native Compute",version="19.0")

@app.on_event("startup")
def startup():
    CONFIG.validate()
    init_db()
    start()

@app.on_event("shutdown")
def shutdown():
    stop()

@app.get("/health")
def health():
    gpu=MANAGER.gpu_info()
    models=inventory()
    capabilities={}
    for model in models:
        key="vision" if model['modality']=='vision' else ('reason' if model['kind']=='reasoning' else model['kind'])
        verified=accepted_model(model['id'],model['revision'])
        compute_ok=gpu.get('available',False) if key in ('image','video') else gpu.get('reason')!='TORCH_NOT_INSTALLED'
        capabilities[key]={**model,'verified':verified,'ready':model['provisioned'] and verified and compute_ok}
    return {'ok':True,'service':'lingxifield-sasi-native-compute','version':'19.1',
        'inference':'self-hosted-offline','capabilities':capabilities,
        'state':'ready' if all(c['ready'] for c in capabilities.values()) else 'not-ready',
        'storage':{'local':True,'r2':CONFIG.r2_ready}}

@app.get("/v1/capabilities")
def capabilities():
    return{"models":public_models(),"kinds":["reason","image","video"],"durableQueue":True,"replayProtection":True}

@app.post("/v1/jobs")
async def create_job(request:Request):
    raw=await verify_request(request)
    try:
        body=json.loads(raw.decode("utf-8"))
    except Exception:
        raise HTTPException(400,"INVALID_JSON")
    if not isinstance(body,dict): raise HTTPException(400,"INVALID_JSON_OBJECT")
    if body.get("protocolVersion")!="2026-09-26.v19":
        raise HTTPException(409,"PROTOCOL_VERSION_MISMATCH")
    required=["requestId","taskId","ownerId","kind","model","input"]
    if any(not body.get(key) for key in required):
        raise HTTPException(400,"JOB_FIELDS_REQUIRED")
    if body["kind"] not in ("reason","image","video"):
        raise HTTPException(400,"INVALID_JOB_KIND")
    try: profile=assert_model(str(body["model"]),str(body["kind"]))
    except RuntimeError: raise HTTPException(400,"MODEL_NOT_APPROVED") from None
    for key in ('requestId','taskId','ownerId'):
        if not isinstance(body[key],str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}',body[key]):
            raise HTTPException(400,"INVALID_JOB_IDENTITY")
    if not isinstance(body["input"],dict):
        raise HTTPException(400,"INVALID_JOB_INPUT")
    prompt=body['input'].get('prompt')
    if not isinstance(prompt,str) or not prompt.strip() or len(prompt)>24000:
        raise HTTPException(400,"PROMPT_LENGTH")
    images=body['input'].get('images')
    if images:
        if body['kind']!='reason' or profile.get('modality')!='vision': raise HTTPException(400,'VISION_MODEL_REQUIRED')
        from .vision import decode_images
        try: decode_images(images)
        except ValueError: raise HTTPException(400,'INVALID_VISION_IMAGES') from None
    elif profile.get('modality')=='vision': raise HTTPException(400,'VISION_IMAGES_REQUIRED')
    try: model_path(body['model'])
    except RuntimeError: raise HTTPException(503,'MODEL_NOT_PROVISIONED') from None
    try:
        job=insert_job({
        "id":str(uuid.uuid4()),
        "requestId":str(body["requestId"]),
        "taskId":str(body["taskId"]),
        "ownerId":str(body["ownerId"]),
        "projectId":body.get("projectId"),
        "kind":str(body["kind"]),
        "model":str(body["model"]),
        "input":body["input"],
    })
    except ValueError: raise HTTPException(409,"IDEMPOTENCY_CONFLICT") from None
    return JSONResponse({"job":job},status_code=202)

@app.get("/v1/jobs/{job_id}")
async def read_job(job_id:str,request:Request):
    await verify_request(request)
    owner=request.query_params.get("owner","")
    if not owner:
        raise HTTPException(400,"OWNER_REQUIRED")
    job=get_job(job_id,owner)
    if not job:
        raise HTTPException(404,"JOB_NOT_FOUND")
    return{"job":job}

@app.delete("/v1/jobs/{job_id}")
async def cancel_job(job_id:str,request:Request):
    await verify_request(request)
    owner=request.query_params.get("owner","")
    if not owner:
        raise HTTPException(400,"OWNER_REQUIRED")
    if not cancel(job_id,owner):
        raise HTTPException(404,"JOB_NOT_FOUND")
    return{"ok":True}


@app.get("/v1/jobs/{job_id}/artifacts/{artifact_id}")
async def download_artifact(job_id:str,artifact_id:str,request:Request):
    await verify_request(request)
    owner=request.query_params.get("owner","")
    if not owner: raise HTTPException(400,"OWNER_REQUIRED")
    job=get_job(job_id,owner)
    if not job or job['state']!='succeeded': raise HTTPException(404,"ARTIFACT_NOT_FOUND")
    item=next((a for a in job['artifacts'] if a.get('id')==artifact_id and a.get('storage')=='local'),None)
    if not item: raise HTTPException(404,"ARTIFACT_NOT_FOUND")
    suffix={'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','video/mp4':'.mp4'}.get(item['mime'])
    if not suffix: raise HTTPException(404,"ARTIFACT_NOT_FOUND")
    target=(CONFIG.artifact_dir/job['ownerId']/job['taskId']/(artifact_id+suffix)).resolve()
    if not target.is_relative_to(CONFIG.artifact_dir) or not target.is_file(): raise HTTPException(404,"ARTIFACT_NOT_FOUND")
    return FileResponse(target,media_type=item['mime'],filename=artifact_id+suffix,
        headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'})
