from __future__ import annotations
import tempfile
import time
from pathlib import Path
from .model_manager import MANAGER
from .storage import store_artifact

def dimensions(ratio: str) -> tuple[int,int]:
    if ratio=="16:9": return 1344,768
    if ratio=="9:16": return 768,1344
    return 1024,1024

def run_image(model_id: str, data: dict, owner_id: str, task_id: str) -> tuple[dict,list[dict],dict]:
    prompt=str(data.get("prompt","")).strip()
    if not prompt: raise RuntimeError("IMAGE_PROMPT_REQUIRED")
    width,height=dimensions(str(data.get("ratio","1:1")))
    steps=max(1,min(8,int(data.get("steps") or 4)))
    seed=int(data.get("seed") if data.get("seed") is not None else 0)
    pipe=MANAGER.load_image(model_id)
    torch=MANAGER._torch()
    generator=torch.Generator(device="cpu")
    if seed:
        generator.manual_seed(seed)

    started=time.perf_counter()
    output=pipe(
        prompt=prompt,
        width=width,
        height=height,
        guidance_scale=0.0,
        num_inference_steps=steps,
        max_sequence_length=256,
        generator=generator,
    )
    image=output.images[0]
    with tempfile.TemporaryDirectory(prefix="sasi-image-") as tmp:
        path=Path(tmp)/"image.webp"
        image.save(path,"WEBP",quality=94,method=6)
        artifact=store_artifact(owner_id,task_id,path,"image","image/webp")
    wall_ms=int((time.perf_counter()-started)*1000)
    return (
        {"width":width,"height":height,"seed":seed or None},
        [artifact],
        {"wallMs":wall_ms,"width":width,"height":height},
    )
