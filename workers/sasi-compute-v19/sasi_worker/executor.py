from __future__ import annotations
import threading
import time
from . import db
from .licenses import assert_model
from .reasoning import run_reason
from .image_gen import run_image
from .video_gen import run_video

_stop=threading.Event()
_thread:threading.Thread|None=None

def _run(job: dict):
    kind=job["kind"]
    model=job["model"]
    assert_model(model,kind)
    if db.cancellation_requested(job["id"]):
        db.cancel(job["id"],job["ownerId"]); return
    db.update_progress(job["id"],0.08)

    if kind=="reason":
        result,artifacts,usage=run_reason(model,job["_input"])
    elif kind=="image":
        db.update_progress(job["id"],0.18)
        result,artifacts,usage=run_image(model,job["_input"],job["ownerId"],job["taskId"])
    elif kind=="video":
        db.update_progress(job["id"],0.12)
        result,artifacts,usage=run_video(model,job["_input"],job["ownerId"],job["taskId"])
    else:
        raise RuntimeError("UNSUPPORTED_JOB_KIND")

    if db.cancellation_requested(job["id"]):
        db.cancel(job["id"],job["ownerId"]); return
    db.complete(job["id"],result,artifacts,usage)

def loop():
    while not _stop.is_set():
        job=db.claim_next()
        if not job:
            _stop.wait(0.5); continue
        try:
            _run(job)
        except Exception as exc:
            db.fail(job["id"],type(exc).__name__.upper(),str(exc))

def start():
    global _thread
    if _thread and _thread.is_alive(): return
    _stop.clear()
    _thread=threading.Thread(target=loop,name="sasi-native-executor",daemon=True)
    _thread.start()

def stop():
    _stop.set()
