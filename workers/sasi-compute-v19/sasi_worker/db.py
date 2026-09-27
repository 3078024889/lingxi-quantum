from __future__ import annotations
import json
import sqlite3
import threading
from datetime import datetime, timezone
from .config import CONFIG

_lock = threading.Lock()

def now() -> str:
    return datetime.now(timezone.utc).isoformat()

def connect() -> sqlite3.Connection:
    con = sqlite3.connect(CONFIG.db_path, check_same_thread=False)
    con.row_factory = sqlite3.Row
    con.execute("pragma journal_mode=WAL")
    return con

def init_db() -> None:
    with connect() as con:
        con.executescript("""
        create table if not exists jobs(
          id text primary key,
          request_id text not null unique,
          task_id text not null,
          owner_id text not null,
          project_id text,
          kind text not null,
          model text not null,
          input_json text not null,
          state text not null,
          progress real not null default 0,
          result_json text,
          artifacts_json text not null default '[]',
          usage_json text,
          error_json text,
          created_at text not null,
          updated_at text not null,
          started_at text,
          completed_at text,
          cancel_requested integer not null default 0
        );
        create index if not exists jobs_state_created_idx on jobs(state,created_at);
        create index if not exists jobs_owner_updated_idx on jobs(owner_id,updated_at desc);
        """)
        con.execute("update jobs set state='queued', progress=0, updated_at=? where state='running'", (now(),))

def insert_job(job: dict) -> dict:
    with _lock, connect() as con:
        existing = con.execute("select * from jobs where request_id=?", (job["requestId"],)).fetchone()
        if existing:
            return row_to_job(existing)
        stamp = now()
        con.execute(
            """insert into jobs(id,request_id,task_id,owner_id,project_id,kind,model,input_json,state,progress,created_at,updated_at)
               values(?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                job["id"], job["requestId"], job["taskId"], job["ownerId"], job.get("projectId"),
                job["kind"], job["model"], json.dumps(job["input"], ensure_ascii=False),
                "queued", 0.0, stamp, stamp,
            ),
        )
        return get_job(job["id"], job["ownerId"])

def row_to_job(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "requestId": row["request_id"],
        "taskId": row["task_id"],
        "ownerId": row["owner_id"],
        "kind": row["kind"],
        "model": row["model"],
        "state": row["state"],
        "progress": float(row["progress"] or 0),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "startedAt": row["started_at"],
        "completedAt": row["completed_at"],
        "result": json.loads(row["result_json"]) if row["result_json"] else None,
        "artifacts": json.loads(row["artifacts_json"] or "[]"),
        "usage": json.loads(row["usage_json"]) if row["usage_json"] else None,
        "error": json.loads(row["error_json"]) if row["error_json"] else None,
    }

def get_job(job_id: str, owner_id: str | None = None) -> dict | None:
    with connect() as con:
        if owner_id:
            row = con.execute("select * from jobs where id=? and owner_id=?", (job_id, owner_id)).fetchone()
        else:
            row = con.execute("select * from jobs where id=?", (job_id,)).fetchone()
        return row_to_job(row) if row else None

def claim_next() -> dict | None:
    with _lock, connect() as con:
        row = con.execute("select * from jobs where state='queued' and cancel_requested=0 order by created_at limit 1").fetchone()
        if not row:
            return None
        stamp = now()
        updated = con.execute(
            "update jobs set state='running', progress=0.01, started_at=coalesce(started_at,?), updated_at=? where id=? and state='queued'",
            (stamp, stamp, row["id"]),
        )
        if updated.rowcount != 1:
            return None
        fresh = con.execute("select * from jobs where id=?", (row["id"],)).fetchone()
        result = row_to_job(fresh)
        result["_input"] = json.loads(fresh["input_json"])
        result["_projectId"] = fresh["project_id"]
        return result

def update_progress(job_id: str, value: float) -> None:
    with connect() as con:
        con.execute("update jobs set progress=?, updated_at=? where id=? and state='running'", (max(0.0,min(0.99,value)), now(), job_id))

def complete(job_id: str, result: dict, artifacts: list[dict], usage: dict | None) -> None:
    stamp = now()
    with connect() as con:
        con.execute(
            """update jobs set state='succeeded', progress=1, result_json=?, artifacts_json=?, usage_json=?,
               error_json=null, updated_at=?, completed_at=? where id=?""",
            (json.dumps(result,ensure_ascii=False),json.dumps(artifacts,ensure_ascii=False),
             json.dumps(usage,ensure_ascii=False) if usage else None,stamp,stamp,job_id),
        )

def fail(job_id: str, code: str, message: str) -> None:
    stamp = now()
    with connect() as con:
        con.execute(
            "update jobs set state='failed', progress=1, error_json=?, updated_at=?, completed_at=? where id=?",
            (json.dumps({"code":code,"message":message[:280]},ensure_ascii=False),stamp,stamp,job_id),
        )

def cancel(job_id: str, owner_id: str) -> bool:
    stamp=now()
    with connect() as con:
        row=con.execute("select state from jobs where id=? and owner_id=?", (job_id,owner_id)).fetchone()
        if not row:
            return False
        if row["state"] in ("succeeded","failed","cancelled"):
            return True
        con.execute(
            "update jobs set cancel_requested=1, state=case when state='queued' then 'cancelled' else state end, updated_at=?, completed_at=case when state='queued' then ? else completed_at end where id=?",
            (stamp,stamp,job_id),
        )
        return True

def cancellation_requested(job_id: str) -> bool:
    with connect() as con:
        row=con.execute("select cancel_requested from jobs where id=?", (job_id,)).fetchone()
        return bool(row and row["cancel_requested"])
