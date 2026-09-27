from __future__ import annotations
from dataclasses import dataclass
import os
from pathlib import Path

def env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()

@dataclass(frozen=True)
class Config:
    secret: str = env("SASI_NATIVE_COMPUTE_SECRET")
    reasoning_model: str = env("SASI_NATIVE_REASONING_MODEL", "Qwen/Qwen3-8B")
    image_model: str = env("SASI_NATIVE_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell")
    video_model: str = env("SASI_NATIVE_VIDEO_MODEL", "Wan-AI/Wan2.1-T2V-1.3B")
    artifact_dir: Path = Path(env("SASI_NATIVE_ARTIFACT_DIR", "./artifacts")).resolve()
    db_path: Path = Path(env("SASI_NATIVE_DB_PATH", "./state/sasi-worker.sqlite3")).resolve()
    max_clock_skew_ms: int = int(env("SASI_NATIVE_MAX_CLOCK_SKEW_MS", "120000"))
    replay_ttl_ms: int = int(env("SASI_NATIVE_REPLAY_TTL_MS", "180000"))
    r2_endpoint: str = env("R2_ENDPOINT")
    r2_access_key: str = env("R2_ACCESS_KEY_ID")
    r2_secret_key: str = env("R2_SECRET_ACCESS_KEY")
    r2_bucket: str = env("R2_BUCKET_SASI_ARTIFACTS")

    def validate(self) -> None:
        if len(self.secret) < 32:
            raise RuntimeError("SASI_NATIVE_COMPUTE_SECRET_INVALID")
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

    @property
    def r2_ready(self) -> bool:
        return all([self.r2_endpoint, self.r2_access_key, self.r2_secret_key, self.r2_bucket])

CONFIG = Config()
