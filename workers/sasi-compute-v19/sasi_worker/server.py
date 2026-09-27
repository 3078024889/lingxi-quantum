from __future__ import annotations
import json
import time
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
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
    return{
        "ok":True,
        "service":"lingxifield-sasi-native-compute",
        "version":"19.0",
        "state":"ready" if gpu.get("available") else "degraded",
        "gpu":gpu,
        "storage":{"r2":CONFIG.r2_ready},
        "models":{
            "reasoning":CONFIG.reasoning_model,
            "image":CONFIG.image_model,
            "video":CONFIG.video_model,
        },
    }

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
    if body.get("protocolVersion")!="2026-09-26.v19":
        raise HTTPException(409,"PROTOCOL_VERSION_MISMATCH")
    required=["requestId","taskId","ownerId","kind","model","input"]
    if any(not body.get(key) for key in required):
        raise HTTPException(400,"JOB_FIELDS_REQUIRED")
    if body["kind"] not in ("reason","image","video"):
        raise HTTPException(400,"INVALID_JOB_KIND")
    assert_model(str(body["model"]),str(body["kind"]))
    if not isinstance(body["input"],dict):
        raise HTTPException(400,"INVALID_JOB_INPUT")
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
