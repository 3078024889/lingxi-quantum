from __future__ import annotations
import tempfile
import time
from pathlib import Path
from .model_manager import MANAGER
from .storage import store_artifact

def dimensions(ratio: str) -> tuple[int,int]:
    # Wan 1.3B production-safe baseline sizes; keep dimensions divisible by common VAE factors.
    if ratio=="9:16": return 480,832
    if ratio=="1:1": return 624,624
    return 832,480

def run_video(model_id: str, data: dict, owner_id: str, task_id: str) -> tuple[dict,list[dict],dict]:
    prompt=str(data.get("prompt","")).strip()
    if not prompt: raise RuntimeError("VIDEO_PROMPT_REQUIRED")
    negative=str(data.get("negativePrompt","")).strip()
    ratio=str(data.get("ratio","16:9"))
    width,height=dimensions(ratio)
    duration=max(2.0,min(10.0,float(data.get("durationSec") or 5)))
    fps=16
    num_frames=max(33,min(161,int(round(duration*fps))+1))
    # Wan temporal modules commonly prefer 4n+1 frames.
    num_frames=max(33,((num_frames-1)//4)*4+1)
    seed=int(data.get("seed") if data.get("seed") is not None else 0)

    pipe=MANAGER.load_video(model_id)
    torch=MANAGER._torch()
    generator=torch.Generator(device="cpu")
    if seed:
        generator.manual_seed(seed)

    started=time.perf_counter()
    result=pipe(
        prompt=prompt,
        negative_prompt=negative or None,
        width=width,
        height=height,
        num_frames=num_frames,
        guidance_scale=5.0,
        generator=generator,
    )
    frames=result.frames[0]
    with tempfile.TemporaryDirectory(prefix="sasi-video-") as tmp:
        path=Path(tmp)/"shot.mp4"
        try:
            from diffusers.utils import export_to_video
            export_to_video(frames,str(path),fps=fps)
        except Exception:
            import imageio.v2 as imageio
            imageio.mimsave(path,frames,fps=fps,codec="libx264",quality=8)
        artifact=store_artifact(owner_id,task_id,path,"video","video/mp4")
    wall_ms=int((time.perf_counter()-started)*1000)
    return (
        {"width":width,"height":height,"fps":fps,"frames":len(frames),"durationSec":round(len(frames)/fps,2),"seed":seed or None},
        [artifact],
        {"wallMs":wall_ms,"frames":len(frames),"width":width,"height":height},
    )
