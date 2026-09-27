"""Experimental local CogVideoX-2B recipe. No hosted inference or paid fallback."""
import argparse
import json
import os
from pathlib import Path

MODEL='zai-org/CogVideoX-2b'
REVISION='1137dacfc2c9c012bed6a0793f4ecf2ca8e7ba01'


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('action',choices=['prepare','run'])
    parser.add_argument('--root',type=Path,default=Path('D:/SASI-local-runtime'))
    parser.add_argument('--prompt',default='A red balloon floating slowly above a peaceful green meadow, steady camera.')
    args=parser.parse_args()
    local=args.root.resolve()/'models/cogvideox-2b'
    if args.action=='prepare':
        from huggingface_hub import snapshot_download
        snapshot_download(repo_id=MODEL,revision=REVISION,local_dir=local,
            allow_patterns=['*.json','*.safetensors','*.model','*.txt','LICENSE*','README*'])
        (local/'sasi-snapshot.json').write_text(json.dumps({'model':MODEL,'revision':REVISION}),encoding='utf-8')
        print('Weights prepared. Video inference has NOT been verified.')
        return
    os.environ['HF_HUB_OFFLINE']='1'
    os.environ['TRANSFORMERS_OFFLINE']='1'
    import torch
    import psutil
    if not torch.cuda.is_available(): raise SystemExit('No compatible CUDA runtime; no paid API fallback.')
    if psutil.virtual_memory().available<12*1024**3:
        raise SystemExit('Experiment safety guard: at least 12 GiB currently free system RAM required; close other programs or use a suitable host.')
    receipt=json.loads((local/'sasi-snapshot.json').read_text(encoding='utf-8'))
    if receipt!={'model':MODEL,'revision':REVISION}: raise SystemExit('Model revision mismatch')
    from diffusers import CogVideoXPipeline
    from diffusers.utils import export_to_video
    pipe=CogVideoXPipeline.from_pretrained(str(local),torch_dtype=torch.float16,local_files_only=True,use_safetensors=True)
    pipe.enable_sequential_cpu_offload()
    pipe.vae.enable_slicing()
    pipe.vae.enable_tiling()
    frames=pipe(prompt=args.prompt,num_videos_per_prompt=1,num_inference_steps=20,
        num_frames=49,guidance_scale=6,generator=torch.Generator(device='cpu').manual_seed(42)).frames[0]
    import uuid
    output=args.root.resolve()/'outputs'/('video-'+str(uuid.uuid4())+'.mp4')
    output.parent.mkdir(parents=True,exist_ok=True)
    export_to_video(frames,str(output),fps=8)
    if not output.is_file() or output.stat().st_size<100: raise SystemExit('No valid output file')
    print('Generated:',output)
    print('Review motion and quality before accepting this experimental configuration.')


if __name__=='__main__': main()
