from __future__ import annotations
import json
from pathlib import Path

_MANIFEST = json.loads((Path(__file__).resolve().parents[1] / "model-manifest.json").read_text(encoding="utf-8"))
_APPROVED = {item["id"]: item for item in _MANIFEST["models"] if item.get("commercialAllowed") is True}

def assert_model(model_id: str, kind: str) -> dict:
    profile = _APPROVED.get(model_id)
    if not profile:
        raise RuntimeError(f"MODEL_NOT_APPROVED:{model_id}")
    expected = "reasoning" if kind == "reason" else kind
    if profile.get("kind") != expected:
        raise RuntimeError(f"MODEL_KIND_MISMATCH:{model_id}")
    return profile

def public_models() -> list[dict]:
    return list(_APPROVED.values())
