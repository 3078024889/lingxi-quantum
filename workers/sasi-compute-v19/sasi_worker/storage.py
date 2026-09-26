from __future__ import annotations
import hashlib
import mimetypes
import os
import shutil
import uuid
from pathlib import Path
from .config import CONFIG

def sha256_file(path: Path) -> str:
    h=hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda:fh.read(1024*1024),b""):
            h.update(chunk)
    return h.hexdigest()

def store_artifact(owner_id: str, task_id: str, source: Path, kind: str, mime: str | None = None) -> dict:
    mime = mime or mimetypes.guess_type(source.name)[0] or "application/octet-stream"
    artifact_id = str(uuid.uuid4())
    suffix = source.suffix.lower()
    key = f"sasi/{owner_id}/{task_id}/{artifact_id}{suffix}"
    size = source.stat().st_size
    digest = sha256_file(source)

    if CONFIG.r2_ready:
        import boto3
        client=boto3.client(
            "s3",
            endpoint_url=CONFIG.r2_endpoint,
            aws_access_key_id=CONFIG.r2_access_key,
            aws_secret_access_key=CONFIG.r2_secret_key,
            region_name="auto",
        )
        client.upload_file(str(source), CONFIG.r2_bucket, key, ExtraArgs={"ContentType":mime})
        return {
            "id":artifact_id,"kind":kind,"mime":mime,"byteSize":size,"sha256":digest,
            "storage":"r2","objectKey":key,"localId":None,
        }

    target = CONFIG.artifact_dir / owner_id / task_id / f"{artifact_id}{suffix}"
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source,target)
    return {
        "id":artifact_id,"kind":kind,"mime":mime,"byteSize":size,"sha256":digest,
        "storage":"local","objectKey":None,"localId":artifact_id,
    }
