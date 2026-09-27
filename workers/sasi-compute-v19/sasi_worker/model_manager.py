from __future__ import annotations
import gc
import threading
from .config import CONFIG
from .licenses import assert_model

class ModelManager:
    def __init__(self) -> None:
        self._lock=threading.RLock()
        self.reasoning=None
        self.reasoning_tokenizer=None
        self.reasoning_id=None
        self.image=None
        self.image_id=None
        self.video=None
        self.video_id=None

    def _torch(self):
        import torch
        return torch

    def gpu_info(self) -> dict:
        torch=self._torch()
        if not torch.cuda.is_available():
            return {"available":False,"count":0}
        free,total=torch.cuda.mem_get_info()
        return {
            "available":True,
            "count":torch.cuda.device_count(),
            "name":torch.cuda.get_device_name(0),
            "freeVramGb":round(free/1024**3,2),
            "totalVramGb":round(total/1024**3,2),
        }

    def unload_diffusion(self) -> None:
        self.image=None; self.image_id=None
        self.video=None; self.video_id=None
        gc.collect()
        torch=self._torch()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def load_reasoning(self, model_id: str):
        assert_model(model_id,"reason")
        with self._lock:
            if self.reasoning is not None and self.reasoning_id==model_id:
                return self.reasoning_tokenizer,self.reasoning
            from transformers import AutoModelForCausalLM, AutoTokenizer
            torch=self._torch()
            tokenizer=AutoTokenizer.from_pretrained(model_id,trust_remote_code=False)
            model=AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype="auto",
                device_map="auto",
                trust_remote_code=False,
            )
            model.eval()
            self.reasoning_tokenizer=tokenizer
            self.reasoning=model
            self.reasoning_id=model_id
            return tokenizer,model

    def load_image(self, model_id: str):
        assert_model(model_id,"image")
        with self._lock:
            if self.image is not None and self.image_id==model_id:
                return self.image
            self.unload_diffusion()
            from diffusers import FluxPipeline
            torch=self._torch()
            if not torch.cuda.is_available():
                raise RuntimeError("CUDA_REQUIRED_FOR_IMAGE")
            pipe=FluxPipeline.from_pretrained(model_id,torch_dtype=torch.bfloat16)
            pipe.enable_model_cpu_offload()
            self.image=pipe
            self.image_id=model_id
            return pipe

    def load_video(self, model_id: str):
        assert_model(model_id,"video")
        with self._lock:
            if self.video is not None and self.video_id==model_id:
                return self.video
            self.unload_diffusion()
            try:
                from diffusers import WanPipeline
            except Exception as exc:
                raise RuntimeError("DIFFUSERS_WAN_PIPELINE_UNAVAILABLE") from exc
            torch=self._torch()
            if not torch.cuda.is_available():
                raise RuntimeError("CUDA_REQUIRED_FOR_VIDEO")
            pipe=WanPipeline.from_pretrained(model_id,torch_dtype=torch.bfloat16)
            pipe.enable_model_cpu_offload()
            self.video=pipe
            self.video_id=model_id
            return pipe

MANAGER=ModelManager()
