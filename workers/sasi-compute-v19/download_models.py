"""Explicit online provisioning; inference never downloads models."""
import argparse,json
from pathlib import Path
root=Path(__file__).resolve().parent
manifest=json.loads((root/'model-manifest.json').read_text(encoding='utf-8'))
approved={m['directory']:m for m in manifest['models'] if m.get('commercialAllowed') is True}
parser=argparse.ArgumentParser()
parser.add_argument('kinds',nargs='+',choices=list(approved))
parser.add_argument('--model-dir',default=str(root/'models'))
args=parser.parse_args()
from huggingface_hub import snapshot_download
for kind in args.kinds:
    model=approved[kind]
    local=Path(args.model_dir).resolve()/model['directory']
    print(f"Provisioning {model['id']} at revision {model['revision']}")
    snapshot_download(repo_id=model['id'],revision=model['revision'],local_dir=local,
        allow_patterns=['*.json','*.safetensors','*.txt','*.model','*.tiktoken','LICENSE*','README.md'])
    (local/'sasi-snapshot.json').write_text(json.dumps({'model':model['id'],'revision':model['revision']}),encoding='utf-8')
    print('PROVISIONED; real inference acceptance still required')
