"""Protocol tests with fake model inventory. Never claims real model inference."""
import hashlib
import hmac
import json
import os
import tempfile
import time
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

TEMP = tempfile.TemporaryDirectory()
os.environ.update(SASI_NATIVE_COMPUTE_SECRET="test-only-" + "x" * 40,
    SASI_NATIVE_DB_PATH=str(Path(TEMP.name)/"state.sqlite"),
    SASI_NATIVE_ARTIFACT_DIR=str(Path(TEMP.name)/"artifacts"),
    SASI_NATIVE_MODEL_DIR=str(Path(TEMP.name)/"models"))
from fastapi.testclient import TestClient
from sasi_worker import db, server
from sasi_worker.config import CONFIG


class ProtocolTest(unittest.TestCase):
    def setUp(self):
        CONFIG.validate()
        db.init_db()
        with db.connect() as con:
            for table in ("jobs", "request_nonces", "model_acceptance"):
                con.execute("delete from " + table)
        self.client = TestClient(server.app)

    def signed(self, method, path, payload=None, headers_only=False):
        body = b"" if payload is None else json.dumps(payload,separators=(",", ":")).encode()
        stamp, nonce = str(int(time.time()*1000)), str(uuid.uuid4())
        canonical = f"{stamp}.{nonce}.{method}.{path}.{hashlib.sha256(body).hexdigest()}"
        headers={"x-lingxi-timestamp":stamp,"x-lingxi-nonce":nonce,
            "x-lingxi-signature":hmac.new(CONFIG.secret.encode(),canonical.encode(),hashlib.sha256).hexdigest()}
        if headers_only: return headers
        return self.client.request(method,path,content=body,headers=headers)

    def create(self, owner="owner-a", request_id=None):
        payload={"protocolVersion":"2026-09-26.v19","requestId":request_id or str(uuid.uuid4()),
            "taskId":"task-a","ownerId":owner,"kind":"reason","model":"Qwen/Qwen3-8B",
            "input":{"prompt":"Test question"}}
        with patch.object(server,"model_path",return_value="fake-inventory-only"):
            result=self.signed("POST","/v1/jobs",payload)
        return result,payload

    def test_not_provisioned_does_not_queue(self):
        _, payload=self.create()
        result=self.signed("POST","/v1/jobs",{**payload,"requestId":str(uuid.uuid4())})
        self.assertEqual(result.status_code,503)
        self.assertFalse(any(c["ready"] for c in self.client.get("/health").json()["capabilities"].values()))

    def test_query_signature_replay_and_tenant(self):
        response,_=self.create()
        self.assertEqual(response.status_code,202)
        job=response.json()["job"]
        path=f'/v1/jobs/{job["id"]}?owner=owner-a'
        headers=self.signed("GET",path,headers_only=True)
        self.assertEqual(self.client.get(path.replace("owner-a","owner-b"),headers=headers).status_code,401)
        self.assertEqual(self.client.get(path,headers=headers).status_code,200)
        self.assertEqual(self.client.get(path,headers=headers).status_code,409)
        self.assertEqual(self.signed("GET",path.replace("owner-a","owner-b")).status_code,404)

    def test_idempotency_and_conflicts(self):
        first,payload=self.create(request_id="stable-request")
        second,_=self.create(request_id="stable-request")
        self.assertEqual(first.json()["job"]["id"],second.json()["job"]["id"])
        other,_=self.create(owner="owner-b",request_id="stable-request")
        self.assertEqual(other.status_code,409)
        payload["input"]["prompt"]="Changed question"
        with patch.object(server,"model_path",return_value="fake"):
            self.assertEqual(self.signed("POST","/v1/jobs",payload).status_code,409)

    def test_only_one_claim_and_cancel_cannot_publish(self):
        response,_=self.create()
        job_id=response.json()["job"]["id"]
        with ThreadPoolExecutor(max_workers=8) as pool:
            claims=list(pool.map(lambda _:db.claim_next(),range(8)))
        self.assertEqual(sum(c is not None for c in claims),1)
        db.cancel(job_id,"owner-a")
        db.complete(job_id,{"text":"must not publish"},[],None)
        job=db.get_job(job_id)
        self.assertEqual(job["state"],"cancelled")
        self.assertIsNone(job["result"])

    def test_restart_fails_interrupted_work(self):
        response,_=self.create()
        db.claim_next()
        db.init_db()
        self.assertEqual(db.get_job(response.json()["job"]["id"])["error"]["code"],"WORKER_RESTARTED")

    def test_artifacts_owned_and_downloadable(self):
        response,_=self.create()
        job=response.json()["job"]
        db.claim_next()
        aid=str(uuid.uuid4())
        target=CONFIG.artifact_dir/"owner-a"/"task-a"/(aid+".png")
        target.parent.mkdir(parents=True,exist_ok=True)
        from PIL import Image
        Image.new("RGB",(2,2)).save(target)
        db.complete(job["id"],{},[{"id":aid,"mime":"image/png","storage":"local"}],None)
        path=f'/v1/jobs/{job["id"]}/artifacts/{aid}?owner=owner-a'
        result=self.signed("GET",path)
        self.assertEqual(result.status_code,200)
        self.assertEqual(result.content,target.read_bytes())
        self.assertEqual(self.signed("GET",path.replace("owner-a","owner-b")).status_code,404)

    def test_vision_rejects_remote_fetch_and_invalid_bytes(self):
        from sasi_worker.vision import decode_images
        for value in (["https://example.com/private"],["data:image/png;base64,AAAA"],["file:///secret"]):
            with self.assertRaises(ValueError): decode_images(value)

    def test_signed_body_limit(self):
        self.assertEqual(self.signed("POST","/v1/jobs",{"data":"x"*(4*1024*1024)}).status_code,413)


if __name__=="__main__": unittest.main()
