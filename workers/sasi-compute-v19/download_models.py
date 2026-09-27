from __future__ import annotations
import argparse,json
from pathlib import Path

root=Path(__file__).resolve().parent
manifest=json.loads((root/"model-manifest.json").read_text(encoding="utf-8"))
approved={m["kind"]:m for m in manifest["models"] if m.get("commercialAllowed") is True}

parser=argparse.ArgumentParser()
parser.add_argument("kinds",nargs="*",choices=["reasoning","image","video"],default=["reasoning","image","video"])
args=parser.parse_args()

from huggingface_hub import snapshot_download

for kind in args.kinds:
    model=approved[kind]
    print(f"MODEL={model['id']} LICENSE={model['license']} DOWNLOAD=START")
    snapshot_download(repo_id=model["id"])
    print(f"MODEL={model['id']} DOWNLOAD=PASS")
