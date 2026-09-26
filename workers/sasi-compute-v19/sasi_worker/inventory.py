"""Serve only explicitly provisioned local snapshots. Never download during a job."""
import json
from .config import CONFIG
from .licenses import public_models

def model_path(model_id: str) -> str:
    profile=next((m for m in public_models() if m['id']==model_id),None)
    if profile is None: raise RuntimeError('MODEL_NOT_APPROVED')
    local=(CONFIG.model_dir/profile['directory']).resolve()
    if not local.is_relative_to(CONFIG.model_dir): raise RuntimeError('MODEL_PATH_INVALID')
    receipt=local/'sasi-snapshot.json'
    try: data=json.loads(receipt.read_text(encoding='utf-8'))
    except (OSError,ValueError): raise RuntimeError('MODEL_NOT_PROVISIONED') from None
    if data.get('model')!=model_id or data.get('revision')!=profile['revision']:
        raise RuntimeError('MODEL_REVISION_MISMATCH')
    if not (local/'config.json').is_file() and not (local/'model_index.json').is_file():
        raise RuntimeError('MODEL_CONFIG_MISSING')
    if not any(local.rglob('*.safetensors')): raise RuntimeError('MODEL_WEIGHTS_MISSING')
    return str(local)

def inventory() -> list[dict]:
    result=[]
    for model in public_models():
        try: model_path(model['id']); provisioned=True; reason=None
        except RuntimeError as error: provisioned=False; reason=str(error)
        result.append({'id':model['id'],'kind':model['kind'],'modality':model['modality'],
            'revision':model['revision'],'provisioned':provisioned,'reason':reason})
    return result
